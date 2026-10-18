export interface BexiProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
}

export interface BexiStoreInfo {
  id?: string;
  name?: string;
  slug?: string;
  whatsapp_number?: string;
  tagline?: string;
  description?: string;
}

export interface BexiChatInput {
  message: string;
  store: BexiStoreInfo;
  products: BexiProduct[];
}

export interface BexiChatOutput {
  reply: string;
  languageDetected: 'ur' | 'en';
  matchesCount?: number;
}

/**
 * Detect whether the user is typing in Roman Urdu / Urdu or English
 */
export function detectBexiLanguage(message: string): 'ur' | 'en' {
  const clean = message.toLowerCase().trim();

  // Urdu Unicode characters
  if (/[\u0600-\u06FF]/.test(clean)) {
    return 'ur';
  }

  // Common Roman Urdu keywords, verbs, pronouns, and question words
  const romanUrduPatterns = [
    /\b(kya|kia|kitna|kitne|kitni|kab|kese|kaise|kahan|kyun|kon|kaun)\b/,
    /\b(ka|ki|ke|ko|se|mein|me|par|pe|aur|bhi|nahi|nahin|na|han|jee|ji)\b/,
    /\b(hoga|hogi|honge|hai|hain|tha|thi|the|hun|hoon)\b/,
    /\b(batao|bataiye|dikhao|dikhayein|chahiye|lena|lene|kharidna|mil|milega|milegi)\b/,
    /\b(bhai|baji|yar|shukriya|bohat|acha|achi|achha|theek|sasta|mehanga|rate|keemat|paisa|paise|pesy)\b/,
    /\b(mangwana|bhejo|sunain|karo|kardo|pesa|kuch|zara|dost|aap|tum|mera|meri|mere|hum|hamara|humara)\b/,
    /\b(lekin|magar|shadi|kapray|jootay|khushbu|wala|wali|walay|roz|aaj|kal|jaldi)\b/,
    /\b(salam|assalam|aoa|adaab|kese ho|thek ho|kya hal)\b/
  ];

  for (const regex of romanUrduPatterns) {
    if (regex.test(clean)) {
      return 'ur';
    }
  }

  return 'en';
}

/**
 * Main Bexi Conversational AI Engine
 * Handles Roman Urdu, English, and Mixed Urdu with high commercial accuracy
 */
