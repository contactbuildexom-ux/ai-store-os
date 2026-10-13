export type Block =
  | { h: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] };

export type Post = {
  slug: string;
  title: string;
  category: string;
  emoji: string;
  excerpt: string;
  readTime: string;
  body: Block[];
};

export const CATEGORIES = [
  "Starting out",
  "Selling on WhatsApp",
  "Growing your store",
] as const;

export const posts: Post[] = [
  // ───────────── STARTING OUT ─────────────
  {
    slug: "start-online-store-pakistan-no-coding",
    title: "How to Start an Online Store in Pakistan with No Coding",
    category: "Starting out",
    emoji: "🏪",
    excerpt:
      "You do not need a developer or a big budget. Here is a simple path from idea to your first order.",
    readTime: "5 min read",
    body: [
      {
        p: "Many people think an online store needs a developer, a big budget and months of work. Today that is not true. With an AI store builder you can have a working store in an afternoon.",
      },
      { h: "Step 1: Decide what you will sell" },
      {
        p: "Start small. Pick one type of product you know well, such as candles, clothes, jewelry or home decor. A focused store is easier to build and easier for customers to understand.",
      },
      { h: "Step 2: Describe your store to the AI" },
      {
        p: "Write a short description of your business and the look you want. For example: “A clothing store for women with a modern, colorful look.” The AI builds the first version of your store for you.",
      },
      { h: "Step 3: Add your products" },
      {
        ol: [
          "Take clear photos with your phone.",
          "Add a name, a price and a short description.",
          "Put products into simple categories.",
        ],
      },
      { h: "Step 4: Connect WhatsApp" },
      {
        p: "Most customers in Pakistan prefer to chat before they buy. Connect your WhatsApp number so orders reach you directly.",
      },
      { h: "Step 5: Publish and share" },
      {
        p: "Publish your store and share the link on WhatsApp status, Instagram and Facebook. You can also print your store QR code and put it on packaging or in your shop.",
      },
      {
        p: "Start with the Free plan, learn what works, and upgrade only when your store grows.",
      },
    ],
  },
  {
    slug: "mistakes-new-online-sellers-make",
    title: "5 Mistakes New Online Sellers Make (and How to Avoid Them)",
    category: "Starting out",
    emoji: "⚠️",
    excerpt:
      "Most new sellers lose customers for the same few reasons. Avoid these five and you are already ahead.",
    readTime: "4 min read",
    body: [
      {
        p: "Almost every new seller makes a few of the same mistakes. The good news is that each one is easy to fix.",
      },
      { h: "1. Adding too many products at the start" },
      {
        p: "A store with 200 unorganized products confuses people. Begin with 10 to 20 products you are confident about, and grow from there.",
      },
      { h: "2. Using poor photos" },
      {
        p: "Customers cannot touch your product, so photos do the selling. Use daylight, a clean background and show the product from more than one angle.",
      },
      { h: "3. Hiding important information" },
      {
        p: "Always make price, delivery time, delivery charges and return rules easy to find. Missing details make people leave.",
      },
      { h: "4. Replying slowly" },
      {
        p: "A customer who messages you is ready to buy right now. If you reply after a day, they have probably bought from someone else. Use saved quick replies to answer faster.",
      },
      { h: "5. Having no plan to get visitors" },
      {
        p: "A great store with no visitors makes no sales. Share your store link every week on WhatsApp status, Instagram and Facebook, and put your QR code on every parcel.",
      },
    ],
  },
  {
    slug: "pick-right-products-for-your-store",
    title: "How to Pick the Right Products for Your Online Store",
    category: "Starting out",
    emoji: "🎯",
    excerpt:
      "The right product makes selling easier. Use these simple questions to choose what to sell first.",
    readTime: "4 min read",
    body: [
      {
        p: "Choosing what to sell is the most important early decision. You do not need a perfect idea, just a sensible one.",
      },
      { h: "Ask these questions" },
      {
        ul: [
          "Do I understand this product and its customers?",
          "Is it easy to photograph and to ship?",
          "Do people already buy it regularly?",
          "Is there enough profit after cost and delivery?",
        ],
      },
      { h: "Start with what you know" },
      {
        p: "If you already love a topic, like fashion, baking or home decor, you will find it easier to describe products and answer questions honestly.",
      },
      { h: "Check what people already buy" },
      {
        p: "Look at what sells well on Instagram pages, marketplaces and in local shops. Demand that already exists is easier to serve than demand you have to create.",
      },
      { h: "Work out your profit first" },
      {
        p: "Add up the product cost, packaging and delivery. Then set a price that leaves a fair profit. Selling more at a loss does not help you.",
      },
      { h: "Test small" },
      {
        p: "Begin with a small number of products. See which ones customers ask about, and add more of those.",
      },
    ],
  },

  // ───────────── SELLING ON WHATSAPP ─────────────
  {
    slug: "how-to-sell-on-whatsapp",
    title: "How to Sell on WhatsApp: A Simple Guide for Small Businesses",
    category: "Selling on WhatsApp",
    emoji: "💬",
    excerpt:
      "WhatsApp is where your customers already are. Learn how to turn chats into orders in a simple way.",
    readTime: "5 min read",
    body: [
      {
        p: "WhatsApp is the app people check the most. That makes it one of the best places for a small business to sell.",
      },
      { h: "Set up your business profile" },
      {
        p: "Use a clear business name, a logo as your profile photo, a short description, your working hours and your store link.",
      },
      { h: "Make ordering simple" },
      {
        p: "Do not make customers search through long chats. With Buildexom, customers browse your store and tap a button to send their order to your WhatsApp, with the order details already written.",
      },
      { h: "Use a clear order flow" },
      {
        ol: [
          "Customer sends the order.",
          "You confirm the items, price and delivery charges.",
          "You confirm the address and payment method.",
          "You send an update when the order is shipped.",
        ],
      },
      { h: "Stay polite and clear" },
      {
        p: "Short, friendly messages work best. Always confirm the order in writing so there is no confusion later.",
      },
    ],
  },
  {
    slug: "tips-to-get-more-whatsapp-orders",
    title: "7 Tips to Get More Orders on WhatsApp",
    category: "Selling on WhatsApp",
    emoji: "📈",
    excerpt:
      "Small habits make a big difference. Here are seven simple tips to turn more chats into sales.",
    readTime: "4 min read",
    body: [
      {
        p: "You do not need a big marketing budget to get more orders. These seven habits help.",
      },
      {
        ol: [
          "Post on WhatsApp status every day. New products, offers and customer photos work well.",
          "Put your store link in your profile, so people can browse before they message you.",
          "Reply quickly. Fast replies close more sales than lower prices.",
          "Use a greeting message so every new customer feels welcomed.",
          "Share clear photos and prices, so fewer people have to ask.",
          "Ask happy customers to share your store with friends and family.",
          "Follow up politely with people who asked but did not order.",
        ],
      },
      { h: "Keep it personal" },
      {
        p: "People buy from people they trust. A warm, honest and helpful tone is your biggest advantage over big stores.",
      },
    ],
  },
  {
    slug: "reply-to-customers-faster",
    title: "How to Reply to Customers Faster and Close More Sales",
    category: "Selling on WhatsApp",
    emoji: "⚡",
    excerpt:
      "Speed wins sales. Learn how to answer faster without sounding like a robot.",
    readTime: "3 min read",
    body: [
      {
        p: "When a customer messages you, they are interested right now. The faster you respond, the better your chance of making the sale.",
      },
      { h: "Save your common answers" },
      {
        p: "Most questions repeat: price, delivery time, delivery charges, payment methods and return rules. Write good answers once and save them as quick replies.",
      },
      { h: "Set a greeting and away message" },
      {
        p: "A greeting welcomes new customers. An away message tells them when you will reply if you are busy or asleep.",
      },
      { h: "Let your store answer for you" },
      {
        p: "Put prices, photos and delivery details on your store, so customers find answers without waiting. On the Business plan, the AI chatbot can answer common customer questions for you.",
      },
      { h: "Check messages at fixed times" },
      {
        p: "If you cannot reply all day, choose a few times to check messages, and tell customers those times.",
      },
    ],
  },

  // ───────────── GROWING YOUR STORE ─────────────
  {
    slug: "use-qr-code-to-bring-customers",
    title: "How to Use a QR Code to Bring Customers to Your Store",
    category: "Growing your store",
    emoji: "📱",
    excerpt:
      "A QR code takes people from the real world to your online store in one scan.",
    readTime: "3 min read",
    body: [
      {
        p: "A QR code is a small square that opens your store when someone scans it with their phone camera. No typing, no mistakes.",
      },
      { h: "Where to use your QR code" },
      {
        ul: [
          "On parcels, packaging and thank-you cards",
          "On your shop door, counter or banner",
          "On visiting cards, flyers and posters",
          "On your Instagram and Facebook posts",
        ],
      },
      { h: "Make it look good" },
      {
        p: "Use your brand color and add your logo in the center. Keep strong contrast between the code and the background so it scans easily.",
      },
      { h: "Test before you print" },
      {
        p: "Always scan your QR code with a phone first. Then print it large enough to scan from a normal distance.",
      },
      {
        p: "Add a short line next to it, such as “Scan to see our store”, so people know what to do.",
      },
    ],
  },
  {
    slug: "better-product-photos-with-your-phone",
    title: "How to Take Better Product Photos with Just Your Phone",
    category: "Growing your store",
    emoji: "📸",
    excerpt:
      "You do not need a studio. A phone, daylight and a plain background are enough.",
    readTime: "4 min read",
    body: [
      {
        p: "Good photos build trust. The good news is that a normal phone camera is enough.",
      },
      { h: "Use natural light" },
      {
        p: "Shoot near a window in daytime. Avoid the flash, because it creates harsh shadows and changes colors.",
      },
      { h: "Keep the background plain" },
      {
        p: "Use a white wall, a sheet of paper or a clean table. A simple background keeps attention on the product.",
      },
      { h: "Clean the lens and hold steady" },
      {
        p: "A quick wipe of the camera lens helps a lot. Rest your elbows on a table or use a small stand to avoid blur.",
      },
      { h: "Show more than one angle" },
      {
        ul: [
          "A front photo of the whole product",
          "A close-up of the details",
          "The product in use, or next to something for size",
        ],
      },
      { h: "Keep your style consistent" },
      {
        p: "Using the same background and light for every product makes your store look professional.",
      },
    ],
  },
  {
    slug: "promote-store-on-instagram-and-facebook",
    title: "How to Promote Your Store on Instagram and Facebook",
    category: "Growing your store",
    emoji: "📣",
    excerpt:
      "Free ways to find your first customers on the social media apps they already use.",
    readTime: "5 min read",
    body: [
      {
        p: "You can find your first customers on social media without paying for ads.",
      },
      { h: "Set up your profile properly" },
      {
        p: "Use your logo, a short description of what you sell and your store link in the bio. Make it clear in one glance what you offer.",
      },
      { h: "Post consistently" },
      {
        ul: [
          "New products and restocks",
          "Short videos or reels that show the product",
          "Customer photos and reviews, with permission",
          "Behind-the-scenes, like packing an order",
        ],
      },
      { h: "Use stories and status" },
      {
        p: "Stories are quick and informal. Share offers, polls and new arrivals, and add your store link.",
      },
      { h: "Reply to every comment and message" },
      {
        p: "Engagement builds trust, and it also helps more people see your posts.",
      },
      { h: "Give people an easy next step" },
      {
        p: "End each post with a clear action, such as “Order on WhatsApp” or “Visit our store link in bio”.",
      },
    ],
  },
  {
    slug: "write-product-descriptions-that-sell",
    title: "How to Write Product Descriptions That Sell",
    category: "Growing your store",
    emoji: "✍️",
    excerpt:
      "Good descriptions answer questions before customers ask. Here is a simple formula you can follow.",
    readTime: "4 min read",
    body: [
      {
        p: "A product description is your salesperson when you are not there. It should answer the customer’s questions clearly.",
      },
      { h: "A simple formula" },
      {
        ol: [
          "Start with the main benefit in one line.",
          "List key details: size, material, color, weight.",
          "Explain who it is for or when to use it.",
          "Add care instructions or delivery notes if needed.",
        ],
      },
      { h: "Write for real people" },
      {
        p: "Use simple words and short sentences. Say what the product does for the customer, not just what it is.",
      },
      { h: "Be honest" },
      {
        p: "Describe the product as it really is. Honest descriptions mean fewer returns and happier customers.",
      },
      { h: "Let AI give you a first draft" },
      {
        p: "Buildexom’s AI can draft a product description for you. Read it, add your own details, and make it sound like your brand.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}