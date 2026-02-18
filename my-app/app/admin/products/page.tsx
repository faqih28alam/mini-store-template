export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Product {params.id}</h1>
        </div>
    )
}