import React, { useEffect } from "react";
import ScrollToTop from "../components/ScrollToTop";

const COMPANY = {
  name: "A V TEXTILEHUB PRIVATE LIMITED",
  address:
    "Floor No.: P BLOCK\nBuilding No./Flat No.: PROPERTY  BEARING NO.P-4\nRoad/Street: VIJAY VIHAR\nLocality/Sub Locality: UTTAM NAGAR\nCity/Town/Village: New Delhi\nDistrict: South West Delhi\nState: Delhi\nPIN Code: 110059",
  gstNo: "07ABBCA7672F1ZN",
};

const LAST_UPDATED = "25 March 2026";

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800">
      <div className="max-w-5xl mx-auto px-5 lg:px-20 py-6 lg:py-24">
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm lg:text-base text-gray-600">Last updated: {LAST_UPDATED}</p>
          <p className="mt-3 text-sm lg:text-base text-gray-700 max-w-3xl mx-auto">
            These Terms &amp; Conditions govern your use of this website and services provided by{" "}
            <strong>{COMPANY.name}</strong>.
          </p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">1. Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 18 years old and legally capable of entering into a binding contract
              to place orders on this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">2. Orders &amp; Payments</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Orders are confirmed only after successful payment (unless COD is offered).</li>
              <li>We may cancel orders in case of suspected fraud or pricing errors.</li>
              <li>In case of cancellation by us, eligible refunds are processed to the original mode.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">3. Shipping &amp; Delivery</h2>
            <p className="leading-relaxed">
              Shipping timelines and charges are governed by our Shipping Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">4. Returns &amp; Refunds</h2>
            <p className="leading-relaxed">
              Returns, refunds and cancellations are governed by our Refund/Cancellation Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">5. Product Information</h2>
            <p className="leading-relaxed">
              We try to keep product descriptions, images and prices accurate. Minor variations may occur
              due to packaging updates or display differences. In case of mismatch, our decision on
              correction/replacement/refund will be final as per policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">6. User Conduct</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Do not misuse the website for fraudulent, abusive or illegal activity.</li>
              <li>Do not attempt unauthorized access to systems, user accounts or payment flows.</li>
              <li>Do not upload misleading, offensive or unlawful content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content including brand assets, product media, UI, and text belongs to the company
              or licensed owners. Unauthorized copying or redistribution is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the extent permitted by law, we are not liable for indirect or consequential losses
              arising from delays, third-party service failures, or factors beyond reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">9. Governing Law</h2>
            <p className="leading-relaxed">
              These terms are governed by the laws of India. Jurisdiction shall be courts in Delhi.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">10. Contact Us</h2>
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

