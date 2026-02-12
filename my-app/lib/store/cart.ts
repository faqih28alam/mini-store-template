import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'

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

    // Actions
    addItem: (product: Omit<CartItem, 'quantity'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void

    // Computed values
    getTotalItems: () => number
    getTotalPrice: () => number
    getItemCount: (productId: string) => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            // Add item to cart
            addItem: (product) => {
                const items = get().items
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
            },

            // Remove item from cart
            removeItem: (productId) => {
                const items = get().items
                const item = items.find((i) => i.id === productId)

                set({
                    items: items.filter((item) => item.id !== productId),
                })

                if (item) {
                    toast.success('Removed from cart', {
                        description: item.name,
                    })
                }
            },

            // Update item quantity
            updateQuantity: (productId, quantity) => {
                const items = get().items
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
            },

            // Clear all items
            clearCart: () => {
                set({ items: [] })
                toast.success('Cart cleared')
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
            name: 'quickshop-cart', // LocalStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
)