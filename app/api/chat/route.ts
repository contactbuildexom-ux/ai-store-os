import { NextResponse } from "next/server";
import type {
  PlatformAssistantRequest,
  PlatformAssistantResponse,
} from "@/lib/storefront-types";

// Call Gemini if key is provided
async function callGemini(messages: PlatformAssistantRequest["messages"]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const contents = [
      {
        role: "user",
        parts: [{
          text: `You are Bexi AI, the intelligent, friendly, and expert shopping & store consultant for Buildexom AI Store OS.
You help Pakistani and global merchants build, manage, and scale AI-powered e-commerce stores with automated WhatsApp checkout.

Platform Knowledge:
- Over 10,000+ stores created across Pakistan (Lahore, Karachi, Islamabad, etc.) and internationally.
- 500,000+ orders processed with 99.8% uptime.
- Store setup takes under 30 seconds: users give a prompt/description, pick a theme, enter a WhatsApp number, and their store is generated with custom subdomain (e.g. storename.buildexom.store).
- Plans:
  1. Free Plan (Rs. 0/mo): 20 products, 2 categories, standard checkout, personal subdomain, store QR code.
  2. Pro Plan (Rs. 2,999/mo): 75 products, 5 categories, direct WhatsApp ordering, custom theme colors, priority order management.
  3. Advanced Plan (Rs. 5,999/mo): Unlimited products & categories, WhatsApp automation, priority support, full custom branding.
- Orders: Customer cart is neatly itemized and sent directly to the merchant's dedicated WhatsApp number with customer name, phone, city, postal code, and address.
- Cash on Delivery (COD) and Advance Bank Transfer are built-in.
- Merchant Dashboard: Manage product inventory, image uploads, category limits, and order lifecycle statuses: Pending (⏳), Ready to Dispatch (📦), Shipped / In Transit (🚚), Delivered (✅), Cancelled (✕).
- Tone: Helpful, enthusiastic, concise, professional. Understands English, Urdu, and Roman Urdu. Always answer the user's specific question directly.`
        }]
      },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    ];

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof reply === "string" && reply.trim() ? reply.trim() : null;
  } catch {
    return null;
  }
}

// Call OpenAI if key is provided
async function callOpenAI(messages: PlatformAssistantRequest["messages"]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `You are Bexi AI, the expert platform consultant for Buildexom AI Store OS.
Help merchants build and scale their e-commerce stores with automated WhatsApp checkout and Cash on Delivery.
Keep responses concise, friendly, and directly relevant to the user's question. Support English and Roman Urdu.`
          },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    return typeof reply === "string" && reply.trim() ? reply.trim() : null;
  } catch {
    return null;
  }
}

