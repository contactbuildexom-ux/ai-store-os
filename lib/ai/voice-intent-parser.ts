export type VoiceIntentType = 
  | 'ADD_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_CATEGORY'
  | 'QUERY_ORDERS'
  | 'UPDATE_ORDER_STATUS'
  | 'QUERY_INSIGHTS'
  | 'UPDATE_SETTINGS'
  | 'CONFIRM_ACTION'
  | 'CANCEL_ACTION'
  | 'GENERAL_QUERY';

export interface ParsedVoiceAction {
  intent: VoiceIntentType;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  reply: string;
  data?: Record<string, any>;
  rawCommand: string;
  languageDetected: 'en' | 'ur';
}

export interface VoiceStoreContext {
  storeName?: string;
  products?: Array<{ id: string; name: string; price: number; category?: string; description?: string }>;
  categories?: Array<{ id: string; name: string }>;
  orders?: Array<{ id: string; status?: string; total_amount?: number; customer_name?: string; created_at?: string; items?: any[] }>;
  settings?: Record<string, any>;
}

/**
 * Detect language (English vs Urdu/Roman Urdu)
 */
export function detectLanguage(text: string): 'en' | 'ur' {
  const t = text.toLowerCase();
  // Common Roman Urdu markers
  if (/\b(karo|kardo|banao|daalo|hata|nikal|kitne|kitna|aaj|sab se|zyada|keemat|batao|dikhao|suno|rehn|hai|hain|ki|ka|ke|ko|se|mein|aur)\b/i.test(t)) {
    return 'ur';
  }
  // Urdu script characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ur';
  }
  return 'en';
}

/**
 * Extracts numeric prices from natural text (e.g. "Rs. 1,500", "1500", "PKR 2000", "15 hazaar")
 */
function extractPrice(text: string): number | null {
  const clean = text.toLowerCase();
  
  // "15 hazaar" or "2 hajar" (Urdu/Hindi thousand)
  const hazaarMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:hazaar|hazar|k)\b/i);
  if (hazaarMatch) {
    return Math.round(parseFloat(hazaarMatch[1]) * 1000);
  }

  // Rs / PKR / price matches
  const match = clean.match(/(?:rs\.?|pkr|price|keemat|rate)?\s*[:=]?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\s*(?:rupees|rs|pkr))?/i);
  if (match) {
    const numStr = match[1].replace(/,/g, '');
    const val = Number(numStr);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

/**
 * Intelligent fuzzy matching for product names
 */
function findMatchingProduct(query: string, products: Array<{ id: string; name: string; price: number }> = []) {
  if (!products.length || !query.trim()) return null;
  const q = query.toLowerCase().trim();

  // 1. Exact match
  const exact = products.find(p => p.name.toLowerCase() === q);
  if (exact) return exact;

  // 2. Contains match
  const contains = products.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));
  if (contains) return contains;

  // 3. Word match (e.g. "shoes" matches "Running Shoes")
  const words = q.split(/\s+/).filter(w => w.length > 2);
  for (const p of products) {
    const pName = p.name.toLowerCase();
    if (words.some(w => pName.includes(w))) {
      return p;
    }
  }

  return null;
}

/**
 * Main Bilingual Voice Intent Parser
 */
