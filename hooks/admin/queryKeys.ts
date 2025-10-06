export const adminQueryKeys = {
  products: (filters?: Record<string, unknown>) => ['admin', 'products', filters ?? {}] as const,
  categories: () => ['admin', 'categories'] as const,
  orders: (filters?: Record<string, unknown>) => ['admin', 'orders', filters ?? {}] as const,
  stats: () => ['admin', 'stats'] as const,
};


