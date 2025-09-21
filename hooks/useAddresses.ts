import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label: string;
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
  delivery_instructions?: string;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: string;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Real-time subscription for address updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('addresses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'addresses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Address change received:', payload);
          fetchAddresses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAddresses]);

  const refresh = useCallback(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    isLoading,
    error,
    refresh,
  };
};

export const useAddress = (addressId: string) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async () => {
    if (!addressId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) throw error;
      setAddress(data);
    } catch (err: any) {
      console.error('Error fetching address:', err);
      setError(err.message || 'Failed to load address');
    } finally {
      setIsLoading(false);
    }
  }, [addressId]);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  const refresh = useCallback(() => {
    fetchAddress();
  }, [fetchAddress]);

  return {
    address,
    isLoading,
    error,
    refresh,
  };
};

export const useCreateAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createAddress = useCallback(async (addressData: CreateAddressData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // If this is set as default, unset other default addresses
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          ...addressData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error creating address:', err);
      setError(err.message || 'Failed to create address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    createAddress,
    isLoading,
    error,
  };
};

export const useUpdateAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateAddress = useCallback(async (addressData: UpdateAddressData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // If this is set as default, unset other default addresses
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)
          .neq('id', addressData.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update({
          ...addressData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error updating address:', err);
      setError(err.message || 'Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    updateAddress,
    isLoading,
    error,
  };
};

export const useDeleteAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const deleteAddress = useCallback(async (addressId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting address:', err);
      setError(err.message || 'Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    deleteAddress,
    isLoading,
    error,
  };
};

export const useDefaultAddress = () => {
  const { addresses, isLoading, error } = useAddresses();
  
  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
  
  return {
    defaultAddress,
    isLoading,
    error,
  };
};

export const useSetDefaultAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // First, unset all default addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error setting default address:', err);
      setError(err.message || 'Failed to set default address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    setDefaultAddress,
    isLoading,
    error,
  };
};

// Address validation hook
export const useAddressValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateAddress = useCallback((addressData: Partial<CreateAddressData>) => {
    const errors: Record<string, string> = {};

    if (!addressData.label?.trim()) {
      errors.label = 'Label is required';
    }

    if (!addressData.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!addressData.phone_number?.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(addressData.phone_number.replace(/\s/g, ''))) {
      errors.phone_number = 'Please enter a valid phone number';
    }

    if (!addressData.address_line_1?.trim()) {
      errors.address_line_1 = 'Address line 1 is required';
    }

    if (!addressData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!addressData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!addressData.postal_code?.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (!/^\d{4,6}$/.test(addressData.postal_code.replace(/\s/g, ''))) {
      errors.postal_code = 'Please enter a valid postal code';
    }

    if (!addressData.country?.trim()) {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  return {
    validationErrors,
    isValid: Object.keys(validationErrors).length === 0,
    validateAddress,
  };
};
