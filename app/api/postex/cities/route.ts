import { NextResponse } from 'next/server'
import { getAllCities, getCitiesByProvince } from '@/lib/address-validator'

export async function GET() {
  const cities = getAllCities()
  const grouped = getCitiesByProvince()
  return NextResponse.json({
    count: cities.length,
    cities,
    grouped,
  })
}
