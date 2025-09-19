# 📱 Responsive Design System

This document outlines the comprehensive responsive design system implemented for the Kitchen One food delivery app, ensuring optimal user experience across all device sizes.

## 🎯 Overview

The responsive design system provides:
- **Device-aware layouts** that adapt to screen sizes
- **Consistent spacing and typography** across all devices
- **Optimized touch targets** for different screen sizes
- **Flexible grid system** for content organization
- **Responsive components** that automatically adjust

## 📏 Breakpoints

### Device Categories
- **Small**: < 375px (iPhone SE, small Android)
- **Medium**: 375px - 414px (iPhone 12, 13, 14)
- **Large**: 414px - 768px (iPhone 14 Plus, large Android)
- **Tablet**: >= 768px (iPad, Android tablets)

### Breakpoint Values
```typescript
Breakpoints = {
  xs: 0,      // Extra small devices
  sm: 375,    // Small devices (phones)
  md: 414,    // Medium devices (large phones)
  lg: 768,    // Large devices (tablets)
  xl: 1024,   // Extra large devices (large tablets)
}
```

## 🧩 Responsive Components

### ResponsiveView
A flexible container component that adapts to different screen sizes.

```typescript
<ResponsiveView
  padding="md"           // Responsive padding
  margin="lg"            // Responsive margin
  flexDirection="row"    // Layout direction
  justifyContent="center" // Content alignment
  hideOnSmall={true}     // Hide on small devices
  showOnlyOnTablet={true} // Show only on tablets
>
  <Text>Content</Text>
</ResponsiveView>
```

### ResponsiveText
Text component with responsive sizing and styling.

```typescript
<ResponsiveText
  size="lg"              // Responsive font size
  weight="semiBold"      // Font weight
  color="#333"           // Text color
  align="center"         // Text alignment
  hideOnSmall={true}     // Hide on small devices
>
  Responsive Text
</ResponsiveText>
```

### ResponsiveButton
Button component with responsive sizing and variants.

```typescript
<ResponsiveButton
  variant="primary"      // Button style
  size="medium"         // Button size
  fullWidth={true}      // Full width button
  loading={false}       // Loading state
  icon={<Icon />}       // Icon component
>
  Button Text
</ResponsiveButton>
```

### ResponsiveInput
Input component with responsive sizing and validation.

```typescript
<ResponsiveInput
  size="medium"         // Input size
  label="Email"         // Input label
  error="Invalid email" // Error message
  leftIcon={<Icon />}   // Left icon
  rightIcon={<Icon />}  // Right icon
/>
```

### ResponsiveGrid
Grid layout component for organizing content.

```typescript
<ResponsiveGrid
  data={items}          // Data array
  columns={2}           // Number of columns
  spacing={16}          // Item spacing
  itemAspectRatio={1}   // Item aspect ratio
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

## 📐 Spacing System

### Responsive Spacing Scale
```typescript
ResponsiveSpacing = {
  none: 0,
  xxs: responsiveValue(2, 3, 4, 6),    // 2px on small, 6px on tablet
  xs: responsiveValue(4, 5, 6, 8),     // 4px on small, 8px on tablet
  sm: responsiveValue(8, 9, 10, 12),   // 8px on small, 12px on tablet
  md: responsiveValue(12, 14, 16, 20), // 12px on small, 20px on tablet
  lg: responsiveValue(16, 18, 20, 24), // 16px on small, 24px on tablet
  xl: responsiveValue(20, 22, 24, 28), // 20px on small, 28px on tablet
  xxl: responsiveValue(24, 26, 28, 32), // 24px on small, 32px on tablet
  xxxl: responsiveValue(32, 36, 40, 48), // 32px on small, 48px on tablet
  huge: responsiveValue(40, 44, 48, 56), // 40px on small, 56px on tablet
}
```

### Usage
```typescript
// Using predefined spacing
<ResponsiveView padding="md" margin="lg" />

// Using responsive functions
<ResponsiveView 
  padding={Responsive.getResponsiveSpacing(16)} 
  margin={Responsive.getResponsiveMargin(20)} 
