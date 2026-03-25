import React, { useEffect } from "react";
import ScrollToTop from "../components/ScrollToTop";

const COMPANY = {
  name: "A V TEXTILEHUB PRIVATE LIMITED",
  address:
    "Floor No.: P BLOCK\nBuilding No./Flat No.: PROPERTY  BEARING NO.P-4\nRoad/Street: VIJAY VIHAR\nLocality/Sub Locality: UTTAM NAGAR\nCity/Town/Village: New Delhi\nDistrict: South West Delhi\nState: Delhi\nPIN Code: 110059",
  gstNo: "07ABBCA7672F1ZN",
};

const LAST_UPDATED = "25 March 2026";

export default function RefundCancellationPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800">
      <div className="max-w-5xl mx-auto px-5 lg:px-20 py-6 lg:py-24">
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Refund &amp; Cancellation Policy</h1>
          <p className="text-sm lg:text-base text-gray-600">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">1. Order Cancellation</h2>
            <p className="leading-relaxed">
              You may request cancellation before dispatch. Once dispatched, cancellation may not be
              possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">2. Returns</h2>
            <p className="leading-relaxed">
              Returns may be accepted only as per product condition and eligibility. For any issue,
              contact support with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">3. Refunds</h2>
            <p className="leading-relaxed">
              Refunds (if approved) are processed to the original payment method or via bank transfer
              for eligible cases, within a reasonable processing time.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">4. Return Eligibility</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Product should be unused and in original packaging.</li>
              <li>Return request should be raised within eligible window from delivery date.</li>
              <li>Certain consumables/hygiene-sensitive items may be non-returnable once opened.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">5. Non-Refundable Cases</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Damage due to misuse, improper storage, or customer handling.</li>
              <li>Return requests outside policy window.</li>
              <li>Products missing tags, seals, or original accessories (where applicable).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">6. Refund Timelines</h2>
            <p className="leading-relaxed">
              After approval, refunds are generally initiated within 5-7 business days. Final credit time
              may vary based on bank/payment provider processing cycles.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">7. Exchange Requests</h2>
            <p className="leading-relaxed">
              Exchange may be offered based on stock availability. If replacement is unavailable, refund
              or store credit may be offered as applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">8. Contact Us</h2>
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

