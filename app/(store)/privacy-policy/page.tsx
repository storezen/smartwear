import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Smartwear Pakistan",
  description: "How Smartwear collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="sw-container max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Privacy Policy
        </h1>
        <p className="text-white/50 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Smartwear.pk ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
            <p className="mt-2">
              By using our platform, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-white/90 font-medium mb-2">Personal Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name, email address, phone number</li>
              <li>Shipping and billing address</li>
              <li>Order history and preferences</li>
              <li>Payment information (processed securely through third-party gateways)</li>
            </ul>
            <h3 className="text-white/90 font-medium mt-4 mb-2">Automatically Collected Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address, browser type, device information</li>
              <li>Pages visited, time spent, and navigation patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate order updates, delivery tracking, and customer support</li>
              <li>Improve our website, products, and customer experience</li>
              <li>Send promotional offers (only with your consent)</li>
              <li>Prevent fraudulent transactions and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Delivery partners</strong> (PostEx, courier services) for order fulfillment</li>
              <li><strong>Payment processors</strong> for secure transaction handling</li>
              <li><strong>Service providers</strong> (analytics, hosting, customer support tools)</li>
              <li><strong>Legal authorities</strong> when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including SSL encryption, secure servers,
              and restricted data access. Your payment information is encrypted and never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data held by us</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Opt out of marketing communications anytime</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
              You can control cookie preferences through your browser settings. Essential cookies are required
              for the website to function properly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
            <p>
              For privacy-related inquiries, please contact us:
            </p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li>Email: privacy@smartwear.pk</li>
              <li>Phone: +92 300 1234567</li>
              <li>Address: MM Alam Road, Gulberg III, Lahore, Pakistan</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
