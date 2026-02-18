// app/api/payment/create-token/route.ts

import { NextRequest, NextResponse } from 'next/server'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'

const MIDTRANS_API_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, orderNumber, amount, customerDetails, items } = body

        // Validate required fields
        if (!orderId || !orderNumber || !amount || !customerDetails) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Prepare Midtrans transaction data
        const transactionData = {
            transaction_details: {
                order_id: orderNumber, // Use order number (unique string)
                gross_amount: amount,
            },
            customer_details: {
                first_name: customerDetails.first_name,
                email: customerDetails.email,
                phone: customerDetails.phone,
            },
            item_details: items.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
            callbacks: {
                // finish: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?status=success`,
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
            },
        }

        // Create authorization header
        const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')

        // Request Snap token from Midtrans
        const response = await fetch(MIDTRANS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`,
            },
            body: JSON.stringify(transactionData),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Midtrans error:', data)
            return NextResponse.json(
                { error: data.error_messages || 'Failed to create payment' },
                { status: response.status }
            )
        }

        return NextResponse.json({
            token: data.token,
            redirectUrl: data.redirect_url,
        })

    } catch (error: any) {
        console.error('Payment token creation error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}