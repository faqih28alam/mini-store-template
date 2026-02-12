// lib/api/cart.ts
import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/lib/store/cart'

export type DbCartItem = {
    id: string
    user_id: string
    product_id: string
    quantity: number
    created_at: string
    updated_at: string
    products: {
        id: string
        name: string
        slug: string
        price: number
        stock: number
        image_url: string
        category_id: string
        categories: {
            name: string
        } | null
    }
}

export async function fetchCartItems(userId: string): Promise<CartItem[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('cart_items')
        .select(`
      id,
      product_id,
      quantity,
      products (
        id,
        name,
        slug,
        price,
        stock,
        image_url,
        categories (
          name
        )
      )
    `)
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching cart:', error)
        return []
    }

    // Transform database response to CartItem format
    return (data as unknown as DbCartItem[]).map((item) => ({
        id: item.products.id,
        name: item.products.name,
        slug: item.products.slug,
        price: Number(item.products.price),
        quantity: item.quantity,
        image: item.products.image_url || '/placeholder-product.jpg',
        stock: item.products.stock,
        category: item.products.categories?.name,
    }))
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    const supabase = createClient()

    // Check if item already exists in cart
    const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

    if (existing) {
        // Update existing item
        const { error } = await supabase
            .from('cart_items')
            .update({
                quantity: existing.quantity + quantity,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

        if (error) throw error
    } else {
        // Insert new item
        const { error } = await supabase
            .from('cart_items')
            .insert({
                user_id: userId,
                product_id: productId,
                quantity: quantity,
            })

        if (error) throw error
    }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    const supabase = createClient()

    if (quantity <= 0) {
        // Remove item if quantity is 0
        return removeFromCart(userId, productId)
    }

    const { error } = await supabase
        .from('cart_items')
        .update({
            quantity,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId)

    if (error) throw error
}

export async function removeFromCart(userId: string, productId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

    if (error) throw error
}

export async function clearCart(userId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

    if (error) throw error
}

// Sync local cart with database (for guest to user conversion)
export async function syncLocalCartToDb(userId: string, localItems: CartItem[]) {
    const supabase = createClient()

    // Get existing cart items from database
    const dbItems = await fetchCartItems(userId)

    for (const localItem of localItems) {
        const dbItem = dbItems.find(item => item.id === localItem.id)

        if (dbItem) {
            // Merge quantities (take the higher value)
            const newQuantity = Math.max(localItem.quantity, dbItem.quantity)
            await updateCartItemQuantity(userId, localItem.id, newQuantity)
        } else {
            // Add new item from local cart
            await addToCart(userId, localItem.id, localItem.quantity)
        }
    }

    // Return merged cart
    return fetchCartItems(userId)
}