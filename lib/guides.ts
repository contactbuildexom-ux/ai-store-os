export type Section = {
  h: string;
  p?: string;
  points?: string[];
  tip?: string;
};

export type Guide = {
  slug: string;
  title: string;
  short: string;
  tagline: string;
  emoji: string;
  theme: "amber" | "blue" | "emerald" | "violet" | "rose" | "teal";
  readTime: string;
  learn: string[];
  sections: Section[];
  checklist: string[];
};

export const guides: Guide[] = [
  {
    slug: "products",
    title: "Products",
    short: "Products",
    tagline: "How to price, photograph, and describe your products",
    emoji: "🛍️",
    theme: "amber",
    readTime: "6 min read",
    learn: [
      "Set prices that leave a fair profit",
      "Take clear photos with your phone",
      "Write descriptions that answer questions",
    ],
    sections: [
      {
        h: "Price your products with profit in mind",
        p: "A good price covers your costs and leaves you a fair profit. Many new sellers only look at the product cost and forget everything else.",
        points: [
          "Add up the product cost, packaging, delivery and any fees.",
          "Decide how much profit you want on each sale.",
          "Look at similar products to see what customers expect to pay.",
          "Keep prices simple and clear. Avoid hidden charges.",
        ],
        tip: "If you offer free delivery, include the delivery cost in your price first.",
      },
      {
        h: "Photograph your products well",
        p: "Customers cannot touch your product, so your photos do the selling. A phone camera is enough.",
        points: [
          "Shoot in daylight near a window. Avoid the flash.",
          "Use a plain background, such as a white wall or a clean table.",
          "Take a front photo, a close-up of details and one showing size.",
          "Wipe the camera lens and hold the phone steady.",
          "Use the same style for every product so your store looks consistent.",
        ],
      },
      {
        h: "Describe your products clearly",
        p: "A description is your salesperson when you are not there. It should answer questions before customers ask.",
        points: [
          "Start with the main benefit in one line.",
          "List key details: size, material, color, weight.",
          "Say who it is for or when to use it.",
          "Be honest. Honest descriptions mean fewer returns.",
        ],
        tip: "Let Buildexom’s AI write a first draft, then add your own details.",
      },
      {
        h: "Keep your catalog organized",
        points: [
          "Group products into simple categories, such as Men, Women and Gifts.",
          "Use short, clear product names that customers would search for.",
          "Remove or hide products that are out of stock.",
          "Start with 10 to 20 products and add more as you learn what sells.",
        ],
      },
    ],
    checklist: [
      "Every product has a price that leaves a profit",
      "Every product has at least 2 clear photos",
      "Every description lists size, material and color",
      "Products are sorted into categories",
      "Out-of-stock items are hidden",
    ],
  },
  {
    slug: "orders",
    title: "Orders",
    short: "Orders",
    tagline: "How to manage orders, delivery, and returns",
    emoji: "📦",
    theme: "blue",
    readTime: "6 min read",
    learn: [
      "Handle every order with a clear process",
      "Deliver on time and keep customers informed",
      "Write a simple, fair returns policy",
    ],
    sections: [
      {
        h: "Follow one clear order process",
        p: "A simple, repeatable process saves time and prevents mistakes, especially when orders increase.",
        points: [
          "Receive the order on WhatsApp and check it in your dashboard.",
          "Reply quickly to confirm the items, price and delivery charges.",
          "Confirm the customer’s name, phone number and full address.",
          "Agree on the payment method.",
          "Pack the order and update its status in your dashboard.",
        ],
      },
      {
        h: "Confirm details before you ship",
        p: "Most delivery problems start with wrong or missing details. A one-minute confirmation can save you a failed delivery.",
        points: [
          "Repeat the order back to the customer in one message.",
          "Check the address, area and a working phone number.",
          "Tell the customer the total amount they need to pay.",
        ],
        tip: "Keep the confirmation message saved as a quick reply.",
      },
      {
        h: "Delivery that builds trust",
        points: [
          "Be honest about delivery time. A longer honest estimate is better than a missed promise.",
          "Pack products safely and neatly. Packaging is part of your brand.",
          "Send the tracking number or courier details when the order ships.",
          "Message the customer when the order is on the way.",
        ],
      },
      {
        h: "Handle returns and exchanges",
        p: "A clear returns policy makes customers more confident to order. Keep it short and fair.",
        points: [
          "Write your policy in simple words and share it on your store.",
          "Say how many days customers have to contact you.",
          "Explain the condition products must be in.",
          "Handle problems politely, even when the customer is upset.",
        ],
      },
      {
        h: "Keep records",
        points: [
          "Use your dashboard to track new, confirmed and delivered orders.",
          "Note failed deliveries and the reasons, so you can fix patterns.",
          "Review your orders weekly to see your best-selling products.",
        ],
      },
    ],
    checklist: [
      "I confirm every order with the customer",
      "I check address and phone number before shipping",
      "I send tracking details when an order ships",
      "My returns policy is written and visible",
      "I update order status in my dashboard",
    ],
  },
  {
    slug: "whatsapp-selling",
    title: "WhatsApp selling",
    short: "WhatsApp",
    tagline: "Setting up a catalog, greeting message, and quick replies",
    emoji: "💬",
    theme: "emerald",
    readTime: "6 min read",
    learn: [
      "Set up a professional business profile",
      "Share your store as your product catalog",
      "Reply faster with greetings and quick replies",
    ],
    sections: [
      {
        h: "Set up your business profile",
        p: "Your profile is the first thing customers see. Make it clear and trustworthy.",
        points: [
          "Use your logo as the profile photo.",
          "Write a short description of what you sell.",
          "Add your working hours, address (if you have one) and store link.",
        ],
      },
      {
        h: "Use your store as your catalog",
        p: "Instead of sending many photos in chat, send your Buildexom store link. Customers browse products, add them to the cart and send their order to your WhatsApp with the details already written.",
        points: [
          "Put your store link in your profile and your status.",
          "Share a product link when a customer asks about one item.",
          "Print your store QR code so customers can scan it.",
        ],
      },
      {
        h: "Write a friendly greeting message",
        p: "A greeting welcomes every new customer and tells them what to do next.",
        points: [
          "Thank them for messaging you.",
          "Share your store link.",
          "Tell them when you usually reply.",
        ],
        tip: "Example: “Assalam o Alaikum! Thank you for messaging us. Browse our store here: [link]. We usually reply within a few minutes.”",
      },
      {
        h: "Save quick replies for common questions",
        p: "Most customers ask the same things. Save good answers once and reuse them.",
        points: [
          "Delivery time and delivery charges",
          "Payment methods",
          "Return and exchange policy",
          "Order confirmation message",
          "Thank-you message after delivery",
        ],
      },
      {
        h: "Stay organized",
        points: [
          "Use an away message when you are busy or offline.",
          "Use labels to mark chats, such as New, Paid and Delivered.",
          "Check messages at fixed times and tell customers when.",
        ],
      },
    ],
    checklist: [
      "My profile has a logo, description and store link",
      "I have a greeting message set up",
      "I have quick replies for common questions",
      "I use labels to organize my chats",
      "My store QR code is printed or shared",
    ],
  },
  {
    slug: "marketing",
    title: "Marketing",
    short: "Marketing",
    tagline: "Promoting your store with QR codes, social media, and WhatsApp status",
    emoji: "📣",
    theme: "violet",
    readTime: "6 min read",
    learn: [
      "Bring customers to your store with a QR code",
      "Post consistently on social media",
      "Use WhatsApp status to get repeat orders",
    ],
    sections: [
      {
        h: "Put your QR code everywhere",
        p: "A QR code takes people from the real world to your store in one scan, with no typing.",
        points: [
          "Add it to parcels, packaging and thank-you cards.",
          "Print it on your shop counter, banner or visiting cards.",
          "Use your brand color and add your logo in the center.",
          "Scan it yourself before you print.",
        ],
      },
      {
        h: "Promote on Instagram and Facebook",
        p: "You can find your first customers without paying for ads.",
        points: [
          "Put your logo, a short description and store link in your bio.",
          "Post new products, short videos and customer photos (with permission).",
          "Reply to every comment and message.",
          "End each post with a clear next step, such as “Order on WhatsApp”.",
        ],
      },
      {
        h: "Use WhatsApp status",
        p: "Many of your customers check status every day. It is free and personal.",
        points: [
          "Post new arrivals, offers and restocks.",
          "Share short customer feedback and delivery photos.",
          "Add your store link or ask customers to message you.",
        ],
      },
      {
        h: "Offer simple promotions",
        points: [
          "Run a limited-time offer, such as a weekend discount.",
          "Bundle related products at a small discount.",
          "Reward customers who bring a friend.",
        ],
        tip: "Never discount so much that you lose money. Check your profit first.",
      },
      {
        h: "Be consistent",
        points: [
          "Pick 2 platforms and do them well instead of 5 poorly.",
          "Plan a simple weekly routine and stick to it.",
          "Note which posts bring orders and repeat them.",
        ],
      },
    ],
    checklist: [
      "My QR code is on every parcel",
      "My social bio has my store link",
      "I post at least a few times every week",
      "I post on WhatsApp status regularly",
      "I know which posts bring orders",
    ],
  },
  {
    slug: "customers",
    title: "Customers",
    short: "Customers",
    tagline: "How to build repeat customers and ask for reviews",
    emoji: "🤝",
    theme: "rose",
    readTime: "5 min read",
    learn: [
      "Turn first-time buyers into repeat customers",
      "Ask for reviews politely",
      "Handle complaints without losing the customer",
    ],
    sections: [
      {
        h: "Make the first order great",
        p: "A customer who has a great first experience is far more likely to come back.",
        points: [
          "Reply quickly and politely.",
          "Deliver on the promised date.",
          "Pack neatly and add a handwritten or printed thank-you note.",
        ],
      },
      {
        h: "Follow up after delivery",
        points: [
          "A few days after delivery, message to ask if everything is fine.",
          "Thank them for ordering and invite them to order again.",
          "Keep the message short and personal.",
        ],
      },
      {
        h: "Ask for reviews the right way",
        p: "Reviews and photos from real customers build trust with new buyers.",
        points: [
          "Ask after the customer has received and used the product.",
          "Make it easy. A short message or photo is enough.",
          "Always ask permission before sharing a customer’s feedback.",
          "Thank every customer who shares feedback.",
        ],
        tip: "Example: “We hope you love your order! If you have a minute, we would be happy to hear your feedback.”",
      },
      {
        h: "Handle complaints calmly",
        points: [
          "Listen first and apologize for the problem.",
          "Offer a clear solution, such as a replacement or refund, as per your policy.",
          "Follow up to make sure the customer is satisfied.",
        ],
      },
      {
        h: "Keep customers coming back",
        points: [
          "Tell past customers about new products.",
          "Offer a small thank-you for repeat orders.",
          "On the Pro and Business plans, send WhatsApp alerts for new products to interested customers.",
        ],
      },
    ],
    checklist: [
      "I include a thank-you note with orders",
      "I follow up after delivery",
      "I ask happy customers for feedback",
      "I respond to complaints within a day",
      "I tell past customers about new products",
    ],
  },
  {
    slug: "growth",
    title: "Growth",
    short: "Growth",
    tagline: "When to move from the Free plan to Pro or Business",
    emoji: "📈",
    theme: "teal",
    readTime: "4 min read",
    learn: [
      "Know the signs your store is ready to grow",
      "Understand what each plan is best for",
      "Upgrade at the right time",
    ],
    sections: [
      {
        h: "Start free and learn",
        p: "The Free plan is the best place to begin. Build your store, add products, connect WhatsApp and learn what your customers want, without any pressure.",
      },
      {
        h: "Signs you are ready for Pro",
        points: [
          "You get regular orders and want to bring customers back.",
          "You want to send WhatsApp alerts when you add a new product.",
          "You want more advanced features to grow your sales.",
        ],
      },
      {
        h: "Signs you are ready for Business",
        points: [
          "Your store is busy and you want unlimited use.",
          "You answer the same customer questions again and again.",
          "You want an AI chatbot to answer customers for you.",
        ],
      },
      {
        h: "How to decide",
        points: [
          "Ask: what is slowing my growth right now?",
          "Check which plan includes the feature that solves it.",
          "Upgrade when the extra sales or saved time is worth the cost.",
        ],
        tip: "You can change your plan later, so there is no need to rush.",
      },
    ],
    checklist: [
      "I know what is slowing my growth",
      "I have compared the plans",
      "I upgrade only when it makes sense",
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}