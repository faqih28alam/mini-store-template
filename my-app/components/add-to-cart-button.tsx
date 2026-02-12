'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'

type AddToCartButtonProps = {
    product: {
        id: string
        name: string
        slug: string
        price: number
        image: string
        stock: number
        category?: string
    }
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
}

export function AddToCartButton({
    product,
    variant = 'default',
    size = 'default',
    className
}: AddToCartButtonProps) {
    const { addItem, getItemCount } = useCart()

    const itemCount = getItemCount(product.id)
    const isInCart = itemCount > 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a Link
        e.stopPropagation()

        addItem({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.image,
            stock: product.stock,
            category: product.category,
        })
    }

    return (
        <Button
            onClick={handleAddToCart}
            variant={variant}
            size={size}
            className={className}
            disabled={product.stock === 0}
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? (
                'Out of Stock'
            ) : isInCart ? (
                `In Cart (${itemCount})`
            ) : (
                'Add to Cart'
            )}
        </Button>
    )
}