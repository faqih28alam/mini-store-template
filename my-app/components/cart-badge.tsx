// components/cart-badge.tsx

'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export function CartBadge() {
    const { getTotalItems } = useCart()
    const itemCount = getTotalItems()
    const params = useParams()

    return (
        <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href={`/${params.id}/cart`}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        variant="default"
                    >
                        {itemCount > 9 ? '9+' : itemCount}
                    </Badge>
                )}
                <span className="sr-only">Shopping cart</span>
            </Link>
        </Button>
    )
}