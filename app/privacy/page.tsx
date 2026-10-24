import type { Metadata } from "next";
import LegalLayout, { CONTACT_EMAIL, type LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Buildexom",
  description:
    "Learn what information Buildexom collects, how it is used, and the choices you have.",
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <p>
          Buildexom is an AI-powered store builder that helps businesses create an online store,
          take orders on WhatsApp, and manage their customers. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>
        <p>
          By creating an account or using our website and services, you agree to the practices
          described in this policy.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account information:</strong> your name, email address, phone number and
            password when you sign up.
          </li>
          <li>
            <strong>Store information:</strong> your store name, products, images, prices, orders
            and the details of customers who order from your store.
          </li>
          <li>
            <strong>Billing information:</strong> details needed to process your subscription.
            Payments are handled by our payment providers, and we do not store your full card
            number.
          </li>
          <li>
            <strong>Technical information:</strong> your IP address, device, browser type, pages
            visited and other usage data collected through cookies and analytics tools.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use your information",
    content: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Create and manage your account and your store.</li>
          <li>Provide features such as WhatsApp ordering and smart notifications.</li>
          <li>Process payments and send billing-related messages.</li>
          <li>Provide customer support and respond to your requests.</li>
          <li>Keep our platform secure and prevent fraud and abuse.</li>
          <li>Understand how the product is used so we can improve it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-features",
    title: "AI features",
    content: (
      <>
        <p>
          Some Buildexom features use artificial intelligence, for example to help write product
          descriptions or build your store. To provide these features, the content you submit may
          be processed by AI service providers.
        </p>
        <p>
          AI output can contain mistakes, so please review it before you publish it. If we ever
          use customer content to train AI models, we will update this policy and tell you first.
        </p>
      </>
    ),
  },
  {
    id: "sharing-information",
    title: "Sharing your information",
    content: (
      <>
        <p>
          <strong>We do not sell your personal data.</strong> We share information only with
          trusted service providers that help us run Buildexom, such as:
        </p>
        <ul>
          <li>Payment providers that process subscription payments.</li>
          <li>Hosting and infrastructure providers.</li>
          <li>Messaging services such as WhatsApp, used to deliver orders and notifications.</li>
          <li>Analytics tools that help us understand product usage.</li>
          <li>AI providers that power our AI features.</li>
        </ul>
        <p>
          We may also share information when required by law or to protect the rights and safety
          of Buildexom and its users.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        We use cookies and similar technologies to keep you signed in, remember your preferences
        and measure how the site is used. You can control or delete cookies in your browser
        settings, but some parts of Buildexom may not work properly without them.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data security",
    content: (
      <p>
        We use reasonable technical and organizational measures to protect your information,
        including access controls and encrypted connections. No system is completely secure, so
        we cannot guarantee absolute security. Please choose a strong password and keep it
        private.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "Data retention",
    content: (
      <p>
        We keep your information for as long as your account is active and as needed to provide
        our services. When you delete your account, we will delete or anonymize your personal
        data within a reasonable time, except where we must keep it to meet legal, tax or
        security obligations.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>Give you a copy of the personal data we hold about you.</li>
          <li>Correct information that is inaccurate or incomplete.</li>
          <li>Delete your account and personal data.</li>
        </ul>
        <p>
          To make a request, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may need to verify your
          identity before we act on it.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's privacy",
    content: (
      <p>
        Buildexom is not intended for anyone under the age of 18, and we do not knowingly collect
        personal data from children. If you believe a child has given us their information,
        please contact us and we will remove it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we make important changes, we
        will update the date at the top of this page and, where appropriate, notify you by email
        or inside the platform.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        If you have questions about this Privacy Policy, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We respect your privacy. This page explains what data we collect, why we collect it, and how you stay in control."
      updated="October 24, 2026"
      sections={sections}
    />
  );
}