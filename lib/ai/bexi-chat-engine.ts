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

export type BexiLanguageStyle = 'ur-script' | 'ur-roman' | 'en';

/**
 * Detect user language and script:
 * - 'ur-script': Native Urdu characters (e.g. السلام علیکم, کیا یہ جوتے اصلی ہیں؟)
 * - 'ur-roman': Roman Urdu transliteration (e.g. "ye shoes original hain?", "delivery kab hogi?")
 * - 'en': English (e.g. "Do you deliver to Karachi?", "What sizes are available?")
 */
export function detectBexiScriptAndLanguage(message: string): BexiLanguageStyle {
  const clean = message.toLowerCase().trim();

  // Urdu Unicode characters
  if (/[\u0600-\u06FF]/.test(clean)) {
    return 'ur-script';
  }

  // Common Roman Urdu markers
  const romanUrduPatterns = [
    /\b(kya|kia|kitna|kitne|kitni|kab|kese|kaise|kahan|kyun|kon|kaun)\b/,
    /\b(ka|ki|ke|ko|se|mein|me|par|pe|aur|bhi|nahi|nahin|na|han|jee|ji)\b/,
    /\b(hoga|hogi|honge|hai|hain|tha|thi|the|hun|hoon)\b/,
    /\b(batao|bataiye|dikhao|dikhayein|chahiye|lena|lene|kharidna|mil|milega|milegi)\b/,
    /\b(bhai|baji|yar|shukriya|bohat|acha|achi|achha|theek|thek|sasta|mehanga|rate|keemat|paisa|paise|pesy)\b/,
    /\b(mangwana|bhejo|sunain|karo|kardo|pesa|kuch|zara|dost|aap|tum|mera|meri|mere|hum|hamara|humara)\b/,
    /\b(lekin|magar|shadi|kapray|jootay|khushbu|wala|wali|walay|roz|aaj|kal|jaldi|asli|nakal)\b/,
    /\b(salam|assalam|aoa|adaab|kese ho|thek ho|kya hal)\b/
  ];

  for (const regex of romanUrduPatterns) {
    if (regex.test(clean)) {
      return 'ur-roman';
    }
  }

  return 'en';
}

export function detectBexiLanguage(message: string): 'ur' | 'en' {
  const style = detectBexiScriptAndLanguage(message);
  return style === 'en' ? 'en' : 'ur';
}

/**
 * Main Bexi Conversational AI Engine
 * Handles Roman Urdu, Urdu Script, and English with question-specific accuracy
 */