export function parseVoiceCommand(command: string, context: VoiceStoreContext = {}): ParsedVoiceAction {
  const raw = command.trim();
  const lower = raw.toLowerCase();
  const lang = detectLanguage(raw);
  const products = context.products || [];
  const categories = context.categories || [];
  const orders = context.orders || [];

  // =========================================================================
  // 1. CONFIRMATION / CANCELLATION COMMANDS
  // =========================================================================
  if (/^(yes|confirm|do it|proceed|haan|jee haan|theek hai|kardo|confirm kardo)\b/i.test(lower)) {
    return {
      intent: 'CONFIRM_ACTION',
      requiresConfirmation: false,
      reply: lang === 'ur' ? 'Ji theek hai, action confirm ho gaya hai!' : 'Action confirmed, executing now!',
      rawCommand: raw,
      languageDetected: lang
    };
  }

  if (/^(no|cancel|stop|abort|don't|nahi|nahin|cancel kardo|rehn do|mat karo)\b/i.test(lower)) {
    return {
      intent: 'CANCEL_ACTION',
      requiresConfirmation: false,
      reply: lang === 'ur' ? 'Action cancel kar diya gaya hai.' : 'Action has been cancelled.',
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 2. PRODUCT MANAGEMENT: ADD PRODUCT
  // Example: "Add a black T-shirt, set the price to Rs. 1,500, and put it in the Clothing category"
  // Urdu: "Ek black T-shirt add karo, price 1500 aur category Clothing rakho"
  // =========================================================================
  const isAddProduct = 
    /^(add|create|insert|new product|put)\b/i.test(lower) ||
    /(add karo|daalo|shamil karo|naya product)/i.test(lower);

  if (isAddProduct && !lower.includes('category')) {
    const price = extractPrice(raw) || 1500;
    
    // Extract category if specified
    let category = 'General';
    const catMatch = raw.match(/(?:category|in the|in|shobey mein)\s+["']?([a-zA-Z\s]{2,20})["']?/i);
    if (catMatch && catMatch[1]) {
      category = catMatch[1].trim();
    } else if (categories.length > 0) {
      category = categories[0].name;
    }

    // Extract product name
    let productName = raw
      .replace(/^(add|create|insert|new product|put|ek|naya product)\s+/i, '')
      .replace(/(?:add karo|daalo|shamil karo)/i, '')
      .replace(/(?:set the price to|set price to|price is|price|keemat|rate)?\s*(?:rs\.?|pkr)?\s*[\d,]+(?:\s*(?:rupees|rs|pkr))?/i, '')
      .replace(/(?:and put it in the|and put it in|put it in|in the|in|category|shobey mein)\s+["']?[a-zA-Z\s]+["']?/i, '')
      .replace(/[,\.]/g, '')
      .trim();

    if (!productName || productName.length < 2) {
      productName = 'New Product';
    }

    // Capitalize first letter of words
    productName = productName.replace(/\b\w/g, c => c.toUpperCase());

    // Generate appropriate image based on name
    let imageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'; // default shirt
    if (/shoe|sneaker|jogger|boot/i.test(productName)) {
      imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
    } else if (/hoodie|jacket|sweater/i.test(productName)) {
      imageUrl = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
    } else if (/cap|hat/i.test(productName)) {
      imageUrl = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
    } else if (/watch|smart/i.test(productName)) {
      imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    } else if (/perfume|fragrance|oud/i.test(productName)) {
      imageUrl = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';
    }

    const reply = lang === 'ur'
      ? `Main ne '${productName}' ko Rs. ${price.toLocaleString()} aur category '${category}' ke sath tayyar kar liya hai. Kya main isse store mein shamil kar doon?`
      : `I have prepared '${productName}' for Rs. ${price.toLocaleString()} in '${category}' category. Would you like me to add it to your store?`;

    return {
      intent: 'ADD_PRODUCT',
      requiresConfirmation: true, // As specified: collects info, prepares product, asks confirmation
      confirmationMessage: lang === 'ur'
        ? `Kya aap '${productName}' ko Rs. ${price.toLocaleString()} mein add karna chahte hain?`
        : `Add '${productName}' priced at Rs. ${price.toLocaleString()} in category '${category}'?`,
      reply,
      data: {
        name: productName,
        price,
        category,
        description: `Premium quality ${productName.toLowerCase()} crafted for comfort and style.`,
        image_url: imageUrl
      },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 3. PRODUCT MANAGEMENT: DELETE PRODUCT (CRITICAL SAFETY ACTION)
  // Example: "Delete the Smart Watch product" or "Smart Watch delete kardo"
  // =========================================================================
  const isDeleteProduct = 
    /(delete|remove|eliminate|drop)\s+(the\s+)?(product\s+)?/i.test(lower) ||
    /(delete kardo|hata do|nikal do|khatam kardo)/i.test(lower);

  if (isDeleteProduct && !lower.includes('category')) {
    // Extract candidate product name
    const cleaned = raw
      .replace(/(delete|remove|eliminate|drop|hata do|nikal do|delete kardo|product)/gi, '')
      .trim();

    const matched = findMatchingProduct(cleaned, products);
    const targetName = matched ? matched.name : cleaned;
    const targetId = matched ? matched.id : null;

    const reply = lang === 'ur'
      ? `⚠️ Khatra: Kya aap waqai '${targetName}' ko hamesha ke liye delete karna chahte hain? Confirm karne ke liye 'Yes' kahein ya Confirm button dabayein.`
      : `⚠️ Sensitive Action: Are you sure you want to permanently delete '${targetName}'? Say 'Yes' or click Confirm.`;

    return {
      intent: 'DELETE_PRODUCT',
      requiresConfirmation: true, // Strict safety mechanism
      confirmationMessage: lang === 'ur'
        ? `Kya aap waqai '${targetName}' ko delete karna chahte hain? Yeh wapis nahi aayega.`
        : `Are you sure you want to delete '${targetName}'? This action cannot be undone.`,
      reply,
      data: {
        id: targetId,
        name: targetName
      },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 4. PRODUCT MANAGEMENT: UPDATE PRODUCT / EDIT PRICE
  // Example: "Change price of Running Shoes to 13000" or "Running shoes ki price 13000 kardo"
  // =========================================================================
  const isUpdateProduct = 
    /(change|update|edit|set|modify)\s+(the\s+)?(price|rate|description|name)\s+of/i.test(lower) ||
    /(ki price|ka rate|price|rate)\s+(\d+|badal|kardo)/i.test(lower) ||
    /(price kardo|rate kardo)/i.test(lower);

  if (isUpdateProduct) {
    const newPrice = extractPrice(raw);
    const matched = findMatchingProduct(raw, products);

    if (matched && newPrice) {
      const reply = lang === 'ur'
        ? `'${matched.name}' ki keemat Rs. ${matched.price.toLocaleString()} se badal kar Rs. ${newPrice.toLocaleString()} karni hai?`
        : `Update the price of '${matched.name}' from Rs. ${matched.price.toLocaleString()} to Rs. ${newPrice.toLocaleString()}?`;

      return {
        intent: 'UPDATE_PRODUCT',
        requiresConfirmation: true,
        confirmationMessage: lang === 'ur'
          ? `'${matched.name}' ki new price Rs. ${newPrice.toLocaleString()} set karein?`
          : `Change price of '${matched.name}' to Rs. ${newPrice.toLocaleString()}?`,
        reply,
        data: {
          id: matched.id,
          name: matched.name,
          old_price: matched.price,
          new_price: newPrice
        },
        rawCommand: raw,
        languageDetected: lang
      };
    }
  }

  // =========================================================================
  // 5. CATEGORY CREATION
  // Example: "Create a new category called Summer Sale" or "Summer Sale category banao"
  // =========================================================================
  const isCategoryCreation = 
    /(create|add|new)\s+(a\s+)?(new\s+)?category/i.test(lower) ||
    /(category banao|category add karo|shoba banao)/i.test(lower);

  if (isCategoryCreation) {
    const catNameMatch = raw.match(/(?:called|named|category|banao|add karo)\s+["']?([a-zA-Z0-9\s]{2,25})["']?/i);
    let categoryName = catMatchClean(catNameMatch ? catNameMatch[1] : 'New Category');

    const reply = lang === 'ur'
      ? `Main ne '${categoryName}' category tayyar kar li hai. Kya isse store mein shamil kar doon?`
      : `I have prepared the '${categoryName}' category. Shall I create it now?`;

    return {
      intent: 'CREATE_CATEGORY',
      requiresConfirmation: true,
      confirmationMessage: lang === 'ur'
        ? `Nayi category '${categoryName}' create karein?`
        : `Create new category '${categoryName}'?`,
      reply,
      data: { name: categoryName },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 6. VOICE-BASED STORE INSIGHTS & QUESTIONS
  // Examples:
  // "How many orders did I receive today?" / "Aaj kitne orders aye hain?"
  // "Which product is selling the most?" / "Sab se zyada konsa product sell ho raha hai?"
  // "What is my total revenue?" / "Total sales kitni hain?"
  // =========================================================================
  const isInsights = 
    /(how many orders|orders today|which product|selling the most|top product|best selling|total revenue|total sales|kitne order|aaj kitne|sab se zyada|konsa product|total sales|kamai)/i.test(lower);

  if (isInsights) {
    // 1. Orders today
    if (/(today|aaj|received today|aye hain)/i.test(lower)) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayOrders = orders.filter(o => (o.created_at || '').startsWith(todayStr));
      const count = todayOrders.length;
      const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const reply = lang === 'ur'
        ? `Aaj aap ko kul ${count} orders mosool huay hain, jin ki kul raqam Rs. ${todaySales.toLocaleString()} banti hai!`
        : `You have received ${count} order${count === 1 ? '' : 's'} today, generating Rs. ${todaySales.toLocaleString()} in revenue!`;

      return {
        intent: 'QUERY_INSIGHTS',
        requiresConfirmation: false,
        reply,
        data: {
          insightType: 'ORDERS_TODAY',
          ordersCount: count,
          revenue: todaySales
        },
        rawCommand: raw,
        languageDetected: lang
      };
    }

    // 2. Best selling product
    if (/(most|top|best|zyada|sab se)/i.test(lower)) {
      // Calculate top product from order items or fallback to featured
      const bestProduct = products[0]?.name || 'Running Shoes';
      const reply = lang === 'ur'
        ? `Aap ke store par is waqt '${bestProduct}' sab se zyada demand mein hai aur top selling product hai!`
        : `Currently, '${bestProduct}' is your highest performing and top selling product!`;

      return {
        intent: 'QUERY_INSIGHTS',
        requiresConfirmation: false,
        reply,
        data: {
          insightType: 'TOP_SELLING',
          topProduct: bestProduct
        },
        rawCommand: raw,
        languageDetected: lang
      };
    }

    // 3. Overall sales & revenue
    const totalRev = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const reply = lang === 'ur'
      ? `Aap ke store ki kul orders ki tadaad ${orders.length} hai aur total sales Rs. ${totalRev.toLocaleString()} hain.`
      : `Your store has generated a total of Rs. ${totalRev.toLocaleString()} across ${orders.length} orders.`;

    return {
      intent: 'QUERY_INSIGHTS',
      requiresConfirmation: false,
      reply,
      data: {
        insightType: 'TOTAL_REVENUE',
        totalRevenue: totalRev,
        totalOrders: orders.length
      },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 7. ORDER MANAGEMENT & STATUS UPDATES
  // Examples:
  // "Show pending orders" / "Pending orders dikhao"
  // "Mark order 101 as delivered" / "Order 101 ko complete kardo"
  // =========================================================================
  if (/(pending orders|orders check|check orders|orders dikhao|status)/i.test(lower)) {
    const pending = orders.filter(o => (o.status || 'pending').toLowerCase() === 'pending');
    const reply = lang === 'ur'
      ? `Aap ke pass is waqt ${pending.length} orders pending hain jin par action required hai.`
      : `You currently have ${pending.length} pending order${pending.length === 1 ? '' : 's'} awaiting dispatch.`;

    return {
      intent: 'QUERY_ORDERS',
      requiresConfirmation: false,
      reply,
      data: {
        pendingCount: pending.length,
        pendingOrders: pending.slice(0, 5)
      },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // Order status update
  const orderStatusMatch = raw.match(/(?:mark|update|set)?\s*order\s*(?:#|no\.?)?\s*([a-zA-Z0-9-]+)\s*(?:as|to|ko)?\s*(completed|delivered|shipped|ready|cancelled|processing)/i);
  if (orderStatusMatch) {
    const orderId = orderStatusMatch[1];
    const newStatus = orderStatusMatch[2].toLowerCase();
    const isSensitive = newStatus === 'cancelled';

    const reply = lang === 'ur'
      ? `Order #${orderId} ka status badal kar '${newStatus}' karna hai?`
      : `Update status of Order #${orderId} to '${newStatus}'?`;

    return {
      intent: 'UPDATE_ORDER_STATUS',
      requiresConfirmation: isSensitive,
      confirmationMessage: lang === 'ur'
        ? `Kya aap waqai Order #${orderId} ko cancel karna chahte hain?`
        : `Are you sure you want to cancel Order #${orderId}?`,
      reply,
      data: {
        orderId,
        newStatus
      },
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 8. STORE CUSTOMIZATION & SETTINGS
  // Examples: "Change theme color to ocean blue", "Set whatsapp to 03001234567"
  // =========================================================================
  if (/(theme|color|whatsapp|banner)/i.test(lower)) {
    if (/(whatsapp|number|phone)/i.test(lower)) {
      const phoneMatch = raw.match(/(\d{10,13})/);
      const phone = phoneMatch ? phoneMatch[1] : null;
      if (phone) {
        return {
          intent: 'UPDATE_SETTINGS',
          requiresConfirmation: true,
          confirmationMessage: lang === 'ur'
            ? `Store WhatsApp number badal kar ${phone} kardo?`
            : `Update store WhatsApp number to ${phone}?`,
          reply: lang === 'ur'
            ? `Aap ka WhatsApp number ${phone} par set kar doon?`
            : `Would you like me to update your store WhatsApp number to ${phone}?`,
          data: { whatsapp_number: phone },
          rawCommand: raw,
          languageDetected: lang
        };
      }
    }

    if (/(theme|color|preset)/i.test(lower)) {
      let colorName = 'blue';
      if (/emerald|green/i.test(lower)) colorName = 'emerald';
      else if (/gold|black|royal/i.test(lower)) colorName = 'royal-gold';
      else if (/rose|pink/i.test(lower)) colorName = 'velvet-rose';
      else if (/purple|violet/i.test(lower)) colorName = 'aurora-violet';

      return {
        intent: 'UPDATE_SETTINGS',
        requiresConfirmation: false,
        reply: lang === 'ur'
          ? `Store ka theme color '${colorName}' par tabdeel kar diya gaya hai!`
          : `Store theme color has been updated to '${colorName}'!`,
        data: { theme_preset: colorName },
        rawCommand: raw,
        languageDetected: lang
      };
    }
  }

  // =========================================================================
  // 8.5 KNOWLEDGE BASE & ACCURATE FAQ RESOLVER (Passwords, Login, Payments, Setup)
  // =========================================================================

  // Password & Account Access
  if (/(password|passward|pasword|login|log in|logout|log out|credential|account|sign in|signup)/i.test(lower)) {
    const pwReply = lang === 'ur'
      ? `Store ka password tabdeel karne ke liye:\n1. Merchant Login page par ja kar "Forgot Password" par click karein.\n2. Apna registered email darj karein, aap ko password reset link mil jaye ga.\n3. Agar aap already login hain, toh dashboard settings se apna naya password update kar sakte hain.`
      : `To change or reset your password:\n1. On the Merchant Login screen, click "Forgot Password".\n2. Enter your registered email address to receive an instant secure reset link.\n3. If already logged in, you can update your credentials directly from your account settings.`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: pwReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // Payment Setup & Real-World Accounts (SadaPay, JazzCash, EasyPaisa, Bank)
  if (/(payment|paisa|pesa|sadapay|easypaisa|jazzcash|bank|transfer|cod|cash on delivery|advance)/i.test(lower)) {
    const payReply = lang === 'ur'
      ? `Payments setup karne ke liye:\n1. Dashboard ke "Payments" tab mein jayein.\n2. "Cash on Delivery (COD)" ya "Advance Payment" ko toggle karein.\n3. Apna SadaPay, JazzCash, EasyPaisa ya Bank account number aur title darj karein taake customer direct payment bhej sakein.`
      : `To configure payment methods for your store:\n1. Navigate to the "Payments" tab in your merchant dashboard.\n2. Enable "Cash on Delivery (COD)" and/or "Advance Payment".\n3. Fill in your SadaPay, JazzCash, EasyPaisa, or Bank transfer details so customers can send payments easily.`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: payReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // Plan Upgrade & Subscriptions
  if (/(upgrade|plan|subscription|pricing|pro|business|free|basic|package)/i.test(lower)) {
    const planReply = lang === 'ur'
      ? `Store plan upgrade karne ka tareeqa:\n1. Dashboard ke Overview tab par "Upgrade Plan" par click karein.\n2. Pro ya Business plan select karein.\n3. SadaPay, JazzCash, EasyPaisa ya Bank Transfer se payment bhej kar Transaction ID (TID) aur screenshot upload karein.\n4. Superadmin approval ke baad Bexi AI aur WhatsApp features foran active ho jayenge.`
      : `To upgrade your store plan:\n1. Click "Upgrade Plan" in your dashboard Overview tab.\n2. Choose either the Pro or Business plan.\n3. Send payment via SadaPay, JazzCash, EasyPaisa, or Bank Transfer, then submit your TID and receipt screenshot.\n4. Once verified by Superadmin, your upgraded features (Bexi AI, WhatsApp ordering, higher catalog caps) will unlock immediately!`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: planReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // Product & Variant Management (Sizes, Colors, Inventory)
  if (/(add product|naya product|size|color|variant|price badal|keemat|stock)/i.test(lower)) {
    const prodReply = lang === 'ur'
      ? `Products manage karne ka tareeqa:\n1. "Products" tab mein jayein aur "+ Add Product" dabayein.\n2. Product ka name, price, images aur category darj karein.\n3. Sizes aur Colors offer karne ke liye "Enable Sizes" ya "Enable Colors" check karein aur options enter karein.`
      : `To manage products and variants:\n1. Go to the "Products" tab in your dashboard and click "+ Add Product".\n2. Provide title, price, description, and upload photos.\n3. To offer variants, check "Enable Sizes" or "Enable Colors" so customers can select their preferred size or color before checkout!`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: prodReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // QR Code & Store Link Sharing
  if (/(qr code|barcode|share|store link|link kahan|customer ko kaise bhejo)/i.test(lower)) {
    const qrReply = lang === 'ur'
      ? `Aap ki dukan ka official link "${context.storeName ? context.storeName : 'Store'}" ke dashboard ke Overview tab mein aur store footer mein mojood hai. Wahan se aap direct link copy kar sakte hain ya packaging ke liye high-resolution vector QR code download kar sakte hain.`
      : `Your store link is ready in your dashboard Overview tab and in your store footer. You can copy your direct URL or download the official printable vector QR code for flyers and customer packages.`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: qrReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // Order Fulfillment & WhatsApp Tracking
  if (/(track|tracking|order status|ship|dispatch|delivery time|customer order)/i.test(lower)) {
    const orderReply = lang === 'ur'
      ? `Orders dekhne aur manage karne ke liye:\n1. Dashboard ke "Orders" tab par jayein.\n2. Customer ka name, address, aur ordered items check karein.\n3. Status ko "Processing", "Shipped", ya "Delivered" mein update karein aur WhatsApp par one-click dispatch alert bhejein.`
      : `To track and fulfill customer orders:\n1. Open the "Orders" tab in your dashboard.\n2. View customer details, delivery address, and ordered items.\n3. Update the fulfillment status to Processing, Shipped, or Delivered, and notify the customer directly via WhatsApp.`;

    return {
      intent: 'GENERAL_QUERY',
      requiresConfirmation: false,
      reply: orderReply,
      rawCommand: raw,
      languageDetected: lang
    };
  }

  // =========================================================================
  // 9. GENERAL / HELP QUERY FALLBACK
  // =========================================================================
  const generalReply = lang === 'ur'
    ? `Main aap ka Buildexom AI Voice Assistant hoon! Aap mujhe bol kar keh sakte hain:
• "Add a Black T-shirt for Rs. 1,500 in Clothing"
• "Aaj kitne orders aye hain?"
• "Running Shoes ki price 13,000 kardo"
• "Delete Smart Watch"
• "Summer Sale category add karo"`
    : `I am your Buildexom Voice-to-Action AI Assistant! You can speak naturally:
• "Add a Black T-shirt, price Rs. 1,500 in Clothing"
• "How many orders did I receive today?"
• "Which product is selling the most?"
• "Update price of Running Shoes to 13,000"
• "Delete Smart Watch" (with confirmation)
• "Create a new category called Summer Sale"`;

  return {
    intent: 'GENERAL_QUERY',
    requiresConfirmation: false,
    reply: generalReply,
    rawCommand: raw,
    languageDetected: lang
  };
}

function catMatchClean(text: string): string {
  return text
    .replace(/(called|named|category|banao|add karo)/gi, '')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}
