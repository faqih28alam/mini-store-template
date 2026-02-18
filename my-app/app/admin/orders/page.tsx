// app/admin/orders/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Package, Search, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

type Order = {
    id: string
    order_number: string
    status: string
    payment_status: string
    total: number
    shipping_name: string
    created_at: string
}

type CancellationRequest = {
    id: string
    order_id: string
    reason: string
    status: string
    admin_notes: string | null
    created_at: string
    reviewed_at: string | null
    orders: {
        order_number: string
        total: number
        shipping_name: string
        payment_status: string
    }
}

export default function AdminOrdersPage() {
    const supabase = createClient()

    const [orders, setOrders] = useState<Order[]>([])
    const [cancellations, setCancellations] = useState<CancellationRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Dialog states
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
    const [selectedCancellation, setSelectedCancellation] = useState<CancellationRequest | null>(null)
    const [adminNotes, setAdminNotes] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchOrders()
        fetchCancellations()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, status, payment_status, total, shipping_name, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } else {
            setOrders(data || [])
        }

        setLoading(false)
    }

    const fetchCancellations = async () => {
        const { data, error } = await supabase
            .from('order_cancellations')
            .select(`
        *,
        orders (order_number, total, shipping_name, payment_status)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching cancellations:', error)
        } else {
            setCancellations(data || [])
        }
    }

    const handleReviewCancellation = (cancellation: CancellationRequest) => {
        setSelectedCancellation(cancellation)
        setAdminNotes(cancellation.admin_notes || '')
        setReviewDialogOpen(true)
    }

    const handleApproveCancellation = async () => {
        if (!selectedCancellation) return

        setProcessing(true)
        const toastId = toast.loading('Approving cancellation...')

        try {
            const { data: { session } } = await supabase.auth.getSession()

            // Update cancellation status
            const { error: cancelError } = await supabase
                .from('order_cancellations')
                .update({
                    status: 'approved',
                    admin_notes: adminNotes,
                    reviewed_by: session?.user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', selectedCancellation.id)

            if (cancelError) throw cancelError

            // Update order status
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                })
                .eq('id', selectedCancellation.order_id)

            if (orderError) throw orderError

            toast.success('Cancellation approved', {
                id: toastId,
                description: 'Order has been cancelled',
            })

            setReviewDialogOpen(false)
            setSelectedCancellation(null)
            setAdminNotes('')

            await fetchCancellations()
            await fetchOrders()

        } catch (error: any) {
            toast.error('Failed to approve cancellation', {
                id: toastId,
                description: error.message,
            })
        } finally {
            setProcessing(false)
        }
    }

    const handleRejectCancellation = async () => {
        if (!selectedCancellation) return
        if (!adminNotes.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setProcessing(true)
        const toastId = toast.loading('Rejecting cancellation...')

        try {
            const { data: { session } } = await supabase.auth.getSession()

            const { error } = await supabase
                .from('order_cancellations')
                .update({
                    status: 'rejected',
                    admin_notes: adminNotes,
                    reviewed_by: session?.user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', selectedCancellation.id)

            if (error) throw error

            toast.success('Cancellation rejected', {
                id: toastId,
            })

            setReviewDialogOpen(false)
            setSelectedCancellation(null)
            setAdminNotes('')

            await fetchCancellations()

        } catch (error: any) {
            toast.error('Failed to reject cancellation', {
                id: toastId,
                description: error.message,
            })
        } finally {
            setProcessing(false)
        }
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-blue-100 text-blue-700',
            processing: 'bg-purple-100 text-purple-700',
            shipped: 'bg-orange-100 text-orange-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        }

        return (
            <Badge className={`${variants[status] || variants.pending} border-0`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const getCancellationBadge = (status: string) => {
        const config: Record<string, { color: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
        }

        const { color, icon: Icon } = config[status] || config.pending

        return (
            <Badge className={`${color} border-0 flex items-center gap-1 w-fit`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const pendingCancellations = cancellations.filter(c => c.status === 'pending')
    const reviewedCancellations = cancellations.filter(c => c.status !== 'pending')

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            {/* Header */}
            <div className="bg-gradient-to-r from-beige-100 to-sage-100 dark:from-midnight-surface dark:to-midnight-base border-b border-sage-200 dark:border-midnight-border">
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center">
                            <Package className="w-7 h-7 text-sage-500 dark:text-sage-400" />
                        </div>
                        <div>
                            <h1 className="font-serif text-4xl text-foreground font-semibold">Order Management</h1>
                            <p className="text-muted-foreground">Manage orders and cancellation requests</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Pending Payment</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter(o => o.payment_status === 'unpaid').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Processing</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {orders.filter(o => o.status === 'processing').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Pending Cancellations</p>
                                <p className="text-2xl font-bold text-red-600">{pendingCancellations.length}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <Tabs defaultValue="orders" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="orders">All Orders</TabsTrigger>
                        <TabsTrigger value="cancellations">
                            Cancellation Requests
                            {pendingCancellations.length > 0 && (
                                <Badge className="ml-2 bg-red-500">{pendingCancellations.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* All Orders Tab */}
                    <TabsContent value="orders" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by order number or customer name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Orders Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order Number</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No orders found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredOrders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-mono font-medium">
                                                            {order.order_number}
                                                        </TableCell>
                                                        <TableCell>{order.shipping_name}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(order.created_at)}
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                        <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            {formatPrice(order.total)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cancellations Tab */}
                    <TabsContent value="cancellations" className="space-y-4">
                        {/* Pending Cancellations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    Pending Approval ({pendingCancellations.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingCancellations.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No pending cancellation requests
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingCancellations.map((cancellation) => (
                                            <Card key={cancellation.id} className="bg-yellow-50 dark:bg-yellow-900/10">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-mono font-semibold">{cancellation.orders.order_number}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Customer: {cancellation.orders.shipping_name}
                                                            </p>
                                                            <p className="text-sm font-semibold text-primary">
                                                                Amount: {formatPrice(cancellation.orders.total)}
                                                            </p>
                                                        </div>
                                                        {getCancellationBadge(cancellation.status)}
                                                    </div>

                                                    <div className="bg-background rounded-lg p-3 mb-3">
                                                        <p className="text-sm font-medium mb-1">Reason:</p>
                                                        <p className="text-sm text-muted-foreground">{cancellation.reason}</p>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs text-muted-foreground">
                                                            Requested: {formatDate(cancellation.created_at)}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleReviewCancellation(cancellation)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Review
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reviewed Cancellations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reviewed Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order Number</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Reviewed</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reviewedCancellations.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No reviewed cancellations yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                reviewedCancellations.map((cancellation) => (
                                                    <TableRow key={cancellation.id}>
                                                        <TableCell className="font-mono">
                                                            {cancellation.orders.order_number}
                                                        </TableCell>
                                                        <TableCell>{cancellation.orders.shipping_name}</TableCell>
                                                        <TableCell className="max-w-xs truncate">
                                                            {cancellation.reason}
                                                        </TableCell>
                                                        <TableCell>{getCancellationBadge(cancellation.status)}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {cancellation.reviewed_at && formatDate(cancellation.reviewed_at)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Review Cancellation Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Review Cancellation Request</DialogTitle>
                        <DialogDescription>
                            Review and decide whether to approve or reject this cancellation request
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCancellation && (
                        <div className="space-y-4 py-4 overflow-y-auto flex-1">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="font-mono font-semibold">{selectedCancellation.orders.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-semibold">{selectedCancellation.orders.shipping_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Total</p>
                                    <p className="font-semibold text-primary">
                                        {formatPrice(selectedCancellation.orders.total)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                    {getStatusBadge(selectedCancellation.orders.payment_status)}
                                </div>
                            </div>

                            {/* Customer's Reason */}
                            <div>
                                <Label>Customer's Reason</Label>
                                <div className="mt-2 p-4 bg-muted rounded-lg">
                                    <p className="text-sm">{selectedCancellation.reason}</p>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                                <Textarea
                                    id="admin-notes"
                                    placeholder="Add notes about this decision..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    className="mt-2"
                                />
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                            Important
                                        </p>
                                        <p className="text-yellow-800 dark:text-yellow-200">
                                            If approved, the order will be marked as "cancelled" and this action cannot be undone.
                                            If rejected, the customer will be notified with your notes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectCancellation}
                            disabled={processing}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            onClick={handleApproveCancellation}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}