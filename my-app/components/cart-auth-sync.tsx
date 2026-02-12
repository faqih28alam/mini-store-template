'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/store/cart'

export function CartAuthSync() {
    const { setUserId } = useCart()
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id || null)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null)
        })

        return () => subscription.unsubscribe()
    }, [supabase, setUserId])

    return null // This component doesn't render anything
}