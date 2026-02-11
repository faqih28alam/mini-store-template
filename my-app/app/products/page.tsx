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

// 3. Simple Loading State
function ProductsSkeleton() {
    return (
        <div className="container mx-auto p-12 text-center">
            <div className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 rounded-xl w-full"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                </div>
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