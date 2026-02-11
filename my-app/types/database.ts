export type Database = {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    price: number
                    stock: number
                    category_id: string | null
                    image_url: string | null
                    images: string[]
                    is_active: boolean
                    sku: string | null
                    weight: number | null
                    created_at: string
                    updated_at: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    image_url: string | null
                    created_at: string
                    updated_at: string
                }
            }
        }
    }
}