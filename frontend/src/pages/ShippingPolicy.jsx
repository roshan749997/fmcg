import React, { useEffect } from "react";
import ScrollToTop from "../components/ScrollToTop";

const COMPANY = {
  name: "A V TEXTILEHUB PRIVATE LIMITED",
  address:
    "Floor No.: P BLOCK\nBuilding No./Flat No.: PROPERTY  BEARING NO.P-4\nRoad/Street: VIJAY VIHAR\nLocality/Sub Locality: UTTAM NAGAR\nCity/Town/Village: New Delhi\nDistrict: South West Delhi\nState: Delhi\nPIN Code: 110059",
  gstNo: "07ABBCA7672F1ZN",
};

const LAST_UPDATED = "25 March 2026";

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800">
      <div className="max-w-5xl mx-auto px-5 lg:px-20 py-6 lg:py-24">
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Shipping Policy</h1>
          <p className="text-sm lg:text-base text-gray-600">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">1. Order Processing</h2>
            <p className="leading-relaxed">
              Orders are generally processed within 1–3 business days (excluding Sundays and holidays).
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">2. Shipping Charges</h2>
            <p className="leading-relaxed">
              Shipping charges (if applicable) are shown at checkout before you confirm your order.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">3. Delivery Timeline</h2>
            <p className="leading-relaxed">
              Delivery timelines depend on your PIN code serviceability and courier network. Delays may
              occur due to weather, festivals, strikes or other events beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">4. Serviceable Locations</h2>
            <p className="leading-relaxed">
              We deliver across serviceable Indian PIN codes. If your area is not serviceable, order may
              be cancelled and eligible refund will be initiated.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">5. Address &amp; Contact Details</h2>
            <p className="leading-relaxed">
              Please ensure your shipping address and phone number are correct. We are not responsible
              for delays caused by incorrect or incomplete details.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">6. Failed Delivery Attempts</h2>
            <p className="leading-relaxed">
              If delivery fails due to customer unavailability, wrong address, or unreachable contact,
              courier may return shipment to origin. Re-delivery can involve additional shipping cost.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">7. Damaged/Tampered Packages</h2>
            <p className="leading-relaxed">
              If package appears damaged/tampered, capture photos at delivery and report within 24-48
              hours for investigation and resolution as per return/refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">8. International Shipping</h2>
            <p className="leading-relaxed">
              International shipping is currently not available unless explicitly announced.
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

