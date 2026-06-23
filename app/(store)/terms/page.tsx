"use client"

import { useState, useEffect } from "react"

export default function TermsPage() {
  const [s, setS] = useState<any>(null)
  useEffect(() => { fetch('/api/public/settings').then(r => r.json()).then(setS).catch(() => {}) }, [])
  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="sw-container max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Terms of Service
        </h1>
        <p className="text-white/50 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-8 md:space-y-10 text-white/70 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Smartwear.pk, you agree to be bound by these Terms of Service. If you do not agree,
              please do not use our platform. We reserve the right to update these terms at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to make a purchase. By placing an order, you confirm that you
              are legally capable of entering into binding contracts and that all information provided is accurate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Orders &amp; Pricing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are in Pakistani Rupees (PKR) and include applicable taxes</li>
              <li>We reserve the right to modify prices without prior notice</li>
              <li>Orders are subject to availability and confirmation</li>
              <li>We may cancel orders if fraudulent activity is suspected</li>
              <li>Cash on Delivery (COD) orders require phone confirmation before dispatch</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Payment</h2>
            <p>
              We accept Cash on Delivery (COD), JazzCash, Easypaisa, and Bank Transfer. Full payment is required
              before order dispatch for non-COD orders. COD orders are paid in full upon delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Shipping &amp; Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We deliver nationwide across Pakistan</li>
              <li>Standard delivery: 2-4 business days</li>
              <li>Express delivery: 1-2 business days (additional charges apply)</li>
              <li>Free delivery on orders over Rs. 5,000</li>
              <li>Open-box verification available before payment (COD only)</li>
              <li>Delivery times may vary based on location and courier partner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Returns &amp; Refunds</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>7-day return window from delivery date</li>
              <li>Products must be unused, in original packaging</li>
              <li>Defective items are eligible for replacement or refund</li>
              <li>Return shipping is covered by us for defective items</li>
              <li>Refunds are processed within 5-7 business days after inspection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Warranty</h2>
            <p>
              All smartwatches come with a 1-year international warranty covering manufacturing defects.
              The warranty does not cover physical damage, water damage (beyond rated limits), or normal wear and tear.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. User Conduct</h2>
            <p>
              You agree not to use our platform for any unlawful purpose, to not attempt to gain unauthorized
              access to our systems, and to not engage in any activity that disrupts the platform's functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              Smartwear.pk shall not be liable for any indirect, incidental, or consequential damages arising
              from the use of our products or platform. Our total liability is limited to the purchase price
              of the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For questions about these terms, reach us at:
            </p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li>Email: {s?.legal_email || 'legal@smartwear.pk'}</li>
              <li>Phone: {s?.support_phone || '+92 300 1234567'}</li>
              <li>Address: {s?.store_address_line1 || 'MM Alam Road'}{s?.store_address_line2 ? `, ${s.store_address_line2}` : ''}{s?.store_city ? `, ${s.store_city}` : ', Lahore, Pakistan'}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
