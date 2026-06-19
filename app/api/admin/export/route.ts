import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    // 1. Verify Admin (simplified for API)
    const cookieHeader = req.headers.get('cookie') || ''
    if (!cookieHeader.includes('smartwear_admin_token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let orders = []

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (!error && data) orders = data
    } else {
      orders = await getOrders()
    }

    // 2. Format to CSV
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Total', 'Payment', 'Status', 'Items']
    
    const csvRows = orders.map((o: any) => {
      const date = new Date(o.created_at).toLocaleDateString()
      const itemsStr = o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | ')
      
      // Escape commas and quotes for CSV
      const escape = (str: string) => `"${String(str).replace(/"/g, '""')}"`
      
      return [
        o.id,
        date,
        escape(o.customer_name),
        o.phone,
        escape(o.shipping_address?.city || ''),
        o.total,
        o.payment_method,
        o.status,
        escape(itemsStr)
      ].join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')

    // 3. Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error("Export Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