/>
```

## 🔤 Typography System

### Responsive Text Sizes
```typescript
TextSizes = {
  xxs: responsiveValue(8, 9, 10, 12),   // 8px on small, 12px on tablet
  xs: responsiveValue(10, 11, 12, 14),  // 10px on small, 14px on tablet
  sm: responsiveValue(12, 13, 14, 16),  // 12px on small, 16px on tablet
  md: responsiveValue(14, 15, 16, 18),  // 14px on small, 18px on tablet
  lg: responsiveValue(16, 17, 18, 20),  // 16px on small, 20px on tablet
  xl: responsiveValue(18, 19, 20, 22),  // 18px on small, 22px on tablet
  xxl: responsiveValue(20, 22, 24, 26), // 20px on small, 26px on tablet
  xxxl: responsiveValue(24, 26, 28, 32), // 24px on small, 32px on tablet
  display: responsiveValue(28, 30, 32, 36), // 28px on small, 36px on tablet
}
```

### Font Weights
```typescript
FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
}
```

## 🎨 Component Sizes

### Button Sizes
```typescript
ButtonSizes = {
  small: {
    height: responsiveValue(32, 36, 40, 48),
    paddingHorizontal: responsiveValue(12, 14, 16, 20),
    fontSize: responsiveValue(12, 13, 14, 16),
  },
  medium: {
    height: responsiveValue(40, 44, 48, 56),
    paddingHorizontal: responsiveValue(16, 18, 20, 24),
    fontSize: responsiveValue(14, 15, 16, 18),
  },
  large: {
    height: responsiveValue(48, 52, 56, 64),
    paddingHorizontal: responsiveValue(20, 22, 24, 28),
    fontSize: responsiveValue(16, 17, 18, 20),
  },
}
```

### Input Sizes
```typescript
InputSizes = {
  small: {
    height: responsiveValue(36, 40, 44, 48),
    paddingHorizontal: responsiveValue(12, 14, 16, 20),
    fontSize: responsiveValue(12, 13, 14, 16),
  },
  medium: {
    height: responsiveValue(44, 48, 52, 56),
    paddingHorizontal: responsiveValue(16, 18, 20, 24),
    fontSize: responsiveValue(14, 15, 16, 18),
  },
  large: {
    height: responsiveValue(52, 56, 60, 64),
    paddingHorizontal: responsiveValue(20, 22, 24, 28),
    fontSize: responsiveValue(16, 17, 18, 20),
  },
}
```

### Image Sizes
```typescript
ImageSizes = {
  avatar: {
    small: responsiveValue(32, 36, 40, 48),
    medium: responsiveValue(48, 56, 64, 72),
    large: responsiveValue(64, 72, 80, 96),
  },
  product: {
    small: responsiveValue(80, 90, 100, 120),
    medium: responsiveValue(120, 140, 160, 200),
    large: responsiveValue(160, 180, 200, 240),
  },
  category: {
    small: responsiveValue(40, 45, 50, 60),
    medium: responsiveValue(60, 70, 80, 100),
    large: responsiveValue(80, 90, 100, 120),
  },
}
```

## 📱 Grid System

### Auto-responsive Grid
```typescript
// Automatically adjusts columns based on device size
<ResponsiveGrid
  data={items}
  columns="auto"  // 2 cols on phone, 3 on large phone, 4 on tablet
  spacing={16}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### Fixed Columns
```typescript
<ResponsiveGrid
  data={items}
  columns={2}     // Always 2 columns
  spacing={16}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### Custom Item Sizing
```typescript
<ResponsiveGrid
  data={items}
  columns={3}
  spacing={20}
  itemAspectRatio={1.2}  // 1.2:1 aspect ratio
  itemMinWidth={100}     // Minimum item width
  itemMaxWidth={200}     // Maximum item width
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

## 🎯 Responsive Utilities

### Device Detection
```typescript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { 
    deviceSize, 
    isTablet, 
    isSmallDevice, 
    isLargeDevice 
  } = useResponsive();

  return (
    <View>
      {isTablet && <TabletSpecificContent />}
      {isSmallDevice && <SmallDeviceContent />}
    </View>
  );
};
```

### Responsive Values
```typescript
import Responsive from '../constants/Responsive';

// Get different values based on device size
const fontSize = Responsive.responsiveValue(14, 16, 18, 20);
const padding = Responsive.responsiveValue(16, 18, 20, 24);
const width = Responsive.responsiveWidth(80); // 80% of screen width
const height = Responsive.responsiveHeight(20); // 20% of screen height
```

### Scaling Functions
```typescript
// Scale font size based on screen width
const scaledFontSize = Responsive.scaleFontSize(16);

// Scale any dimension based on screen width
const scaledSize = Responsive.scaleSize(100);
```

## 🎨 Layout Patterns