export function generateBexiReply(input: BexiChatInput): BexiChatOutput {
  const { message, store, products } = input;
  const storeName = store.name?.trim() || 'hamari dukan';
  const whatsappNum = (store.whatsapp_number || '923001234567').replace(/[^0-9]/g, '');
  const cleanMsg = (message || '').trim().toLowerCase();
  const lang = detectBexiLanguage(message);

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c && c !== 'All'))
    )
  );
  const categoriesList = categories.length > 0 ? categories.join(', ') : 'All Collections';

  const money = (val: number) => `Rs. ${Number(val).toLocaleString()}`;

  // 1. GREETING (Salam, Hello, Hi, Hey, Kese ho)
  if (
    /^(hi|hello|hey|salam|assalam|aoa|adab|hola|good\s*(morning|afternoon|evening)|kese ho|kaisay ho|kya hal|kia hal)/i.test(
      cleanMsg
    ) ||
    cleanMsg === 'salam' ||
    cleanMsg === 'assalam o alaikum' ||
    cleanMsg === 'bhai'
  ) {
    if (lang === 'ur') {
      return {
        reply: `Walaikum Assalam / Hello! 👋 Main **Bexi AI** hoon, **${storeName}** ka virtual shopping assistant! 🛍️

Main aap ki har cheez mein madad kar sakta hoon:
• Products aur prices jan'nay mein (e.g. *"shoes dikhao"*, *"3000 se kam kya hai?"*)
• Delivery charges aur timing maloom karne mein
• Bestsellers aur recommendations lene mein
• Direct WhatsApp par order place karne mein

Aap batayein aaj kya dekhna chahein gay?`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `Walaikum Assalam / Hello! 👋 Welcome to **${storeName}**! I am **Bexi AI**, your personal shopping assistant.

I am here to help you:
• Browse our *${products.length} catalog items* across ${categoriesList}
• Find products within your budget (e.g. *"show items under Rs. 5,000"*)
• Check delivery charges & delivery times
• Place direct orders via WhatsApp

What are you looking for today?`,
      languageDetected: 'en',
    };
  }

  // 2. DELIVERY & SHIPPING (Delivery kab hogi, charges kitne hen, cash on delivery, etc.)
  if (
    /\b(delivery|shipping|charges|charges kitne|fee|cod|cash on delivery|time kitna|kab milega|deliver|bhejo|pochay ga|pohanchna|lahore|karachi|islamabad)\b/i.test(
      cleanMsg
    )
  ) {
    if (lang === 'ur') {
      return {
        reply: `🚚 **Delivery Ki Maloomat (${storeName})**:

• **Lahore Delivery**: Rs. 200 (1 se 2 business days mein delivery)
• **Baqi Tamam Shehar (Karachi, Islamabad, Rawalpindi, etc.)**: Rs. 350 (2 se 4 business days)
• **Cash on Delivery (COD)**: Ji bilkul, COD available hai! Parcel haath mein mile tabhi payment karein.
• **Free Delivery Offer**: Rs. 3,000 se barhay orders par delivery bilkul FREE hai!

Kia aap apna order place karna chahtay hain? Screen par WhatsApp button daba kar live rabta karein!`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `🚚 **Delivery Information for ${storeName}**:

• **Lahore Delivery**: Rs. 200 (1-2 business days)
• **Other Cities (Karachi, Islamabad, Rawalpindi, etc.)**: Rs. 350 (2-4 business days)
• **Payment Method**: Cash on Delivery (COD) & Online Bank Transfer supported
• **Free Delivery**: Free shipping on all orders above Rs. 3,000!
• **Tracking**: Full WhatsApp order tracking updates provided right after dispatch.

Would you like to proceed with placing an order?`,
      languageDetected: 'en',
    };
  }

  // 3. HOW TO ORDER / ORDER KA TAREEQA
  if (
    /\b(order kaise|how to order|buy|purchase|khareedna|kese buy|process|mangwana|kaise mangwaun|order karna|order kaisay)\b/i.test(
      cleanMsg
    )
  ) {
    if (lang === 'ur') {
      return {
        reply: `🛍️ **Order Karne Ka Aasan Tareeqa (${storeName})**:

1. Store par apni pasand ka koi bhi product dekhein.
2. Product card par **'WhatsApp'** button dabayein, ya agar aik se zyada cheezein chahiyein to **'Add to Cart'** karein.
3. Cart Drawer mein apna naam, phone number aur shehar/address darj karein.
4. **'Checkout via WhatsApp'** par click karein — aap ka mukammal order invoice seedha hamaray official WhatsApp (+${whatsappNum}) par send ho jayega for instant confirmation!`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `🛍️ **How to Place an Order at ${storeName}**:

1. Browse our catalog on this page.
2. Click **'Add to Cart'** for multiple items, or click **'WhatsApp'** on any product card for instant ordering.
3. In the Cart Drawer, choose your city and enter your delivery address.
4. Click **'Checkout via WhatsApp'** — your complete order invoice will be sent directly to our official WhatsApp line (+${whatsappNum}) for instant confirmation!`,
      languageDetected: 'en',
    };
  }

  // 4. PAYMENT METHODS / COD / ADVANCE
  if (
    /\b(payment|advance|jazzcash|easypaisa|bank|paise kaise|advance kitna|payment method|advance payment)\b/i.test(
      cleanMsg
    )
  ) {
    if (lang === 'ur') {
      return {
        reply: `💳 **Payment Ka Tareeqa (${storeName})**:

• **Cash on Delivery (COD)**: Available hai — jab parcel aap tak pohanch jaye tab rider ko cash pay karein.
• **Online Payment**: JazzCash, EasyPaisa aur Direct Bank Transfer bhi accept hotay hain.
• Checkout par aap apni pasand ka tareeqa select kar saktay hain.`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `💳 **Payment Methods at ${storeName}**:

• **Cash on Delivery (COD)** is supported nationwide (pay when parcel arrives).
• **Online Transfers**: EasyPaisa, JazzCash, and direct Bank Transfer are accepted.
• You can select your preferred payment mode in the cart checkout drawer.`,
      languageDetected: 'en',
    };
  }

  // 5. BUDGET SEARCH (e.g. "under 5000", "3000 tak", "sasta kya hai", "budget")
  const budgetMatch =
    cleanMsg.match(/(?:under|below|less than|budget(?: of)?|rs\.?\s*)\s*(\d[\d,]*)/i) ||
    cleanMsg.match(/(\d[\d,]*)\s*(?:tak|rupees|rs)\b/i);

  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : null;

  if (budget !== null || /\b(sasta|sasti|cheap|kam rate|kam price|affordable)\b/i.test(cleanMsg)) {
    const targetBudget = budget ?? 5000;
    const affordable = products.filter((p) => p.price <= targetBudget);

    if (affordable.length > 0) {
      const itemsList = affordable
        .slice(0, 5)
        .map((p, i) => `${i + 1}. **${p.name}** — ${money(p.price)}\n   _${p.description || p.category || ''}_`)
        .join('\n\n');

      if (lang === 'ur') {
        return {
          reply: `✨ **Rs. ${targetBudget.toLocaleString()} Ke Budget Mein ${storeName} Ke Products**:

${itemsList}

Aap in mein se kisi bhi item par click karke Cart mein daal saktay hain ya direct WhatsApp par order bhej saktay hain!`,
          languageDetected: 'ur',
          matchesCount: affordable.length,
        };
      }

      return {
        reply: `✨ **Products within your budget of Rs. ${targetBudget.toLocaleString()} at ${storeName}**:

${itemsList}

You can click 'Add to Cart' or 'WhatsApp' on any of these cards to place your order!`,
        languageDetected: 'en',
        matchesCount: affordable.length,
      };
    } else {
      const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
      if (lang === 'ur') {
        return {
          reply: `Filhal hamare paas Rs. ${targetBudget.toLocaleString()} se kam mein koi item nahi hai. Hamara sab se munasib product **${money(minPrice)}** se shuru hota hai. Kia aap hamari mukammal collection dekhna chahein gay?`,
          languageDetected: 'ur',
        };
      }

      return {
        reply: `Currently we don't have items under Rs. ${targetBudget.toLocaleString()}. Our most affordable item starts at **${money(minPrice)}**. Would you like to view our full collection?`,
        languageDetected: 'en',
      };
    }
  }

  // 6. BESTSELLERS & RECOMMENDATIONS (sab se acha, best, popular, recommend)
  if (
    /\b(bestseller|recommend|popular|best|top pick|mashoor|favourite|achha|sab se acha|kuch acha)\b/i.test(
      cleanMsg
    )
  ) {
    const topItems = products.slice(0, 4);
    const topList = topItems
      .map((p, i) => `⭐ ${i + 1}. **${p.name}** (${money(p.price)})\n   _${p.description || p.category || ''}_`)
      .join('\n\n');

    if (lang === 'ur') {
      return {
        reply: `🌟 **${storeName} Ki Top Recommendations & Bestsellers**:

${topList}

Yeh hamare customers ke sab se pasandeeda items hain! Inhein khareedne ke liye kisi bhi card par click karein ya WhatsApp button dabayein.`,
        languageDetected: 'ur',
        matchesCount: topItems.length,
      };
    }

    return {
      reply: `🌟 **Top Recommended Bestsellers at ${storeName}**:

${topList}

These are our most loved items with verified 5-star customer ratings!`,
      languageDetected: 'en',
      matchesCount: topItems.length,
    };
  }

  // 7. CONTACT & WHATSAPP QUESTIONS
  if (/\b(contact|number|rabta|phone|whatsapp|call|admin|owner|madad|help)\b/i.test(cleanMsg)) {
    if (lang === 'ur') {
      return {
        reply: `📞 **${storeName} Se Live Rabta Karein**:

• **Official WhatsApp**: +${whatsappNum}
• **Aukaat**: 10:00 AM – 10:00 PM (Monday – Saturday)
• **Direct Chat**: Screen par kisi bhi product ke sath green 'WhatsApp' button daba kar foran hamaray live representative se baat karein!`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `📞 **Contact Support for ${storeName}**:

• **Official WhatsApp**: +${whatsappNum}
• **Operating Hours**: 10:00 AM – 10:00 PM (Monday – Saturday)
• **Direct Chat**: Click the green 'WhatsApp' button anywhere on the page to chat with our live representative!`,
      languageDetected: 'en',
    };
  }

  // 8. GRATITUDE & POLITE CLOSURES (Shukriya, Thanks, Theek hai, Ok)
  if (/\b(shukriya|thanks|thank you|theek hai|thek hai|ok|acha|achha|bohat shukriya|jazakallah|great|nice)\b/i.test(cleanMsg)) {
    if (lang === 'ur') {
      return {
        reply: `Bohat bohat shukriya! ❤️ Agar koi aur cheez poochni ho to bejhijhak batayein. Happy shopping with **${storeName}**!`,
        languageDetected: 'ur',
      };
    }

    return {
      reply: `You're very welcome! ❤️ Let me know if you need anything else. Happy shopping at **${storeName}**!`,
      languageDetected: 'en',
    };
  }

  // 9. PRODUCT KEYWORD SEARCH
  const stopWords = new Set([
    'show', 'find', 'have', 'what', 'with', 'from', 'under', 'below', 'less', 'than',
    'product', 'products', 'please', 'chahiye', 'dikhao', 'dikhayein', 'batao', 'mujhe',
    'kuch', 'hai', 'hain', 'mein', 'kya', 'kia', 'bhai', 'store'
  ]);
  const searchTerms = cleanMsg
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const matches = products.filter((p) => {
    const text = `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase();
    return searchTerms.some((term) => text.includes(term));
  });

  if (matches.length > 0) {
    const matchesList = matches
      .slice(0, 5)
      .map((p, i) => `• **${p.name}** (${money(p.price)} | ${p.category || 'General'})\n  _${p.description || ''}_`)
      .join('\n\n');

    if (lang === 'ur') {
      return {
        reply: `🎯 **"${message}" Ke Mutabiq ${matches.length} Item(s) Milay Hain** (${storeName}):

${matchesList}

Kisi bhi product card par click karke direct WhatsApp order karein ya cart mein add karein!`,
        languageDetected: 'ur',
        matchesCount: matches.length,
      };
    }

    return {
      reply: `🎯 **Found ${matches.length} matching item(s) for "${message}" in ${storeName}**:

${matchesList}

Click on any product card to add to cart or order directly on WhatsApp!`,
      languageDetected: 'en',
      matchesCount: matches.length,
    };
  }

  // 10. INTELLIGENT BILINGUAL FALLBACK
  if (lang === 'ur') {
    return {
      reply: `Aap ke sawal ka shukriya! **${storeName}** par hamaray paas **${products.length} curated products** dastiyab hain (${categoriesList}).

Aap mujh se Roman Urdu ya English mein pooch saktay hain:
• *"Bestsellers dikhao"*
• *"5000 se kam mein kya hai?"*
• *"Delivery charges kitne hain?"*
• *"Order kaise karein?"*

Ya kisi bhi product card par click karke WhatsApp par direct order bhej saktay hain!`,
      languageDetected: 'ur',
    };
  }

  return {
    reply: `Thank you for reaching out! At **${storeName}**, we offer a curated collection of **${products.length} premium products** across categories: **${categoriesList}**.

You can ask me in English or Roman Urdu:
• *"Show me bestsellers"*
• *"Items under Rs. 5,000"*
• *"What are the delivery charges?"*
• Or click *'Order on WhatsApp'* on any product card for instant purchase!`,
    languageDetected: 'en',
  };
}
