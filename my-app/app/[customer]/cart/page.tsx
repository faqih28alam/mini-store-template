'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, X, ShoppingBag, ArrowRight, Leaf, Sparkles, Heart, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useCart } from '@/lib/store/cart'

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice } = useCart()

    const subtotal = getTotalPrice()
    const shipping = subtotal > 500000 ? 0 : 25000
    const total = subtotal + shipping

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <Card className="border-sage-200 dark:border-midnight-border shadow-xl backdrop-blur">
                        <CardContent className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sage-100 dark:bg-midnight-surface mb-6 animate-bounce">
                                <ShoppingBag className="w-12 h-12 text-sage-500 dark:text-sage-400" strokeWidth={1.5} />
                            </div>
                            <h1 className="font-serif text-4xl text-foreground mb-4 font-semibold">
                                Your cart feels a little light
                            </h1>
                            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                Discover mindful products crafted for your wellness journey
                            </p>
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Link href="/products" className="flex items-center gap-2">
                                    Explore Products
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-beige-100 to-sage-100 dark:from-midnight-surface dark:to-midnight-base border-b border-sage-200 dark:border-midnight-border">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center">
                            <Leaf className="w-7 h-7 text-sage-500 dark:text-sage-400" />
                        </div>
                        <div>
                            <h1 className="font-serif text-4xl text-foreground font-semibold">Your Cart</h1>
                            <p className="text-muted-foreground text-base">
                                {items.length} mindful {items.length === 1 ? 'selection' : 'selections'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className="hover:shadow-lg transition-all backdrop-blur overflow-hidden group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {item.stock < 10 && (
                                                <Badge className="absolute top-2 left-2">
                                                    Only {item.stock} left
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between gap-4 mb-2">
                                                    <Link
                                                        href={`/products/${item.slug}`}
                                                        className="font-serif text-xl text-foreground hover:text-sage-600 dark:hover:text-sage-400 transition-colors line-clamp-2 font-medium"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                                {item.category && (
                                                    <Badge variant="outline" className="mb-2">
                                                        {item.category}
                                                    </Badge>
                                                )}
                                                <p className="text-primary font-semibold text-lg">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-muted-foreground text-sm">Qty:</span>
                                                    <div className="flex items-center gap-1 bg-muted/50 dark:bg-midnight-surface rounded-lg border p-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="h-8 w-8 hover:bg-background dark:hover:bg-midnight-base"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="w-12 text-center font-medium text-foreground">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock}
                                                            className="h-8 w-8 hover:bg-background dark:hover:bg-midnight-base"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Subtotal</p>
                                                    <p className="font-semibold text-foreground">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Continue Shopping Link */}
                        <Button
                            variant="ghost"
                            asChild
                            className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-sage-50 dark:hover:bg-midnight-surface mt-4"
                        >
                            <Link href="/products" className="flex items-center gap-2">
                                <ArrowRight className="w-5 h-5 rotate-180" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Main Summary Card */}
                            <Card className="shadow-xl backdrop-blur">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        <h2 className="font-serif text-2xl text-foreground font-semibold">
                                            Order Summary
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-foreground">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{formatPrice(subtotal)}</span>
                                        </div>

                                        <div className="flex justify-between text-foreground">
                                            <span>Shipping</span>
                                            <span className="font-medium">
                                                {shipping === 0 ? (
                                                    <span className="text-sage-600 dark:text-sage-400 font-semibold">Free</span>
                                                ) : (
                                                    formatPrice(shipping)
                                                )}
                                            </span>
                                        </div>

                                        {shipping > 0 && (
                                            <Card className="bg-sage-50 dark:bg-midnight-surface border-sage-300 dark:border-sage-700">
                                                <CardContent className="p-3 flex items-start gap-2">
                                                    <Leaf className="w-4 h-4 text-sage-600 dark:text-sage-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-foreground">
                                                        Add <span className="font-semibold text-sage-600 dark:text-sage-400">{formatPrice(500000 - subtotal)}</span> more for free shipping
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Separator />

                                        <div className="flex justify-between items-center">
                                            <span className="font-serif text-lg text-foreground">Total</span>
                                            <span className="font-serif font-bold text-2xl text-primary">
                                                {formatPrice(total)}
                                            </span>
                                        </div>

                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full rounded-full shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Link href="/checkout" className="flex items-center justify-center gap-2">
                                                Proceed to Checkout
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trust Badges Card */}
                            <Card className="bg-gradient-to-br from-background to-muted/30">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sage-100 dark:bg-midnight-surface flex items-center justify-center flex-shrink-0">
                                            <Leaf className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">Natural Ingredients</p>
                                            <p className="text-xs text-muted-foreground">Organic & cruelty-free</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sage-100 dark:bg-midnight-surface flex items-center justify-center flex-shrink-0">
                                            <PackageCheck className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">Secure Payment</p>
                                            <p className="text-xs text-muted-foreground">SSL encrypted checkout</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sage-100 dark:bg-midnight-surface flex items-center justify-center flex-shrink-0">
                                            <Heart className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">Beauty Experts</p>
                                            <p className="text-xs text-muted-foreground">Curated by professionals</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}