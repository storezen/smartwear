import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import Papa from "papaparse"

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const clearData = formData.get("clearData") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    const rows = parsed.data as any[]
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 })
    }

    // Group by Handle
    const productsByHandle: Record<string, any[]> = {}
    for (const row of rows) {
      const handle = row["Handle"]
      if (!handle) continue
      if (!productsByHandle[handle]) {
        productsByHandle[handle] = []
      }
      productsByHandle[handle].push(row)
    }

    if (clearData) {
      await prisma.product.deleteMany({})
      await prisma.category.deleteMany({})
    }

    const categoriesSet = new Set<string>()
    let imported = 0

    // Begin processing
    for (const [handle, groupRows] of Object.entries(productsByHandle)) {
      const baseRow = groupRows.find(r => r["Title"]) || groupRows[0]

      const title = baseRow["Title"] || handle
      const description = baseRow["Body (HTML)"] || ""
      const tagsStr = baseRow["Tags"] || ""
      const tags = tagsStr.split(",").map((t: string) => t.trim()).filter(Boolean)
      
      let categoryName = baseRow["Type"] || baseRow["Product Category"] || "Uncategorized"
      if (categoryName.includes(">")) {
        categoryName = categoryName.split(">").pop()?.trim() || "Uncategorized"
      }
      const categorySlug = slugify(categoryName)
      categoriesSet.add(categoryName)

      const images: string[] = []
      groupRows.forEach(row => {
        const img = row["Image Src"]
        if (img && !images.includes(img)) {
          images.push(img)
        }
      })
      
      const mainRowImg = groupRows.find(r => r["Image Position"] === "1")?.["Image Src"]
      const mainImage = mainRowImg || (images.length > 0 ? images[0] : "")

      const variants: any[] = []
      const optionNames = new Set<string>()

      groupRows.forEach(row => {
        if (!row["Variant Price"]) return 
        
        const variant: any = {
          price: parseFloat(row["Variant Price"]) || 0,
          originalPrice: parseFloat(row["Variant Compare At Price"]) || null,
          sku: row["Variant SKU"] || "",
          inventory: parseInt(row["Variant Inventory Qty"]) || 100,
          image: row["Variant Image"] || "",
          options: {}
        }

        for (let i = 1; i <= 3; i++) {
          const optName = row[`Option${i} Name`]
          const optValue = row[`Option${i} Value`]
          if (optName && optValue) {
            optionNames.add(optName)
            variant.options[optName] = optValue
          }
        }
        
        if (Object.keys(variant.options).length === 1 && variant.options["Title"] === "Default Title") {
          optionNames.delete("Title")
          variant.options = {}
        }

        variants.push(variant)
      })

      if (variants.length === 0) {
        variants.push({
          price: parseFloat(baseRow["Variant Price"]) || 0,
          originalPrice: parseFloat(baseRow["Variant Compare At Price"]) || null,
          sku: baseRow["Variant SKU"] || "",
          inventory: parseInt(baseRow["Variant Inventory Qty"]) || 100,
          options: {}
        })
      }

      const basePrice = variants.length > 0 ? variants[0].price : 0
      const originalPrice = variants.length > 0 ? variants[0].originalPrice : null

      const isPublished = baseRow["Published"] === "true" || baseRow["Status"] === "active"
      const status = isPublished ? "published" : "draft"

      const data = {
        name: title,
        handle: handle,
        description,
        price: basePrice,
        originalPrice: originalPrice,
        image: mainImage,
        images: images,
        category: categorySlug,
        tags: tags,
        status: status,
        variants: variants,
        optionNames: Array.from(optionNames),
        inStock: variants.some(v => v.inventory > 0),
        featured: tags.includes("hot") || tags.includes("featured")
      }

      if (clearData) {
        await prisma.product.create({ data })
      } else {
        const existing = await prisma.product.findFirst({ where: { handle } })
        if (existing) {
          await prisma.product.update({ where: { id: existing.id }, data })
        } else {
          await prisma.product.create({ data })
        }
      }
      
      imported++
    }

    for (const catName of Array.from(categoriesSet)) {
      const slug = slugify(catName)
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: {
          name: catName,
          slug: slug,
          showInNavbar: true,
          showOnHomepage: true,
        }
      })
    }

    revalidatePath("/", "layout")
    
    return NextResponse.json({ 
      success: true, 
      message: `Imported ${imported} products and ${categoriesSet.size} categories.`
    })

  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json({ error: error.message || "Failed to import products" }, { status: 500 })
  }
}
