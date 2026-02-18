export default function EditProductPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Edit Product {params.id}</h1>
            {/* your edit form here */}
        </div>
    )
}