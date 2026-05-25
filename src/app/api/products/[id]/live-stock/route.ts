import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Mock stock levels that fluctuate realistically based on time (minutes)
    const baseQuantity = product.quantity || 15
    const minute = new Date().getMinutes()
    
    // Fluctuates slightly to simulate real sales/restocks
    const fluctuation = (minute % 7)
    const liveStock = Math.max(1, baseQuantity - fluctuation)
    
    // Assign warehouse based on ID hash
    const isEven = id.charCodeAt(id.length - 1) % 2 === 0
    const warehouse = isEven ? "Lahore Main Warehouse" : "Karachi Distribution Hub"
    
    const lowStockThreshold = product.lowStockThreshold || 8
    const isLow = liveStock <= lowStockThreshold

    return NextResponse.json({
      productId: id,
      stockCount: liveStock,
      warehouse,
      isLow,
      lastUpdated: new Date().toISOString(),
      simulatedStream: true,
      message: isLow 
        ? `Only ${liveStock} units left in ${warehouse}!` 
        : `Stock level healthy at ${warehouse}`
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
