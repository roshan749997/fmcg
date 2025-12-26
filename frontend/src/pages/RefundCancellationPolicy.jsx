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

const RefundCancellationPolicy = () => {
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
        api.getPolicy('refund').catch(() => null),
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
              {policy.title || 'Refund/Cancellation Policy'}
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
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-3 text-sm lg:text-base text-gray-700 max-w-3xl mx-auto">
            This Refund & Cancellation Policy explains how{" "}
            <strong>Kidzo</strong> ("we",
            "our" or "us") handles refunds, returns, exchanges and cancellations
            for orders placed for kids clothing, accessories, footwear, baby care products, and toys through our
            website.
          </p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          {/* 1. Cancellation Policy */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              1. Order Cancellation
            </h2>
            <p className="leading-relaxed mb-2">
              You may cancel your order before it is dispatched. To cancel:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Contact us via email or phone with your order ID as soon as
                possible.
              </li>
              <li>
                Cancellation requests received before dispatch will be processed
                immediately, and a full refund will be issued.
              </li>
              <li>
                Once an order is dispatched, cancellation may not be possible.
                In such cases, you may need to return the product as per our
                return policy.
              </li>
            </ul>
          </section>

          {/* 2. Return Policy */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              2. Return Policy
            </h2>
            <p className="leading-relaxed mb-2">
              We accept returns under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Return Window:</strong> Returns must be initiated within{" "}
                <strong>7 days</strong> of delivery. For defective or damaged products, the return window is extended to 15 days.
              </li>
              <li>
                <strong>Product Condition:</strong> Products must be unused,
                unwashed, with original tags and packaging intact.
              </li>
              <li>
                <strong>Reason for Return:</strong> Defective items, wrong
                product received, size mismatch (subject to availability), quality issues, or if the product does not match the description.
              </li>
              <li>
                <strong>Non-Returnable Items:</strong> Customised or personalised
                products, items damaged by customer misuse, items without original
                packaging or tags, intimate wear (for hygiene reasons), and items purchased during clearance sales (unless defective). Gift cards and vouchers are non-refundable.
              </li>
              <li>
                <strong>Special Conditions:</strong> Baby care products must be unopened and in original sealed packaging. Toys must be unused and in original packaging with all accessories included.
              </li>
            </ul>
          </section>

          {/* 3. Return Process */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              3. How to Initiate a Return
            </h2>
            <p className="leading-relaxed mb-2">
              To initiate a return, please follow these steps:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Contact us via email at{" "}
                <span className="text-blue-600">
                  {contactInfo.email}
                </span>{" "}
                or call us at{" "}
                <span className="text-blue-600">{contactInfo.phone}</span> with your
                order ID.
              </li>
              <li>
                Provide clear photos/videos of the product if it's defective or
                damaged.
              </li>
              <li>
                Once approved, we will provide you with a return address and
                instructions.
              </li>
              <li>
                Pack the product securely in its original packaging and ship it
                back to us.
              </li>
            </ul>
          </section>

          {/* 4. Refund Process */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              4. Refund Process
            </h2>
            <p className="leading-relaxed mb-2">
              Once we receive and inspect the returned product:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                We will process your refund within{" "}
                <strong>5-7 business days</strong> of receiving and inspecting the returned
                item. The inspection process typically takes 1-2 business days.
              </li>
              <li>
                Refunds will be issued to the original payment method used for
                the order. For credit/debit card payments, refunds are processed to the same card. For UPI payments, refunds are processed to the same UPI ID.
              </li>
              <li>
                For Cash on Delivery (COD) orders, refunds will be processed via
                bank transfer (NEFT/IMPS) to your registered bank account or as store credit, as per your preference. You will need to provide your bank account details (Account Number, IFSC Code, Account Holder Name) for bank transfer refunds.
              </li>
              <li>
                Shipping charges (if any) are non-refundable unless the return
                is due to our error (wrong product, defective item, damaged during transit, etc.). In such cases, we will refund the full amount including shipping charges.
              </li>
              <li>
                For partial returns (if you ordered multiple items), shipping charges will be refunded proportionally only if all items in the order are returned.
              </li>
            </ul>
          </section>

          {/* 5. Exchange Policy */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              5. Exchange Policy
            </h2>
            <p className="leading-relaxed mb-2">
              We offer exchanges for size or colour mismatches, subject to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Product availability in the desired size/colour. If the desired size/colour is not available, we will offer alternatives or process a refund.</li>
              <li>
                The product being in original, unused condition with tags
                intact and original packaging.
              </li>
              <li>
                Exchange requests must be initiated within the return window
                period (7 days from delivery).
              </li>
              <li>
                Additional charges may apply if the exchanged product is of a
                higher value. The price difference will be collected before processing the exchange.
              </li>
              <li>
                If the exchanged product is of lower value, the difference will be refunded to your original payment method.
              </li>
              <li>
                Only one exchange per product is allowed. If you are not satisfied with the exchanged product, you can return it for a refund.
              </li>
            </ul>
          </section>

          {/* 6. Defective or Damaged Products */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              6. Defective or Damaged Products
            </h2>
            <p className="leading-relaxed mb-2">
              If you receive a defective or damaged product:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Contact us immediately (within 24–48 hours of delivery) with
                photos/videos of the defect or damage.
              </li>
              <li>
                We will arrange for a replacement or full refund, including
                return shipping charges.
              </li>
              <li>
                Do not wash or use the product if you notice any defect upon
                delivery.
              </li>
            </ul>
          </section>

          {/* 7. Wrong Product Received */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              7. Wrong Product Received
            </h2>
            <p className="leading-relaxed mb-2">
              If you receive a product different from what you ordered:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Contact us immediately with your order ID and photos of the
                product received.
              </li>
              <li>
                We will arrange for the correct product to be shipped to you, or
                process a full refund if the correct product is unavailable.
              </li>
              <li>Return shipping charges will be borne by us.</li>
            </ul>
          </section>

          {/* 8. Refund Timeline */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              8. Refund Timeline
            </h2>
            <p className="leading-relaxed mb-2">
              Refund processing times vary by payment method:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Credit/Debit Cards:</strong> 5–10 business days after
                processing. The refund will appear as a credit on your card statement.
              </li>
              <li>
                <strong>UPI/Wallets (Google Pay, PhonePe, Paytm):</strong> 3–7 business days after
                processing. Refunds are processed directly to your UPI ID.
              </li>
              <li>
                <strong>Net Banking:</strong> 5–10 business days after
                processing. Refunds are processed to the same bank account used for payment.
              </li>
              <li>
                <strong>Bank Transfer (for COD):</strong> 7–14 business days
                after processing. We initiate the transfer within 5-7 days, and your bank may take additional 2-7 days to credit the amount.
              </li>
              <li>
                <strong>Store Credit:</strong> Instant credit to your account. Store credit can be used for future purchases and is valid for 12 months from the date of issue.
              </li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              Note: Actual credit to your account may take additional time
              depending on your bank's processing time. For card payments, the refund may appear as a pending transaction initially. If you do not receive your refund within the stated timeline, please contact us with your order ID and payment details.
            </p>
          </section>

          {/* 9. Non-Refundable Items */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              9. Non-Refundable Items & Situations
            </h2>
            <p className="leading-relaxed mb-2">
              The following items or situations are not eligible for refund:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Products damaged due to misuse, improper care, or normal wear and tear.</li>
              <li>Products returned after the return window period (7 days from delivery).</li>
              <li>Products without original tags, packaging, labels, or accessories.</li>
              <li>Customised or personalised items (unless defective or wrong product received).</li>
              <li>Items purchased during sale/clearance (unless defective or wrong product received).</li>
              <li>Intimate wear items (for hygiene reasons) unless defective or wrong product received.</li>
              <li>Gift cards, vouchers, and promotional items (unless defective).</li>
              <li>Items that have been washed, worn, or used (unless defective).</li>
              <li>Products returned without proper authorization or return request.</li>
            </ul>
          </section>

          {/* 10. Store Credit */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              10. Store Credit
            </h2>
            <p className="leading-relaxed mb-2">
              In certain cases, we may offer store credit instead of a refund:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Store credit can be used for future purchases on our website. You can use store credit during checkout by selecting the "Use Store Credit" option.
              </li>
              <li>
                Store credit is valid for{" "}
                <strong>12 months</strong> from the date of issue. After expiry, the credit cannot be reinstated.
              </li>
              <li>
                Store credit cannot be transferred to another account or
                converted to cash. It can only be used for purchasing products on our website.
              </li>
              <li>
                Store credit can be used in combination with other payment methods if the order value exceeds the available credit amount.
              </li>
              <li>
                If your order value is less than the store credit amount, the remaining balance will stay in your account for future use.
              </li>
            </ul>
          </section>

          {/* 11. Changes to Policy */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              11. Changes to This Policy
            </h2>
            <p className="leading-relaxed">
              We may revise this Refund & Cancellation Policy from time to time.
              Any updates will be posted on this page with an updated "Last
              updated" date. We encourage you to review this Policy periodically.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              12. Contact Us
            </h2>
            <p className="leading-relaxed mb-2">
              For questions about refunds, returns, exchanges or cancellations,
              contact:
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
              Address: 123 Fashion Street, Mumbai, India 400001
            </p>
          </section>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default RefundCancellationPolicy;

