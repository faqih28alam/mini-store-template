// app/actions/send-welcome-email.ts
'use server'

import { sendWelcomeEmail } from '@/lib/email'

export async function sendWelcomeEmailAction(email: string, name: string) {
    try {
        await sendWelcomeEmail(email, name)
        return { success: true }
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        // Don't throw - we don't want to block signup if email fails
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}