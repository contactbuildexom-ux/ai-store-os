export interface BexiProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
}

import { resolveUniversalAnswer } from './universal-knowledge-engine';

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
 * - 'ur-roman': Roman Urdu transliteration (e.g. "ye shoes original hain?", "delivery kab hogi?", "price kya hai")
 * - 'en': English (e.g. "What is the price?", "Do you deliver to Karachi?", "What sizes are available?")
 */
export function detectBexiScriptAndLanguage(message: string): BexiLanguageStyle {
  const clean = message.toLowerCase().trim();

  // Urdu Unicode characters
  if (/[\u0600-\u06FF]/.test(clean)) {
    return 'ur-script';
  }

  // Common distinct Roman Urdu markers
  const distinctUrduPatterns = [
    /\b(kya|kia|kitna|kitne|kitni|kab|kese|kaise|kahan|kidhar|kyun|kon|kaun)\b/,
    /\b(ka|ki|ke|ko|se|mein|me|par|pe|aur|bhi|nahi|nahin|han|jee|ji)\b/,
    /\b(hoga|hogi|honge|hai|hain|tha|thi|thay|hun|hoon)\b/,
    /\b(batao|bataiye|dikhao|dikhayein|chahiye|lena|lene|kharidna|mil|milega|milegi)\b/,
    /\b(bhai|baji|yar|shukriya|bohat|acha|achi|achha|theek|thek|sasta|mehanga|keemat|qemat|paisa|paise|pesy)\b/,
    /\b(mangwana|bhejo|sunain|karo|kardo|pesa|kuch|zara|dost|aap|tum|mera|meri|mere|hum|hamara|humara)\b/,
    /\b(lekin|magar|shadi|kapray|jootay|khushbu|khushboo|wala|wali|walay|roz|aaj|kal|jaldi|asli|nakal)\b/,
    /\b(salam|assalam|aoa|adaab|kese ho|thek ho|kya hal|kia hal|kya rate|rate kya|price kya|kia price)\b/
  ];

  // Distinct English grammar indicators
  const englishGrammar = /\b(what|how|where|when|why|who|which|whose|can|could|would|should|please|tell|show|price|deliver|delivery|order|product|products|return|policy|discount|about|with|without|from|have|does|do|are|is|this|that|your|my|we|you)\b/;

  let urduScore = 0;
  for (const regex of distinctUrduPatterns) {
    if (regex.test(clean)) urduScore++;
  }

  // If starts with clear English phrase or contains English grammar with no strong Urdu, detect as English
  if (/^(what|how|where|when|why|who|which|can i|could you|do you|is there|are these|does this|tell me|show me|please)\b/.test(clean) && urduScore <= 1) {
    return 'en';
  }

  if (englishGrammar.test(clean) && urduScore === 0) {
    return 'en';
  }

  return urduScore > 0 ? 'ur-roman' : 'en';
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

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c && c !== 'All'))
    )
  );
  const categoriesList = categories.length > 0 ? categories.join(', ') : 'All Collections';
  const money = (val: number) => `Rs. ${Number(val).toLocaleString()}`;

  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 1500;
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 12000;
  const samplePicks = products.slice(0, 4);
  const sampleItemsList = samplePicks.map((p, i) => `${i + 1}. **${p.name}** — ${money(p.price)}`).join('\n');

  // Helper to find specific product mentioned in message
  const findMentionedProduct = () => {
    return products.find((p) => {
      const nameParts = p.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return nameParts.some((word) => cleanMsg.includes(word));
    });
  };

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

  // 2. CASH ON DELIVERY (COD) INQUIRY (Priority match for COD)
  if (/\b(cod|cash on delivery|delivery pe paise|hath mein paise|parcel aane par|cod available)\b/i.test(cleanMsg) && !/\b(charges|fee)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `💵 **جی ہاں، کیش آن ڈیلیوری (COD) پورے پاکستان میں دستیاب ہے!**\nآپ کو پہلے کوئی ایڈوانس رقم نہیں دینی ہوتی۔ پارسل موصول ہونے پر رقم کوریئر رائیڈر کو ادا کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `💵 **Ji haan, 100% Cash on Delivery (COD) poore Pakistan mein available hai!**\nAap ko pehle koi advance dene ki zaroorat nahi hai. Jab courier rider aap ke ghar parcel le kar aye, tabhi aap ne cash pay karna hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `💵 **Yes, Cash on Delivery (COD) is 100% available nationwide!**\nYou do not need to pay in advance. Simply pay the courier rider when the parcel arrives at your doorstep!`,
      languageDetected: 'en',
    };
  }

  // 3. SPECIFIC PRODUCT PRICE OR GENERAL PRICE INQUIRY
  const isPriceQuery = /\b(price|prices|rate|rates|cost|keemat|qemat|kitne ka|kitnay ka|kitne ki|kitnay ki|how much|price kya|kia price|kya rate|kia rate)\b/i.test(cleanMsg);
  if (isPriceQuery) {
    const specificItem = findMentionedProduct();
    if (specificItem) {
      if (style === 'ur-script') {
        return {
          reply: `🏷️ **${specificItem.name}** کی قیمت صرف **${money(specificItem.price)}** ہے!\n${specificItem.description ? `_${specificItem.description}_\n\n` : ''}کیش آن ڈیلیوری کی سہولت موجود ہے۔ آرڈر کرنے کے لیے کارڈ پر واٹس ایپ بٹن دبائیں۔`,
          languageDetected: 'ur',
        };
      }
      if (style === 'ur-roman') {
        return {
          reply: `🏷️ **${specificItem.name}** ki price sirf **${money(specificItem.price)}** hai!\n${specificItem.description ? `_${specificItem.description}_\n\n` : ''}Cash on Delivery par direct order karne ke liye product card par **'Add to Cart'** ya **'WhatsApp'** button click karein!`,
          languageDetected: 'ur',
        };
      }
      return {
        reply: `🏷️ The price for **${specificItem.name}** is **${money(specificItem.price)}**.\n${specificItem.description ? `_${specificItem.description}_\n\n` : ''}Cash on Delivery is available. Tap the product card to add it to cart or order via WhatsApp!`,
        languageDetected: 'en',
      };
    }

    // General price inquiry
    if (style === 'ur-script') {
      return {
        reply: `🏷️ **${storeName}** پر پروڈکٹس کی قیمتیں **${money(minPrice)}** سے لے کر **${money(maxPrice)}** تک ہیں۔\n\nہمارے کچھ خاص آئٹمز اور قیمتیں:\n${sampleItemsList}\n\n3،000 روپے سے زائد پر ملک بھر میں ڈیلیوری بالکل مفت ہے!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🏷️ **${storeName}** par products ki prices **${money(minPrice)}** se lekar **${money(maxPrice)}** tak hain.\n\nKuch mashoor items aur unki prices:\n${sampleItemsList}\n\nTamam items par Cash on Delivery available hai aur Rs. 3,000 se barhay orders par **Delivery bilkul FREE** hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🏷️ Prices at **${storeName}** range from **${money(minPrice)}** to **${money(maxPrice)}**.\n\nHere are some of our popular items:\n${sampleItemsList}\n\nCash on Delivery is supported nationwide, with FREE delivery on orders over Rs. 3,000!`,
      languageDetected: 'en',
    };
  }

  // 4. DELIVERY CHARGES / SHIPPING FEE
  if (/\b(delivery charge|delivery charges|delivery fee|shipping charges|shipping fee|charges kitne|fee kitni|shipping cost)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🚚 **ڈیلیوری چارجز (${storeName})**:\n• عام کوریئر چارجز: 200 سے 350 روپے (شہر کے لحاظ سے)۔\n• **خصوصی آفر**: 3،000 روپے سے زائد کے آرڈرز پر **ڈیلیوری بالکل مفت** ہے! 🎉`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🚚 **Delivery Charges (${storeName})**:\n• Standard courier shipping: **Rs. 200 se Rs. 350** (shehar ke hisaab se).\n• **Free Delivery Offer**: Agar aap ka order **Rs. 3,000 se zyada** ka ho to delivery **bilkul FREE** hai! 🎉`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🚚 **Delivery Charges for ${storeName}**:\n• Standard courier shipping is **Rs. 200 to Rs. 350** depending on the destination.\n• **Free Shipping Offer**: Orders above **Rs. 3,000 qualify for 100% FREE nationwide delivery**! 🎉`,
      languageDetected: 'en',
    };
  }

  // 5. DELIVERY TIME / TIMELINE / DAYS
  if (/\b(delivery kab|kab milega|kitne din|time kitna|deliver kab|delivery time|how many days|when will i receive)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🚚 **ڈیلیوری کا وقت (${storeName})**:\n• مقامی شہر: 1 سے 2 کاروباری دن\n• کراچی، اسلام آباد اور دیگر تمام شہر: 2 سے 4 کاروباری دن\n• پارسل روانہ ہوتے ہی آپ کو واٹس ایپ پر لائیو ٹریکنگ نمبر بھیج دیا جاتا ہے!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🚚 **Delivery Ka Waqt (${storeName})**:\n• **Lahore / Local City**: 1 se 2 business days\n• **Karachi, Islamabad, Rawalpindi & Baqi Shehar**: 2 se 4 business days\n• Parcel dispatch hotay hi aap ko TCS/Leopard ka real-time tracking code WhatsApp par mil jata hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🚚 **Delivery Timeline for ${storeName}**:\n• **Local City**: 1 to 2 business days\n• **Nationwide (Karachi, Islamabad, etc.)**: 2 to 4 business days\n• You will receive a direct courier tracking number as soon as your package is dispatched!`,
      languageDetected: 'en',
    };
  }

  // 6. ADVANCE PAYMENT INQUIRY
  if (/\b(advance|advance kitna|advance dena|online payment|bank transfer|jazzcash|easypaisa)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `💳 ایڈوانس پیمنٹ لازمی نہیں ہے کیونکہ کیش آن ڈیلیوری دستیاب ہے۔ اگر آپ آن لائن ادائیگی کرنا چاہیں تو جیز کیش، ایزی پیسہ اور ڈائریکٹ بینک ٹرانسفر کی سہولت بھی موجود ہے۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `💳 **${storeName} Payment Options**:\n• **Advance dena zaroori nahi hai** — Cash on Delivery (COD) poori tarah active hai!\n• Agar aap cashless online pay karna chahein to JazzCash, EasyPaisa aur Direct Bank Transfer bhi accept kiya jata hai checkout ke waqt.`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `💳 **Payment Options at ${storeName}**:\n• Advance payment is **not required** because Cash on Delivery (COD) is fully active!\n• If you prefer online payments, we also accept JazzCash, EasyPaisa, and Direct Bank Transfers at checkout.`,
      languageDetected: 'en',
    };
  }

  // 7. SIZES & FITTING INQUIRY
  if (/\b(size|sizes|size chart|fitting|fit|chota|bara|dimension|inches|number)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📏 ہمارے پروڈکٹس معیاری سائزز میں دستیاب ہیں: **Small, Medium, Large, اور XL**۔ آرڈر کرتے وقت واٹس ایپ پر اپنا مطلوبہ سائز لکھ دیں، ہمارا نمائندہ پارسل بھیجنے سے قبل آپ سے تصدیق کر لے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📏 Hamare products standard Pakistani aur international sizing guidelines ke mutabiq available hain: **Small (S), Medium (M), Large (L), aur Extra Large (XL)**. Order kartay waqt aap WhatsApp par apna preferred size bata dein — dispatch se pehle confirm kar liya jayega!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📏 Our products follow standard sizing: **Small (S), Medium (M), Large (L), and XL**. When placing your order via WhatsApp, simply mention your preferred size and our team will verify availability before dispatch!`,
      languageDetected: 'en',
    };
  }

  // 8. COLORS & VARIATIONS
  if (/\b(color|colors|colour|colours|rang|black|white|blue|green|red|shades)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🎨 ہمارے پاس بہترین اور مقبول رنگ دستیاب ہیں (جیسے بلیک، نیوی، ایمرلڈ، میرون اور کلاسک وائٹ)۔ کارڈ پر واٹس ایپ بٹن دبا کر آپ کسی بھی پروڈکٹ کے لائیو کلر آپشنز دیکھ سکتے ہیں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🎨 Hamare products trending aur premium colors mein available hain (e.g. Classic Black, Navy Blue, Emerald Green, Maroon aur Crisp White). Kisi bhi specific item ke available colors janne ke liye us ke WhatsApp button par tap karein!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🎨 Our items come in our most popular colorways including Classic Black, Navy, Emerald Green, Maroon, and White. For exact shades of any item, tap the WhatsApp button on its card!`,
      languageDetected: 'en',
    };
  }

  // 9. AUTHENTICITY / QUALITY
  if (/\b(original|authentic|genuine|asli|nakal|replica|copy|first copy|quality|meyar|mayar|kaisa hai|kaisi hai)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `✨ جی بالکل! **${storeName}** پر تمام اشیاء 100٪ اصلی، نئی اور پریمیئم کوالٹی کی ہیں۔ ہر پروڈکٹ روانگی سے قبل چیک کیا جاتا ہے اور کیش آن ڈیلیوری پر آپ تسلی سے وصول کر سکتے ہیں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `✨ Ji bilkul 100%! **${storeName}** par tamam items 100% original, brand new aur verified premium quality ke hotay hain. Dispatch se pehle har item ka quality inspection hota hai aur sath Cash on Delivery bhi hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `✨ 100% Authentic and brand-new! At **${storeName}**, every single item undergoes a strict quality check before dispatch. With Cash on Delivery, you can shop with full confidence.`,
      languageDetected: 'en',
    };
  }

  // 10. RETURN / EXCHANGE / REFUND POLICY
  if (/\b(return|exchange|wapis|tabdeel|refund|damage|kharab|warranty|guarantee|policy)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🔄 **${storeName}** پر کسٹمرز کے لیے 7 روزہ آسان ایکسچینج پالیسی ہے۔ اگر کوئی سائز مسئلہ یا مینوفیکچرنگ خرابی ہو تو ہمارے واٹس ایپ (+${whatsappNum}) پر اطلاع دیں، فوری تبدیل کر دیا جائے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🔄 **${storeName} 7-Day Exchange Policy**:\nAgar parcel milne par koi size issue ho ya item defective nikle, to 7 din ke andar hamaray WhatsApp (+${whatsappNum}) par unboxing pictures bhejein, hamari team foran replacement send karegi!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🔄 **7-Day Exchange Policy at ${storeName}**:\nIf you experience any sizing issue or manufacturing defect, message our WhatsApp support (+${whatsappNum}) within 7 days and we will arrange a hassle-free exchange!`,
      languageDetected: 'en',
    };
  }

  // 11. HOW TO ORDER / ORDER PROCESS
  if (/\b(order kaise|order kaisay|how to order|buy|purchase|khareedna|process|mangwana|order karna)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🛍️ **آرڈر کرنے کا طریقہ (${storeName})**:\n1. کیٹلاگ میں سے اپنی پسند کی چیز منتخب کریں۔\n2. 'Add to Cart' یا براہ راست 'WhatsApp' بٹن دبائیں۔\n3. اپنا نام، موبائل نمبر اور مکمل پتہ درج کریں۔\n4. واٹس ایپ پر آرڈر تصدیق کے لیے میسج بھیجیں!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🛍️ **Order Karne Ka Aasan Tareeqa (${storeName})**:\n1. Kisi bhi product card par **'Add to Cart'** ya **'WhatsApp'** button click karein.\n2. Cart Drawer mein apna naam, phone number aur address darj karein.\n3. **'Checkout via WhatsApp'** par click karein — aap ka invoice seedha hamaray official WhatsApp (+${whatsappNum}) par pohanch jayega instant confirmation ke sath!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🛍️ **How to Place Your Order at ${storeName}**:\n1. Choose any product from our catalog.\n2. Click **'Add to Cart'** or **'WhatsApp'** on the card.\n3. In the Cart Drawer, enter your contact and shipping address.\n4. Click **'Checkout via WhatsApp'** to submit your order instantly!`,
      languageDetected: 'en',
    };
  }

  // 12. DISCOUNTS / PROMOS / BARGAINING
  if (/\b(discount|concession|off|promo|coupon|deal|kam karo|kam kardo|gunjaish|riayat|kam rate)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🎁 ہماری قیمتیں پہلے ہی نہایت مناسب اور آن لائن ڈسکاؤنٹ پر رکھی گئی ہیں۔ اس کے علاوہ 3،000 روپے سے زائد کے آرڈرز پر **ڈیلیوری بالکل مفت** ہے! کسٹم بنڈل ڈیل کے لیے واٹس ایپ (+${whatsappNum}) پر رابطہ کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🎁 Hamari prices pehle se hi wholesale aur discounted rates par listed hain! Mazeed ye ke **Rs. 3,000 se barhay orders par Delivery bilkul FREE** milti hai. Agar aap multiple items ka bundle lena chahein to direct WhatsApp (+${whatsappNum}) par baat kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🎁 Our prices are already competitively discounted online! Furthermore, all orders over Rs. 3,000 qualify for **FREE nationwide delivery**. For bundle deals, chat with us directly on WhatsApp (+${whatsappNum})!`,
      languageDetected: 'en',
    };
  }

  // 13. STORE LOCATION / PHYSICAL SHOP / ADDRESS
  if (/\b(location|address|kahan hai|kidhar hai|shop kahan|dukan kahan|outlet|physical store|office kahan|shehar|city kahan|where are you located)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📍 **${storeName}** ایک تصدیق شدہ آن لائن برانڈ ہے جو پورے پاکستان میں تیز رفتار کوریئر اور کیش آن ڈیلیوری کی سہولت فراہم کرتا ہے۔ تمام آرڈرز محفوظ پیکنگ کے ساتھ سیدھے آپ کے گھر کی دہلیز پر پہنچائے جاتے ہیں۔ آرڈر یا معلومات کے لیے ہمارے واٹس ایپ (+${whatsappNum}) پر رابطہ کریں۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📍 **${storeName}** ek verified direct-to-consumer online brand hai jo poore Pakistan mein TCS aur Leopard couriers ke zariye Cash on Delivery par orders deliver karta hai! Central hubs se packed parcels seedha aap ke door par pohanchaye jatay hain. Rabta ke liye WhatsApp (+${whatsappNum}) open karein.`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📍 **${storeName}** is a verified online brand delivering nationwide with Cash on Delivery across Pakistan! Orders are securely packaged and delivered directly to your doorstep. Contact us on WhatsApp (+${whatsappNum}) for inquiries!`,
      languageDetected: 'en',
    };
  }

  // 14. CONTACT DETAILS / WHATSAPP NUMBER
  if (/\b(contact|number|rabta|phone|whatsapp|call|admin|owner|madad|help|helpline)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📞 **${storeName} رابطہ**:\n• آفیشل واٹس ایپ: +${whatsappNum}\n• اوقات: صبح 10 تا رات 10 بجے\n• آپ پیج پر دیے گئے واٹس ایپ بٹن سے بھی براہ راست بات کر سکتے ہیں!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📞 **${storeName} Support Contact**:\n• **Official WhatsApp**: +${whatsappNum}\n• **Aukaat**: 10:00 AM – 10:00 PM (Rozana)\n• Screen par kisi bhi product card ke WhatsApp button se aap seedha live representative se baat kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📞 **Customer Support for ${storeName}**:\n• **Official WhatsApp**: +${whatsappNum}\n• **Hours**: 10:00 AM – 10:00 PM Daily\n• Tap any WhatsApp button on the catalog for an instant live representative chat!`,
      languageDetected: 'en',
    };
  }

  // 15. REAL PICTURES / LIVE PHOTOS / VIDEOS
  if (/\b(real pic|real photo|real picture|video|live pic|original photo|tasveer|tasweer|asli photo|unboxing|photo dikhao|tasveer dikhao)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `📸 ویب سائٹ پر دکھائی گئی تمام تصاویر ہمارے اصل پروڈکٹس کی اصل اور تفصیلی فوٹو گرافی ہیں۔ اگر آپ کو کسی مخصوص پروڈکٹ کی لائیو ویڈیو یا ان باکسنگ تصویر چاہیے تو نیچے دیے گئے کارڈ پر واٹس ایپ بٹن دبائیں، ہمارا نمائندہ آپ کو فوری لائیو میڈیا بھیج دے گا۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `📸 Store par display ki gayi tamam pictures 100% actual product ki high-definition photography hain! Agar aap ko kisi item ki live unboxing picture ya video dekhni ho, to simply us product ke WhatsApp button par click karein — hamari customer care team foran WhatsApp (+${whatsappNum}) par live video/photos share kar degi!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `📸 All images displayed on **${storeName}** are real HD photos of our inventory! If you need a live unboxing clip or close-up photo of any item, just tap the WhatsApp button on that product and our support team (+${whatsappNum}) will share it!`,
      languageDetected: 'en',
    };
  }

  // 16. MATERIAL / FABRIC / LEATHER / QUALITY SPECS
  if (/\b(kapra|kapray|stuff|fabric|material|leather|washable|pure hai|mix hai|color fade|silai|stitching|durable)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🧵 **${storeName}** پر استعمال شدہ میٹریل پریمیئم اور پائیدار ہے۔ سلائی، رنگ کی پختگی اور فیبرک کوالٹی پر خصوصی توجہ دی جاتی ہے۔ کسی بھی مسئلے کی صورت میں ہماری 7 روزہ ایکسچینج پالیسی دستیاب ہے۔`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🧵 **${storeName}** ke tamam items export-quality material, fine reinforced stitching aur durable finish ke sath tayar hotay hain. Color fade nahi hota aur wash ke baad shrink nahi hota. Sath 7-Day Exchange Guarantee bhi mojood hai!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🧵 All items at **${storeName}** are manufactured with premium, durable materials and reinforced stitching. They are colorfast and built for everyday comfort, backed by our 7-day hassle-free exchange policy!`,
      languageDetected: 'en',
    };
  }

  // 17. ORDER TRACKING & STATUS
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

  // 18. TRUST / SCAM / RELIABILITY
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

  // 19. GRATITUDE & POLITE CLOSURES
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

  // 20. CATALOG / WHAT DO YOU SELL / SAMAN KYA HAI / ITEMS DIKHAO
  if (/\b(kya kya|saman|items|products|catalog|collection|dikhao|dikhayein|available hai|what do you sell|what products|show me|list)\b/i.test(cleanMsg)) {
    if (style === 'ur-script') {
      return {
        reply: `🛍️ **${storeName}** پر ہمارے پاس **${products.length} معیاری پروڈکٹس** دستیاب ہیں:\n• کیٹیگریز: **${categoriesList}**\n\nمقبول پروڈکٹس:\n${sampleItemsList}\n\nآپ اوپر کیٹلاگ میں مزید اشیاء دیکھ سکتے ہیں!`,
        languageDetected: 'ur',
      };
    }
    if (style === 'ur-roman') {
      return {
        reply: `🛍️ **${storeName}** par hamaray paas **${products.length} premium products** available hain:\n• Categories: **${categoriesList}**\n\nTop Featured Items:\n${sampleItemsList}\n\nAap oper catalog scroll karke koi bhi item dekh saktay hain ya category filter use kar saktay hain!`,
        languageDetected: 'ur',
      };
    }
    return {
      reply: `🛍️ At **${storeName}**, we feature **${products.length} premium products** across these collections:\n• Categories: **${categoriesList}**\n\nFeatured Items:\n${sampleItemsList}\n\nFeel free to explore our collection above or select a category tab!`,
      languageDetected: 'en',
    };
  }

  // 21. PRODUCT SEARCH BY NAME OR CATEGORY KEYWORD
  const synonymMap: Record<string, string[]> = {
    shoes: ['shoe', 'shoes', 'sneaker', 'sneakers', 'kicks', 'jogger', 'joggers', 'footwear', 'boots', 'jootay'],
    bags: ['bag', 'bags', 'handbag', 'handbags', 'clutch', 'clutches', 'purse', 'purses', 'tote', 'wallet'],
    perfume: ['perfume', 'perfumes', 'scent', 'fragrance', 'oud', 'attar', 'musk', 'oil', 'amber', 'khushbu', 'khushboo'],
    plants: ['plant', 'plants', 'green', 'greens', 'flora', 'succulent', 'botanical', 'herb', 'nature', 'pot'],
    jewelry: ['jewel', 'jewelry', 'jewellery', 'gold', 'silver', 'ring', 'rings', 'necklace', 'earring', 'pendant', 'choker', 'jhumka'],
    clothes: ['cloth', 'clothes', 'clothing', 'kurta', 'suit', 'dress', 'shirt', 'hoodie', 'pret', 'lawn', 'kapray'],
    tech: ['tech', 'headphone', 'headphones', 'watch', 'smartwatch', 'earbuds', 'charger', 'audio', 'magsafe', 'gaming']
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
      .slice(0, 4)
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
      reply: `🎯 **Found ${matches.length} matching item(s) for "${message}" at ${storeName}**:\n\n${matchesList}\n\nClick on any product card to add to cart or order directly on WhatsApp!`,
      languageDetected: 'en',
      matchesCount: matches.length,
    };
  }

  // 22. UNIVERSAL KNOWLEDGE CHECK BEFORE STORE FALLBACK
  const universal = resolveUniversalAnswer(cleanMsg);
  if (universal.domain !== 'conversational') {
    return {
      reply: universal.reply,
      languageDetected: universal.language,
    };
  }

  // 23. DYNAMIC LANGUAGE-MATCHED CONTEXTUAL FALLBACK
  const isQuestion = message.includes('?') || /\b(kya|kia|kab|kese|kaise|kitna|why|how|when|where|which|who|can|do)\b/i.test(cleanMsg);

  if (style === 'ur-script') {
    return {
      reply: isQuestion
        ? `آپ کے سوال کے حوالے سے: **${storeName}** پر ہم 100٪ اصلی کوالٹی، تیز رفتار شپنگ اور کیش آن ڈیلیوری فراہم کرتے ہیں۔ ہماری مقبول کیٹیگریز: **${categoriesList}**۔\n\nکچھ خاص پروڈکٹس:\n${sampleItemsList}\n\nمزید معلومات کے لیے واٹس ایپ (+${whatsappNum}) پر رابطہ کریں!`
        : `خوش آمدید! **${storeName}** پر ہمارے پاس **${products.length} معیاری پروڈکٹس** دستیاب ہیں (${categoriesList})۔ آپ کیش آن ڈیلیوری پر آرڈر کر سکتے ہیں۔ کوئی خاص آئٹم دیکھنا چاہتے ہیں؟`,
      languageDetected: 'ur',
    };
  }

  if (style === 'ur-roman') {
    return {
      reply: isQuestion
        ? `Aap ke sawal ke hawalay se: **${storeName}** par hum verified 100% original quality, fast shipping aur Cash on Delivery provide kartay hain (${categoriesList})!\n\nHamare kuch top items:\n${sampleItemsList}\n\nAap in mein se kisi bhi item par tap karein ya hamaray WhatsApp (+${whatsappNum}) par direct rabta karein!`
        : `Welcome to **${storeName}**! Hamaray paas **${products.length} premium products** available hain (${categoriesList}) nationwide Cash on Delivery ke sath. Agar aap ko kisi specific cheez ke baray mein janna ho to zaroor batayein!`,
      languageDetected: 'ur',
    };
  }

  return {
    reply: isQuestion
      ? `Regarding your inquiry: At **${storeName}**, we guarantee 100% verified quality with nationwide Cash on Delivery across categories: **${categoriesList}**.\n\nHere are some of our popular picks:\n${sampleItemsList}\n\nFeel free to tap any product card or reach out via WhatsApp (+${whatsappNum}) for instant help!`
      : `Welcome to **${storeName}**! We feature **${products.length} premium items** across **${categoriesList}** with nationwide Cash on Delivery. How may I assist you today?`,
    languageDetected: 'en',
  };
}
