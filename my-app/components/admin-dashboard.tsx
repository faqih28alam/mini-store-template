'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2, Package, TrendingUp, ShoppingBag, AlertCircle, Eye, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

type Product = {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    stock: number
    category_id: string | null
    image_url: string | null
    sku: string | null
    is_active: boolean
    created_at: string
    categories?: {
        name: string
        slug: string
    }
}

type Category = {
    id: string
    name: string
    slug: string
}

type DashboardStats = {
    totalProducts: number
    activeProducts: number
    lowStockProducts: number
    totalValue: number
}

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        totalValue: 0,
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        sku: '',
        is_active: true,
    })

    const supabase = createClient()

    // Fetch data
    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    useEffect(() => {
        calculateStats()
    }, [products])

    const fetchProducts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        categories (name, slug)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Failed to fetch products')
            console.error(error)
        } else {
            setProducts(data || [])
        }
        setLoading(false)
    }

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) {
            console.error(error)
        } else {
            setCategories(data || [])
        }
    }

    const calculateStats = () => {
        const totalProducts = products.length
        const activeProducts = products.filter(p => p.is_active).length
        const lowStockProducts = products.filter(p => p.stock < 10).length
        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0)

        setStats({
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalValue,
        })
    }

    const handleCreate = async () => {
        if (!formData.name || !formData.price || !formData.stock) {
            toast.error('Please fill in all required fields')
            return
        }

        const toastId = toast.loading('Creating product...')

        const { error } = await supabase
            .from('products')
            .insert([{
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                description: formData.description || null,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category_id: formData.category_id || null,
                image_url: formData.image_url || null,
                sku: formData.sku || null,
                is_active: formData.is_active,
            }])

        if (error) {
            toast.error('Failed to create product', { id: toastId })
            console.error(error)
        } else {
            toast.success('Product created successfully!', { id: toastId })
            setIsCreateOpen(false)
            resetForm()
            fetchProducts()
        }
    }

    const handleUpdate = async () => {
        if (!selectedProduct) return

        const toastId = toast.loading('Updating product...')

        const { error } = await supabase
            .from('products')
            .update({
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category_id: formData.category_id || null,
                image_url: formData.image_url || null,
                sku: formData.sku || null,
                is_active: formData.is_active,
            })
            .eq('id', selectedProduct.id)

        if (error) {
            toast.error('Failed to update product', { id: toastId })
            console.error(error)
        } else {
            toast.success('Product updated successfully!', { id: toastId })
            setIsEditOpen(false)
            resetForm()
            fetchProducts()
        }
    }

    const handleDelete = async () => {
        if (!selectedProduct) return

        const toastId = toast.loading('Deleting product...')

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', selectedProduct.id)

        if (error) {
            toast.error('Failed to delete product', { id: toastId })
            console.error(error)
        } else {
            toast.success('Product deleted successfully!', { id: toastId })
            setIsDeleteOpen(false)
            setSelectedProduct(null)
            fetchProducts()
        }
    }

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product)
        setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            price: String(product.price),
            stock: String(product.stock),
            category_id: product.category_id || '',
            image_url: product.image_url || '',
            sku: product.sku || '',
            is_active: product.is_active,
        })
        setIsEditOpen(true)
    }

    const openDeleteDialog = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            image_url: '',
            sku: '',
            is_active: true,
        })
        setSelectedProduct(null)
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200 dark:from-midnight-base dark:via-midnight-surface dark:to-midnight-base">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-4xl font-semibold text-foreground mb-2">
                        Product Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your beauty and wellness products
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.activeProducts} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Inventory value
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertCircle className="h-4 w-4 text-terracotta-600 dark:text-coral-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                Need restock
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Product categories
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={() => {
                                    resetForm()
                                    setIsCreateOpen(true)
                                }}
                                className="bg-sage-600 hover:bg-sage-700 dark:bg-sage-500 dark:hover:bg-sage-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Image</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                Loading products...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package className="h-10 w-10 text-muted-foreground" />
                                                    <p className="text-muted-foreground">No products found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                                        {product.image_url ? (
                                                            <Image
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        {product.sku && (
                                                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {product.categories?.name ? (
                                                        <Badge variant="outline">{product.categories.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatPrice(Number(product.price))}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={product.stock < 10 ? 'destructive' : 'secondary'}
                                                    >
                                                        {product.stock} units
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(product)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <ProductDialog
                    isOpen={isCreateOpen || isEditOpen}
                    onClose={() => {
                        setIsCreateOpen(false)
                        setIsEditOpen(false)
                        resetForm()
                    }}
                    onSubmit={isEditOpen ? handleUpdate : handleCreate}
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    title={isEditOpen ? 'Edit Product' : 'Create Product'}
                    isEdit={isEditOpen}
                />

                {/* Delete Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

// Product Dialog Component
function ProductDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    categories,
    title,
    isEdit,
}: {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    formData: any
    setFormData: (data: any) => void
    categories: Category[]
    title: string
    isEdit: boolean
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update product information' : 'Add a new product to your store'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Vitamin C Serum"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="vitamin-c-serum"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (IDR) *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="285000"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock *</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="SKC-001"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Active (visible in store)
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} className="bg-sage-600 hover:bg-sage-700">
                        {isEdit ? 'Update Product' : 'Create Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}