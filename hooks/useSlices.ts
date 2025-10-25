import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';

export interface Slice {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSlices() {
  const [slices, setSlices] = useState<Slice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlices();
  }, []);

  const fetchSlices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('slices')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setSlices(data || []);
    } catch (err: any) {
      console.error('Error fetching slices:', err);
      setError(err.message || 'Failed to fetch slices');
    } finally {
      setLoading(false);
    }
  };

  return {
    slices,
    loading,
    error,
    refetch: fetchSlices,
  };
}
