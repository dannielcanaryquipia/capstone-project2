// Design System: String constants used across the app

export const Strings = {
  // App Information
  appName: 'KITCHEN ONE',
  appTagline: 'Delicious food, delivered fresh',
  
  // Authentication
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  forgotPassword: 'Forgot Password?',
  resetPassword: 'Reset Password',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  fullName: 'Full Name',
  phoneNumber: 'Phone Number',
  username: 'Username',
  
  // Auth UI Labels
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  fullNameLabel: 'Full Name',
  confirmPasswordLabel: 'Confirm Password',
  phoneLabel: 'Phone Number',
  optional: '(Optional)',
  
  // Auth CTAs and Links
  signInCta: 'Sign In',
  signUpCta: 'Create Account',
  forgotPasswordCta: 'Forgot Password?',
  dontHaveAccount: "Don't have an account?",
  alreadyHaveAccount: 'Already have an account?',
  signInTitle: 'Sign In',
  signUpTitle: 'Sign Up',
  
  // Auth Messages
  signInSuccess: 'Successfully signed in!',
  signUpSuccess: 'Account created successfully!',
  signOutSuccess: 'Successfully signed out!',
  passwordResetSent: 'Password reset email sent!',
  invalidCredentials: 'Invalid email or password',
  emailAlreadyExists: 'Email already exists',
  passwordsDoNotMatch: 'Passwords do not match',
  weakPassword: 'Password is too weak',
  
  // Navigation
  home: 'Home',
  menu: 'Menu',
  cart: 'Cart',
  orders: 'Orders',
  profile: 'Profile',
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  inventory: 'Inventory',
  users: 'Users',
  reports: 'Reports',
  delivery: 'Delivery',
  
  // Customer Features
  browseMenu: 'Browse Menu',
  placeOrder: 'Place Order',
  trackOrder: 'Track Order',
  orderHistory: 'Order History',
  recommendedItems: 'Recommended for You',
  popularItems: 'Popular Items',
  searchProducts: 'Search products...',
  addToCart: 'Add to Cart',
  removeFromCart: 'Remove',
  updateQuantity: 'Update Quantity',
  proceedToCheckout: 'Proceed to Checkout',
  orderConfirmation: 'Order Confirmation',
  
  // Order Status
  orderPending: 'Pending',
  orderPreparing: 'Preparing',
  orderReady: 'Ready for Pickup',
  orderOutForDelivery: 'Out for Delivery',
  orderDelivered: 'Delivered',
  orderCancelled: 'Cancelled',
  
  // Payment
  paymentMethod: 'Payment Method',
  cashOnDelivery: 'Cash on Delivery (COD)',
  cashOnPayment: 'Cash on Payment (GCash)',
  paymentPending: 'Payment Pending',
  paymentVerified: 'Payment Verified',
  paymentFailed: 'Payment Failed',
  uploadProofOfPayment: 'Upload Proof of Payment',
  selectPaymentMethod: 'Select Payment Method',
  totalAmount: 'Total Amount',
  subtotal: 'Subtotal',
  deliveryFee: 'Delivery Fee',
  
  // Admin Features
  manageMenu: 'Manage Menu',
  manageOrders: 'Manage Orders',
  manageInventory: 'Manage Inventory',
  manageUsers: 'Manage Users',
  generateReports: 'Generate Reports',
  addProduct: 'Add Product',
  editProduct: 'Edit Product',
  deleteProduct: 'Delete Product',
  addCategory: 'Add Category',
  editCategory: 'Edit Category',
  deleteCategory: 'Delete Category',
  updateStock: 'Update Stock',
  lowStockAlert: 'Low Stock Alert',
  salesReport: 'Sales Report',
  inventoryReport: 'Inventory Report',
  userReport: 'User Report',
  
  // Delivery Staff Features
  assignedOrders: 'Assigned Orders',
  pickupOrder: 'Pickup Order',
  deliverOrder: 'Deliver Order',
  confirmDelivery: 'Confirm Delivery',
  confirmPayment: 'Confirm Payment',
  updateDeliveryStatus: 'Update Delivery Status',
  
  // Product Management
  productName: 'Product Name',
  productDescription: 'Product Description',
  productPrice: 'Product Price',
  productCategory: 'Product Category',
  productImage: 'Product Image',
  productGallery: 'Product Gallery',
  productAvailability: 'Product Availability',
  productRating: 'Product Rating',
  isRecommended: 'Recommended Item',
  isAvailable: 'Available',
  
  // Pizza Specific
  pizzaSize: 'Pizza Size',
  pizzaCrust: 'Pizza Crust',
  selectSize: 'Select Size',
  selectCrust: 'Select Crust',
  customizePizza: 'Customize Your Pizza',
  
  // Address Management
  deliveryAddress: 'Delivery Address',
  addAddress: 'Add Address',
  editAddress: 'Edit Address',
  deleteAddress: 'Delete Address',
  setDefaultAddress: 'Set as Default',
  addressLabel: 'Address Label (e.g., Home, Office)',
  fullAddress: 'Full Address',
  isDefaultAddress: 'Default Address',
  
  // User Management
  userRole: 'User Role',
  customer: 'Customer',
  admin: 'Admin',
  deliveryStaff: 'Delivery Staff',
  changeRole: 'Change Role',
  userDetails: 'User Details',
  userActivity: 'User Activity',
  
  // Common Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  update: 'Update',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  close: 'Close',
  open: 'Open',
  view: 'View',
  details: 'Details',
  
  // Messages
  loading: 'Loading...',
  noData: 'No data available',
  noOrders: 'No orders found',
  noProducts: 'No products found',
  noUsers: 'No users found',
  noCategories: 'No categories found',
  orderPlacedSuccess: 'Order placed successfully!',
  orderUpdatedSuccess: 'Order updated successfully!',
  productAddedSuccess: 'Product added successfully!',
  productUpdatedSuccess: 'Product updated successfully!',
  productDeletedSuccess: 'Product deleted successfully!',
  categoryAddedSuccess: 'Category added successfully!',
  categoryUpdatedSuccess: 'Category updated successfully!',
  categoryDeletedSuccess: 'Category deleted successfully!',
  userUpdatedSuccess: 'User updated successfully!',
  stockUpdatedSuccess: 'Stock updated successfully!',
  deliveryConfirmedSuccess: 'Delivery confirmed successfully!',
  paymentConfirmedSuccess: 'Payment confirmed successfully!',
  
  // Errors
  somethingWentWrong: 'Something went wrong',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  permissionDenied: 'You do not have permission to perform this action.',
  orderNotFound: 'Order not found',
  productNotFound: 'Product not found',
  userNotFound: 'User not found',
  
  // Confirmations
  confirmDelete: 'Are you sure you want to delete this item?',
  confirmCancelOrder: 'Are you sure you want to cancel this order?',
  confirmLogout: 'Are you sure you want to sign out?',
  
  // Notifications
  orderStatusUpdate: 'Order status updated',
  newOrderReceived: 'New order received',
  paymentReceived: 'Payment received',
  deliveryAssigned: 'Delivery assigned',
  
  // AI Recommendations
  basedOnYourHistory: 'Based on your order history',
  popularThisWeek: 'Popular this week',
  trendingNow: 'Trending now',
  youMightLike: 'You might also like',
  
  // Time and Date
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  dateFormat: 'MMM dd, yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'MMM dd, yyyy HH:mm',
  
  // Currency
  currency: '₱',
  currencyFormat: '₱{amount}',
  
  // Validation Messages
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidPassword: 'Password must be at least 6 characters',
  passwordMismatch: 'Passwords do not match',
  invalidQuantity: 'Please enter a valid quantity',
  invalidPrice: 'Please enter a valid price',
  invalidAddress: 'Please enter a complete address',
  
  // Empty States
  emptyCart: 'Your cart is empty',
  emptyOrders: 'No orders yet',
  emptyProducts: 'No products available',
  emptyCategories: 'No categories available',
  emptyUsers: 'No users found',
  emptySearch: 'No results found for your search',
  
  // Help and Support
  help: 'Help',
  support: 'Support',
  contactUs: 'Contact Us',
  about: 'About',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  faq: 'Frequently Asked Questions',
  
  // Settings
  settings: 'Settings',
  notifications: 'Notifications',
  language: 'Language',
  theme: 'Theme',
  darkMode: 'Dark Mode',
  lightMode: 'Light Mode',
  autoMode: 'Auto',
  
  // Version and Build
  version: 'Version',
  build: 'Build',
  copyright: '© 2024 Kitchen One. All rights reserved.',
} as const;

export type StringsType = typeof Strings;
export default Strings;


