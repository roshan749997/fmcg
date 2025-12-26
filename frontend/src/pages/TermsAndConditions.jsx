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

const TermsAndConditions = () => {
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
        api.getPolicy('terms').catch(() => null),
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
              {policy.title || 'Terms & Conditions'}
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
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-8 lg:space-y-10">
          {/* 1 */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              These Terms & Conditions ("Terms") govern your use of the website
              and services offered by{" "}
              <strong>{contactInfo.companyName}</strong>
              ("we", "our", "us"). By accessing or purchasing from our website,
              you agree to be bound by these Terms. If you do not agree, please
              do not use our website.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              2. Eligibility
            </h2>
            <p className="leading-relaxed">
              You must be at least 18 years of age and capable of entering into
              a legally binding contract under applicable law to place orders on
              our website.
            </p>
          </section>

          {/* 3 Products */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              3. Products, Availability & Pricing
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                We sell kids clothing, accessories, footwear, baby care products, and toys. Product images are for
                reference; slight colour or texture variations may occur due to screen settings and lighting conditions.
              </li>
              <li>
                Prices are listed in Indian Rupees (INR) and are subject to
                change at any time without prior notice. All prices are inclusive of applicable taxes unless otherwise stated.
              </li>
              <li>
                Acceptance of your order is subject to product availability and
                successful payment confirmation. We reserve the right to limit quantities purchased per person or per order.
              </li>
              <li>
                Product descriptions, specifications, and images are provided for informational purposes. While we strive for accuracy, we do not warrant that product descriptions or other content on the site are complete, reliable, current, or error-free.
              </li>
            </ul>
          </section>

          {/* 4 Orders */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              4. Orders & Payments
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                When you place an order, you agree that all information provided
                is accurate and complete.
              </li>
              <li>
                We reserve the right to cancel any order in case of pricing
                errors, suspected fraud or other legitimate reasons. Any amount
                charged will be refunded in such cases.
              </li>
              <li>
                Payments must be made via the methods listed at checkout
                (UPI/cards/net banking/wallets etc.).
              </li>
            </ul>
          </section>

          {/* 5 Shipping */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              5. Shipping & Delivery
            </h2>
            <p className="leading-relaxed">
              Shipping timelines, charges and delivery conditions are governed
              by our{" "}
              <span className="text-blue-600 cursor-pointer">
                Shipping Policy
              </span>
              . By placing an order, you agree to those terms as well.
            </p>
          </section>

          {/* 6 Refunds */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              6. Returns, Refunds & Cancellations
            </h2>
            <p className="leading-relaxed">
              All requests for returns, exchanges, refunds or cancellations are
              handled in accordance with our{" "}
              <span className="text-blue-600 cursor-pointer">
                Refund & Cancellation Policy
              </span>
              .
            </p>
          </section>

          {/* 7 User responsibilities */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              7. User Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Do not use the website for any unlawful or fraudulent purpose.</li>
              <li>Do not attempt to gain unauthorised access to our systems.</li>
              <li>
                Do not post or transmit any defamatory, abusive, obscene or
                harmful content.
              </li>
              <li>
                Do not resell our products commercially without written
                permission.
              </li>
            </ul>
          </section>

          {/* 8 IP */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              8. Intellectual Property
            </h2>
            <p className="leading-relaxed">
              All content on the website including logos, product photos,
              designs, text, graphics and layout is the property of{" "}
              <strong>Kidzo</strong> or its
              licensors and is protected by applicable copyright and trademark
              laws. Unauthorised use, reproduction or distribution is strictly
              prohibited. The "Kidzo" name and logo are trademarks of Kidzo. All other trademarks, product names, and company names or logos mentioned on the site are the property of their respective owners.
            </p>
          </section>

          {/* 9 Limitation */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              9. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special or consequential damages
              arising out of your use of the website or purchase of products,
              including but not limited to loss due to courier delays, minor
              colour variations, improper washing or misuse of products.
            </p>
          </section>

          {/* 10 Fraud */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              10. Fraud Prevention
            </h2>
            <p className="leading-relaxed">
              We reserve the right to cancel orders, block accounts or refuse
              service in cases of suspected fraud, repeated COD refusals or
              policy abuse.
            </p>
          </section>

          {/* 11 Third-party */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              11. Third-Party Links
            </h2>
            <p className="leading-relaxed">
              Our website may contain links to third-party sites such as social
              media platforms and payment gateways. We are not responsible for
              the content, privacy practices or terms of those websites.
            </p>
          </section>

          {/* 12 Changes */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              12. Changes to These Terms
            </h2>
            <p className="leading-relaxed">
              We may modify these Terms from time to time. Updated Terms will be
              posted on this page. Continued use of the website after such
              changes constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* 13 Governing law */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              13. Governing Law & Jurisdiction
            </h2>
            <p className="leading-relaxed">
              These Terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of the courts at Mumbai,
              Maharashtra. In case of any dispute, both parties agree to first attempt to resolve the matter through good faith negotiations. If such negotiations fail, the dispute shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 2015.
            </p>
          </section>

          {/* 14 Contact */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold mb-3">
              14. Contact Us
            </h2>
            <p className="leading-relaxed">
              For any queries regarding these Terms, contact:
              <br />
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
              Business Hours: Monday to Saturday, 10:00 AM to 7:00 PM IST
            </p>
          </section>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default TermsAndConditions;

