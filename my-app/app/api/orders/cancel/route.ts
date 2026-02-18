// lib/api/orders/cancel/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { orderId, reason } = await request.json()

        if (!orderId || !reason) {
            return NextResponse.json(
                { error: 'Order ID and reason are required' },
                { status: 400 }
            )
        }

        // Get order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Check if order can be cancelled
        if (!['pending', 'paid', 'processing'].includes(order.status)) {
            return NextResponse.json(
                { error: 'This order cannot be cancelled' },
                { status: 400 }
            )
        }

        // Check if already has pending cancellation
        const { data: existing } = await supabase
            .from('order_cancellations')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'pending')
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Cancellation request already pending' },
                { status: 400 }
            )
        }

        // Create cancellation request
        const { data: cancellation, error: cancellationError } = await supabase
            .from('order_cancellations')
            .insert({
                order_id: orderId,
                user_id: order.user_id,
                reason,
                status: 'pending',
            })
            .select()
            .single()

        if (cancellationError) {
            throw cancellationError
        }

        return NextResponse.json({
            success: true,
            message: 'Cancellation request submitted. Waiting for admin approval.',
            cancellation,
        })

    } catch (error: any) {
        console.error('Cancel order error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process cancellation' },
            { status: 500 }
        )
    }
}