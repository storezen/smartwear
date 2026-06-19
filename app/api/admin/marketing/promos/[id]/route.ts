import { NextResponse } from 'next/server'
import { updatePromo, deletePromo } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const body = await req.json()
    const updated = await updatePromo(resolvedParams.id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Promo PUT Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    await deletePromo(resolvedParams.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Promo DELETE Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
