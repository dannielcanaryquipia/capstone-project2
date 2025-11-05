# How Rider Assignment Works

## Overview

The rider assignment system manages how orders are assigned to delivery riders. It supports both **automatic assignment** (when orders become ready) and **manual assignment** (by riders themselves or admins).

---

## Database Structure

### `delivery_assignments` Table

This is the core table that links orders to riders:

```sql
delivery_assignments {
  id: UUID (primary key)
  order_id: UUID (foreign key → orders.id)
  rider_id: UUID (foreign key → riders.id, nullable)
  assigned_at: timestamp (when order was assigned)
  picked_up_at: timestamp (when rider picked up order)
  delivered_at: timestamp (when order was delivered)
  status: enum ('Assigned', 'Picked Up', 'Delivered')
  notes: text (optional)
}
```

**Key Points:**
- `rider_id` can be `NULL` - this means the order is unassigned
- An order can have an assignment record even if `rider_id` is NULL
- Status tracks the delivery lifecycle

---

## Assignment Flow

### 1. Order Lifecycle

```
Order Created
    ↓
Pending → Confirmed → Preparing → Ready for Pickup
                                              ↓
                                    [Assignment Happens Here]
                                              ↓
                                    Assigned → Picked Up → Out for Delivery
                                                              ↓
                                                      Delivered
```

### 2. When Orders Become Available

An order becomes available for assignment when:

**For GCash Orders:**
- Status is `ready_for_pickup` OR `preparing`
- **AND** `payment_verified = true` (admin has verified payment)

**For COD Orders:**
- Status is `ready_for_pickup` OR `preparing`
- **AND** (`payment_method = 'cod'` AND `payment_status = 'pending'`)
  - Note: COD orders don't need payment verification before assignment

**Code Location:** `services/rider.service.ts::getAvailableOrders()`

```typescript
.in('status', ['ready_for_pickup', 'preparing'])
.or('payment_verified.eq.true,and(payment_method.eq.cod,payment_status.eq.pending)')
```

---

## Assignment Methods

### Method 1: Automatic Assignment (Auto-Assignment)

**Trigger:** When admin updates order status to `ready_for_pickup`

**How it Works:**

1. **Trigger Point:**
   ```typescript
   // In OrderService.updateOrderStatus()
   if (dbStatus === 'ready_for_pickup') {
     AutoAssignmentService.onOrderStatusUpdate(orderId, dbStatus);
   }
   ```

2. **Auto-Assignment Process:**
   - Gets all available orders (unassigned, payment verified)
   - Gets all available riders (`is_available = true`)
   - Calculates best rider for each order using scoring algorithm
   - Assigns orders to riders (max 3 orders per rider)

3. **Scoring Algorithm:**
   - **Distance Score (40%)**: Closer riders get higher scores
   - **Availability Score (30%)**: Less busy riders get higher scores
   - **Urgency Score (30%)**: Newer orders get higher scores

**Code Location:** `services/auto-assignment.service.ts`

**Configuration:**
- Max orders per rider: **3**
- Assignment radius: **10 km**
- Priority weights: Distance (40%), Availability (30%), Urgency (30%)

---

### Method 2: Manual Assignment by Admin

**How it Works:**

Admin can manually assign orders to specific riders through:
- Admin dashboard
- Order detail page

**Code Location:** `services/admin-assignment.service.ts::manualAssignOrder()`

**Process:**
1. Admin selects order and rider
2. Calls `RiderService.acceptOrder(orderId, riderId)`
3. Creates/updates delivery assignment
4. Sends notification to rider

---

### Method 3: Rider Self-Assignment

**How it Works:**

Riders can browse and accept available orders themselves:

1. Rider views "Available Orders" in their app
2. Clicks "Accept Order" button
3. System checks:
   - Order is still available (not assigned)
   - Rider is available
   - Rider hasn't reached max orders (3)
4. Creates assignment record

**Code Location:** `services/rider.service.ts::acceptOrder()`

**Process:**
```typescript
// Check if assignment exists
const existingAssignment = await checkAssignment(orderId);

if (existingAssignment && existingAssignment.rider_id) {
  throw Error('Order already assigned');
}

// Create or update assignment
if (existingAssignment) {
  // Update existing assignment with rider_id
  update({ rider_id: riderId, status: 'Assigned' });
} else {
  // Create new assignment
  insert({ order_id, rider_id, status: 'Assigned' });
}
```

---

## Special Cases: COD Orders

### COD Payment Verification Flow

For COD orders, assignment works differently:

1. **Initial State:**
   - Order is available for assignment (payment not verified yet)
   - Rider can accept order normally

2. **After Rider Picks Up:**
   - Order status → `out_for_delivery`
   - Rider collects payment from customer

3. **Payment Verification:**
   - Rider verifies COD payment
   - **System automatically creates/updates assignment** if missing
   - Sets `assigned_at` and `picked_up_at` timestamps
   - Updates payment status to `verified`

