import React, { useEffect } from "react";
import ScrollToTop from "../components/ScrollToTop";

const COMPANY = {
  name: "A V TEXTILEHUB PRIVATE LIMITED",
  address:
    "Floor No.: P BLOCK\nBuilding No./Flat No.: PROPERTY  BEARING NO.P-4\nRoad/Street: VIJAY VIHAR\nLocality/Sub Locality: UTTAM NAGAR\nCity/Town/Village: New Delhi\nDistrict: South West Delhi\nState: Delhi\nPIN Code: 110059",
  gstNo: "07ABBCA7672F1ZN",
};

const LAST_UPDATED = "25 March 2026";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800">
      <div className="max-w-5xl mx-auto px-5 lg:px-20 py-6 lg:py-24">
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm lg:text-base text-gray-600">Last updated: {LAST_UPDATED}</p>
          <p className="mt-3 text-sm lg:text-base text-gray-700 max-w-3xl mx-auto">
            This Privacy Policy explains how <strong>{COMPANY.name}</strong> collects, uses and protects
            your information when you use our website.
          </p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Personal details you provide (name, phone, email, address).</li>
              <li>Order details and transaction references.</li>
              <li>Technical/usage data (device, browser, basic analytics).</li>
              <li>Communication records when you contact customer support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>To process orders, deliveries, returns and customer support.</li>
              <li>To improve site performance and user experience.</li>
              <li>To comply with legal and regulatory requirements.</li>
              <li>To prevent fraud, abuse and unauthorized transactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">3. Sharing of Information</h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share it with service providers (delivery
              partners, payment gateways) only as needed to fulfil your order or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">4. Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable measures to protect your data. However, no online transmission is 100%
              secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">5. Cookies &amp; Tracking</h2>
            <p className="leading-relaxed">
              We may use cookies or similar technologies for login sessions, cart retention, analytics and
              improving browsing experience. You can manage cookies from your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain personal data only for as long as required for order fulfilment, legal compliance,
              accounting and dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>You may request correction of inaccurate personal information.</li>
              <li>You may request deletion of data, subject to legal/operational obligations.</li>
              <li>You may opt out of non-essential promotional communication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">8. Third-Party Services</h2>
            <p className="leading-relaxed">
              Payment, logistics and analytics may be operated by third-party providers. Their handling of
              data is governed by their own privacy terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">9. Contact Us</h2>
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 whitespace-pre-line leading-relaxed">
              <div className="font-semibold text-gray-900">{COMPANY.name}</div>
              <div className="text-gray-700 mt-2">Address: {COMPANY.address}</div>
              <div className="text-gray-700 mt-2">GST No: {COMPANY.gstNo}</div>
            </div>
          </section>
        </div>

        <ScrollToTop />
      </div>
    </div>
  );
}

