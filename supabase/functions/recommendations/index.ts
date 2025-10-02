
// @ts-ignore - Deno imports are not recognized in Node.js environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno imports are not recognized in Node.js environment  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  type: 'featured' | 'personalized' | 'category' | 'random'
  userId?: string
  categoryId?: string
  productId?: string
  limit?: number
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { type, userId, categoryId, productId, limit = 4 }: RecommendationRequest = await req.json()

    let recommendations = []

    switch (type) {
      case 'featured':
        recommendations = await getFeaturedProducts(supabaseClient, limit)
        break
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(supabaseClient, userId!, limit)
        break
      case 'category':
        recommendations = await getCategoryRecommendations(supabaseClient, categoryId!, productId!, limit)
        break
      case 'random':
        recommendations = await getRandomRecommendations(supabaseClient, limit)
        break
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Featured Products: Top ordered products from order history
async function getFeaturedProducts(supabase: any, limit: number) {
  const { data, error } = await supabase
    .rpc('get_featured_products', { limit_count: limit })

  if (error) throw error
  return data || []
}

// Personalized Recommendations: Fisher-Yates algorithm for random selection
async function getPersonalizedRecommendations(supabase: any, userId: string, limit: number) {
  // Get all available products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)

  if (error) throw error
  if (!products || products.length === 0) return []

  // Apply Fisher-Yates shuffle algorithm
  const shuffledProducts = fisherYatesShuffle([...products])
  
  // Return limited results
  return shuffledProducts.slice(0, limit)
}

// Category Recommendations: Products from same category, fallback to random
async function getCategoryRecommendations(supabase: any, categoryId: string, productId: string, limit: number) {
  // Get products from same category excluding current product
  const { data: categoryProducts, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .neq('id', productId)

  if (error) throw error

  // If category has products, return them (shuffled)
  if (categoryProducts && categoryProducts.length > 0) {
    const shuffled = fisherYatesShuffle([...categoryProducts])
    return shuffled.slice(0, limit)
  }

  // Fallback: Get random products from all categories
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .neq('id', productId)

  if (allError) throw allError

  const shuffled = fisherYatesShuffle([...allProducts])
  return shuffled.slice(0, limit)
}

// Random Recommendations: Random products from all categories
async function getRandomRecommendations(supabase: any, limit: number) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)

  if (error) throw error

  const shuffled = fisherYatesShuffle([...products])
  return shuffled.slice(0, limit)
}

// Fisher-Yates Shuffle Algorithm
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}