4. **Mark as Delivered:**
   - Rider marks order as delivered with proof photo
   - System ensures assignment exists (creates if missing)
   - Updates `delivered_at` timestamp

**Code Location:** `services/rider.service.ts::verifyCODPayment()`

**Key Fix:** The recent fix ensures that COD orders always have a proper assignment record, even if the rider didn't formally "accept" the order through the normal flow.

---

## Assignment Status Lifecycle

```
Assigned
  ↓ (rider marks as picked up)
Picked Up
  ↓ (rider marks as delivered)
Delivered
```

### Status Transitions:

1. **Assigned** → Created when rider accepts order
   - `assigned_at` timestamp set
   - `rider_id` set
   - Order status: `ready_for_pickup`

2. **Picked Up** → Rider marks order as picked up
   - `picked_up_at` timestamp set
   - Order status: `out_for_delivery`

3. **Delivered** → Rider marks order as delivered
   - `delivered_at` timestamp set
   - Order status: `delivered`

**Code Location:** `services/rider.service.ts::markOrderPickedUp()` and `markOrderDelivered()`

---

## How Orders Are Filtered for Riders

### Available Orders (for riders to accept):
- Status: `ready_for_pickup` or `preparing`
- Payment verified (GCash) OR COD pending
- **Not** already assigned to another rider

### Assigned Orders (rider's active orders):
- `rider_id` = current rider
- `delivered_at` is NULL (not yet delivered)

### Recent Orders (last 7 days):
- `rider_id` = current rider
- `assigned_at` >= 7 days ago **OR** `picked_up_at` >= 7 days ago **OR** `delivered_at` >= 7 days ago
- **Fix:** Now includes orders even if `assigned_at` is missing

### Delivered Orders:
- `rider_id` = current rider
- `delivered_at` is NOT NULL

**Code Location:** `services/rider.service.ts::getRiderOrders()`, `getRecentOrders()`, `getDeliveredOrders()`

---

## Assignment Validation

### Rules:

1. **One Rider Per Order:**
   - Each order can only be assigned to one rider at a time
   - If assignment exists with `rider_id`, order is not available

2. **Max Orders Per Rider:**
   - Default: **3 active orders** per rider
   - Only counts undelivered orders (`delivered_at` is NULL)

3. **Rider Availability:**
   - Rider must have `is_available = true`
   - Rider can toggle availability in their dashboard

4. **Payment Verification:**
   - GCash orders: Must be verified by admin before assignment
   - COD orders: Can be assigned before payment verification

---

## Error Handling & Edge Cases

### Missing Assignment Records:

**Problem:** Sometimes orders don't have assignment records (edge cases)

**Solution:**
- `verifyCODPayment()` creates assignment if missing
- `markOrderDelivered()` creates assignment if missing
- `getRecentOrders()` filters by multiple date fields

### Missing Timestamps:

**Problem:** `assigned_at` might be missing

**Solution:**
- System fills in missing timestamps when updating assignments
- Uses current timestamp if missing

### Order Already Assigned:

**Problem:** Race condition - two riders try to accept same order

**Solution:**
- `acceptOrder()` checks if order is already assigned
- Throws error if `rider_id` is already set
- Prevents double assignment

---

## Real-time Updates

### Subscriptions:

Riders receive real-time updates via Supabase subscriptions:

```typescript
// In useRiderOrders hook
supabase
  .channel('rider-orders-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'delivery_assignments',
  }, (payload) => {
    fetchOrders(); // Refresh orders
  })
```

**Triggers:**
- New assignment created
- Assignment status updated
- Order status changed

---

## Summary

### Assignment Flow Summary:

1. **Order Ready** → Admin marks as `ready_for_pickup`
2. **Auto-Assignment** → System tries to assign to best available rider
3. **Manual Assignment** → Admin or rider can manually assign
4. **Rider Accepts** → Rider accepts from available orders
5. **Pick Up** → Rider marks as picked up
6. **Verify Payment** → (COD only) Rider verifies payment
7. **Deliver** → Rider marks as delivered with proof

### Key Points:

✅ Orders must have payment verified (GCash) or be COD to be available  
✅ Each order can only be assigned to one rider  
✅ Riders can have max 3 active orders  
✅ COD orders get assignment created automatically during payment verification  
✅ System handles missing assignments gracefully  
✅ Real-time updates keep riders informed of new assignments

---

## Code Locations

- **Assignment Creation:** `services/rider.service.ts::acceptOrder()`
- **Auto-Assignment:** `services/auto-assignment.service.ts`
- **Admin Assignment:** `services/admin-assignment.service.ts`
- **Available Orders:** `services/rider.service.ts::getAvailableOrders()`
- **COD Payment:** `services/rider.service.ts::verifyCODPayment()`
- **Mark Delivered:** `services/rider.service.ts::markOrderDelivered()`

