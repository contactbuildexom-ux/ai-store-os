import type { Metadata } from "next";
import LegalLayout, { CONTACT_EMAIL, type LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Refund Policy | Buildexom",
  description: "When and how you can get a refund for your Buildexom subscription.",
};

const sections: LegalSection[] = [
  {
    id: "free-plan",
    title: "Free plan and trial",
    content: (
      <p>
        You can start on our free plan or free trial without paying anything. No charge is made
        until you choose a paid plan, so there is nothing to refund for free usage.
      </p>
    ),
  },
  {
    id: "refund-window",
    title: "Refund window",
    content: (
      <p>
        If you are not satisfied with a paid plan, you can request a refund within{" "}
        <strong>7 days of your first payment</strong>. Requests made after this period are not
        eligible, except in the cases described in section 5.
      </p>
    ),
  },
  {
    id: "monthly-yearly",
    title: "Monthly and yearly plans",
    content: (
      <ul>
        <li>
          <strong>Monthly plans:</strong> the 7-day window applies to your first payment only.
          Later monthly renewals are not refundable.
        </li>
        <li>
          <strong>Yearly plans:</strong> the 7-day window applies to your first yearly payment.
          After that, no partial refund is given for the unused part of the year.
        </li>
      </ul>
    ),
  },
  {
    id: "non-refundable",
    title: "What is not refundable",
    content: (
      <>
        <p>We cannot offer a refund in these cases:</p>
        <ul>
          <li>You forgot to cancel before a renewal date.</li>
          <li>Your account was suspended or closed for breaking our Terms of Service.</li>
          <li>Add-ons or custom services that have already been delivered.</li>
          <li>Partial use of a billing period after the refund window has passed.</li>
        </ul>
      </>
    ),
  },
  {
    id: "refundable",
    title: "When we always refund",
    content: (
      <>
        <p>We will refund you, even outside the refund window, if:</p>
        <ul>
          <li>You were charged twice for the same period.</li>
          <li>You were charged the wrong amount because of a billing error.</li>
          <li>A technical fault on our side stopped you from using the service and we could not fix it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-to-request",
    title: "How to request a refund",
    content: (
      <>
        <p>
          Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the email
          address of your Buildexom account and include:
        </p>
        <ul>
          <li>Your account email and store name.</li>
          <li>The date and amount of the payment.</li>
          <li>Proof of payment, such as a receipt or screenshot.</li>
          <li>The reason for your request.</li>
        </ul>
      </>
    ),
  },
  {
    id: "processing-time",
    title: "Processing time",
    content: (
      <p>
        We review refund requests and reply within 3 business days. Once a refund is approved, it
        can take 5 to 10 business days to reach you, depending on your bank or payment provider.
      </p>
    ),
  },
  {
    id: "refund-method",
    title: "Refund method",
    content: (
      <p>
        Refunds are sent back to the original payment method. Any fees charged by the payment
        provider or bank may not be recoverable.
      </p>
    ),
  },
  {
    id: "cancellation",
    title: "Cancelling your subscription",
    content: (
      <p>
        You can cancel your subscription at any time from your account settings. After you cancel,
        you keep access to your paid features until the end of the period you already paid for, and
        you will not be charged again.
      </p>
    ),
  },
  {
    id: "updates",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this Refund Policy from time to time. The version shown on this page, with
        the date at the top, is the one that applies. If you have any questions, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="We want you to feel confident when you subscribe. Here is when and how you can get your money back."
      updated="October 24, 2026"
      sections={sections}
    />
  );
}