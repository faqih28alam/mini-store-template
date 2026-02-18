// app/products/page.tsx

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ProductsClient from './products-client'
import { Suspense } from 'react'

async function ProductsList() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { }
                },
            },
        }
    )

    // Parallel fetch products and categories
    const [productsResponse, categoriesResponse] = await Promise.all([
        supabase.from('products').select('*, categories(*)').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, slug').order('name')
    ])

    const products = productsResponse.data
    const categories = categoriesResponse.data

    // Transform products (Your existing logic)
    const formattedProducts = products?.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        category: p.categories?.name || 'Uncategorized', // Fixed reference p.categories
        categorySlug: p.categories?.slug || 'uncategorized',
        image: p.image_url || '/placeholder-product.jpg',
        stock: p.stock,
        rating: 4.7,
        isNew: isWithinDays(p.created_at, 30),
    })) || []

    const categoriesWithCounts = [
        { name: 'All Products', slug: 'all', count: formattedProducts.length },
        ...(categories?.map(c => ({
            name: c.name,
            slug: c.slug,
            count: formattedProducts.filter(p => p.categorySlug === c.slug).length,
        })) || [])
    ]

    return <ProductsClient initialProducts={formattedProducts} initialCategories={categoriesWithCounts} />
}

// The Page component renders immediately and shows the fallback
export default function ProductsPage() {
    return (
        <main>
            <Suspense fallback={<ProductsSkeleton />}>
                <ProductsList />
            </Suspense>
        </main>
    )
}

// Loading State
function ProductsSkeleton() {
    return (
        <div className="max-w-5xl mx-auto p-5">
            {/* Fake Category Tabs */}
            <div className="flex gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
                ))}
            </div>

            {/* Fake Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-4">
                        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" /> {/* Image */}
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" /> {/* Title */}
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" /> {/* Price */}
                    </div>
                ))}
            </div>
        </div>
    )
}

function isWithinDays(dateString: string, days: number): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= days
}