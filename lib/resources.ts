export type MenuLink = { label: string; href: string; desc?: string };
export type MenuGroup = { title: string; href?: string; links: MenuLink[] };

export type Resource = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: string;
  theme: "blue" | "amber" | "violet" | "emerald" | "rose" | "teal" | "slate";
  badge?: string;
  groups: MenuGroup[];
};

// Help Center ke anchor links (/help#id)
const help = (id: string, labels: string[]): MenuLink[] =>
  labels.map((label) => ({ label, href: `/help#${id}` }));

// FAQ section landing page par hai
const FAQ_URL = "/#faq";

export const resources: Resource[] = [
  {
    id: "help",
    title: "Help Center",
    desc: "Guides to build and manage your store",
    href: "/help",
    icon: "🛟",
    theme: "blue",
    groups: [
      {
        title: "Getting Started",
        href: "/help#getting-started",
        links: help("getting-started", [
          "Create your Buildexom account",
          "Build your first store with AI",
          "Describe your business for best results",
          "Publish your store",
        ]),
      },
      {
        title: "Products",
        href: "/help#products",
        links: help("products", [
          "Add and edit products",
          "Upload images and write descriptions",
          "Organize products into categories",
        ]),
      },
      {
        title: "Orders & WhatsApp",
        href: "/help#orders-whatsapp",
        links: help("orders-whatsapp", [
          "Connect your WhatsApp number",
          "How customers place orders",
          "Confirm and track orders",
        ]),
      },
      {
        title: "Store QR Code",
        href: "/help#qr-code",
        links: help("qr-code", [
          "Get your store QR code",
          "Download it as PNG or PDF",
          "Change QR color and add your logo",
        ]),
      },
      {
        title: "Plans & Account",
        href: "/help#plans-account",
        links: help("plans-account", [
          "Free, Pro, and Business differences",
          "Upgrade or change your plan",
          "Contact support",
        ]),
      },
    ],
  },
  {
    id: "blog",
    title: "Blog",
    desc: "E-commerce, online selling, and business tips",
    href: "/blogs",
    icon: "📰",
    theme: "amber",
    groups: [
      {
        title: "Starting out",
        href: "/blogs",
        links: [
          {
            label: "Start an Online Store in Pakistan with No Coding",
            href: "/blog/start-online-store-pakistan-no-coding",
          },
          {
            label: "5 Mistakes New Online Sellers Make",
            href: "/blog/mistakes-new-online-sellers-make",
          },
          {
            label: "Pick the Right Products for Your Store",
            href: "/blog/pick-right-products-for-your-store",
          },
        ],
      },
      {
        title: "Selling on WhatsApp",
        href: "/blogs",
        links: [
          {
            label: "How to Sell on WhatsApp",
            href: "/blog/how-to-sell-on-whatsapp",
          },
          {
            label: "7 Tips to Get More Orders",
            href: "/blog/tips-to-get-more-whatsapp-orders",
          },
          {
            label: "Reply to Customers Faster",
            href: "/blog/reply-to-customers-faster",
          },
        ],
      },
      {
        title: "Growing your store",
        href: "/blogs",
        links: [
          {
            label: "Use a QR Code to Bring Customers",
            href: "/blog/use-qr-code-to-bring-customers",
          },
          {
            label: "Better Product Photos with Your Phone",
            href: "/blog/better-product-photos-with-your-phone",
          },
          {
            label: "Promote Your Store on Instagram and Facebook",
            href: "/blog/promote-store-on-instagram-and-facebook",
          },
          {
            label: "Write Product Descriptions That Sell",
            href: "/blog/write-product-descriptions-that-sell",
          },
        ],
      },
    ],
  },
  {
    id: "tutorials",
    title: "Tutorials",
    desc: "Short how-to guides and videos",
    href: "/tutorials",
    icon: "🎬",
    theme: "violet",
    groups: [
      {
        title: "2 to 3 minute lessons",
        href: "/tutorials",
        links: [
          {
            label: "Build your first store with AI in 5 minutes",
            href: "/tutorials/build-first-store-with-ai",
          },
          {
            label: "Add your first product",
            href: "/tutorials/add-your-first-product",
          },
          {
            label: "Connect WhatsApp and receive your first order",
            href: "/tutorials/connect-whatsapp-first-order",
          },
          {
            label: "Customize store colors, logo, and layout",
            href: "/tutorials/customize-store-colors-logo-layout",
          },
          {
            label: "Create and download your store QR code",
            href: "/tutorials/create-and-download-store-qr-code",
          },
          {
            label: "Send a WhatsApp alert for a new product",
            href: "/tutorials/send-whatsapp-alert-new-product",
          },
          {
            label: "Use the AI chatbot to answer customers",
            href: "/tutorials/use-ai-chatbot-for-customer-questions",
          },
        ],
      },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    desc: "Answers to common questions",
    href: FAQ_URL,
    icon: "❓",
    theme: "emerald",
    groups: [
      {
        title: "Popular questions",
        href: FAQ_URL,
        links: [
          { label: "Do I need a credit card to start?", href: FAQ_URL },
          { label: "Can I use my own logo and colors?", href: FAQ_URL },
          { label: "Can I add more products later?", href: FAQ_URL },
          { label: "Is my store data safe?", href: FAQ_URL },
          {
            label: "Can customers pay online, or only order on WhatsApp?",
            href: FAQ_URL,
          },
          { label: "What happens if I downgrade my plan?", href: FAQ_URL },
        ],
      },
    ],
  },
  {
    id: "guides",
    title: "E-commerce Guides",
    desc: "Products, orders, WhatsApp selling, and more",
    href: "/guides",
    icon: "📘",
    theme: "rose",
    groups: [
      {
        title: "In-depth guides",
        href: "/guides",
        links: [
          {
            label: "Products",
            desc: "Price, photograph, and describe",
            href: "/guides/products",
          },
          {
            label: "Orders",
            desc: "Manage orders, delivery, and returns",
            href: "/guides/orders",
          },
          {
            label: "WhatsApp selling",
            desc: "Catalog, greeting, and quick replies",
            href: "/guides/whatsapp-selling",
          },
          {
            label: "Marketing",
            desc: "QR codes, social media, and status",
            href: "/guides/marketing",
          },
          {
            label: "Customers",
            desc: "Repeat customers and reviews",
            href: "/guides/customers",
          },
          {
            label: "Growth",
            desc: "When to move to Pro or Business",
            href: "/guides/growth",
          },
        ],
      },
    ],
  },
  {
    id: "ai-guide",
    title: "AI Tools Guide",
    desc: "How to use the AI chatbot and AI features",
    href: "/ai-guide",
    icon: "🤖",
    theme: "teal",
    groups: [
      {
        title: "Using Buildexom AI",
        href: "/ai-guide",
        links: [
          { label: "What the AI store builder can do", href: "/ai-guide#builder" },
          { label: "How to write a good prompt", href: "/ai-guide#prompts" },
          { label: "How to edit what the AI created", href: "/ai-guide#editing" },
          {
            label: "Use the AI chatbot to answer customers",
            href: "/ai-guide#chatbot",
          },
          { label: "Tips to get better results", href: "/ai-guide#tips" },
          { label: "What the AI can't do yet", href: "/ai-guide#limits" },
        ],
      },
    ],
  },
    {
    id: "stories",
    title: "Success Stories",
    desc: "Real stores built with Buildexom",
    href: "/success-stories",
    icon: "🏆",
    theme: "slate",
    badge: "Coming soon",
    groups: [
      {
        title: "Real stores, real results",
        href: "/success-stories",
        links: [{ label: "Read success stories", href: "/success-stories" }],
      },
    ],
  },
];