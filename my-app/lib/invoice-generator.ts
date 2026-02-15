// lib/invoice-generator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type OrderData = {
    order_number: string
    created_at: string
    paid_at: string | null
    status: string
    payment_status: string
    payment_method: string | null
    shipping_name: string
    shipping_email: string
    shipping_phone: string
    shipping_address: string
    shipping_city: string
    shipping_province: string
    shipping_postal_code: string
    subtotal: number
    tax: number
    shipping_fee: number
    total: number
    order_items: {
        product_name: string
        product_sku: string | null
        quantity: number
        price: number
        subtotal: number
    }[]
}

export function generateInvoicePDF(order: OrderData) {
    const doc = new jsPDF()

    // Colors
    const primaryColor: [number, number, number] = [141, 170, 145]
    const textColor: [number, number, number] = [31, 41, 55]
    const lightGray: [number, number, number] = [243, 244, 246]

    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 20, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('OrganicStore', 20, 33)

    // Invoice details
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.text(`Invoice: ${order.order_number}`, 190, 25, { align: 'right' })
    doc.text(`Date: ${formatDate(order.created_at)}`, 190, 31, { align: 'right' })

    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
        paid: [34, 197, 94],
        pending: [234, 179, 8],
        processing: [168, 85, 247],
        cancelled: [239, 68, 68],
    }
    const statusColor = statusColors[order.payment_status] || statusColors.pending
    doc.setFillColor(...statusColor)
    doc.roundedRect(140, 32, 50, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(order.payment_status.toUpperCase(), 165, 37, { align: 'center' })

    // Bill To
    doc.setTextColor(...textColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 20, 55)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(order.shipping_name, 20, 62)
    doc.text(order.shipping_email, 20, 68)
    doc.text(order.shipping_phone, 20, 74)

    // Ship To
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('SHIP TO:', 110, 55)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const address = `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province} ${order.shipping_postal_code}`
    const addressLines = doc.splitTextToSize(address, 80)
    doc.text(addressLines, 110, 62)

    // Items table
    autoTable(doc, {
        startY: 90,
        head: [['Item', 'SKU', 'Qty', 'Price', 'Subtotal']],
        body: order.order_items.map(item => [
            item.product_name,
            item.product_sku || '-',
            item.quantity.toString(),
            formatPrice(item.price),
            formatPrice(item.subtotal),
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
        },
        styles: {
            fontSize: 9,
            cellPadding: 5,
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
        },
    })

    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10

    // Summary
    const summaryX = 130
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    doc.text('Subtotal:', summaryX, finalY)
    doc.text(formatPrice(order.subtotal), 190, finalY, { align: 'right' })

    doc.text('Tax:', summaryX, finalY + 6)
    doc.text(formatPrice(order.tax), 190, finalY + 6, { align: 'right' })

    doc.text('Shipping:', summaryX, finalY + 12)
    doc.text(formatPrice(order.shipping_fee), 190, finalY + 12, { align: 'right' })

    // Total
    doc.setFillColor(...lightGray)
    doc.rect(summaryX - 5, finalY + 16, 65, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', summaryX, finalY + 23)
    doc.setTextColor(...primaryColor)
    doc.text(formatPrice(order.total), 190, finalY + 23, { align: 'right' })

    // Payment method
    if (order.payment_method) {
        doc.setTextColor(...textColor)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(
            `Payment: ${order.payment_method.replace('_', ' ').toUpperCase()}`,
            summaryX,
            finalY + 30
        )
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Thank you for your purchase!', 105, 280, { align: 'center' })
    doc.text('support@organicstore.com', 105, 285, { align: 'center' })

    // Save
    doc.save(`Invoice-${order.order_number}.pdf`)
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price)
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}