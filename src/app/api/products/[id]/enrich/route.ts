import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"// Placeholder used in the app when an image is missing
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
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

    // 3. Generate Text with Opencode (DeepSeek)
    if (needsDescription || needsSpecs || needsSeo) {
      const apiKey = process.env.OPENCODE_API_KEY
      const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
      const model = process.env.AI_MODEL || "deepseek-v4-flash-free"
      
      if (!apiKey) {
        console.warn("OPENCODE_API_KEY is not set. Skipping text enrichment.")
      } else {
        try {
          const prompt = `
You are an expert E-commerce Copywriter and SEO Specialist.
I have a product with the following details:
Name: "${product.name}"
Category: "${product.category}"
Price: Rs. ${product.price}

I need you to generate missing data for this product. Return ONLY a valid JSON object matching this exact structure:
{
  "description": "Write a compelling, premium, and detailed product description in HTML format (e.g. <p>...</p> <ul><li>...</li></ul>). Make it sound premium, focusing on features and benefits.",
  "specs": [{"key": "Spec Name (e.g. Material)", "value": "Spec Value (e.g. Premium Leather)"}, {"key": "...", "value": "..."}],
  "metaTitle": "SEO optimized title (max 60 chars)",
  "metaDescription": "SEO optimized description (max 160 chars)"
}

Make sure the specs are realistic for a product of this type. Return ONLY valid JSON, without markdown formatting like \`\`\`json.
`

          const aiRes = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: "You are a product data enricher. Return only raw valid JSON object. No explanations." },
                { role: "user", content: prompt }
              ],
              temperature: 0.3
            })
          })

          if (!aiRes.ok) {
            console.error("AI API Error:", await aiRes.text())
          } else {
            const aiJson = await aiRes.json()
            let aiText = aiJson.choices?.[0]?.message?.content?.trim() || ""
            
            // Strip markdown if AI included it
            aiText = aiText.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim()
            
            if (aiText) {
              try {
                const aiData = JSON.parse(aiText)

                if (needsDescription && aiData.description) updates.description = aiData.description
                if (needsSpecs && aiData.specs) updates.specs = aiData.specs
                if (needsSeo) {
                  if (aiData.metaTitle) updates.metaTitle = aiData.metaTitle
                  if (aiData.metaDescription) updates.metaDescription = aiData.metaDescription
                }
              } catch (parseError) {
                console.error("Failed to parse AI JSON:", aiText)
              }
            }
          }
        } catch (err) {
          console.error("AI Generation Error:", err)
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
