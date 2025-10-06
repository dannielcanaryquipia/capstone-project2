// Authentication hooks
export { useAuth } from './useAuth';
export { useAuthActions } from './useAuthActions';
export { useCurrentUserProfile, useProfile } from './useProfile';

// Product hooks
export {
    useLowStockProducts, useProduct,
    useProductCategories, useProducts, useProductSearch, useProductStats
} from './useProducts';

// Order hooks
export {
    useCancelOrder, useCreateOrder, useOrder, useOrders, useOrderStats, useOrderTracking, useUpdateOrderStatus
} from './useOrders';

// Cart hooks
export {
    useCart, useCartActions, useCartItem, useCartPersistence, useCartTotals, useCartValidation
} from './useCart';

// Address hooks
export {
    useAddress, useAddresses, useAddressValidation, useCreateAddress, useDefaultAddress, useDeleteAddress, useSetDefaultAddress, useUpdateAddress
} from './useAddresses';

// Saved products hooks
export {
    useIsProductSaved, useSavedProductIds, useSavedProducts, useSavedProductsCount, useSaveProduct, useToggleSaveProduct, useUnsaveProduct
} from './useSavedProducts';

// Admin hooks
export { useAdminOrders } from './useAdminOrders';
export { useAdminProducts } from './useAdminProducts';
export {
    useOrderStats as useAdminOrderStats, useProductStats as useAdminProductStats, useAdminStats
} from './useAdminStats';

// Delivery hooks
export {
    useAssignOrder, useAvailableOrders, useDeliveryEarnings, useDeliveryLocation, useDeliveryStats, useMyDeliveryOrders, useUpdateDeliveryStatus
} from './useDeliveryOrders';

// Responsive hook
export { useResponsive } from './useResponsive';

// Avatar hook
export { useAvatar } from './useAvatar';

// Form validation hook
export { useFormValidation } from './useFormValidation';

// Recommendation hooks
export { useRecommendations } from './useRecommendations';
export { useTopProducts } from './useTopProducts';

// Analytics hooks
export { useRevenueAnalytics } from './useRevenueAnalytics';

