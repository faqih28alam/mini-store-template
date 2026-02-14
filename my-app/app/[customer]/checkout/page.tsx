'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Package, MapPin, User, Phone, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter()
    const { items, getTotalPrice, clearCart } = useCart()
    const [isProcessing, setIsProcessing] = useState(false)
    const supabase = createClient()
    const params = useParams();
    const customerId = params.customer;

    // Shipping form state
    const [shippingData, setShippingData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        notes: '',
        province: '',
    })

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setShippingData({
            ...shippingData,
            [e.target.name]: e.target.value,
        })
    }

    const validateForm = () => {
        const required = ['full_name', 'email', 'phone', 'address', 'city', 'province', 'postal_code']

        for (const field of required) {
            if (!shippingData[field as keyof typeof shippingData]) {
                toast.error('Please fill in all required fields')
                return false
            }
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(shippingData.email)) {
            toast.error('Please enter a valid email address')
            return false
        }

        // Validate phone (Indonesian format)
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
        if (!phoneRegex.test(shippingData.phone)) {
            toast.error('Please enter a valid phone number')
            return false
        }

        return true
    }

    const handleCheckout = async () => {
        // Validate form
        if (!validateForm()) return

        // Check if cart is empty
        if (items.length === 0) {
            toast.error('Your cart is empty')
            router.push('/products')
            return
        }

        // Check user is logged in
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            toast.error('Please login to continue')
            router.push('/login?redirect=/checkout')
            return
        }

        setIsProcessing(true)
        const toastId = toast.loading('Creating your order...')

        try {
            // 1. Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

            // 2. Create order in database
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: session.user.id,
                    order_number: orderNumber,
                    subtotal: subtotal,
                    tax: 0,
                    shipping_fee: shipping,
                    total: total,
                    status: 'pending',
                    payment_status: 'unpaid',
                    shipping_name: shippingData.full_name,
                    shipping_email: shippingData.email,
                    shipping_phone: shippingData.phone,
                    shipping_address: shippingData.address,
                    shipping_city: shippingData.city,
                    shipping_province: shippingData.province,
                    shipping_postal_code: shippingData.postal_code,
                    notes: shippingData.notes || null,
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 3. Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                product_sku: item.id,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // 4. Get Midtrans Snap token
            const response = await fetch('/api/payment/create-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.id,
                    orderNumber: orderNumber,
                    amount: total,
                    customerDetails: {
                        first_name: shippingData.full_name,
                        email: shippingData.email,
                        phone: shippingData.phone,
                    },
                    items: [
                        // Product items
                        ...items.map(item => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                        // Add shipping as a line item
                        {
                            id: 'SHIPPING',
                            name: 'Shipping Fee',
                            price: shipping,
                            quantity: 1,
                        }
                    ],
                }),
            })

            const { token, error: paymentError } = await response.json()

            if (paymentError || !token) {
                throw new Error(paymentError || 'Failed to create payment')
            }

            toast.success('Order created successfully!', { id: toastId })

            // 5. Open Midtrans Snap popup
            // @ts-ignore
            window.snap.pay(token, {
                onSuccess: function (result: any) {
                    console.log('Payment success:', result)
                    clearCart()
                    router.push(`/orders/${order.id}?status=success`)
                },
                onPending: function (result: any) {
                    console.log('Payment pending:', result)
                    router.push(`/orders/${order.id}?status=pending`)
                },
                onError: function (result: any) {
                    console.error('Payment error:', result)
                    toast.error('Payment failed')
                    router.push(`/orders/${order.id}?status=error`)
                },
                onClose: function () {
                    toast.info('Payment window closed')
                    router.push(`/orders/${order.id}`)
                },
            })

        } catch (error: any) {
            console.error('Checkout error:', error)
            toast.error('Checkout failed', {
                id: toastId,
                description: error.message,
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <Card>
                        <CardContent className="text-center py-20">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-2xl font-serif font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-6">Add some products to get started</p>
                            <Button asChild>
                                <Link href="/products">Browse Products</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            {/* Header */}
            <div className="bg-gradient-to-r from-beige-100 to-sage-100 dark:from-midnight-surface dark:to-midnight-base border-b border-sage-200 dark:border-midnight-border">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/${customerId}/cart`} className="flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Cart
                        </Link>
                    </Button>
                    <h1 className="font-serif text-4xl text-foreground font-semibold">Checkout</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="full_name">Full Name *</Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            value={shippingData.full_name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={shippingData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={shippingData.phone}
                                                onChange={handleInputChange}
                                                placeholder="08123456789"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="address">Street Address *</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={shippingData.address}
                                        onChange={handleInputChange}
                                        placeholder="Jl. Example No. 123"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={shippingData.city}
                                            onChange={handleInputChange}
                                            placeholder="Jakarta"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="province">Province *</Label>
                                        <Input
                                            id="province"
                                            name="province"
                                            value={shippingData.province}
                                            onChange={handleInputChange}
                                            placeholder="DKI Jakarta"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postal_code">Postal Code *</Label>
                                        <Input
                                            id="postal_code"
                                            name="postal_code"
                                            value={shippingData.postal_code}
                                            onChange={handleInputChange}
                                            placeholder="12345"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={shippingData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any special instructions?"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Order Items */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {items.map(item => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal ({items.length} items)</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span className={shipping === 0 ? 'text-sage-600 dark:text-sage-400 font-semibold' : ''}>
                                                {shipping === 0 ? 'Free' : formatPrice(shipping)}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <span className="font-serif text-lg">Total</span>
                                        <span className="font-serif text-2xl font-bold text-primary">
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Proceed to Payment
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        Secure payment powered by Midtrans
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}