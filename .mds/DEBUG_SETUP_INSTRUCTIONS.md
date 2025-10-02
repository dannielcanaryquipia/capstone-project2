# 🔍 Debug Setup for Product Display Issues

## **✅ Debugging Tools Added:**

### **1. Console Logging**
- **Home Page**: Logs product count, loading state, and first 2 products
- **ProductService**: Logs data fetching success/errors and first product
- **ProductCard**: Logs component props for each card

### **2. Visual Debug Info**
- **Debug Panel**: Shows product count, loading state, and error status
- **Section Counts**: Shows number of popular and recommended products
- **Error Display**: Shows any data fetching errors in red banner

### **3. Debug Service**
- **Connection Test**: Tests basic Supabase connection
- **Table Tests**: Tests products and categories table access
- **Full Query Test**: Tests complete product query with relationships
- **Debug Button**: Tap "Debug" button in header to run all tests

## **🔧 How to Test:**

### **Step 1: Check Console Logs**
1. Open your development console
2. Look for these log messages:
   - `Home Page Debug:` - Shows product data status
   - `ProductService Success:` - Shows data fetching results
   - `ProductCard Debug:` - Shows individual card props

### **Step 2: Use Debug Button**
1. Tap the "Debug" button in the top-right header
2. Check console for test results:
   - `Testing Supabase connection...`
   - `Testing products table access...`
   - `Testing categories table access...`
   - `Testing full product query with relationships...`

### **Step 3: Check Visual Debug Info**
1. Look for the debug panel below the search bar
2. Check if it shows:
   - Products count > 0
   - Loading: No
   - Error: None
   - Popular/Recommended counts > 0

## **🚨 Common Issues to Look For:**

### **1. Supabase Connection Issues**
```
Error: Missing Supabase URL or Anon Key
```
**Fix**: Check your environment variables in `app.json` or `.env`

### **2. Database Permission Issues**
```
Error: permission denied for table products
```
**Fix**: Check RLS policies in Supabase dashboard

### **3. Table Not Found**
```
Error: relation "products" does not exist
```
**Fix**: Check if products table exists in Supabase

### **4. No Data Returned**
```
Products: 0, Loading: No, Error: None
```
**Fix**: Check if products table has data

### **5. ProductCard Not Rendering**
```
ProductCard Debug: { id: undefined, name: undefined, ... }
```
**Fix**: Check if product data is being passed correctly

## **🔧 Expected Debug Output:**

### **Successful Connection:**
```
Home Page Debug: {
  productsCount: 5,
  productsLoading: false,
  productsError: null,
  products: [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Pepperoni Pizza",
      base_price: 12.99,
      image_url: "https://example.com/pizza.jpg",
      is_recommended: true
    }
  ]
}
```

### **Successful ProductService:**
```
ProductService Success: {
  dataCount: 5,
  firstProduct: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Pepperoni Pizza",
    base_price: 12.99,
    category: { name: "Pizza", description: "Italian dishes" }
  }
}
```

### **Successful ProductCard:**
```
ProductCard Debug: {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Pepperoni Pizza",
  price: 12.99,
  image: "https://example.com/pizza.jpg",
  variant: "horizontal",
  hasOnPress: true
}
```

## **🎯 Next Steps Based on Results:**

### **If Products Count = 0:**
1. Check Supabase connection
2. Verify products table has data
3. Check RLS policies
4. Verify environment variables

### **If Products Count > 0 but Cards Don't Show:**
1. Check ProductCard component props
2. Verify image URLs are valid
3. Check for styling issues
4. Verify onPress handlers

### **If Error Messages Appear:**
1. Check specific error details
2. Verify database schema
3. Check foreign key relationships
4. Verify table permissions

## **📱 Testing Checklist:**

- [ ] Debug button works and shows console logs
- [ ] Debug panel shows product count > 0
- [ ] No error messages in debug panel
- [ ] Popular section shows products
- [ ] Recommended section shows products
- [ ] Product cards display name, price, image
- [ ] Product cards are clickable

---

**🎯 Run the debug tests and share the console output to identify the exact issue!**
