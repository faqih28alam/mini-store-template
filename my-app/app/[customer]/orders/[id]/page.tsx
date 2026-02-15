// app/[customer]/orders/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, CheckCircle2, Clock, Truck, XCircle, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type OrderDetail = {
    id: string
    order_number: string
    status: string
    payment_status: string
    payment_method: string | null
    subtotal: number
    tax: number
    shipping_fee: number
    total: number
    shipping_name: string
    shipping_email: string
    shipping_phone: string
    shipping_address: string
    shipping_city: string
    shipping_province: string
    shipping_postal_code: string
    notes: string | null
    created_at: string
    paid_at: string | null
    order_items: {
        id: string
        product_name: string
        product_image: string | null
        product_sku: string | null
        quantity: number
        price: number
        subtotal: number
    }[]
}

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string
    const customerId = params.customer
    const supabase = createClient()

    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrderDetail()
    }, [orderId])

    const fetchOrderDetail = async () => {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            router.push('/auth/login')
            return
        }

        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (*)
      `)
            .eq('id', orderId)
            .eq('user_id', session.user.id)
            .single()

        if (error) {
            console.error('Error fetching order:', error)
            router.push(`/${customerId}/orders`)
        } else {
            setOrder(data)
        }

        setLoading(false)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: any; label: string; description: string }> = {
            pending: {
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: Clock,
                label: 'Pending Payment',
                description: 'Waiting for payment confirmation',
            },
            paid: {
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: CreditCard,
                label: 'Payment Confirmed',
                description: 'Payment has been received',
            },
            processing: {
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                icon: Package,
                label: 'Processing',
                description: 'Your order is being prepared',
            },
            shipped: {
                color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                icon: Truck,
                label: 'Shipped',
                description: 'Your order is on the way',
            },
            delivered: {
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: CheckCircle2,
                label: 'Delivered',
                description: 'Order has been delivered',
            },
            cancelled: {
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: XCircle,
                label: 'Cancelled',
                description: 'This order has been cancelled',
            },
        }

        return configs[status] || configs.pending
    }

    const getOrderTimeline = () => {
        if (!order) return []

        const timeline: { date: string; label: string; completed: boolean }[] = [
            {
                date: order.created_at,
                label: 'Order Placed',
                completed: true,
            },
        ]

        if (order.paid_at) {
            timeline.push({
                date: order.paid_at,
                label: 'Payment Confirmed',
                completed: true,
            })
        }

        const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered']
        const currentIndex = statusOrder.indexOf(order.status)

        if (currentIndex >= 2) {
            timeline.push({
                date: order.created_at,
                label: 'Processing',
                completed: true,
            })
        }

        if (currentIndex >= 3) {
            timeline.push({
                date: order.created_at,
                label: 'Shipped',
                completed: true,
            })
        }

        if (currentIndex >= 4) {
            timeline.push({
                date: order.created_at,
                label: 'Delivered',
                completed: true,
            })
        }

        return timeline
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                            <p className="text-muted-foreground">Loading order details...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <Card>
                        <CardContent className="text-center py-20">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-serif font-semibold mb-2">Order Not Found</h2>
                            <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have access to it</p>
                            <Button asChild>
                                <Link href={`/${customerId}/orders`}>Back to Orders</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const statusConfig = getStatusConfig(order.status)
    const StatusIcon = statusConfig.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            {/* Header */}
            <div className="bg-gradient-to-r from-beige-100 to-sage-100 dark:from-midnight-surface dark:to-midnight-base border-b border-sage-200 dark:border-midnight-border">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/${customerId}/orders`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Orders
                        </Link>
                    </Button>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl text-foreground font-semibold mb-2">
                                Order Details
                            </h1>
                            <p className="font-mono text-muted-foreground">
                                {order.order_number}
                            </p>
                        </div>

                        <div className={`px-4 py-2 rounded-lg ${statusConfig.color} flex items-center gap-2`}>
                            <StatusIcon className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">{statusConfig.label}</p>
                                <p className="text-xs opacity-80">{statusConfig.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                <Image
                                                    src={item.product_image || '/placeholder-product.jpg'}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium line-clamp-2 mb-1">{item.product_name}</h3>
                                                {item.product_sku && (
                                                    <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatPrice(item.price)} × {item.quantity}
                                                    </p>
                                                    <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                    Order Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {getOrderTimeline().map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-sage-500' : 'bg-gray-300'}`} />
                                                {index < getOrderTimeline().length - 1 && (
                                                    <div className={`w-0.5 h-12 ${item.completed ? 'bg-sage-500' : 'bg-gray-300'}`} />
                                                )}
                                            </div>
                                            <div className="pb-8">
                                                <p className="font-medium">{item.label}</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>{formatPrice(order.tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping_fee)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(order.total)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                                    Payment Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                                    <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : ''}>
                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </Badge>
                                </div>
                                {order.payment_method && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                        <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
                                    </div>
                                )}
                                {order.paid_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Paid At</p>
                                        <p className="text-sm">{formatDate(order.paid_at)}</p>
                                    </div>
                                )}
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
                            <CardContent className="space-y-2">
                                <p className="font-medium">{order.shipping_name}</p>
                                <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                                <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
                                <Separator className="my-3" />
                                <p className="text-sm">{order.shipping_address}</p>
                                <p className="text-sm">
                                    {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                                </p>
                                {order.notes && (
                                    <>
                                        <Separator className="my-3" />
                                        <div>
                                            <p className="text-sm font-medium mb-1">Notes:</p>
                                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}