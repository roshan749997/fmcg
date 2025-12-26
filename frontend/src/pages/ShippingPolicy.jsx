import React, { useState, useEffect } from "react";
import ScrollToTop from '../components/ScrollToTop';
import { api } from '../utils/api';

// Format policy content to preserve line breaks and spacing
const formatPolicyContent = (content) => {
  if (!content) return '';
  
  // If content already has HTML tags, ensure proper spacing
  if (content.includes('<p>') || content.includes('<br>') || content.includes('<div>')) {
    // Ensure paragraphs have proper spacing
    return content
      .replace(/<\/p>\s*<p>/g, '</p><p>')
      .replace(/<p>/g, '<p class="mb-4">')
      .replace(/<br\s*\/?>/gi, '<br>');
  }
  
  // Convert double newlines to paragraph breaks, single newlines to <br>
  let paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length > 1) {
    return paragraphs
      .map(para => `<p class="mb-4">${para.trim().replace(/\n/g, '<br>')}</p>`)
      .join('');
  } else {
    // Single paragraph with line breaks
    return `<p class="mb-4">${content.trim().replace(/\n/g, '<br>')}</p>`;
  }
};

const ShippingPolicy = () => {
  const [contactInfo, setContactInfo] = useState({
    email: 'support@kidzo.com',
    phone: '+91 98765 43210',
    address: 'Kidzo Headquarters, 123 Playful Lane, Mumbai, India 400001',
    companyName: 'Kidzo',
  });
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [policyData, contactData] = await Promise.all([
        api.getPolicy('shipping').catch(() => null),
        api.getContactInfo().catch(() => null),
      ]);

      if (policyData) {
        setPolicy(policyData);
      }
      if (contactData) {
        setContactInfo(contactData);
      }
    } catch (err) {
      console.error('Failed to load policy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const lastUpdated = policy?.lastUpdated 
    ? new Date(policy.lastUpdated).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  // If policy content exists from backend, render it
  if (policy && (policy.sections?.length > 0 || policy.content)) {
    return (
      <div className="min-h-screen bg-gray-200 text-gray-800">
        <div className="max-w-5xl mx-auto px-5 lg:px-20 py-5 lg:py-24">
          <header className="mb-8 lg:mb-12 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              {policy.title || 'Shipping Policy'}
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              Last updated: {lastUpdated}
            </p>
          </header>
          
          {/* Render sections if available, otherwise render content */}
          {policy.sections && policy.sections.length > 0 ? (
            <>
              <style>{`
                .policy-section {
                  margin-bottom: 2rem;
                }
                .policy-section:last-child {
                  margin-bottom: 0;
                }
                .policy-section h2 {
                  margin-bottom: 0.75rem;
                }
                .policy-section p {
                  margin-bottom: 1rem;
                  line-height: 1.75;
                }
                .policy-section p.mb-4 {
                  margin-bottom: 1rem;
                }
                .policy-section p:last-child {
                  margin-bottom: 0;
                }
                .policy-section ul, .policy-section ol {
                  margin-bottom: 1rem;
                  padding-left: 1.5rem;
                  margin-top: 0.5rem;
                }
                .policy-section li {
                  margin-bottom: 0.5rem;
                  line-height: 1.75;
                }
                .policy-section li:last-child {
                  margin-bottom: 0;
                }
                .policy-section br {
                  line-height: 1.75;
                }
                .policy-section div {
                  line-height: 1.75;
                }
                .policy-section strong {
                  font-weight: 600;
                }
              `}</style>
              <div className="space-y-8 lg:space-y-10">
                {policy.sections
                  .sort((a, b) => (a.sectionNumber || 0) - (b.sectionNumber || 0))
                  .map((section, index) => (
                    <section key={index} className="policy-section">
                      <h2 className="text-xl lg:text-2xl font-semibold mb-3">
                        {section.sectionNumber}. {section.heading.replace(/^\d+\.\s*/, '')}
                      </h2>
                      <div 
                        className="leading-relaxed text-gray-800"
                        dangerouslySetInnerHTML={{ 
                          __html: formatPolicyContent(section.content)
                        }}
                      />
                    </section>
                  ))}
              </div>
            </>
          ) : (
            <div 
              className="space-y-8 lg:space-y-10 prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          )}
          
          <ScrollToTop />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800">
      <div className="max-w-5xl mx-auto px-5 lg:px-20 py-5 lg:py-24">
        {/* Header */}
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Shipping Policy
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-3 text-sm lg:text-base text-gray-700 max-w-3xl mx-auto">
            This Shipping Policy explains how{" "}
            <strong>Kidzo</strong> ("we",
            "our" or "us") handles shipping and delivery of orders placed for
            kids clothing, accessories, footwear, baby care products, and toys through our website.
          </p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          {/* 1. Serviceable Locations */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              1. Serviceable Locations
            </h2>
            <p className="leading-relaxed mb-2">
              We currently ship orders across most locations in India through
              our trusted courier partners, subject to serviceability of your
              PIN code.
            </p>
            <p className="leading-relaxed text-sm text-gray-700">
              If your PIN code is not serviceable, we will contact you to
              discuss alternatives or process a refund.
            </p>
          </section>

          {/* 2. Order Processing Time */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              2. Order Processing Time
            </h2>
            <p className="leading-relaxed mb-2">
              After your order and payment are successfully confirmed, we
              typically take <strong>1–3 business days</strong> to process and
              dispatch your order.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Orders are processed Monday to Saturday (excluding holidays).</li>
              <li>
                Orders placed on Sundays or public holidays are processed on the
                next working day.
              </li>
              <li>
                During sale periods or festive seasons, processing times may be
                slightly longer.
              </li>
            </ul>
          </section>

          {/* 3. Shipping Charges */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              3. Shipping Charges
            </h2>
            <p className="leading-relaxed mb-2">
              Shipping charges (if applicable) will be clearly displayed at
              checkout before you confirm your order. Our standard structure is:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Standard Shipping:</strong> ₹99 for orders below ₹999. Delivery within 5-7 business days.
              </li>
              <li>
                <strong>Express Shipping:</strong> ₹149 for orders below ₹999. Delivery within 2-4 business days (available in select cities).
              </li>
              <li>
                <strong>Free Shipping:</strong> Complimentary shipping for orders above ₹999. Standard delivery timeline applies.
              </li>
              <li>
                <strong>Cash on Delivery (COD):</strong> Additional ₹50 COD charges apply for orders below ₹999. Free COD for orders above ₹999.
              </li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              Shipping charges are calculated automatically at checkout based on your delivery address and order value. All shipping charges are non-refundable unless the return is due to our error.
            </p>
          </section>

          {/* 4. Estimated Delivery Timelines */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              4. Estimated Delivery Timelines
            </h2>
            <p className="leading-relaxed mb-2">
              After dispatch, estimated delivery times are:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Metro Cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune):</strong> 3–5 business days from dispatch.
              </li>
              <li>
                <strong>Tier 2 Cities:</strong> 4–7 business days from dispatch.
              </li>
              <li>
                <strong>Tier 3 Cities & Towns:</strong> 5–8 business days from dispatch.
              </li>
              <li>
                <strong>Remote / Out-of-delivery Areas:</strong> 7–12 business
                days from dispatch (subject to courier coverage and accessibility).
              </li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              Business days exclude Sundays and public holidays. Actual delivery may vary due to courier delays, weather conditions, natural disasters, strikes, festivals, or other events beyond our control. During sale periods (Diwali, Christmas, New Year), delivery may take 2-3 additional days.
            </p>
          </section>

          {/* 5. Order Tracking */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              5. Order Tracking
            </h2>
            <p className="leading-relaxed mb-2">
              Once your order is dispatched, you will receive a tracking ID and
              link via SMS/WhatsApp/email (where available), which you can use
              to follow your shipment.
            </p>
            <p className="leading-relaxed">
              If you face any difficulty in tracking, contact us with your order
              ID and registered mobile number or email.
            </p>
          </section>

          {/* 6. Address Accuracy */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              6. Shipping Address & Contact Details
            </h2>
            <p className="leading-relaxed mb-2">
              Please ensure your address, PIN code and contact number are
              correct at the time of placing the order.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                We are not responsible for delays or non-delivery caused by
                incorrect or incomplete details.
              </li>
              <li>
                Address changes after dispatch may not be possible. For changes
                before dispatch, please contact us at the earliest.
              </li>
            </ul>
          </section>

          {/* 7. Undelivered / Returned Shipments */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              7. Undelivered or Returned Shipments
            </h2>
            <p className="leading-relaxed mb-2">
              Orders may be returned to us by the courier due to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Incorrect or incomplete address.</li>
              <li>Customer unavailable during multiple delivery attempts.</li>
              <li>Customer not reachable on phone.</li>
              <li>Refusal to accept delivery.</li>
            </ul>
            <p className="leading-relaxed mt-2">
              Once we receive the returned shipment, we will contact you to
              either:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Re-ship the order (additional shipping charges may apply), or</li>
              <li>
                Process a refund/store credit as per our Refund & Cancellation
                Policy.
              </li>
            </ul>
          </section>

          {/* 8. Delays Beyond Our Control */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              8. Delays Beyond Our Control
            </h2>
            <p className="leading-relaxed">
              While we aim for timely delivery, certain events such as natural
              disasters, strikes, lockdowns, or issues at the courier's end may
              cause delays. We will coordinate with the courier to expedite
              delivery wherever possible and request your understanding in such
              cases.
            </p>
          </section>

          {/* 9. International Shipping */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              9. International Shipping
            </h2>
            <p className="leading-relaxed">
              Currently, we{" "}
              <strong>do not offer international shipping</strong>. If we start
              shipping outside India in future, this section will be updated
              with applicable terms, duties and taxes.
            </p>
          </section>

          {/* 10. Damaged Packages */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              10. Damaged, Opened or Tampered Packages
            </h2>
            <p className="leading-relaxed mb-2">
              If you receive a package that appears damaged, tampered or opened:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kindly mention this to the delivery person immediately.</li>
              <li>
                Take clear photos/videos of the package and product and share
                them with us within <strong>24–48 hours</strong>.
              </li>
            </ul>
            <p className="leading-relaxed mt-2">
              We will review the case as per our Refund & Cancellation Policy
              and provide a suitable resolution.
            </p>
          </section>

          {/* 11. COD */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              11. Cash on Delivery (COD)
            </h2>
            <p className="leading-relaxed mb-2">
              Cash on Delivery (COD) service is{" "}
              <strong>available</strong> for orders across India. Terms and conditions:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>COD is available for orders up to ₹5,000. Orders above this limit require online payment.</li>
              <li>COD charges of ₹50 apply for orders below ₹999. Free COD for orders above ₹999.</li>
              <li>
                Please ensure you have exact change or near-exact change ready for the delivery person.
              </li>
              <li>
                Repeated refusal of COD orders or providing incorrect addresses may lead to restrictions on
                future COD availability for your account.
              </li>
              <li>For COD orders, we may verify your phone number before dispatch. Please keep your phone accessible.</li>
            </ul>
          </section>

          {/* 12. Changes */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              12. Changes to This Shipping Policy
            </h2>
            <p className="leading-relaxed">
              We may revise this Shipping Policy from time to time. Any updates
              will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              13. Contact Us
            </h2>
            <p className="leading-relaxed mb-2">
              For questions about shipping or delivery, contact:
            </p>
            <p className="leading-relaxed">
              <strong>{contactInfo.companyName}</strong> <br />
              Email:{" "}
              <span className="text-blue-600">
                {contactInfo.email}
              </span>{" "}
              <br />
              Phone:{" "}
              <span className="text-blue-600">
                {contactInfo.phone}
              </span>{" "}
              <br />
              Address: {contactInfo.address} <br />
              Warehouse: Unit 15, Industrial Estate, Andheri East, Mumbai, Maharashtra 400069, India <br />
              Business Hours: Monday to Saturday, 10:00 AM to 7:00 PM IST
            </p>
          </section>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ShippingPolicy;

