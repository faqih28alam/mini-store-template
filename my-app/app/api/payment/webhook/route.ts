// api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const notification = await request.json()

        console.log('Midtrans notification received:', notification)

        // Verify signature
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            payment_type,
            transaction_id,
            transaction_time,
        } = notification

        // Create signature hash
        const serverSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
            .digest('hex')

        // Verify signature
        if (serverSignature !== signature_key) {
            console.error('Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
        }

        // Get order from database using order_number
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id')
            .eq('order_number', order_id)
            .single()

        if (orderError || !order) {
            console.error('Order not found:', order_id)
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Determine payment status
        let paymentStatus = 'pending'
        let orderStatus = 'pending'

        if (transaction_status === 'capture') {
            if (fraud_status === 'accept') {
                paymentStatus = 'paid'
                orderStatus = 'processing'
            }
        } else if (transaction_status === 'settlement') {
            paymentStatus = 'paid'
            orderStatus = 'processing'
        } else if (transaction_status === 'pending') {
            paymentStatus = 'pending'
            orderStatus = 'pending'
        } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
            paymentStatus = 'failed'
            orderStatus = 'cancelled'
        } else if (transaction_status === 'expire') {
            paymentStatus = 'expired'
            orderStatus = 'cancelled'
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: paymentStatus,
                status: orderStatus,
                payment_method: payment_type,
                // midtrans_transaction_id: transaction_id,
                paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
            })
            .eq('id', order.id)

        if (updateError) {
            console.error('Error updating order:', updateError)
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
        }

        // Log payment notification
        await supabase
            .from('payment_logs')
            .insert({
                order_id: order.id,
                transaction_id,
                transaction_status,
                payment_type,
                fraud_status,
                status_code,
                raw_response: notification,
            })

        console.log(`Order ${order_id} updated to ${paymentStatus}`)

        return NextResponse.json({ message: 'OK' })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}