### Card Layout
```typescript
<ResponsiveView
  backgroundColor="#fff"
  borderRadius="lg"
  padding="md"
  shadow={true}
  shadowLevel="sm"
>
  <ResponsiveText size="lg" weight="bold" marginBottom="sm">
    Card Title
  </ResponsiveText>
  <ResponsiveText size="md" color="#666">
    Card content goes here
  </ResponsiveText>
</ResponsiveView>
```

### List Item Layout
```typescript
<ResponsiveView
  flexDirection="row"
  alignItems="center"
  padding="md"
  backgroundColor="#fff"
  borderBottomWidth={1}
  borderBottomColor="#eee"
>
  <ResponsiveView
    width={Responsive.ImageSizes.avatar.medium}
    height={Responsive.ImageSizes.avatar.medium}
    borderRadius="round"
    backgroundColor="#f0f0f0"
    marginRight="md"
  />
  <ResponsiveView flex={1}>
    <ResponsiveText size="md" weight="semiBold">
      Item Title
    </ResponsiveText>
    <ResponsiveText size="sm" color="#666">
      Item subtitle
    </ResponsiveText>
  </ResponsiveView>
  <MaterialIcons name="chevron-right" size={24} color="#999" />
</ResponsiveView>
```

### Form Layout
```typescript
<ResponsiveView padding="lg">
  <ResponsiveText size="xl" weight="bold" marginBottom="lg">
    Form Title
  </ResponsiveText>
  
  <ResponsiveInput
    label="Email"
    placeholder="Enter your email"
    size="medium"
    marginBottom="md"
  />
  
  <ResponsiveInput
    label="Password"
    placeholder="Enter your password"
    secureTextEntry
    size="medium"
    marginBottom="lg"
  />
  
  <ResponsiveButton
    variant="primary"
    size="large"
    fullWidth
  >
    Submit
  </ResponsiveButton>
</ResponsiveView>
```

## 📱 Screen-Specific Adaptations

### Small Devices (< 375px)
- Reduced padding and margins
- Smaller font sizes
- Compact button heights
- Single column layouts
- Condensed spacing

### Medium Devices (375px - 414px)
- Standard padding and margins
- Regular font sizes
- Standard button heights
- Two column layouts
- Balanced spacing

### Large Devices (414px - 768px)
- Increased padding and margins
- Larger font sizes
- Taller button heights
- Three column layouts
- Generous spacing

### Tablets (>= 768px)
- Maximum padding and margins
- Largest font sizes
- Tallest button heights
- Four column layouts
- Spacious layouts

## 🎯 Best Practices

### 1. Use Responsive Components
Always use responsive components instead of regular React Native components for consistent behavior.

### 2. Test on Multiple Devices
Test your layouts on different screen sizes to ensure proper adaptation.

### 3. Use Semantic Sizing
Use semantic size names (small, medium, large) instead of pixel values.

### 4. Leverage Breakpoints
Use breakpoint-specific styling when needed for complex layouts.

### 5. Optimize Touch Targets
Ensure touch targets are at least 44px on all devices.

### 6. Consider Content Density
Adjust content density based on screen size for optimal readability.

## 🔧 Customization

### Adding New Responsive Values
```typescript
// In constants/Responsive.ts
export const CustomSizes = {
  mySize: responsiveValue(10, 12, 14, 16),
};
```

### Creating Custom Responsive Components
```typescript
const MyResponsiveComponent = ({ size = 'medium', ...props }) => {
  const { responsiveValue } = useResponsive();
  
  const componentSize = responsiveValue(
    size === 'small' ? 20 : 30,
    size === 'small' ? 24 : 36,
    size === 'small' ? 28 : 42,
    size === 'small' ? 32 : 48
  );
  
  return (
    <View style={{ width: componentSize, height: componentSize }} {...props} />
  );
};
```

## 📊 Performance Considerations

### 1. Memoize Responsive Values
```typescript
const MyComponent = () => {
  const fontSize = useMemo(() => Responsive.responsiveValue(14, 16, 18, 20), []);
  
  return <Text style={{ fontSize }}>Text</Text>;
};
```

### 2. Use Responsive Hook
The `useResponsive` hook provides memoized values for better performance.

### 3. Avoid Inline Calculations
Pre-calculate responsive values when possible to avoid repeated calculations.

## 🎨 Design Tokens

The responsive design system uses a comprehensive set of design tokens that automatically adapt to different screen sizes, ensuring consistency and maintainability across the entire application.

---

**Note**: This responsive design system is designed to work seamlessly with the existing Kitchen One app architecture and provides a solid foundation for building responsive user interfaces that work across all device sizes.
