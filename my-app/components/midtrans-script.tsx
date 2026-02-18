// components/midtrans-script.tsx

'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
    interface Window {
        snap: {
            key?: string
            pay?: (token: string, options?: object) => void
        }
    }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'

const SNAP_SCRIPT_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

export function MidtransScript() {
    useEffect(() => {
        // Set Midtrans client key when script loads
        if (typeof window !== 'undefined' && window.snap) {
            window.snap.key = MIDTRANS_CLIENT_KEY
        }
    }, [])

    return (
        <Script
            src={SNAP_SCRIPT_URL}
            data-client-key={MIDTRANS_CLIENT_KEY}
            strategy="afterInteractive"
            onLoad={() => {
                console.log('Midtrans Snap script loaded')
            }}
        />
    )
}