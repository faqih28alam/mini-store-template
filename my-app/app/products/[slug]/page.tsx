// app/products/[slug]/page.tsx
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Example Supabase fetch in a Server Component
export default async function ProductPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const { data: product } = await supabase
        .from('products')
        .select('*, categories(name)') // Join with categories table
        .eq('slug', slug)
        .single();

    if (!product) return <div>Product not found</div>;

    return (
        <main className="container mx-auto py-10">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery from product.images (JSONB) */}
                <div className="space-y-4">
                    <img src={product.image_url} alt={product.name} className="rounded-lg w-full" />
                    <div className="grid grid-cols-4 gap-2">
                        {product.images?.map((img: string, i: number) => (
                            <img key={i} src={img} className="rounded md cursor-pointer hover:opacity-80" />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold">{product.name}</h1>
                    <p className="text-2xl font-semibold">Rp    {product.price}</p>
                    {/* Displaying Quantity/Stock Status */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Availability:</span>
                        {product.stock > 0 ? (
                            <span className="text-green-600 font-bold">
                                {product.stock} units in stock
                            </span>
                        ) : (
                            <span className="text-red-600 font-bold">Out of Stock</span>
                        )}
                    </div>
                    <div className="prose prose-sm">
                        {product.description}
                    </div>
                    {/* Add to Cart Logic here */}
                </div>
            </div>
        </main>
    );
}