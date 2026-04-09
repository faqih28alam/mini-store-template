// src/lib/email.ts

import { Resend } from 'resend'
import Welcome from '../components/email/welcome'

// get apiKey from .env
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured in environment variables')
    }
    
    return new Resend(apiKey)
}

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        const resend = getResendClient() 
        
        const { data, error } = await resend.emails.send({
            // from: 'OrganicStore <onboarding@resend.dev>',
            // ✅ Updated to use your verified domain
            from: 'OrganicStore <hello@organicstore.dev64.web.id>',
            to: email,
            subject: 'Welcome to OrganicStore! 🌿',
            react: Welcome({ name }),
        })

        if (error) {
            console.error('Resend error:', error)
            throw error
        }

        console.log('Welcome email sent:', data)
        return data
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        throw error
    }
}

// For future use - Order confirmation email
// export async function sendOrderConfirmation(order: {
//     shipping_email: string
//     order_number: string
//     shipping_name: string
//     total: number
//     order_items: any[]
// }) {
//     try {
//         const resend = getResendClient()
        
//         const { data, error } = await resend.emails.send({
//             from: 'OrganicStore <orders@organicstore.dev64.web.id>',
//             to: order.shipping_email,
//             subject: `Order Confirmed - ${order.order_number}`,
//             react: OrderConfirmation({
//                 orderNumber: order.order_number,
//                 customerName: order.shipping_name,
//                 total: order.total,
//                 items: order.order_items,
//             }),
//         })
        
//         if (error) throw error
//         return data
//     } catch (error) {
//         console.error('Email error:', error)
//         throw error
//     }
// }
 
// For future use - Order cancelled email
// export async function sendOrderCancelled(order: {
//     shipping_email: string
//     order_number: string
//     shipping_name: string
// }) {
//     try {
//         const resend = getResendClient()
        
//         const { data, error } = await resend.emails.send({
//             from: 'OrganicStore <orders@organicstore.dev64.web.id>',
//             to: order.shipping_email,
//             subject: `Order Cancelled - ${order.order_number}`,
//             react: OrderCancelled({ 
//                 orderNumber: order.order_number,
//                 customerName: order.shipping_name 
//             }),
//         })
        
//         if (error) throw error
//         return data
//     } catch (error) {
//         console.error('Email error:', error)
//         throw error
//     }
// }
 
// Note: Import these when you create the email templates:
// import OrderConfirmation from '../components/email/order-confirmation'
// import OrderCancelled from '../components/email/order-cancelled'