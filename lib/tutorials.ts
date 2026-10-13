export type Step = { t: string; d: string };

export type Tutorial = {
  slug: string;
  title: string;
  summary: string;
  emoji: string;
  duration: string;
  plan: "All plans" | "Pro & Business" | "Business";
  steps: Step[];
  tips: string[];
  /** Video ka path, jaise "/tutorials/first-store.mp4" (public folder me rakho). Khali = "Coming soon" */
  video?: string;
};

export const tutorials: Tutorial[] = [
  {
    slug: "build-first-store-with-ai",
    title: "Build your first store with AI in 5 minutes",
    summary:
      "Describe your business and let AI create your first store, then make it yours.",
    emoji: "✨",
    duration: "2–3 min",
    plan: "All plans",
    steps: [
      {
        t: "Sign up and open your dashboard",
        d: "Click “Get Started Free”, create your account and you will land on your dashboard.",
      },
      {
        t: "Describe your store",
        d: "In the “Describe your store” box, write what you sell and the look you want. Example: “A store for handmade candles with a clean, minimal design.”",
      },
      {
        t: "Generate your store",
        d: "Click “Generate Store” and wait a few seconds while the AI builds the first version.",
      },
      {
        t: "Review and edit",
        d: "Look through the pages, then change any text, colors or sections you want.",
      },
      {
        t: "Publish",
        d: "When you are happy, click Publish and share your store link.",
      },
    ],
    tips: [
      "Mention your product type, style and colors for better results.",
      "You can regenerate or edit as many times as you like.",
    ],
  },
  {
    slug: "add-your-first-product",
    title: "Add your first product",
    summary: "Add a product with photos, a price and a description.",
    emoji: "🛍️",
    duration: "2 min",
    plan: "All plans",
    steps: [
      {
        t: "Open Products",
        d: "Go to Products in your dashboard and click “Add product”.",
      },
      {
        t: "Add name and price",
        d: "Write a clear product name and set the price.",
      },
      {
        t: "Upload photos",
        d: "Upload clear photos taken in daylight. Add more than one angle if you can.",
      },
      {
        t: "Write a description",
        d: "Write a short description yourself, or let AI draft one and then edit it.",
      },
      {
        t: "Choose a category and save",
        d: "Pick a category so customers can find it easily, then save.",
      },
    ],
    tips: [
      "Use the same background for all photos so your store looks consistent.",
      "Start with 10 to 20 products, not hundreds.",
    ],
  },
  {
    slug: "connect-whatsapp-first-order",
    title: "Connect WhatsApp and receive your first order",
    summary:
      "Link your WhatsApp number so customer orders reach you directly.",
    emoji: "💬",
    duration: "2–3 min",
    plan: "All plans",
    steps: [
      {
        t: "Open Settings",
        d: "Go to Settings in your dashboard and find the WhatsApp section.",
      },
      {
        t: "Enter your number",
        d: "Type your WhatsApp number with the country code, for example +92…",
      },
      {
        t: "Save",
        d: "Save your settings. Your store now sends orders to this number.",
      },
      {
        t: "Place a test order",
        d: "Open your store on your phone, add a product and tap the order button. WhatsApp opens with the order details ready.",
      },
      {
        t: "Confirm from your dashboard",
        d: "Open Orders in your dashboard to confirm and track the order status.",
      },
    ],
    tips: [
      "Place a test order yourself before sharing your store.",
      "Reply quickly. Fast replies win more sales.",
    ],
  },
  {
    slug: "customize-store-colors-logo-layout",
    title: "Customize your store colors, logo, and layout",
    summary: "Make your store look like your brand in a few clicks.",
    emoji: "🎨",
    duration: "2–3 min",
    plan: "All plans",
    steps: [
      {
        t: "Open store settings",
        d: "Go to your store’s design or appearance settings in the dashboard.",
      },
      {
        t: "Upload your logo",
        d: "Add your logo so it appears at the top of your store.",
      },
      {
        t: "Pick your colors",
        d: "Choose main colors that match your brand. Keep text easy to read.",
      },
      {
        t: "Adjust the layout",
        d: "Reorder or change sections so the most important products appear first.",
      },
      {
        t: "Preview and save",
        d: "Check your store on both phone and computer, then save your changes.",
      },
    ],
    tips: [
      "Most customers will visit on a phone, so check the mobile view.",
      "Stick to two or three colors for a clean, professional look.",
    ],
  },
  {
    slug: "create-and-download-store-qr-code",
    title: "Create and download your store QR code",
    summary:
      "Get a QR code for your store and use it on parcels, posters and cards.",
    emoji: "📱",
    duration: "2 min",
    plan: "All plans",
    steps: [
      {
        t: "Open the QR Code section",
        d: "Find the QR Code section in your dashboard.",
      },
      {
        t: "Customize it",
        d: "Choose a color that matches your brand and add your logo in the center.",
      },
      {
        t: "Download",
        d: "Download it as PNG (for social media) or PDF (for printing).",
      },
      {
        t: "Test it",
        d: "Scan it with your phone camera to make sure your store opens.",
      },
      {
        t: "Use it everywhere",
        d: "Print it on packaging, thank-you cards, banners and your shop counter.",
      },
    ],
    tips: [
      "Keep strong contrast so the code scans easily.",
      "Add a short line like “Scan to see our store”.",
    ],
  },
  {
    slug: "send-whatsapp-alert-new-product",
    title: "Send a WhatsApp alert for a new product",
    summary:
      "Tell your customers about a new product on WhatsApp automatically.",
    emoji: "🔔",
    duration: "3 min",
    plan: "Pro & Business",
    steps: [
      {
        t: "Add your new product",
        d: "Add the product with its name, photo, price and description. AI can help write the description.",
      },
      {
        t: "Choose who gets the alert",
        d: "Select the product category, so only customers interested in it receive the message.",
      },
      {
        t: "Preview the message",
        d: "The alert includes the product name, image, price, a short description and a link to your store.",
      },
      {
        t: "Send now or schedule",
        d: "Send it immediately, or schedule it for a time when your customers are most active.",
      },
      {
        t: "Check the stats",
        d: "See how your alert performed and manage your subscribers from the dashboard.",
      },
    ],
    tips: [
      "Do not send too often. A few quality alerts work better than many.",
      "Always let customers unsubscribe easily.",
    ],
  },
  {
    slug: "use-ai-chatbot-for-customer-questions",
    title: "Use the AI chatbot to answer customer questions",
    summary:
      "Let the AI chatbot answer common questions while you focus on your business.",
    emoji: "🤖",
    duration: "2–3 min",
    plan: "Business",
    steps: [
      {
        t: "Turn on the chatbot",
        d: "Open the chatbot settings in your dashboard and switch it on.",
      },
      {
        t: "Add your business details",
        d: "Add your delivery times, charges, payment methods and return rules so the bot gives correct answers.",
      },
      {
        t: "Set a friendly tone",
        d: "Choose how the chatbot greets and talks to your customers.",
      },
      {
        t: "Test it",
        d: "Ask it a few questions as if you were a customer and fix anything that is not right.",
      },
      {
        t: "Review conversations",
        d: "Check chats now and then and update your details to improve the answers.",
      },
    ],
    tips: [
      "The better your business details, the better the answers.",
      "Review regularly, especially in the first week.",
    ],
  },
];

export function getTutorial(slug: string) {
  return tutorials.find((t) => t.slug === slug);
}