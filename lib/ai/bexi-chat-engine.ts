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

  // 1.5 PASSWORD & ACCOUNT ACCESS (How to change password, login, credentials)
  if (/\b(password|passward|pasword|login|credential|credentials|account|reset password|change password|forgot password|badalna|bhool)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `پاس ورڈ تبدیل کرنے یا اکاؤنٹ سیٹنگز کے لیے: لاگ ان اسکرین پر "Forgot Password" پر کلک کریں اور اپنا رجسٹرڈ ای میل درج کریں۔ آپ کو فوری پاس ورڈ ری سیٹ کا لنک مل جائے گا۔ یا مرچنٹ ڈیش بورڈ کی سیٹنگز سے نیا پاس ورڈ سیو کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `Password tabdeel karne ke liye:\n1. Merchant Login screen par "Forgot Password" par click karein.\n2. Apna registered email darj karein taake reset link aap ko mil sake.\n3. Agar aap already logged in hain toh Dashboard Settings mein ja kar apna naya password update kar sakte hain.`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `To change or reset your password:\n1. Go to the Merchant Login page and click "Forgot Password".\n2. Enter your registered email address to receive a secure password reset link.\n3. If you are already logged in, you can update your credentials directly from your Dashboard Account Settings.`,
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

  // 12. STORE LOCATION / PHYSICAL SHOP / ADDRESS (dukan kahan hai, address, outlet, kahan se operate)
  if (/\b(location|address|kahan hai|kidhar hai|shop kahan|dukan kahan|outlet|physical store|office kahan|shehar|city kahan|kahan se operate)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📍 **${storeName}** ایک تصدیق شدہ آن لائن برانڈ ہے جو پورے پاکستان میں تیز رفتار کوریئر اور کیش آن ڈیلیوری کی سہولت فراہم کرتا ہے۔ تمام آرڈرز محفوظ پیکنگ کے ساتھ سیدھے آپ کے گھر کی دہلیز پر پہنچائے جاتے ہیں۔ آرڈر یا معلومات کے لیے ہمارے واٹس ایپ (+${whatsappNum}) پر رابطہ کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📍 **${storeName}** ek verified online e-commerce brand hai jo poore Pakistan mein TCS/Leopard couriers ke zariye Cash on Delivery par orders dispatch karta hai! Hamara central fulfillment warehouse Lahore/Karachi mein operate karta hai jahan se safely packed parcels aap ke ghar pohanchaye jatay hain. Mazeed details ke liye WhatsApp (+${whatsappNum}) par rabta karein!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📍 **${storeName}** operates as a verified direct-to-consumer online brand delivering nationwide with Cash on Delivery! Orders are safely packaged and dispatched directly from our central fulfillment hubs to your doorstep. Contact us on WhatsApp (+${whatsappNum}) for any custom requests!`,
      languageDetected: 'en',
    };
  }

  // 13. REAL PICTURES / LIVE PHOTOS / VIDEOS (real pics, unboxing, video dikhao, asli tasveer)
  if (/\b(real pic|real photo|real picture|video|live pic|original photo|tasveer|tasweer|asli photo|unboxing|photo dikhao|tasveer dikhao)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📸 ویب سائٹ پر دکھائی گئی تمام تصاویر ہمارے اصل پروڈکٹس کی اصل اور تفصیلی فوٹو گرافی ہیں۔ اگر آپ کو کسی مخصوص پروڈکٹ کی لائیو ویڈیو یا ان باکسنگ تصویر چاہیے تو نیچے دیے گئے کارڈ پر واٹس ایپ بٹن دبائیں، ہمارا نمائندہ آپ کو فوری لائیو میڈیا بھیج دے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📸 Storefront par display ki gayi tamam pictures 100% actual product ki high-definition photography hain! Agar aap ko kisi item ki live unboxing picture ya 360-degree video dekhni ho, to simply us product ke WhatsApp button par click karein — hamari customer care team foran WhatsApp (+${whatsappNum}) par live video/photos share kar degi!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📸 All images displayed on **${storeName}** are real, high-resolution product photos of our actual inventory. If you need a live unboxing clip or close-up video of any item, just click the WhatsApp button on that product and our support team (+${whatsappNum}) will gladly share it with you!`,
      languageDetected: 'en',
    };
  }

  // 14. MATERIAL / FABRIC / LEATHER / QUALITY SPECS (kapra kaisa hai, pure leather, stuff, washing)
  if (/\b(kapra|kapray|stuff|fabric|material|leather|washable|pure hai|mix hai|color fade|silai|stitching|durable)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🧵 **${storeName}** پر استعمال شدہ میٹریل پریمیئم اور پائیدار ہے۔ سلائی، رنگ کی پختگی اور فیبرک کوالٹی پر خصوصی توجہ دی جاتی ہے۔ کسی بھی سائز یا مٹیریل مسئلے کی صورت میں ہماری 7 روزہ ایکسچینج پالیسی دستیاب ہے۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🧵 **${storeName}** ke tamam items premium export-quality material, fine stitching aur durable finish ke sath tayar hotay hain. Color fade ya shrink nahi hota. Sath hi hamari **7-Day Exchange Guarantee** bhi hai taake aap baghair kisi shak ke shopping karein!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🧵 All items at **${storeName}** are manufactured using premium, durable materials and reinforced stitching. Our products are colorfast and built for everyday endurance, backed by our 7-day hassle-free exchange guarantee!`,
      languageDetected: 'en',
    };
  }

  // 15. TRUST / SCAM / RELIABILITY (bharosa kaise karun, scam to nahi, fraud to nahi, safe hai)
  if (/\b(bharosa|scam|fraud|dhoka|safe hai|trust|fake to nahi|yaqeen|check karke)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🛡️ آپ کا اعتماد ہماری اولین ترجیح ہے! **${storeName}** پر مکمل تحفظ کے ساتھ شاپنگ کریں:\n• **کیش آن ڈیلیوری**: پارسل موصول ہونے پر رقم ادا کریں\n• **7 روزہ ایکسچینج**: کوئی بھی مسئلہ ہو تو باآسانی تبدیل کروائیں\n• **براہ راست واٹس ایپ سپورٹ**: تصدیق شدہ کوریئر ٹریکنگ کے ساتھ۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🛡️ Aap bilkul be-fikar hokar shopping kar saktay hain! **${storeName}** par:\n1. **Cash on Delivery (COD)**: Pehle koi advance dene ki zaroorat nahi — parcel hath mein aane par rider ko pay karein!\n2. **7-Day Hassle-Free Exchange**: Agar koi issue ho to replacement milti hai.\n3. **Live WhatsApp Support**: Official number (+${whatsappNum}) par live tracking updates di jati hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🛡️ You can shop with 100% confidence at **${storeName}**!\n• **Cash on Delivery**: Pay only when your parcel arrives at your door\n• **7-Day Exchange Policy**: Hassle-free replacement for any size or quality issue\n• **Dedicated WhatsApp Tracking**: Official support line (+${whatsappNum}) available 7 days a week.`,
      languageDetected: 'en',
    };
  }

  // 16. ORDER TRACKING & STATUS (mera order kahan hai, tracking number, dispatch kab hoga)
  if (/\b(tracking|track|kahan pohancha|dispatch kab|mera order|order status|parcel kahan)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📦 اپنے آرڈر کی لائیو ٹریکنگ کے لیے براہ کرم اپنا آرڈر نمبر یا نام ہمارے واٹس ایپ (+${whatsappNum}) پر بھیجیں۔ ہماری سپورٹ ٹیم آپ کو کوریئر کا لائیو ٹریکنگ لنک فراہم کر دے گی۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📦 Apne order ki real-time tracking ke liye apna Order ID ya phone number hamaray WhatsApp (+${whatsappNum}) par send karein. Hamari team foran TCS/Leopard ka live tracking ID provide karegi!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📦 To track your order in real time, please share your Order ID or contact number on our WhatsApp (+${whatsappNum}) and our dispatch team will immediately send your courier tracking link!`,
      languageDetected: 'en',
    };
  }

  // 17. CONTACT DETAILS / WHATSAPP NUMBER
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

  // 18. GRATITUDE & POLITE CLOSURES (Shukriya, Thanks, Theek hai, Ok)
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

  // 19. PRODUCT KEYWORD & SYNONYM SEARCH IN STORE CATALOG
  const synonymMap: Record<string, string[]> = {
    shoes: ['shoe', 'shoes', 'sneaker', 'sneakers', 'kicks', 'jogger', 'joggers', 'footwear', 'boots'],
    bags: ['bag', 'bags', 'handbag', 'handbags', 'clutch', 'clutches', 'purse', 'purses', 'tote', 'wallet'],
    perfume: ['perfume', 'perfumes', 'scent', 'fragrance', 'oud', 'attar', 'musk', 'oil', 'amber'],
    plants: ['plant', 'plants', 'green', 'greens', 'flora', 'succulent', 'botanical', 'herb', 'nature', 'pot'],
    jewelry: ['jewel', 'jewelry', 'jewellery', 'gold', 'silver', 'ring', 'rings', 'necklace', 'earring', 'pendant', 'choker', 'jhumka'],
    clothes: ['cloth', 'clothes', 'clothing', 'kurta', 'suit', 'dress', 'shirt', 'hoodie', 'pret', 'lawn'],
    tech: ['tech', 'headphone', 'headphones', 'watch', 'smartwatch', 'earbuds', 'charger', 'audio', 'magsafe']
  };

  const stopWords = new Set([
    'show', 'find', 'have', 'what', 'with', 'from', 'under', 'below', 'less', 'than',
    'product', 'products', 'please', 'chahiye', 'dikhao', 'dikhayein', 'batao', 'mujhe',
    'kuch', 'hai', 'hain', 'mein', 'kya', 'kia', 'bhai', 'store', 'shop', 'online', 'kaise', 'kaisi'
  ]);
  const rawTerms = cleanMsg
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const expandedTerms = new Set<string>(rawTerms);
  for (const term of rawTerms) {
    for (const [, synList] of Object.entries(synonymMap)) {
      if (synList.some((s) => term.includes(s) || s.includes(term))) {
        synList.forEach((s) => expandedTerms.add(s));
      }
    }
  }

  const searchTerms = Array.from(expandedTerms);

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

  // 20. SMART CONTEXTUAL FALLBACK (Non-repetitive, questions answered dynamically)
  const sampleItems = products.slice(0, 3).map((p) => `• **${p.name}** (${money(p.price)})`).join('\n');
  const isQuestion = message.includes('?') || /\b(kya|kia|kab|kese|kaise|kitna|why|how|when|where|which)\b/i.test(cleanMsg);

  if (style === 'ur-script') {
    return {
      reply: isQuestion
        ? `آپ کے سوال کے حوالے سے: **${storeName}** پر ہم 100٪ اصلی کوالٹی اور ملک گیر کیش آن ڈیلیوری فراہم کرتے ہیں۔ ہماری مقبول کیٹیگریز: **${categoriesList}**۔\n\nکچھ خاص پروڈکٹس:\n${sampleItems}\n\nآپ کسی بھی پروڈکٹ پر کلک کر کے واٹس ایپ پر تفصیلات معلوم کر سکتے ہیں!`
        : `خوش آمدید! **${storeName}** پر ہمارے پاس **${products.length} معیاری پروڈکٹس** دستیاب ہیں (${categoriesList})۔ آپ کیش آن ڈیلیوری پر آرڈر کر سکتے ہیں۔ کوئی خاص آئٹم دیکھنا چاہتے ہیں؟`,
      languageDetected: 'ur',
    };
  }

  if (style === 'ur-roman') {
    return {
      reply: isQuestion
        ? `Aap ke sawal ke hawalay se: **${storeName}** par hum verified quality, fast shipping aur Cash on Delivery provide kartay hain (${categoriesList})!\n\nHamare kuch top items:\n${sampleItems}\n\nAap in mein se kisi bhi item par tap karein ya hamaray WhatsApp (+${whatsappNum}) par direct pooch lein!`
        : `Welcome to **${storeName}**! Hamaray paas **${products.length} premium products** available hain (${categoriesList}) nationwide Cash on Delivery ke sath. Agar aap ko kisi specific cheez ke baray mein janna ho to zaroor batayein!`,
      languageDetected: 'ur',
    };
  }

  return {
    reply: isQuestion
      ? `Regarding your inquiry: At **${storeName}**, we guarantee 100% verified quality with nationwide Cash on Delivery across categories: **${categoriesList}**.\n\nHere are some of our popular picks:\n${sampleItems}\n\nFeel free to tap any product card or reach out via WhatsApp (+${whatsappNum}) for instant help!`
      : `Welcome to **${storeName}**! We feature **${products.length} premium items** across **${categoriesList}** with nationwide Cash on Delivery. How may I assist you today?`,
    languageDetected: 'en',
  };
}
