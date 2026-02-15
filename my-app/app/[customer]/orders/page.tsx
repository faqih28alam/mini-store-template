// app/[customer]/orders/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Package, Search, Calendar, CreditCard, Truck, CheckCircle2, XCircle, Clock, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type Order = {
    id: string
    order_number: string
    status: string
    payment_status: string
    total: number
    created_at: string
    order_items: {
        product_name: string
        product_image: string
        quantity: number
        price: number
    }[]
}

export default function OrdersPage() {
    const params = useParams()
    const customerId = params.customer
    const supabase = createClient()

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            window.location.href = '/auth/login'
            return
        }

        const { data, error } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        status,
        payment_status,
        total,
        created_at,
        order_items (
          product_name,
          product_image,
          quantity,
          price
        )
      `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
        } else {
            setOrders(data || [])
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
        })
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { color: string; icon: any; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' },
            paid: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CreditCard, label: 'Paid' },
            processing: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Package, label: 'Processing' },
            shipped: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Truck, label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Cancelled' },
        }

        const config = variants[status] || variants.pending
        const Icon = config.icon

        return (
            <Badge className={`${config.color} border-0 flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        )
    }

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            unpaid: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            expired: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        }

        return (
            <Badge className={`${variants[status] || variants.unpaid} border-0 text-xs`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                            <p className="text-muted-foreground">Loading your orders...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            {/* Header */}
            <div className="bg-gradient-to-r from-beige-100 to-sage-100 dark:from-midnight-surface dark:to-midnight-base border-b border-sage-200 dark:border-midnight-border">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-sage-500 dark:text-sage-400" />
                        </div>
                        <div>
                            <h1 className="font-serif text-4xl text-foreground font-semibold">My Orders</h1>
                            <p className="text-muted-foreground">Track and manage your purchases</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-background">
                                <SelectValue placeholder="All Orders" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-20">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-2xl font-serif font-semibold mb-2">
                                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {orders.length === 0
                                    ? 'Start shopping to see your orders here'
                                    : 'Try adjusting your search or filters'
                                }
                            </p>
                            {orders.length === 0 && (
                                <Button asChild>
                                    <Link href="/products">Browse Products</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card key={order.id} className="hover:shadow-lg transition-all overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Order Items Preview */}
                                        <div className="flex gap-3 lg:w-48 flex-shrink-0">
                                            {order.order_items.slice(0, 3).map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                                                >
                                                    <Image
                                                        src={item.product_image || '/placeholder-product.jpg'}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.order_items.length > 3 && (
                                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground font-medium">
                                                    +{order.order_items.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                                                    <p className="font-mono font-semibold text-foreground">
                                                        {order.order_number}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {getStatusBadge(order.status)}
                                                    {getPaymentStatusBadge(order.payment_status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                                                    <p className="font-semibold text-primary">
                                                        {formatPrice(order.total)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Items</p>
                                                    <p className="text-sm font-medium">
                                                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                    </p>
                                                </div>
                                            </div>

                                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                                <Link href={`/${customerId}/orders/${order.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}