export function generateBexiReply(input: BexiChatInput): BexiChatOutput {
  const { message, store, products } = input;
  const storeName = store.name?.trim() || 'hamari dukan';
  const whatsappNum = (store.whatsapp_number || '923001234567').replace(/[^0-9]/g, '');
  const cleanMsg = (message || '').trim().toLowerCase();
  const style = detectBexiScriptAndLanguage(message);
  const lang: 'ur' | 'en' = style === 'en' ? 'en' : 'ur';

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
    /^(hi|hello|hey|salam|assalam|aoa|adab|hola|good\s*(morning|afternoon|evening)|kese ho|kaisay ho|kya hal|kia hal)/i.test(cleanMsg) ||
    cleanMsg === 'salam' ||
    cleanMsg === 'assalam o alaikum' ||
    cleanMsg === 'bhai'
  ) {
    if (style === 'ur-script') {
      return {
        reply: `وعلیکم السلام! 👋 میں **Bexi AI** ہوں، **${storeName}** کا شاپنگ اسسٹنٹ۔ میں آپ کی قیمتوں، سائز، پروڈکٹس اور براہ راست واٹس ایپ آرڈر میں مدد کر سکتا ہوں۔ آپ آج کیا دیکھنا چاہیں گے؟`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Walaikum Assalam / Hello! 👋 Main **Bexi AI** hoon, **${storeName}** ka smart shopping assistant! 🛍️\n\nAap mujh se kuch bhi pooch saktay hain:\n• Specific products ki price aur details\n• Sizes, colors aur stock availability\n• Delivery charges aur delivery time\n• Direct WhatsApp par order place karna\n\nAap batayein aaj kya dekhna chahein gay?`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `Hello and welcome to **${storeName}**! 👋 I am **Bexi AI**, your personal shopping assistant.\n\nI can help you:\n• Browse our *${products.length} products* across ${categoriesList}\n• Check sizing, colors, and stock details\n• View shipping rates & delivery timelines\n• Place an instant order on WhatsApp\n\nHow can I help you today?`,
      languageDetected: 'en',
    };
  }

  // 2. AUTHENTICITY / QUALITY (Original hai, copy hai, quality kaisi hai, authentic)
  if (/\b(original|authentic|genuine|asli|nakal|replica|copy|first copy|quality|kaisa hai|kaisi hai|meyar|mayar)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `جی بالکل! **${storeName}** پر تمام پروڈکٹس 100٪ اصلی، نئے اور اعلیٰ کوالٹی کے ہیں۔ روانگی سے قبل مکمل کوالٹی چیک کیا جاتا ہے اور کیش آن ڈیلیوری پر آپ تسلی سے پارسل وصول کر سکتے ہیں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Ji bilkul! **${storeName}** par tamam items 100% original aur verified premium quality ke hotay hain. Har item dispatch se pehle proper inspect hota hai. Sath hi Cash on Delivery ki suvidha bhi hai taake aap baghair kisi fikar ke shopping kar sakein!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `Yes, 100%! At **${storeName}**, every product is completely authentic, brand-new, and inspected for quality before dispatch. We also support Cash on Delivery so you can shop with full peace of mind.`,
      languageDetected: 'en',
    };
  }

  // 3. SIZES / MEASUREMENTS / COLORS (Size available hai, colors, size chart, dimension)
  if (/\b(size|sizes|chota|bara|fitting|fit|measurement|size chart|dimension|inches|number|color|colors|colour|colours|rang)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `تمام پروڈکٹس معیاری اور ریگولر سائزز میں دستیاب ہیں۔ آرڈر کرتے وقت واٹس ایپ پر اپنا مطلوبہ سائز یا پسندیدہ رنگ لکھ دیں، ہمارا نمائندہ ڈسپیچ سے قبل آپ سے کنفرم کر لے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Hamare items standard Pakistan sizing aur international guidelines ke mutabiq available hain. Aap jab bhi kisi card par click karke WhatsApp par order bhejein, to sath apna preferred size ya color zaroor mention kar dein — hamara representative dispatch se pehle verify kar lega!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `Our products follow standard sizing and fit guidelines. When you click to order via WhatsApp, simply note your preferred size or color, and our team will confirm availability before dispatching your package!`,
      languageDetected: 'en',
    };
  }

  // 4. DISCOUNTS / PROMOS / BARGAINING (Discount milega, concession, off, deal)
  if (/\b(discount|concession|off|promo|coupon|deal|kam karo|kam kardo|gunjaish|riayat|kam hoga|kam rate)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `ہماری قیمتیں پہلے ہی نہایت مناسب اور آن لائن ڈسکاؤنٹ پر رکھی گئی ہیں۔ اس کے علاوہ 3،000 روپے سے زائد کے آرڈرز پر **ڈیلیوری بالکل مفت** ہے! خصوصی ڈیل کے لیے واٹس ایپ (+${whatsappNum}) پر رابطہ کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Hamare tamam products pehle se discounted aur wholesale rates par listed hain! Lekin agar aap Rs. 3,000 se zyada ka order banayein to **Delivery bilkul FREE** milti hai. Agar aap multiple items ka bundle lena chahein to direct WhatsApp (+${whatsappNum}) par baat kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `Our prices are already set at the most competitive online rates! Furthermore, all orders above Rs. 3,000 qualify for **FREE nationwide delivery**. For custom bundle packages, feel free to chat with us directly on WhatsApp!`,
      languageDetected: 'en',
    };
  }

  // 5. RETURN / EXCHANGE / REFUND POLICY (Return hoga, exchange policy, wapis, kharab)
  if (/\b(return|exchange|wapis|tabdeel|refund|damage|kharab|tota|warranty|guarantee|policy)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `**${storeName}** پر کسٹمرز کے لیے 7 روزہ آسان ایکسچینج پالیسی ہے۔ پارسل موصول ہونے کے بعد اگر کوئی سائز مسئلہ یا مینوفیکچرنگ خرابی ہو تو ہمارے واٹس ایپ (+${whatsappNum}) پر تصویر بھیجیں، فوری تبدیل کر دیا جائے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `**${storeName}** par hamari **7-Day Hassle-Free Exchange Policy** hai! Agar parcel receive hone par koi size issue ho ya item damaged ho, to 7 din ke andar hamaray WhatsApp (+${whatsappNum}) par unboxing pictures ya video send karein, hamari team foran replacement arrange karegi.`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `We offer a customer-first **7-day exchange policy** at **${storeName}**! If you experience any defect or sizing issue, simply message our official WhatsApp line (+${whatsappNum}) within 7 days and we will resolve it promptly.`,
      languageDetected: 'en',
    };
  }

  // 6. SPECIFIC CITY DELIVERY INQUIRY (Karachi, Lahore, Islamabad, etc.)
  if (/\b(karachi|lahore|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|gujranwala)\b/i.test(cleanMsg)) {
    const isLahore = cleanMsg.includes('lahore');
    const isKarachi = cleanMsg.includes('karachi');
    const isIslamabad = cleanMsg.includes('islamabad') || cleanMsg.includes('rawalpindi');

    if (style === 'ur-script') {
      return {
        reply: `جی ہاں! ہم آپ کے شہر میں تیز رفتار کوریئر اور کیش آن ڈیلیوری فراہم کرتے ہیں۔ ڈیلیوری عموماً 2 سے 4 دن میں پہنچ جاتی ہے اور 3،000 روپے سے زائد پر شپنگ فری ہے!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      let cityDetail = `Nationwide courier se 2 se 4 business days mein Cash on Delivery par parcel pohanch jata hai.`;
      if (isLahore) cityDetail = `Lahore ke liye express delivery 24 se 48 ghanton mein ho jati hai (Courier Rs. 200, COD available).`;
      if (isKarachi) cityDetail = `Karachi ke liye delivery 2 se 4 business days mein TCS/Leopard/Trax se ho jati hai (Courier Rs. 350, COD available).`;
      if (isIslamabad) cityDetail = `Islamabad aur Rawalpindi ke liye 2 se 3 business days mein parcel safely deliver ho jata hai (Courier Rs. 350, COD available).`;

      return {
        reply: `🚚 **${storeName} Delivery**: ${cityDetail}\n\nRs. 3,000 se barhay tamam orders par **Delivery bilkul FREE** hai! Order karne ke liye WhatsApp button dabayein.`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🚚 We deliver nationwide with Cash on Delivery! Orders usually arrive in 2-4 business days (free shipping on orders over Rs. 3,000). Place your order through our catalog or click WhatsApp to chat!`,
      languageDetected: 'en',
    };
  }

  // 7. GENERAL DELIVERY & SHIPPING (Delivery charges, time, cod)
  if (/\b(delivery|shipping|charges|charges kitne|fee|cod|cash on delivery|time kitna|kab milega|deliver|bhejo|pohanchna)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🚚 **ڈیلیوری کی تفصیلات (${storeName})**:\n• کیش آن ڈیلیوری (COD) پورے پاکستان میں دستیاب ہے\n• عام ڈیلیوری چارجز: 200 سے 350 روپے\n• **3،000 روپے سے زائد کے آرڈرز پر ڈیلیوری بالکل مفت ہے!**\n• وقت: 2 سے 4 کاروباری دن۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🚚 **Delivery Ki Maloomat (${storeName})**:\n• **Lahore Delivery**: Rs. 200 (1 se 2 business days)\n• **Karachi, Islamabad & baqi shehar**: Rs. 350 (2 se 4 business days)\n• **Cash on Delivery (COD)**: Ji haan, parcel milne par payment karein!\n• **Free Delivery Offer**: Rs. 3,000 se barhay tamam orders par delivery bilkul FREE hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🚚 **Delivery Information for ${storeName}**:\n• **Cash on Delivery (COD)** available nationwide\n• **Standard Courier**: Rs. 200 (local) to Rs. 350 (other cities)\n• **Free Shipping**: FREE delivery on orders over Rs. 3,000!\n• **Timeline**: 2 to 4 business days to your doorstep.`,
      languageDetected: 'en',
    };
  }

  // 8. HOW TO ORDER / ORDER PROCESS
  if (/\b(order kaise|how to order|buy|purchase|khareedna|kese buy|process|mangwana|order karna|order kaisay)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🛍️ **آرڈر کرنے کا طریقہ**:\n1. کیٹلاگ میں سے اپنی پسند کی چیز منتخب کریں۔\n2. 'Add to Cart' یا براہ راست 'WhatsApp' بٹن دبائیں۔\n3. اپنا نام، موبائل نمبر اور مکمل پتہ درج کریں۔\n4. واٹس ایپ پر آرڈر تصدیق کے لیے میسج بھیجیں!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🛍️ **Order Karne Ka Aasan Tareeqa (${storeName})**:\n1. Kisi bhi product card par **'Add to Cart'** ya **'WhatsApp'** button click karein.\n2. Cart Drawer mein apna naam, phone number aur shehar/address darj karein.\n3. **'Checkout via WhatsApp'** par click karein — aap ka invoice seedha hamaray official WhatsApp (+${whatsappNum}) par pohanch jayega instant confirmation ke sath!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🛍️ **How to Place Your Order at ${storeName}**:\n1. Choose any product from the catalog.\n2. Click **'Add to Cart'** or **'WhatsApp'** on the card.\n3. In the Cart Drawer, enter your shipping details.\n4. Click **'Checkout via WhatsApp'** to submit your order directly to our team!`,
      languageDetected: 'en',
    };
  }

  // 9. PAYMENT METHODS (COD, JazzCash, EasyPaisa, Bank)
  if (/\b(payment|advance|jazzcash|easypaisa|bank|paise kaise|advance kitna|payment method)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `💳 ہم کیش آن ڈیلیوری (COD)، ایزی پیسہ، جیز کیش اور ڈائریکٹ بینک ٹرانسفر قبول کرتے ہیں۔ آپ چیک آؤٹ پر اپنی پسند کا طریقہ منتخب کر سکتے ہیں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `💳 **Payment Ka Tareeqa (${storeName})**:\n• **Cash on Delivery (COD)**: Available hai — jab parcel pohanche tab payment karein.\n• **Online Methods**: JazzCash, EasyPaisa aur Direct Bank Transfer bhi supported hain.\nAap checkout drawer mein apni pasand ka tareeqa choose kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `💳 **Payment Methods at ${storeName}**:\n• **Cash on Delivery (COD)** is supported nationwide\n• **Online Banking**: EasyPaisa, JazzCash, and direct Bank Transfer\nYou can select your preferred payment mode during checkout.`,
      languageDetected: 'en',
    };
  }

  // 10. BUDGET SEARCH (under 5000, 3000 tak, sasta, cheap)
  const budgetMatch =
    cleanMsg.match(/(?:under|below|less than|budget(?: of)?|rs\.?\s*)\s*(\d[\d,]*)/i) ||
    cleanMsg.match(/(\d[\d,]*)\s*(?:tak|rupees|rs)\b/i);

  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : null;

  if (budget !== null || /\b(sasta|sasti|cheap|kam rate|kam price|affordable|low price)\b/i.test(cleanMsg)) {
    const targetBudget = budget ?? 5000;
    const affordable = products.filter((p) => p.price <= targetBudget);

    if (affordable.length > 0) {
      const itemsList = affordable
        .slice(0, 5)
        .map((p, i) => `${i + 1}. **${p.name}** — ${money(p.price)}\n   _${p.description || p.category || ''}_`)
        .join('\n\n');

      if (style === 'ur-script') {
        return {
          reply: `✨ **${storeName} پر ${money(targetBudget)} کے بجٹ میں دستیاب پروڈکٹس**:\n\n${itemsList}\n\nآرڈر کرنے کے لیے کارڈ پر واٹس ایپ کا بٹن دبائیں۔`,
          languageDetected: 'ur',
          matchesCount: affordable.length,
        };
      }
      if (style === 'ur-roman') {
        return {
          reply: `✨ **Rs. ${targetBudget.toLocaleString()} Ke Budget Mein ${storeName} Ke Items**:\n\n${itemsList}\n\nAap in mein se kisi bhi item par click karke direct WhatsApp par order bhej saktay hain!`,
          languageDetected: 'ur',
          matchesCount: affordable.length,
        };
      }
      return {
        reply: `✨ **Items under Rs. ${targetBudget.toLocaleString()} at ${storeName}**:\n\n${itemsList}\n\nClick on any product to add to cart or order via WhatsApp!`,
        languageDetected: 'en',
        matchesCount: affordable.length,
      };
    } else {
      const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
      if (style === 'ur-script') {
        return {
          reply: `فی الحال ہمارے پاس ${money(targetBudget)} سے کم میں کوئی آئٹم نہیں ہے۔ ہمارا سب سے مناسب پروڈکٹ **${money(minPrice)}** سے شروع ہوتا ہے۔`,
          languageDetected: 'ur',
        };
      }
      if (style === 'ur-roman') {
        return {
          reply: `Filhal hamare paas Rs. ${targetBudget.toLocaleString()} se kam mein koi item nahi hai. Hamara sab se munasib product **${money(minPrice)}** se shuru hota hai. Mukammal collection dekhne ke liye catalog scroll karein!`,
          languageDetected: 'ur',
        };
      }
      return {
        reply: `Currently we do not have items under Rs. ${targetBudget.toLocaleString()}. Our most affordable item starts at **${money(minPrice)}**. Browse our collection above!`,
        languageDetected: 'en',
      };
    }
  }

  // 11. BESTSELLERS & RECOMMENDATIONS (best, popular, top pick, recommend)
  if (/\b(bestseller|recommend|popular|best|top pick|mashoor|favourite|achha|sab se acha|kuch acha)\b/i.test(cleanMsg)) {
    const topItems = products.slice(0, 4);
    const topList = topItems
      .map((p, i) => `⭐ ${i + 1}. **${p.name}** (${money(p.price)})\n   _${p.description || p.category || ''}_`)
      .join('\n\n');

    if (style === 'ur-script') {
      return {
        reply: `🌟 **${storeName} کے مقبول ترین پروڈکٹس**:\n\n${topList}\n\nیہ ہمارے کسٹمرز کے سب سے پسندیدہ آئٹمز ہیں!`,
        languageDetected: 'ur',
        matchesCount: topItems.length,
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🌟 **${storeName} Ki Top Recommendations & Bestsellers**:\n\n${topList}\n\nYeh hamare verified top-selling items hain! Inhein buy karne ke liye kisi bhi card par click karein.`,
        languageDetected: 'ur',
        matchesCount: topItems.length,
      };
    }
    return {
      reply: `🌟 **Top Recommended Bestsellers at ${storeName}**:\n\n${topList}\n\nThese are our most popular items! Click any item to purchase.`,
      languageDetected: 'en',
      matchesCount: topItems.length,
    };
  }

  // 12. CONTACT DETAILS / WHATSAPP NUMBER
  if (/\b(contact|number|rabta|phone|whatsapp|call|admin|owner|madad|help)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📞 **${storeName} رابطہ**:\n• آفیشل واٹس ایپ: +${whatsappNum}\n• اوقات: صبح 10 تا رات 10 بجے\n• آپ پیج پر دیے گئے واٹس ایپ بٹن سے بھی براہ راست بات کر سکتے ہیں!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📞 **${storeName} Se Live Rabta Karein**:\n• **Official WhatsApp**: +${whatsappNum}\n• **Aukaat**: 10:00 AM – 10:00 PM\n• Screen par kisi bhi product ke sath green WhatsApp button daba kar aap foran hamaray live representative se baat kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📞 **Contact Support for ${storeName}**:\n• **Official WhatsApp**: +${whatsappNum}\n• **Hours**: 10:00 AM – 10:00 PM\n• Click any WhatsApp button on the storefront for instant representative chat!`,
      languageDetected: 'en',
    };
  }

  // 13. GRATITUDE & POLITE CLOSURES (Shukriya, Thanks, Theek hai, Ok)
  if (/\b(shukriya|thanks|thank you|theek hai|thek hai|ok|acha|achha|bohat shukriya|jazakallah|great|nice)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `بہت شکریہ! ❤️ **${storeName}** سے شاپنگ کے لیے ہمہ وقت حاضر ہیں۔ خوش آمدید!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Bohat bohat shukriya! ❤️ Agar koi aur sawal ya madad chahiye ho to zaroor batayein. Happy shopping with **${storeName}**!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `You're very welcome! ❤️ Let me know if you need any more recommendations. Happy shopping at **${storeName}**!`,
      languageDetected: 'en',
    };
  }

  // 14. PRODUCT KEYWORD SEARCH IN STORE CATALOG
  const stopWords = new Set([
    'show', 'find', 'have', 'what', 'with', 'from', 'under', 'below', 'less', 'than',
    'product', 'products', 'please', 'chahiye', 'dikhao', 'dikhayein', 'batao', 'mujhe',
    'kuch', 'hai', 'hain', 'mein', 'kya', 'kia', 'bhai', 'store', 'shop', 'online'
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

    if (style === 'ur-script') {
      return {
        reply: `🎯 **آپ کے مطلوبہ آئٹمز (${matches.length})**:\n\n${matchesList}\n\nکسی بھی آئٹم پر کلک کر کے واٹس ایپ آرڈر کریں!`,
        languageDetected: 'ur',
        matchesCount: matches.length,
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🎯 **"${message}" Ke Mutabiq ${matches.length} Item(s) Milay Hain** (${storeName}):\n\n${matchesList}\n\nKisi bhi product card par click karke direct WhatsApp order karein ya cart mein add karein!`,
        languageDetected: 'ur',
        matchesCount: matches.length,
      };
    }
    return {
      reply: `🎯 **Found ${matches.length} matching item(s) for "${message}" in ${storeName}**:\n\n${matchesList}\n\nClick on any product card to add to cart or order directly on WhatsApp!`,
      languageDetected: 'en',
      matchesCount: matches.length,
    };
  }

  // 15. DYNAMIC CONVERSATIONAL FALLBACK (Mirroring user's question and language)
  if (style === 'ur-script') {
    return {
      reply: `آپ کے سوال "${message}" کا شکریہ! **${storeName}** پر ہمارے پاس **${products.length} معیاری پروڈکٹس** دستیاب ہیں (${categoriesList})۔ آپ کیش آن ڈیلیوری اور واٹس ایپ پر آرڈر کر سکتے ہیں۔ کوئی خاص آئٹم دیکھنا چاہتے ہیں؟`,
      languageDetected: 'ur',
    };
  }

  if (style === 'ur-roman') {
    return {
      reply: `Aap ke sawal "${message}" ke silsilay mein: **${storeName}** par hamaray paas **${products.length} curated products** dastiyab hain (${categoriesList}). Tamam items nationwide Cash on Delivery par available hain. Agar aap ko kisi specific cheez ki price ya picture chahiye to batayein, ya WhatsApp (+${whatsappNum}) par direct pooch saktay hain!`,
      languageDetected: 'ur',
    };
  }

  return {
    reply: `Regarding your query "${message}": At **${storeName}**, we offer **${products.length} premium products** across categories: **${categoriesList}** with nationwide Cash on Delivery. Feel free to browse the catalog above or chat with us directly on WhatsApp (+${whatsappNum})!`,
    languageDetected: 'en',
  };
}