// Advanced Semantic Fallback Engine (Never repeats generic robotic boilerplate)
function platformReply(question: string, conversationHistory: PlatformAssistantRequest["messages"] = []): string {
  const q = question.toLowerCase().trim();

  const isRomanUrdu = /\b(kya|kia|kitna|kitne|kitni|kab|kese|kaise|kahan|kyun|kon|batao|bataiye|chahiye|hai|hain|hoga|hogi|bhai|yar|acha|theek|salam|pesa|paise|pesy|shuru|karein|dukan|chalega|mil|sakta)\b/i.test(q);

  // 1. GREETINGS (English & Roman Urdu)
  if (/^(hi|hello|hey|salam|assalam|aao|adab|hola|good\s*(morning|afternoon|evening))\b/i.test(q)) {
    if (isRomanUrdu) {
      return "Walaikum Assalam! 👋 Main hoon **Bexi AI**, Buildexom ka store assistant. Kya aap apna naya online store banana chahtay hain, ya platform ke baray mein koi sawal poochna hai?";
    }
    return "Assalam-o-Alaikum / Hello! 👋 I'm **Bexi AI**, your Buildexom store consultant. Are you planning to launch a new online store, or do you have a question about our features and automated WhatsApp ordering?";
  }

  // 2. SPECIFIC BUSINESS NICHES (Shoes, Bags, Perfumes, Jewelry, Nature, Clothing, etc.)
  if (/\b(shoe|shoes|sneaker|sneakers|kicks|joggers?|footwear|jootay)\b/i.test(q)) {
    return isRomanUrdu
      ? "👟 **Footwear & Sneakers Store**:\n\nBuildexom par aap athletic shoes aur streetwear sneakers ka store 30 seconds mein generate kar saktay hain! Form mein hamara curated idea **'Athletic Running Shoes & Streetwear Sneakers'** select karein (Theme: **Ocean Blue**). AI aap ke liye 28+ realistic sneakers, cushioned running shoes, aur sizes ke sath catalog banayega. Kya aap abhi generate karna chahtay hain?"
      : "👟 **Footwear & Sneakers Store**:\n\nYou can launch an athletic footwear or sneaker store in 30 seconds! In the store builder, select our **'Athletic Running Shoes & Streetwear Sneakers'** preset (Theme: **Ocean Blue**). Our AI will auto-populate 28+ performance sneakers, running shoes, and size variants with WhatsApp checkout ready.";
  }

  if (/\b(bag|bags|handbag|handbags|clutch|clutches|purse|purses|tote|leather\s*bag)\b/i.test(q)) {
    return isRomanUrdu
      ? "👜 **Luxury Handbags & Clutches Store**:\n\nHamaray form mein **'Luxury Velvet Handbags, Clutches & Purses'** ka option majood hai (Theme: **Velvet Rose**). AI high-res velvet clutches, leather totes, aur evening bags ke sath store banayega. Customer direct WhatsApp par order kar sakega!"
      : "👜 **Luxury Handbags & Clutches Store**:\n\nSelect our **'Luxury Velvet Handbags, Clutches & Purses'** preset (Theme: **Velvet Rose**). Our AI generates a stunning boutique featuring bridal velvet clutches, structured leather shoulder totes, and evening purses with instant WhatsApp order routing.";
  }

  if (/\b(perfume|perfumes|scent|scents|oud|attar|fragrance|khushbu)\b/i.test(q)) {
    return isRomanUrdu
      ? "🌸 **Perfumes & Oud Fragrances Store**:\n\nPerfumes ke liye hamara **'Luxury Perfumes, Ouds & Artisanal Attars'** preset perfect hai (Theme: **Royal Gold**). AI artisanal oud oils, French EDP perfumes, aur luxury gift boxes ka catalog generate karega PKR prices aur cash on delivery ke sath."
      : "🌸 **Luxury Fragrances & Oud Store**:\n\nSelect our **'Luxury Perfumes, Ouds & Artisanal Attars'** preset (Theme: **Royal Gold**). Our AI curates an exquisite atelier featuring French long-lasting EDP perfumes, pure Dehn Al Oud, and gift sets with nationwide Cash on Delivery.";
  }

  if (/\b(jewel|jewelry|jewellery|gold|ring|rings|necklace|choker|pendant|jhumka)\b/i.test(q)) {
    return isRomanUrdu
      ? "💍 **Jewelry & Accessories Store**:\n\nJewelry store ke liye **'18K Gold Plated Jewelry, Rings & Pendants'** select karein (Theme: **Royal Gold**). Is mein anti-tarnish rings, baroque pearl necklaces, aur festive earrings AI khud generate karta hai aur visuals 100% jewelry par focused hotay hain!"
      : "💍 **18K Gold Plated Jewelry Store**:\n\nSelect our **'18K Gold Plated Jewelry, Rings & Pendants'** preset (Theme: **Royal Gold**). Our AI curates a sparkling boutique of zirconia solitaire rings, anti-tarnish gold chains, and baroque pearl necklaces without bridal clutter.";
  }

  if (/\b(plant|plants|nature|grass|botanical|flower|indoor\s*plants?|gardening)\b/i.test(q)) {
    return isRomanUrdu
      ? "🌿 **Nature, Plants & Botanicals Store**:\n\nHaan bilkul! Form mein hamara dedicated preset **'Nature, Indoor Plants & Organic Botanicals'** select karein (Theme: **Emerald**). AI lush green indoor plants, air-purifying succulents, organic planters, aur fresh herbs ka pure botanical store generate karta hai."
      : "🌿 **Nature & Indoor Plants Boutique**:\n\nSelect our dedicated **'Nature, Indoor Plants & Organic Botanicals'** preset (Theme: **Emerald**). Our AI will generate a green living store filled with air-purifying succulents, ficus plants, organic planters, and botanical teas.";
  }

  // 3. VOICE-CONTROLLED STORE MANAGEMENT
  if (/\b(voice|bol\s*kar|bol\s*k|voice\s*assistant|voice\s*to\s*action|speak|mike?|mic)\b/i.test(q)) {
    return isRomanUrdu
      ? "🎙️ **AI Voice-Controlled Store Management**:\n\nBuildexom mein voice-to-action AI assistant shamil hai! Merchant dashboard par mic button dabayein aur bol kar apni store manage karein:\n\n" +
        "• *'Add a black T-shirt, price 1500, category Clothing'*\n" +
        "• *'How many orders did I receive today?'*\n" +
        "• *'Change order #104 status to Shipped'*\n" +
        "Important actions (jaise product delete ya order status update) par assistant pehly confirmation mangta hai safety ke liye!"
      : "🎙️ **Buildexom Voice-Controlled Store Management**:\n\nMerchants can manage their entire online store using natural voice commands instead of clicking through dashboard menus:\n\n" +
        "• **Voice Products**: Add, edit, or delete items by speaking naturally.\n" +
        "• **Voice Insights**: Ask questions like *'How many orders did I receive today?'* or *'Which product sold the most?'*\n" +
        "• **Voice Order Dispatch**: Update statuses to Ready or Shipped hands-free.\n" +
        "Sensitive operations always ask for merchant confirmation before executing for 100% safety!";
  }

  // 4. STORE STATS / "HOW MANY STORES CREATED"
  if (/(how\s*many|how\s*much|kitne|kitnay)\s*(store|stores|shop|shops)/i.test(q) || /(stores?\s*(created|built|active|live|ban\s*chuke))/i.test(q)) {
    return "Currently, over **10,000+ online stores** have been built on Buildexom AI Store OS! 🚀\n\nMerchants across Pakistan (Karachi, Lahore, Islamabad, Faisalabad) and the UAE use our platform to sell fashion, electronics, perfumes, and home goods with more than **500,000+ orders** successfully processed. Would you like to create your own store today?";
  }

  // 5. AFFIRMATIONS (OK, Cool, Theek hai)
  if (/^(ok|okay|okey|k|alright|cool|sure|theek\s*hai|acha|achha|nice|great|done|yep|yeah|yes|ha|haan)\b/i.test(q)) {
    return isRomanUrdu
      ? "Zabardast! 🚀 Agar aap apna store banana chahte hain to upar **'Start Building Free'** par click karein ya dropdown se apna pasandeeda idea select karein. Koi aur sawal ho to batayein!"
      : "Awesome! 🚀 Whenever you're ready, click **'Start Building Free'** above or choose a curated business niche from our dropdown. How else can I assist you?";
  }

  // 6. HOW TO CREATE A STORE / SETUP / STARTING
  if (/(how\s*to\s*(create|make|build|start|launch)\s*(a\s*)?store|store\s*kaise\s*banaye|kese\s*banaye|tarika|shuru\s*karein)/i.test(q)) {
    return "Creating your store takes only 3 simple steps:\n\n" +
      "1. 💡 **Enter Your Prompt**: Type your store idea (or select from 24+ global niches in our dropdown).\n" +
      "2. 🎨 **Select a Theme**: Choose from 10+ designer palettes like Ocean Blue, Royal Gold, or Velvet Rose.\n" +
      "3. 📱 **Connect WhatsApp**: Enter your WhatsApp number so customer orders arrive directly on your phone.\n\n" +
      "Click **Generate Store** and your storefront will be live in 15 seconds!";
  }

  // 7. PRICING & PLANS (Free vs Pro vs Advanced)
  if (/(price|pricing|plan|plans|cost|charges|fee|fees|kitne\s*paise|free\s*plan|pro\s*plan|advance\s*plan|subscription)/i.test(q)) {
    return "We offer 3 straightforward plans:\n\n" +
      "• 🟢 **Free Plan (Rs. 0 / forever)**: Up to 20 products, 2 categories, standard checkout, custom subdomain, store QR code.\n" +
      "• 🔵 **Pro Plan (Rs. 2,999 / month)**: Up to 75 products, 5 categories, direct WhatsApp ordering, custom theme colors, priority order management.\n" +
      "• 🟣 **Advanced Plan (Rs. 5,999 / month)**: Unlimited products & categories, WhatsApp automation, custom branding, priority 24/7 support.\n\n" +
      "You can start 100% free with no credit card required!";
  }

  // 8. PAYMENT METHODS (JazzCash, EasyPaisa, Bank Transfer, COD)
  if (/\b(jazzcash|easypaisa|bank|advance|payment|pay|cod|cash\s*on\s*delivery|account)\b/i.test(q)) {
    return isRomanUrdu
      ? "💳 **Payment Options**:\n\n" +
        "1. **Cash on Delivery (COD)**: Har store mein pehly se active hota hai.\n" +
        "2. **Advance Bank / Wallet Payment**: Dashboard mein aap apna Meezan Bank, JazzCash, ya EasyPaisa account daal saktay hain aur required advance percentage (jaise 20% ya 50%) set kar saktay hain.\n" +
        "Customer order karte waqt transfer details dekhta hai aur receipt WhatsApp par send karta hai!"
      : "💳 **Payment & Advance Transfer Setup**:\n\n" +
        "• **Cash on Delivery (COD)**: Enabled by default across all stores.\n" +
        "• **Direct Bank & Wallet Transfers**: In your dashboard, configure Meezan/HBL bank details, JazzCash, or EasyPaisa accounts.\n" +
        "• **Advance Percentage**: You can require a custom advance deposit (e.g. 50% advance for customized orders).";
  }

  // 9. DOMAIN & STORE LINK
  if (/\b(domain|subdomain|url|link|address|website\s*name)\b/i.test(q)) {
    return isRomanUrdu
      ? "🌐 **Store Link & Domain**:\n\nHar store ko free mein apna dedicated branded link milta hai, jaise: `yourstore.buildexom.store`.\nIs ke sath printable vector QR code bhi milta hai jisy customer scan kar ke direct store open kar sakta hai!"
      : "🌐 **Store Subdomain & URL**:\n\nEvery store immediately receives a dedicated secure link (e.g., `yourbrand.buildexom.store`) with SSL encryption and a high-resolution printable QR code for packaging and flyers.";
  }

  // 10. TRUST, SAFETY & SCAM INQUIRIES
  if (/\b(trust|safe|safety|scam|fraud|fake|real|asli|dhoka|guarantee)\b/i.test(q)) {
    return isRomanUrdu
      ? "🛡️ **100% Safe & Direct Model**:\n\nBuildexom par koi fraud ya middleman hold nahi hota! Customer ka order direct aap ke apnay WhatsApp par itemized receipt ke sath ata hai. Payment aap COD ya apnay direct bank/JazzCash account mein receive kartay hain."
      : "🛡️ **100% Transparent Direct-to-Merchant Model**:\n\nBuildexom eliminates marketplace middleman fees and payout delays. Every order goes directly to your verified merchant WhatsApp number, and payments are settled directly between you and your customer via COD or your own bank account.";
  }

  // 11. MOBILE & RESPONSIVE EXPERIENCE
  if (/\b(mobile|phone|responsive|android|iphone|screen)\b/i.test(q)) {
    return isRomanUrdu
      ? "📱 **Mobile Responsive Design**:\n\nBuildexom ke sary stores mobile-first design par banaye gaye hain. Slide-over cart, 1-tap WhatsApp checkout, zoomable product images, aur color/size selector mobile screen par smooth chaltay hain!"
      : "📱 **Mobile-First Responsive Experience**:\n\nOver 85% of e-commerce shoppers in Pakistan use mobile phones. All Buildexom stores feature smooth slide-over touch carts, 1-tap WhatsApp ordering, image zoom modals, and fast load times on 4G.";
  }

  // 12. WHATSAPP CHECKOUT MECHANISM
  if (/(whatsapp|order|orders|checkout|cart|add\s*to\s*cart|buy|purchase|invoice)/i.test(q)) {
    return "Our WhatsApp order flow is built for high conversion:\n\n" +
      "1. Customers browse your storefront and add items with size/color choices to their Cart.\n" +
      "2. At checkout, they enter Name, WhatsApp Number, City, Postal Code, and Address.\n" +
      "3. When they tap **'Order via WhatsApp'**, a clean, itemized invoice with Grand Total and delivery details opens directly in their WhatsApp chat with you!\n" +
      "4. You simply confirm the order and dispatch via Cash on Delivery.";
  }

  // 13. DYNAMIC CONTEXTUAL FALLBACK (Non-repetitive, questions answered dynamically)
  if (isRomanUrdu) {
    return `Aap ke sawal "${question.trim()}" ke baray mein:\n\n` +
      `Buildexom AI Store OS par aap 30 seconds mein professional store bana saktay hain. Hamaray AI generator mein 24+ global niches majood hain (Shoes, Perfumes, Pret, Jewelry, Plants, Handbags) aur customer orders direct aap ke WhatsApp par Cash on Delivery ke sath aatay hain.\n\n` +
      `Kya aap apna store abhi launch karna chahte hain, ya kisi specific feature ke baray mein mazeed jan'na chahte hain?`;
  }

  return `Regarding your inquiry about "${question.trim()}":\n\n` +
    `Buildexom AI Store OS is designed to help you launch, customize, and manage a high-converting online store in under 30 seconds. With 24+ curated business niches, automated WhatsApp checkout, Cash on Delivery support, and AI voice management, you have full control over your business.\n\n` +
    `Would you like to start building your store now, or explore a specific plan or niche?`;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const messagesValue = typeof body === "object" && body !== null && "messages" in body
      ? (body as Record<string, unknown>).messages
      : null;

    if (!Array.isArray(messagesValue) || messagesValue.length === 0 || messagesValue.length > 20) {
      return NextResponse.json({ error: "Provide between 1 and 20 chat messages." }, { status: 400 });
    }

    const messages: PlatformAssistantRequest["messages"] = [];
    for (const message of messagesValue) {
      if (
        typeof message !== "object"
        || message === null
        || !("role" in message)
        || !("content" in message)
        || (message.role !== "user" && message.role !== "assistant")
        || typeof message.content !== "string"
        || message.content.trim().length === 0
        || message.content.length > 1000
      ) {
        return NextResponse.json({ error: "Each message must have a valid role and contain 1–1000 characters." }, { status: 400 });
      }
      messages.push({ role: message.role, content: message.content.trim() });
    }

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!latestUserMessage) {
      return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    }

    // 1. Try Gemini if configured
    let reply = await callGemini(messages);

    // 2. Try OpenAI if Gemini not configured or failed
    if (!reply) {
      reply = await callOpenAI(messages);
    }

    // 3. Fallback to advanced intelligent response engine
    if (!reply) {
      reply = platformReply(latestUserMessage.content, messages);
    }

    const response: PlatformAssistantResponse = {
      success: true,
      reply,
    };

    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    console.error("POST /api/chat failed:", error);
    return NextResponse.json({ error: "Unable to process your message right now." }, { status: 500 });
  }
}
