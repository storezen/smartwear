import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Placeholder used in the app when an image is missing
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 1. Fetch Product
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Determine what needs to be enriched
    let specsObj: any = []
    try {
      if (typeof product.specs === 'string') {
        specsObj = JSON.parse(product.specs)
      } else {
        specsObj = product.specs
      }
    } catch(e) {}

    const needsDescription = !product.description || product.description.trim() === "" || product.description.length < 20
    const needsSpecs = !specsObj || specsObj.length === 0
    const needsSeo = !product.metaTitle || !product.metaDescription
    const needsImage = !product.image || product.image === "" || product.image.includes("1505740420928-5e560c06d30e")

    if (!needsDescription && !needsSpecs && !needsSeo && !needsImage) {
      return NextResponse.json({ success: true, message: "Product is already fully enriched.", product })
    }

    const updates: any = {}

    // 2. Fetch missing image from Unsplash
    if (needsImage) {
      const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
      if (unsplashKey) {
        try {
          const query = encodeURIComponent(`${product.category} ${product.name}`.trim())
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&page=1&per_page=1`, {
            headers: {
              Authorization: `Client-ID ${unsplashKey}`
            }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.results && data.results.length > 0) {
              updates.image = data.results[0].urls.regular
            }
          }
        } catch (err) {
          console.error("Unsplash Fetch Error:", err)
        }
      }
    }

    // 3. Generate Text with Gemini
    if (needsDescription || needsSpecs || needsSeo) {
      const geminiKey = process.env.GEMINI_API_KEY
      
      if (!geminiKey) {
        console.warn("GEMINI_API_KEY is not set. Skipping text enrichment.")
      } else {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey)
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

          const prompt = `
          You are an expert E-commerce Copywriter and SEO Specialist.
          I have a product with the following details:
          Name: "${product.name}"
          Category: "${product.category}"
          Price: ${product.price}
          
          I need you to generate missing data for this product. Return ONLY a valid JSON object matching this exact structure:
          {
            "description": "Write a compelling, premium, and detailed product description in HTML format (e.g. <p>...</p> <ul><li>...</li></ul>). Make it sound premium, focusing on features and benefits.",
            "specs": [{"key": "Spec Name (e.g. Material)", "value": "Spec Value (e.g. Premium Leather)"}, {"key": "...", "value": "..."}],
            "metaTitle": "SEO optimized title (max 60 chars)",
            "metaDescription": "SEO optimized description (max 160 chars)"
          }
          
          Make sure the specs are realistic for a product of this type. Return ONLY valid JSON, without markdown formatting like \`\`\`json.
          `

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            }
          })

          const aiText = result.response.text()
          const aiData = JSON.parse(aiText)

          if (needsDescription && aiData.description) updates.description = aiData.description
          if (needsSpecs && aiData.specs) updates.specs = aiData.specs // Prisma maps array to JSON
          if (needsSeo) {
            if (aiData.metaTitle) updates.metaTitle = aiData.metaTitle
            if (aiData.metaDescription) updates.metaDescription = aiData.metaDescription
          }
        } catch (err) {
          console.error("Gemini API Error:", err)
        }
      }
    }

    // 4. Save to DB
    if (Object.keys(updates).length > 0) {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updates
      })
      return NextResponse.json({ success: true, message: "Product enriched successfully.", product: updatedProduct })
    }

    return NextResponse.json({ success: true, message: "No updates were applied.", product })
    
  } catch (error) {
    console.error("AI Enrichment Error:", error)
    return NextResponse.json({ error: "Failed to enrich product" }, { status: 500 })
  }
}
