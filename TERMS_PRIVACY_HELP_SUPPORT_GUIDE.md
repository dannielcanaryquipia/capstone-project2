# Complete Guide: Terms, Privacy, Help & Support Implementation

This document provides a comprehensive explanation of how Terms & Privacy, and Help & Support features are implemented in the KitchenOne app, including routes, display components, and all strings/content.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Routes & Navigation](#routes--navigation)
3. [Terms & Privacy Implementation](#terms--privacy-implementation)
4. [Help & Support Implementation](#help--support-implementation)
5. [All Strings & Content](#all-strings--content)
6. [Component Structure](#component-structure)
7. [Navigation Flow](#navigation-flow)

---

## Overview

The app has **two user types** with separate implementations:
- **Customer** (`(customer)`) - Has Help & Support only
- **Delivery Staff** (`(delivery)`) - Has both Help & Support AND Terms & Privacy

### Key Files:
- **Terms & Privacy**: `app/(delivery)/terms-privacy.tsx`
- **Help & Support (Delivery)**: `app/(delivery)/help-support.tsx`
- **Help & Support (Customer)**: `app/(customer)/profile/help-support.tsx`
- **Settings (Delivery)**: `app/(delivery)/settings.tsx`
- **Settings (Customer)**: `app/(customer)/profile/settings.tsx`
- **Profile (Delivery)**: `app/(delivery)/profile.tsx`
- **Profile (Customer)**: `app/(customer)/(tabs)/profile.tsx`

---

## Routes & Navigation

### Delivery Staff Routes

#### Terms & Privacy
- **Route**: `/(delivery)/terms-privacy`
- **Accessed from**:
  - Delivery Profile: `router.push('/(delivery)/terms-privacy')`
  - Delivery Settings: `router.push('/(delivery)/terms-privacy')`

#### Help & Support
- **Route**: `/(delivery)/help-support`
- **Accessed from**:
  - Delivery Profile: `router.push('/(delivery)/help-support')`
  - Delivery Settings: `router.push('/(delivery)/help-support')`

### Customer Routes

#### Help & Support
- **Route**: `/(customer)/profile/help-support`
- **Accessed from**:
  - Customer Profile: `router.push('/(customer)/profile/help-support')`

#### Terms & Privacy (via Settings)
- **Route**: Not directly accessible (shown as alerts in customer settings)
- **Note**: Customer settings show Privacy Policy and Terms of Service as alerts, not full screens

---

## Terms & Privacy Implementation

### File: `app/(delivery)/terms-privacy.tsx`

#### Features:
1. **Tab Navigation**: Toggle between "Terms of Service" and "Privacy Policy"
2. **Scrollable Content**: All content in scrollable cards
3. **Contact Information**: Footer with contact details
4. **Last Updated**: Shows last update date

#### Component Structure:

```typescript
// State
const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

// Content Arrays
const termsContent = [...]; // 6 sections
const privacyContent = [...]; // 6 sections
```

#### Terms of Service Content (6 Sections):

1. **Delivery Partner Agreement**
   - Valid driver's license requirement
   - Vehicle insurance requirement
   - Vehicle maintenance responsibility

2. **Order Acceptance and Delivery**
   - Accept/decline delivery requests
   - Timely delivery commitment
   - Customer identity verification

3. **Customer Service Standards**
   - Professional behavior
   - Food handling standards
   - Communication requirements

4. **Safety and Compliance**
   - Traffic laws compliance
   - No phone while driving
   - Incident reporting

5. **Earnings and Payments**
   - Earnings calculation
   - Weekly payment processing
   - Quality-based adjustments

6. **Termination**
   - Termination process
   - Equipment return
   - Pending deliveries

#### Privacy Policy Content (6 Sections):

1. **Information We Collect**
   - Personal information
   - Location data
   - Delivery data
   - Device information

2. **How We Use Your Information**
   - Service delivery
   - Safety and security
   - Performance optimization
   - Communication

3. **Information Sharing**
   - Customer sharing
   - Service providers
   - Legal requirements
   - Business partners

4. **Data Security**
   - Security measures
   - Location encryption
   - Access limitations
   - Regular updates

5. **Your Rights and Choices**
   - Access rights
   - Location services control
   - Communication preferences
   - Data deletion

6. **Data Retention**
   - Active account retention
   - Legal requirements
   - Service history
   - Anonymized data

#### Contact Information:
- **Email**: legal@kitchenone.com
- **Facebook**: Kitchen One
- **Phone**: +63 909 474 4215
- **Address**: San Vicente, Bulan, Sorsogon, Philippines

---

## Help & Support Implementation

### Delivery Staff: `app/(delivery)/help-support.tsx`

#### Features:
1. **Quick Actions**:
   - Contact Support (Call/Email/Live Chat)
   - Report an Issue
   - Delivery Guide

2. **FAQ System**:
   - Category filtering (All, Orders, Delivery, Earnings, Payment, Issues, Account)
   - Expandable FAQ items
   - 8 FAQ items total

3. **Contact Information**:
   - Phone: +63 909 474 4215
   - Email: support@kitchenone.com
   - Hours: 6:00 AM - 12:00 AM
   - Main Branch: San Vicente, Bulan, Sorsogon

4. **Emergency Contact**:
   - Emergency: +63 909 474 4215
   - For urgent delivery issues, safety concerns, or accidents

#### Delivery FAQ Items (8 total):

1. **How do I accept a delivery order?**
   - Category: Orders
   - Answer: Notification-based acceptance system

2. **How do I complete a delivery?**
   - Category: Delivery
   - Answer: Tap "Complete Delivery" in order details

3. **What if I can't find the customer's address?**
   - Category: Delivery
   - Answer: Contact customer or support

4. **How do I track my earnings?**
   - Category: Earnings
   - Answer: View in profile statistics

5. **What if a customer is not available?**
   - Category: Delivery
   - Answer: Call, wait 5 minutes, contact support

6. **How do I report an issue with an order?**
   - Category: Issues
   - Answer: Use "Report Issue" or contact support

7. **What payment methods do customers use?**
   - Category: Payment
   - Answer: Cash, GCash, online payments

8. **How do I update my availability status?**
   - Category: Account
   - Answer: Automatically set when online

#### Contact Support Options:
- **Call Us**: `tel:+639094744215`
- **Email Us**: `mailto:support@kitchenone.com`
- **Live Chat**: Coming soon (alert)

#### Report Issue Types:
- Delivery Problem
- App Problem
- Payment Issue
- Customer Issue

---

### Customer: `app/(customer)/profile/help-support.tsx`

#### Features:
1. **Quick Actions**:
   - Contact Support (Call/Email/Live Chat)
   - Report an Issue
   - Order History (navigates to orders screen)

2. **FAQ System**:
   - Category filtering (All, Ordering, Delivery, Payment, Issues)
   - Expandable FAQ items
   - 6 FAQ items total

3. **Contact Information**:
   - Phone: +63 909 474 4215
   - Email: support@kitchenone.com
   - Hours: 8:00 AM - 10:00 PM

#### Customer FAQ Items (6 total):

1. **How do I place an order?**
   - Category: Ordering
   - Answer: Browse menu, add to cart, checkout

2. **How long does delivery take?**
   - Category: Delivery
   - Answer: 30-45 minutes, trackable

3. **Can I cancel my order?**
   - Category: Ordering
   - Answer: Within 5 minutes, or contact support

4. **What payment methods do you accept?**
   - Category: Payment
   - Answer: Cash, GCash, online payments

5. **How do I track my order?**
   - Category: Delivery
   - Answer: Profile > Track Orders

6. **What if my food arrives cold or incorrect?**
   - Category: Issues
   - Answer: Contact immediately for resolution

#### Contact Support Options:
- **Call Us**: `tel:+639094744215`
- **Email Us**: `mailto:support@kitchenone.com`
- **Live Chat**: Coming soon (alert)

#### Report Issue Types:
- Order Problem
- App Problem
- Payment Issue

---

## All Strings & Content

### Terms & Privacy Screen Strings

#### Header:
- **Title**: "Terms & Privacy"
- **Subtitle**: "Legal information for delivery partners"

#### Tab Labels:
- **Terms Tab**: "Terms of Service" (icon: `document-text`)
- **Privacy Tab**: "Privacy Policy" (icon: `shield-checkmark`)

#### Terms Intro:
"These Terms of Service govern your relationship with KitchenOne as a delivery partner. By using our platform, you agree to these terms and our delivery standards."

#### Privacy Intro:
"This Privacy Policy explains how KitchenOne collects, uses, and protects your personal information as a delivery partner. We are committed to protecting your privacy and being transparent about our data practices."

#### Contact Section:
- **Title**: "Contact Us"
- **Text**: "If you have questions about these Terms of Service or Privacy Policy, please contact us:"
- **Email**: support@kitchenone.com
- **Phone**: +63 909 474 4215
- **Address**: San Vicente, Bulan, Sorsogon, Philippines


---

### Help & Support Screen Strings

#### Delivery Staff Header:
- **Title**: "Help & Support"
- **Subtitle**: "We're here to help you"

#### Customer Header:
- **Title**: "Help & Support"
- **Subtitle**: "We're here to help you"

#### Quick Actions Section:
- **Title**: "Quick Actions"
- **Contact Support**: "Contact Support" / "Get help from our team"
- **Report Issue**: "Report an Issue" / "Tell us about a problem"
- **Delivery Guide** (Delivery only): "Delivery Guide" / "Learn delivery best practices"
- **Order History** (Customer only): "Order History" / "View your past orders"

#### FAQ Section:
- **Title**: "Frequently Asked Questions"
- **Categories** (Delivery): All, Orders, Delivery, Earnings, Payment, Issues, Account
- **Categories** (Customer): All, Ordering, Delivery, Payment, Issues

#### Contact Information Section:
- **Title**: "Contact Information"
- **Phone Label**: "Phone:"
- **Email Label**: "Email:"
- **Hours Label**: "Hours:"
- **Office Label** (Delivery only): "Office:"

#### Emergency Contact Section (Delivery only):
- **Title**: "Emergency Contact"
- **Label**: "Emergency:"
- **Note**: "Use this number for urgent delivery issues, safety concerns, or accidents."

---

### Navigation Strings (from Profile/Settings)

#### Delivery Profile Actions:
- **Settings**: "Settings"
- **Help & Support**: "Help & Support"
- **Terms & Privacy**: "Terms & Privacy"
- **Sign Out**: "Sign Out"

#### Customer Profile Actions:
- **Manage Addresses**: "Manage Addresses"
- **Settings**: "Settings"
- **Help & Support**: "Help & Support"
- **About**: "About"

#### Settings Screen Strings:

**Delivery Settings:**
- **Privacy Policy**: "Privacy Policy" / "Read our privacy policy"
- **Terms of Service**: "Terms of Service" / "Read our terms of service"
- **Help & Support**: "Help & Support" / "Get help and contact support"

**Customer Settings:**
- **Privacy Policy**: "Privacy Policy" / "Read our privacy policy" (shows alert)
- **Terms of Service**: "Terms of Service" / "Read our terms of service" (shows alert)

---

## Component Structure

### Terms & Privacy Component

```typescript
DeliveryTermsPrivacyScreen
├── Header
│   ├── Back Button
│   └── Title & Subtitle
├── Tab Navigation
│   ├── Terms Tab
│   └── Privacy Tab
└── ScrollView Content
    ├── Intro Card
    ├── Content Sections (6 each)
    ├── Contact Information Card
    └── Footer (Last Updated)
```

### Help & Support Component

```typescript
HelpSupportScreen
├── Header
│   ├── Back Button
│   └── Title & Subtitle
└── ScrollView Content
    ├── Quick Actions Card
    │   ├── Contact Support
    │   ├── Report Issue
    │   └── Additional Action
    ├── FAQ Card
    │   ├── Category Filter (Horizontal Scroll)
    │   └── FAQ Items (Expandable)
    ├── Contact Information Card
    └── Emergency Contact Card (Delivery only)
```

---

## Navigation Flow

### Delivery Staff Flow:

```
Profile Screen
├── Settings → Settings Screen
│   ├── Privacy Policy → Terms & Privacy Screen
│   ├── Terms of Service → Terms & Privacy Screen
│   └── Help & Support → Help & Support Screen
├── Help & Support → Help & Support Screen
└── Terms & Privacy → Terms & Privacy Screen
```

### Customer Flow:

```
Profile Screen
├── Settings → Settings Screen
│   ├── Privacy Policy → Alert (not implemented)
│   └── Terms of Service → Alert (not implemented)
└── Help & Support → Help & Support Screen
```

---

## Implementation Details

### Key Dependencies:
- `react-native` - Core components
- `@expo/vector-icons` (Ionicons) - Icons
- `expo-router` - Navigation
- Custom components: `Card`, `Button`
- Constants: `Colors`, `Layout`, `Fonts`

### Styling:
- Uses centralized `Colors` and `Layout` constants
- Consistent spacing with `Layout.spacing.*`
- Responsive font sizes with `Layout.fontSize.*`
- Card-based design with rounded corners

### State Management:
- Local state with `useState` hooks
- Tab state for Terms/Privacy toggle
- FAQ expansion state
- Category filter state

### Contact Actions:
- Uses `Linking.openURL()` for phone (`tel:`) and email (`mailto:`)
- Alert dialogs for multi-option selections
- Navigation with `router.push()` for internal routes

---

## Complete Content Arrays

### Terms Content Structure:

```typescript
{
  title: string,
  content: string[]  // Array of paragraphs
}[]
```

### Privacy Content Structure:

```typescript
{
  title: string,
  content: string[]  // Array of paragraphs
}[]
```

### FAQ Structure:

```typescript
{
  id: number,
  question: string,
  answer: string,
  category: string
}[]
```

---

## Summary

### Terms & Privacy:
- **Location**: Delivery staff only
- **Route**: `/(delivery)/terms-privacy`
- **Features**: Tab navigation, 6 sections each, contact info
- **Access**: Profile or Settings

### Help & Support:
- **Location**: Both customer and delivery
- **Routes**: 
  - `/(delivery)/help-support` (Delivery)
  - `/(customer)/profile/help-support` (Customer)
- **Features**: Quick actions, FAQ with categories, contact info
- **Access**: Profile or Settings

### Key Differences:
1. **Customer** has Help & Support only
2. **Delivery** has both Help & Support AND Terms & Privacy
3. **FAQ content** differs between customer and delivery
4. **Contact info** differs (different emails, hours)
5. **Delivery** has emergency contact section

---

## Implementation Checklist for New Project

- [ ] Create Terms & Privacy screen component
- [ ] Create Help & Support screen component (customer version)
- [ ] Create Help & Support screen component (delivery version)
- [ ] Add routes to navigation structure
- [ ] Add navigation links in Profile screens
- [ ] Add navigation links in Settings screens
- [ ] Implement FAQ data structure
- [ ] Implement Terms/Privacy content structure
- [ ] Add contact information
- [ ] Implement Linking for phone/email
- [ ] Style components with consistent design system
- [ ] Test navigation flows
- [ ] Test FAQ expansion/collapse
- [ ] Test category filtering
- [ ] Test contact actions

---

**Last Updated**: Based on December 2024 implementation
