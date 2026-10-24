import type { Metadata } from "next";
import LegalLayout, { CONTACT_EMAIL, type LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service | Buildexom",
  description: "The rules and conditions for using the Buildexom platform.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content: (
      <p>
        These Terms of Service govern your use of Buildexom, including our website, store builder
        and related services. By creating an account or using Buildexom, you agree to these
        terms. If you do not agree, please do not use the service.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    content: (
      <>
        <p>
          You must be at least 18 years old and able to enter into a binding agreement to use
          Buildexom. When you sign up, you agree to:
        </p>
        <ul>
          <li>Provide accurate and up-to-date information.</li>
          <li>Keep your password secure and not share your account.</li>
          <li>Be responsible for all activity that happens under your account.</li>
        </ul>
      </>
    ),
  },
  {
    id: "plans-and-billing",
    title: "Plans, pricing and billing",
    content: (
      <>
        <p>
          Buildexom may offer a free plan or free trial and paid subscription plans. The features
          and prices of each plan are shown on our Pricing section.
        </p>
        <p>
          Paid plans renew automatically at the end of each billing period unless you cancel
          before the renewal date. We will tell you in advance if our prices change. See our
          Refund Policy for details about refunds.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to use Buildexom to:</p>
        <ul>
          <li>Sell illegal, counterfeit, stolen or dangerous goods.</li>
          <li>Commit fraud, scams or mislead your customers.</li>
          <li>Send spam or unwanted messages.</li>
          <li>Upload malware or try to break, overload or gain unauthorized access to the platform.</li>
          <li>Infringe the copyright, trademark or other rights of others.</li>
          <li>Break any law that applies to you or your business.</li>
        </ul>
      </>
    ),
  },
  {
    id: "store-owner-responsibility",
    title: "Store owner responsibility",
    content: (
      <p>
        Buildexom provides the tools to build and run an online store. You are solely responsible
        for your products, prices, orders, delivery, customer service, refunds to your customers,
        taxes and legal compliance. Buildexom is not a party to the sale between you and your
        customers.
      </p>
    ),
  },
  {
    id: "content-ownership",
    title: "Content ownership",
    content: (
      <>
        <p>
          You own the content you add to your store, such as product details, images and text. You
          give Buildexom a limited licence to host, display and process that content only to
          operate the service for you.
        </p>
        <p>
          Buildexom owns the platform, software, templates, design and branding. You may not copy,
          resell or reverse engineer them.
        </p>
      </>
    ),
  },
  {
    id: "ai-content",
    title: "AI-generated content",
    content: (
      <p>
        Some features generate content using AI. This content may be inaccurate, incomplete or
        similar to content created for others. You are responsible for reviewing and approving it
        before you publish or rely on it.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-party services",
    content: (
      <p>
        Buildexom works with third-party services such as WhatsApp and payment providers. These
        services have their own terms and policies. We are not responsible for their availability,
        changes or actions.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Service availability",
    content: (
      <p>
        We work hard to keep Buildexom available, but we do not promise that it will always be
        uninterrupted or error-free. We may carry out maintenance, updates or changes to the
        service, which can cause short periods of downtime.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "Suspension and termination",
    content: (
      <>
        <p>
          You can cancel your account at any time. We may suspend or close an account if you
          break these terms, misuse the platform, put other users at risk, or do not pay for a
          paid plan.
        </p>
        <p>
          After termination, your access to the platform ends, and your data will be handled
          according to our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and limitation of liability",
    content: (
      <>
        <p>
          Buildexom is provided as is and as available, without warranties of any kind to the
          extent allowed by law.
        </p>
        <p>
          To the maximum extent allowed by law, Buildexom will not be liable for indirect or
          consequential losses, such as lost profits, lost sales or lost data. Our total liability
          for any claim is limited to the amount you paid us in the three months before the claim
          arose.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of Pakistan. Any dispute that we cannot settle
        informally will be handled by the courts of Pakistan.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. If we make important changes, we will update
        the date at the top of this page and notify you by email or inside the platform. If you
        keep using Buildexom after the changes take effect, you accept the new terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        If you have questions about these terms, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully. They explain the rules for using Buildexom and what you can expect from us."
      updated="October 24, 2026"
      sections={sections}
    />
  );
}