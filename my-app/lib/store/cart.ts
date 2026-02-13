// lib/store/cart.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { createClient } from '../supabase/client'

// Types
export type CartItem = {
    id: string
    name: string
    slug: string
    price: number
    quantity: number
    image: string
    stock: number
    category?: string
}

type CartStore = {
    items: CartItem[]
    userId: string | null
    isLoading: boolean

    // Actions
    setUserId: (userId: string | null) => void
    loadCartFromDB: () => Promise<void>
    syncCartToDB: () => Promise<void>
    addItem: (product: Omit<CartItem, 'quantity'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void

    // Computed values
    getTotalItems: () => number
    getTotalPrice: () => number
    getItemCount: (productId: string) => number
}

const supabase = createClient()

function mergeCarts(guestItems: CartItem[], dbItems: CartItem[]): CartItem[] {
    const merged = [...dbItems]

    guestItems.forEach(guestItem => {
        const existingItem = merged.find(i => i.id === guestItem.id)

        if (existingItem) {
            // Product exists in both - combine quantities
            existingItem.quantity = Math.min(
                existingItem.quantity + guestItem.quantity,
                guestItem.stock
            )
        } else {
            // New product from guest cart
            merged.push(guestItem)
        }
    })

    return merged
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            userId: null,
            isLoading: false,

            // Set user ID and load their cart
            setUserId: async (userId) => {
                const currentUserId = get().userId

                if (currentUserId === userId) {
                    return // Skip if same user
                }

                set({ userId })

                if (userId) {
                    const guestItems = get().items  // Guest cart

                    await get().loadCartFromDB()  // Load user's cart

                    const dbItems = get().items  // User's cart from DB

                    // Merge them
                    const mergedItems = mergeCarts(guestItems, dbItems)

                    set({ items: mergedItems })
                    await get().syncCartToDB()
                } else {
                    set({ items: [] })  // ← Also clear cart on logout
                }
            },

            // Load cart from database
            loadCartFromDB: async () => {
                const { userId } = get()
                if (!userId) return

                set({ isLoading: true })

                try {
                    const { data, error } = await supabase
                        .from('cart_items')
                        .select(`
              product_id,
              quantity,
              products (
                id,
                name,
                slug,
                price,
                stock,
                image_url,
                categories (name)
              )
            `)
                        .eq('user_id', userId)

                    if (error) throw error

                    const items: CartItem[] = data?.map((item: any) => ({
                        id: item.products.id,
                        name: item.products.name,
                        slug: item.products.slug,
                        price: Number(item.products.price),
                        quantity: item.quantity,
                        image: item.products.image_url || '/placeholder-product.jpg',
                        stock: item.products.stock,
                        category: item.products.categories?.name,
                    })) || []

                    set({ items })
                } catch (error) {
                    console.error('Error loading cart:', error)
                } finally {
                    set({ isLoading: false })
                }
            },

            // Sync cart to database
            syncCartToDB: async () => {
                const { userId, items } = get()
                if (!userId) return

                try {
                    // Delete old cart items
                    await supabase
                        .from('cart_items')
                        .delete()
                        .eq('user_id', userId)

                    // Insert new cart items
                    if (items.length > 0) {
                        const cartItems = items.map(item => ({
                            user_id: userId,
                            product_id: item.id,
                            quantity: item.quantity,
                        }))

                        await supabase
                            .from('cart_items')
                            .insert(cartItems)
                    }
                } catch (error) {
                    console.error('Error syncing cart:', error)
                }
            },

            // Add item to cart
            addItem: async (product) => {
                const { items, userId } = get()
                const existingItem = items.find((item) => item.id === product.id)

                if (existingItem) {
                    // Item already in cart, increase quantity
                    if (existingItem.quantity >= product.stock) {
                        toast.error('Cannot add more', {
                            description: `Only ${product.stock} units available`,
                        })
                        return
                    }

                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    })

                    toast.success('Quantity updated', {
                        description: `${product.name} (${existingItem.quantity + 1})`,
                    })
                } else {
                    // New item, add to cart
                    set({
                        items: [...items, { ...product, quantity: 1 }],
                    })

                    toast.success('Added to cart!', {
                        description: product.name,
                    })
                }

                // Sync to database if user is logged in
                if (userId) {
                    await get().syncCartToDB()
                }
            },

            // Remove item from cart
            removeItem: async (productId) => {
                const { items, userId } = get()
                const item = items.find((i) => i.id === productId)

                set({
                    items: items.filter((item) => item.id !== productId),
                })

                if (item) {
                    toast.success('Removed from cart', {
                        description: item.name,
                    })
                }

                // Sync to database if user is logged in
                if (userId) {
                    await get().syncCartToDB()
                }
            },

            // Update item quantity
            updateQuantity: async (productId, quantity) => {
                const { items, userId } = get()
                const item = items.find((i) => i.id === productId)

                if (!item) return

                // Validate quantity
                if (quantity < 1) {
                    get().removeItem(productId)
                    return
                }

                if (quantity > item.stock) {
                    toast.warning('Limited stock', {
                        description: `Only ${item.stock} units available`,
                    })
                    return
                }

                set({
                    items: items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                })

                // Sync to database if user is logged in
                if (userId) {
                    await get().syncCartToDB()
                }
            },

            // Clear all items
            clearCart: async () => {
                const { userId } = get()

                set({ items: [] })
                toast.success('Cart cleared')

                // Clear from database if user is logged in
                if (userId) {
                    await supabase
                        .from('cart_items')
                        .delete()
                        .eq('user_id', userId)
                }
            },

            // Get total number of items
            getTotalItems: () => {
                const items = get().items
                return items.reduce((total, item) => total + item.quantity, 0)
            },

            // Get total price
            getTotalPrice: () => {
                const items = get().items
                return items.reduce((total, item) => total + item.price * item.quantity, 0)
            },

            // Get quantity of specific item
            getItemCount: (productId) => {
                const item = get().items.find((i) => i.id === productId)
                return item ? item.quantity : 0
            },
        }),
        {
            name: 'quickshop-cart',
            storage: createJSONStorage(() => localStorage),
            // Only persist items and userId, not isLoading
            partialize: (state) => ({
                items: state.items,
                userId: state.userId,
            }),
        }
    )
)