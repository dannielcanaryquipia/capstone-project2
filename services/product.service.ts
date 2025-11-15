import { supabase } from '../lib/supabase';
import { Product, ProductCategory, ProductFilters, ProductStats, ProductStock } from '../types/product.types';

export class ProductService {
  private static normalizeStock(stock: any, productId: string): ProductStock | undefined {
    if (!stock) return undefined;
    const stockEntry = Array.isArray(stock) ? stock[0] : stock;
    if (!stockEntry) return undefined;
    const lastUpdatedValue = stockEntry.last_updated ?? stockEntry.last_updated_at;

    const normalized: ProductStock = {
      id: stockEntry.id,
      product_id: productId,
      quantity: stockEntry.quantity ?? 0,
      low_stock_threshold: stockEntry.low_stock_threshold ?? undefined,
      last_updated: lastUpdatedValue ?? new Date().toISOString(),
    };

    if (lastUpdatedValue) {
      normalized.last_updated_at = lastUpdatedValue;
    }

    return normalized;
  }

  // Lightweight list for admin screens (no pizza options/crust join)
  static async getProductsLite(
    filters?: ProductFilters,
    options?: { limit?: number; offset?: number }
  ): Promise<Product[]> {
    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          gallery_image_urls,
          category_id,
          is_available,
          is_recommended,
          created_at,
          updated_at,
          stock:product_stock!left(
            id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          ),
          categories:categories(name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }

      if (filters?.is_recommended !== undefined) {
        query = query.eq('is_recommended', filters.is_recommended);
      }

      if (filters?.search) {
        // Escape special characters and use * for wildcards in PostgREST
        const searchTerm = filters.search.replace(/[%_*]/g, '\\$&');
        query = query.or(`name.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*`);
      }

      if (filters?.price_min) {
        query = query.gte('base_price', filters.price_min);
      }

      if (filters?.price_max) {
        query = query.lte('base_price', filters.price_max);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Sort products by search relevance if search is active
      let sortedData = data || [];
      if (filters?.search && sortedData.length > 0) {
        const searchTermLower = filters.search.toLowerCase();
        sortedData = sortedData.sort((a: any, b: any) => {
          const aNameLower = (a.name || '').toLowerCase();
          const bNameLower = (b.name || '').toLowerCase();
          const aDescLower = (a.description || '').toLowerCase();
          const bDescLower = (b.description || '').toLowerCase();

          // Priority 1: Name starts with search term
          const aNameStarts = aNameLower.startsWith(searchTermLower) ? 0 : 1;
          const bNameStarts = bNameLower.startsWith(searchTermLower) ? 0 : 1;
          if (aNameStarts !== bNameStarts) {
            return aNameStarts - bNameStarts;
          }

          // Priority 2: Name contains search term
          const aNameContains = aNameLower.includes(searchTermLower) ? 0 : 1;
          const bNameContains = bNameLower.includes(searchTermLower) ? 0 : 1;
          if (aNameContains !== bNameContains) {
            return aNameContains - bNameContains;
          }

          // Priority 3: Description contains search term
          const aDescContains = aDescLower.includes(searchTermLower) ? 0 : 1;
          const bDescContains = bDescLower.includes(searchTermLower) ? 0 : 1;
          if (aDescContains !== bDescContains) {
            return aDescContains - bDescContains;
          }

          // If same priority, maintain original order (by created_at)
          return 0;
        });
      }

      // Ensure backward-compat price field and map categories to category
      const products = sortedData.map((p: any) => {
        // Handle category data - it might be an object or array
        let categoryData = null;
        if (p.categories) {
          // If categories is an array, take the first one
          if (Array.isArray(p.categories) && p.categories.length > 0) {
            categoryData = { 
              name: p.categories[0].name,
              id: p.category_id 
            };
          } 
          // If categories is an object
          else if (typeof p.categories === 'object' && p.categories.name) {
            categoryData = { 
              name: p.categories.name,
              id: p.category_id 
            };
          }
        }
        
        return {
          ...p,
          price: p.base_price,
          category: categoryData,
          stock: this.normalizeStock(p.stock, p.id)
        };
      });
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products (lite):', error);
      throw error;
    }
  }
  // Get all products with filters
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          gallery_image_urls,
          category_id,
          is_available,
          is_recommended,
          is_featured,
          preparation_time_minutes,
          created_at,
          updated_at,
          stock:product_stock!left(
            id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          ),
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price,
            crust_id
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }

      if (filters?.is_recommended !== undefined) {
        query = query.eq('is_recommended', filters.is_recommended);
      }

      if (filters?.search) {
        // Escape special characters and use * for wildcards in PostgREST
        const searchTerm = filters.search.replace(/[%_*]/g, '\\$&');
        query = query.or(`name.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*`);
      }

      if (filters?.price_min) {
        query = query.gte('base_price', filters.price_min);
      }

      if (filters?.price_max) {
        query = query.lte('base_price', filters.price_max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('ProductService Error:', error);
        throw error;
      }

      // Sort products by search relevance if search is active
      let sortedData = data || [];
      if (filters?.search && sortedData.length > 0) {
        const searchTermLower = filters.search.toLowerCase();
        sortedData = sortedData.sort((a: any, b: any) => {
          const aNameLower = (a.name || '').toLowerCase();
          const bNameLower = (b.name || '').toLowerCase();
          const aDescLower = (a.description || '').toLowerCase();
          const bDescLower = (b.description || '').toLowerCase();

          // Priority 1: Name starts with search term
          const aNameStarts = aNameLower.startsWith(searchTermLower) ? 0 : 1;
          const bNameStarts = bNameLower.startsWith(searchTermLower) ? 0 : 1;
          if (aNameStarts !== bNameStarts) {
            return aNameStarts - bNameStarts;
          }

          // Priority 2: Name contains search term
          const aNameContains = aNameLower.includes(searchTermLower) ? 0 : 1;
          const bNameContains = bNameLower.includes(searchTermLower) ? 0 : 1;
          if (aNameContains !== bNameContains) {
            return aNameContains - bNameContains;
          }

          // Priority 3: Description contains search term
          const aDescContains = aDescLower.includes(searchTermLower) ? 0 : 1;
          const bDescContains = bDescLower.includes(searchTermLower) ? 0 : 1;
          if (aDescContains !== bDescContains) {
            return aDescContains - bDescContains;
          }

          // If same priority, maintain original order (by created_at)
          return 0;
        });
      }

      // Get all crusts for mapping
      const { data: crusts, error: crustsError } = await supabase
        .from('crusts')
        .select('id, name');

      if (crustsError) {
        console.warn('Error fetching crusts:', crustsError);
      }

      const crustMap = new Map<string, any>((crusts || []).map((crust: any) => [crust.id, crust]));

      // Map pizza options with crust information
      const productsWithCrusts = (sortedData || []).map((product: any) => ({
        ...product,
        stock: this.normalizeStock(product.stock, product.id),
        pizza_options: (product.pizza_options || []).map((option: any) => {
          const crust: any = crustMap.get(option.crust_id);
          return {
            ...option,
            crust: crust ? {
              id: option.crust_id,
              name: crust.name
            } : undefined
          };
        })
      }));
      
      return productsWithCrusts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          gallery_image_urls,
          category_id,
          is_available,
          is_recommended,
          is_featured,
          preparation_time_minutes,
          created_at,
          updated_at,
          stock:product_stock!left(
            id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          ),
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price,
            crust_id
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Get all crusts for mapping
      const { data: crusts, error: crustsError } = await supabase
        .from('crusts')
        .select('id, name');

      if (crustsError) {
        console.warn('Error fetching crusts:', crustsError);
      }

      const crustMap = new Map<string, any>((crusts || []).map((crust: any) => [crust.id, crust]));

      // Map pizza options with crust information
      const productRecord: any = data;
      const productWithCrusts = {
        ...productRecord,
        stock: this.normalizeStock(productRecord.stock, productRecord.id),
        pizza_options: (productRecord.pizza_options || []).map((option: any) => {
          const crust: any = crustMap.get(option.crust_id);
          return {
            ...option,
            crust: crust ? {
              id: option.crust_id,
              name: crust.name
            } : undefined
          };
        })
      };

      return productWithCrusts;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product
  static async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    category_id: string;
    image_url?: string;
    is_available?: boolean;
    is_recommended?: boolean;
    preparation_time?: number;
    calories?: number;
    allergens?: string[];
    ingredients?: string[];
    variants?: any[];
  }): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          base_price: productData.price,
          category_id: productData.category_id,
          image_url: productData.image_url,
          is_available: productData.is_available ?? true,
          is_recommended: productData.is_recommended ?? false,
          preparation_time_minutes: productData.preparation_time,
        } as any)
        .select()
        .single();

      if (error) throw error;

      return await this.getProductById((data as any).id) as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(
    productId: string, 
    updates: Partial<Product>
  ): Promise<Product> {
    try {
      // Filter out fields that don't exist in the database schema
      // and map field names to match database columns
      const { 
        allergens, 
        nutritional_info, 
        preparation_time,
        price,
        ...restUpdates 
      } = updates as any;
      
      // Map field names to database column names
      const dbUpdates: any = {
        ...restUpdates,
        updated_at: new Date().toISOString(),
      };
      
      // Map preparation_time to preparation_time_minutes
      if (preparation_time !== undefined) {
        dbUpdates.preparation_time_minutes = preparation_time;
      }
      
      // Map price to base_price
      if (price !== undefined) {
        dbUpdates.base_price = price;
      }
      
      const { error } = await (supabase as any)
        .from('products')
        .update(dbUpdates)
        .eq('id', productId);

      if (error) throw error;
      return await this.getProductById(productId) as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async updateProductStock(
    productId: string,
    updates: {
      quantity?: number;
      low_stock_threshold?: number;
    },
    options?: {
      performedBy?: string;
      reason?: string;
    }
  ): Promise<ProductStock> {
    try {
      if (
        updates.quantity !== undefined &&
        (Number.isNaN(updates.quantity) || updates.quantity < 0)
      ) {
        throw new Error('Quantity must be a non-negative number');
      }

      if (
        updates.low_stock_threshold !== undefined &&
        (Number.isNaN(updates.low_stock_threshold) || updates.low_stock_threshold < 0)
      ) {
        throw new Error('Low stock threshold must be a non-negative number');
      }

      let previousQuantity: number | null = null;

      if (updates.quantity !== undefined) {
        const { data: existingStock, error: existingError } = await supabase
          .from('product_stock')
          .select('quantity')
          .eq('product_id', productId)
          .maybeSingle();

        if (existingError) {
          console.warn('Error fetching current stock before update:', existingError);
        } else {
          const existingStockData = existingStock as any;
          if (existingStockData && typeof existingStockData.quantity === 'number') {
            previousQuantity = existingStockData.quantity;
          }
        }
      }

      const payload: Record<string, any> = {
        product_id: productId,
        last_updated_at: new Date().toISOString(),
      };

      if (updates.quantity !== undefined) {
        payload.quantity = updates.quantity;
      }

      if (updates.low_stock_threshold !== undefined) {
        payload.low_stock_threshold = updates.low_stock_threshold;
      }

      const { data, error } = await supabase
        .from('product_stock')
        .upsert(
          payload as any,
          {
            onConflict: 'product_id',
            ignoreDuplicates: false,
          }
        )
        .select(
          `
            id,
            product_id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          `
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update product stock');

      const normalized = this.normalizeStock(data as any, productId);
      if (!normalized) throw new Error('Failed to normalize product stock');

      if (options?.performedBy && updates.quantity !== undefined) {
        const newQuantity = updates.quantity;
        const quantityDelta =
          previousQuantity === null ? newQuantity : newQuantity - previousQuantity;

        if (quantityDelta !== 0) {
          const transactionType =
            quantityDelta > 0 ? 'IN' : quantityDelta < 0 ? 'OUT' : 'ADJUSTMENT';

          try {
            const { error: logError } = await (supabase
              .from('inventory_transactions') as any).insert([
              {
                product_id: productId,
                transaction_type: transactionType,
                quantity: Math.abs(quantityDelta),
                reason: options.reason ?? 'Manual stock adjustment',
                performed_by: options.performedBy,
              },
            ]);

            if (logError) {
              console.warn('Error logging inventory transaction:', logError);
            }
          } catch (logException) {
            console.warn('Unexpected error logging inventory transaction:', logException);
          }
        }
      }

      return normalized;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Delete product and all related data
  static async deleteProduct(productId: string): Promise<void> {
    try {
      // First, get the product to retrieve image URLs and check for related data
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product is used in any orders
      // We need to check if the orders are completed/delivered or still active
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('id, order_id')
        .eq('product_id', productId);

      if (orderItemsError) {
        console.warn('Error checking order items:', orderItemsError);
      }

      // If product is in orders, check order statuses
      if (orderItems && orderItems.length > 0) {
        // Get unique order IDs
        const orderIds = [...new Set(orderItems.map((item: any) => item.order_id))];
        
        // Check order statuses
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, order_number')
          .in('id', orderIds);

        if (ordersError) {
          console.warn('Error checking orders:', ordersError);
          // If we can't check orders, be safe and prevent deletion
          throw new Error('Cannot delete product: Unable to verify order status. Please disable it instead.');
        }

        // Check if any orders are completed/delivered (these should be preserved)
        const completedOrders = orders?.filter((order: any) => {
          const status = order.status?.toLowerCase();
          return status === 'delivered' || 
                 status === 'completed' ||
                 status === 'cancelled';
        }) || [];

        // If there are completed/delivered orders, prevent deletion
        if (completedOrders.length > 0) {
          const orderNumbers = completedOrders.map((o: any) => o.order_number).join(', ');
          throw new Error(
            `Cannot delete product: It is associated with ${completedOrders.length} completed/delivered order(s) (${orderNumbers}). ` +
            `Please disable it instead to preserve order history.`
          );
        }

        // If only pending/preparing orders exist, we can delete the order_items first
        // This allows deletion of products that are only in incomplete orders
        const incompleteOrders = orders?.filter((order: any) => {
          const status = order.status?.toLowerCase();
          return status === 'pending' || 
                 status === 'preparing' ||
                 status === 'ready_for_pickup' ||
                 status === 'out_for_delivery';
        }) || [];

        if (incompleteOrders.length > 0) {
          console.log(`⚠️ Product is in ${orderItems.length} order item(s) from ${incompleteOrders.length} incomplete order(s). Deleting order items first...`);
          
          // Delete order_items that reference this product
          const { error: deleteOrderItemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('product_id', productId);

          if (deleteOrderItemsError) {
            console.warn('Error deleting order items:', deleteOrderItemsError);
            throw new Error(
              `Cannot delete product: Failed to remove it from incomplete orders. ` +
              `Please try again or disable it instead. Error: ${deleteOrderItemsError.message}`
            );
          } else {
            console.log(`✅ Deleted ${orderItems.length} order item(s) associated with this product`);
          }
        }
      }

      // Delete product images from storage
      if (product.image_url) {
        try {
          await this.deleteProductImage(product.image_url);
        } catch (imageError) {
          console.warn('Error deleting product image:', imageError);
          // Continue with deletion even if image deletion fails
        }
      }

      // Delete gallery images if they exist
      if (product.gallery_image_urls && product.gallery_image_urls.length > 0) {
        for (const imageUrl of product.gallery_image_urls) {
          try {
            await this.deleteProductImage(imageUrl);
          } catch (imageError) {
            console.warn('Error deleting gallery image:', imageError);
            // Continue with deletion even if image deletion fails
          }
        }
      }

      // Delete related data manually (in case cascade doesn't work)
      // Delete related data in sequence, but continue even if some fail
      const deleteRelatedData = async () => {
        const operations = [
          // Delete product co-occurrences
          supabase
            .from('product_co_occurrences')
            .delete()
            .or(`product_a_id.eq.${productId},product_b_id.eq.${productId}`),
          
          // Delete user interactions
          supabase
            .from('user_interactions')
            .delete()
            .eq('product_id', productId),
          
          // Delete saved products
          supabase
            .from('saved_products')
            .delete()
            .eq('product_id', productId),
          
          // Delete inventory transactions
          supabase
            .from('inventory_transactions')
            .delete()
            .eq('product_id', productId),
          
          // Delete product stock
          supabase
            .from('product_stock')
            .delete()
            .eq('product_id', productId),
          
          // Delete pizza options
          supabase
            .from('pizza_options')
            .delete()
            .eq('product_id', productId),
        ];

        // Execute all operations, but don't fail if some tables don't exist or have no data
        for (const operation of operations) {
          try {
            const { error } = await operation;
            if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
              // PGRST116 = no rows found, 42P01 = table doesn't exist
              console.warn('Error deleting related data:', error);
            }
          } catch (err: any) {
            console.warn('Error in related data deletion:', err);
            // Continue with deletion
          }
        }
      };

      await deleteRelatedData();

      // Finally, delete the product itself
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Helper method to delete product image from storage
  private static async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || imageUrl.trim() === '') {
        console.warn('Empty image URL provided, skipping deletion');
        return;
      }

      // Extract path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/products/{productId}/{timestamp}.jpg
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'product-images');
      
      if (bucketIndex === -1) {
        // Try alternative URL format: might be a full URL or just a path
        console.warn('Could not extract path from product image URL:', imageUrl);
        
        // Try to extract path if it contains 'product-images' anywhere
        const productImagesIndex = imageUrl.indexOf('product-images/');
        if (productImagesIndex !== -1) {
          const path = imageUrl.substring(productImagesIndex + 'product-images/'.length);
          console.log('🗑️ Deleting product image from extracted path:', path);
          
          const { error } = await supabase.storage
            .from('product-images')
            .remove([path]);

          if (error) {
            console.warn('Error deleting product image (alternative path):', error);
          } else {
            console.log('✅ Product image deleted successfully');
          }
        }
        return;
      }
      
      // Get the path after 'product-images/'
      const pathIndex = bucketIndex + 1;
      const path = urlParts.slice(pathIndex).join('/');
      
      if (!path || path.trim() === '') {
        console.warn('Empty path extracted from URL:', imageUrl);
        return;
      }
      
      console.log('🗑️ Deleting product image from path:', path);
      
      const { error } = await supabase.storage
        .from('product-images')
        .remove([path]);

      if (error) {
        // Check if it's a "file not found" error - that's okay, might already be deleted
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          console.log('ℹ️ Image already deleted or not found:', path);
        } else {
          console.warn('Error deleting product image:', error);
        }
        // Don't throw - allow product deletion to continue
      } else {
        console.log('✅ Product image deleted successfully');
      }
    } catch (error) {
      console.warn('Failed to delete product image:', error);
      // Don't throw - allow product deletion to continue
    }
  }

  // Toggle product availability
  static async toggleAvailability(productId: string): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      if (!product) throw new Error('Product not found');

      return await this.updateProduct(productId, {
        is_available: !product.is_available,
      });
    } catch (error) {
      console.error('Error toggling product availability:', error);
      throw error;
    }
  }

  // Get product categories
  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Create category
  static async createCategory(categoryData: {
    name: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Find or create category by name
  // This is useful when creating products with new categories
  static async findOrCreateCategory(categoryName: string, description?: string): Promise<ProductCategory> {
    try {
      const trimmedName = categoryName.trim();
      if (!trimmedName) {
        throw new Error('Category name cannot be empty');
      }

      // First, try to find existing category by name (case-insensitive)
      const { data: existingCategories, error: searchError } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', trimmedName)
        .limit(1);

      // If we found a category, return it
      if (existingCategories && existingCategories.length > 0) {
        return existingCategories[0];
      }

      // If search error occurred (other than "not found"), log it but continue
      if (searchError && searchError.code !== 'PGRST116') {
        console.warn('Error searching for category:', searchError);
      }

      // Category doesn't exist, create it
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert({
          name: trimmedName,
          description: description || null,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newCategory) {
        throw new Error('Failed to create category - no data returned');
      }
      return newCategory;
    } catch (error) {
      console.error('Error finding or creating category:', error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(
    categoryId: string, 
    updates: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get product statistics
  static async getProductStats(): Promise<ProductStats> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_available, is_recommended, base_price, created_at');

      if (productsError) throw productsError;

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      if (categoriesError) throw categoriesError;

      const productsData = products as any[];
      const categoriesData = categories as any[];

      const stats: ProductStats = {
        total_products: productsData.length,
        available_products: productsData.filter(p => p.is_available).length,
        unavailable_products: productsData.filter(p => !p.is_available).length,
        recommended_products: productsData.filter(p => p.is_recommended).length,
        total_categories: categoriesData.length,
        low_stock_products: 0, // No stock tracking in current schema
        average_price: productsData.length > 0 ? 
          productsData.reduce((sum, p) => sum + p.base_price, 0) / productsData.length : 0,
        new_products_this_month: productsData.filter(p => 
          new Date(p.created_at).getMonth() === new Date().getMonth()
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  // Get low stock products
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const LOW_STOCK_THRESHOLD = 10;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          gallery_image_urls,
          category_id,
          is_available,
          is_recommended,
          is_featured,
          preparation_time_minutes,
          created_at,
          updated_at,
          stock:product_stock!inner(
            id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          ),
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price,
            crust_id
          )
        `)
        .lte('product_stock.quantity', LOW_STOCK_THRESHOLD)
        .order('product_stock.quantity', { ascending: true });

      if (error) throw error;

      const productsWithStock = (data || []).map((product: any) => ({
        ...product,
        stock: this.normalizeStock(product.stock, product.id),
      }));

      return productsWithStock;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          gallery_image_urls,
          category_id,
          is_available,
          is_recommended,
          is_featured,
          preparation_time_minutes,
          created_at,
          updated_at,
          stock:product_stock!left(
            id,
            quantity,
            low_stock_threshold,
            last_updated:last_updated_at
          ),
          category:categories(name, description),
          pizza_options:pizza_options(
            id,
            size,
            price,
            crust_id
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,categories.name.ilike.%${query}%`)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Get all crusts for mapping
      const { data: crusts, error: crustsError } = await supabase
        .from('crusts')
        .select('id, name');

      if (crustsError) {
        console.warn('Error fetching crusts:', crustsError);
      }

      const crustMap = new Map<string, any>((crusts || []).map((crust: any) => [crust.id, crust]));

      // Map pizza options with crust information
      const productsWithCrusts = (data || []).map((product: any) => ({
        ...product,
        stock: this.normalizeStock(product.stock, product.id),
        pizza_options: (product.pizza_options || []).map((option: any) => {
          const crust: any = crustMap.get(option.crust_id);
          return {
            ...option,
            crust: crust ? {
              id: option.crust_id,
              name: crust
            } : undefined
          };
        })
      }));

      return productsWithCrusts;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}
