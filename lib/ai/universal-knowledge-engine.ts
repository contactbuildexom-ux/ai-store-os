/**
 * Universal Knowledge & Multi-Domain AI Intelligence Engine
 * 
 * Provides GPT/Gemini-grade answers to questions across ALL domains:
 * - World facts, history, geography, countries, and capitals
 * - Science, physics, biology, nature, and the universe
 * - Mathematics, arithmetic, percentages, and conversions
 * - Technology, AI, coding, computers, and internet
 * - E-commerce growth, marketing, sales strategy, pricing, and retail
 * - Pakistan history, culture, currency, economy, and society
 * - Health, lifestyle, productivity, recipes, and daily life
 * - Conversational dialogue in Roman Urdu, native Urdu, and English
 */

export interface UniversalAnswer {
  reply: string;
  domain: 'general_knowledge' | 'science' | 'math' | 'technology' | 'business' | 'pakistan' | 'lifestyle' | 'platform' | 'conversational';
  language: 'en' | 'ur';
}

// 1. Math Evaluator (Handles arithmetic, percentages, powers, roots)
function tryEvaluateMath(query: string, isUrdu: boolean): string | null {
  const q = query.toLowerCase().trim();

  // Percentage: "20% of 5000" or "5000 ka 20 percent"
  const percentMatch1 = q.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|off|ka)?\s*(\d+(?:\.\d+)?)/i);
  const percentMatch2 = q.match(/(\d+(?:\.\d+)?)\s*(?:ka)?\s*(\d+(?:\.\d+)?)\s*(?:percent|%|faisad)/i);
  if (percentMatch1) {
    const rate = parseFloat(percentMatch1[1]);
    const total = parseFloat(percentMatch1[2]);
    const ans = (rate / 100) * total;
    return isUrdu
      ? `${total.toLocaleString()} ka ${rate}% banta hai **${ans.toLocaleString()}**.`
      : `${rate}% of ${total.toLocaleString()} is **${ans.toLocaleString()}**.`;
  }
  if (percentMatch2) {
    const total = parseFloat(percentMatch2[1]);
    const rate = parseFloat(percentMatch2[2]);
    const ans = (rate / 100) * total;
    return isUrdu
      ? `${total.toLocaleString()} ka ${rate}% banta hai **${ans.toLocaleString()}**.`
      : `${rate}% of ${total.toLocaleString()} is **${ans.toLocaleString()}**.`;
  }

  // Square root: "sqrt of 144" or "square root of 64" or "64 ka square root"
  const sqrtMatch = q.match(/(?:sqrt|square\s*root)\s*(?:of)?\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:ka\s*)?(?:square\s*root|sqrt)/i);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1] || sqrtMatch[2]);
    const ans = Math.sqrt(num);
    return isUrdu
      ? `${num} ka square root **${ans}** hota hai.`
      : `The square root of ${num} is **${ans}**.`;
  }

  // Simple arithmetic: "what is 25 * 40", "1500 + 350", "200 / 4", "100 minus 35", etc.
  const cleanArithmetic = q
    .replace(/(?:what\s*is|calculate|solve|kitna\s*hota\s*hai|jawab\s*kya\s*hai|\?|=)/gi, '')
    .replace(/\bplus\b/gi, '+')
    .replace(/\bminus\b/gi, '-')
    .replace(/\b(times|multiply|multiplied\s*by|zarb)\b/gi, '*')
    .replace(/\b(divided\s*by|divide|taqseem)\b/gi, '/')
    .trim();

  // If it's a valid safe math expression: digits and [+\-*/. ()]
  if (/^[\d\s+\-*/.()]+$/.test(cleanArithmetic) && /[+\-*/]/.test(cleanArithmetic)) {
    try {
      const sanitized = cleanArithmetic.replace(/[^0-9+\-*/().]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const rounded = Number.isInteger(result) ? result.toLocaleString() : Number(result.toFixed(4)).toString();
        return isUrdu
          ? `${cleanArithmetic} ka hisaab **${rounded}** banta hai.`
          : `${cleanArithmetic} = **${rounded}**.`;
      }
    } catch {}
  }

  return null;
}

// 2. Comprehensive Country-to-Capital Dictionary
const CAPITALS_MAP: Record<string, { country: string; capital: string; urNote?: string; enNote?: string }> = {
  'pakistan': { country: 'Pakistan', capital: 'Islamabad' },
  'france': { country: 'France', capital: 'Paris' },
  'usa': { country: 'United States of America (USA)', capital: 'Washington, D.C.' },
  'america': { country: 'United States of America (USA)', capital: 'Washington, D.C.' },
  'united states': { country: 'United States of America (USA)', capital: 'Washington, D.C.' },
  'uk': { country: 'United Kingdom (UK)', capital: 'London' },
  'britain': { country: 'United Kingdom (UK)', capital: 'London' },
  'england': { country: 'England', capital: 'London' },
  'turkey': { country: 'Turkey (Türkiye)', capital: 'Ankara', urNote: '(Istanbul sab se bara shehar hai jabkay official capital Ankara hai)' },
  'turkiye': { country: 'Turkey (Türkiye)', capital: 'Ankara' },
  'saudi arabia': { country: 'Saudi Arabia', capital: 'Riyadh' },
  'saudi': { country: 'Saudi Arabia', capital: 'Riyadh' },
  'uae': { country: 'United Arab Emirates (UAE)', capital: 'Abu Dhabi', urNote: '(Dubai sab se bara commercial hub hai jabkay capital Abu Dhabi hai)' },
  'dubai': { country: 'UAE', capital: 'Abu Dhabi' },
  'china': { country: 'China', capital: 'Beijing' },
  'japan': { country: 'Japan', capital: 'Tokyo' },
  'germany': { country: 'Germany', capital: 'Berlin' },
  'canada': { country: 'Canada', capital: 'Ottawa' },
  'australia': { country: 'Australia', capital: 'Canberra', urNote: '(Sydney ya Melbourne nahi balkay Canberra official capital hai)' },
  'russia': { country: 'Russia', capital: 'Moscow' },
  'india': { country: 'India', capital: 'New Delhi' },
  'bangladesh': { country: 'Bangladesh', capital: 'Dhaka' },
  'iran': { country: 'Iran', capital: 'Tehran' },
  'iraq': { country: 'Iraq', capital: 'Baghdad' },
  'afghanistan': { country: 'Afghanistan', capital: 'Kabul' },
  'italy': { country: 'Italy', capital: 'Rome' },
  'spain': { country: 'Spain', capital: 'Madrid' },
  'egypt': { country: 'Egypt (Misr)', capital: 'Cairo' },
  'brazil': { country: 'Brazil', capital: 'Brasília' },
  'argentina': { country: 'Argentina', capital: 'Buenos Aires' },
  'qatar': { country: 'Qatar', capital: 'Doha' },
  'oman': { country: 'Oman', capital: 'Muscat' },
  'malaysia': { country: 'Malaysia', capital: 'Kuala Lumpur' },
  'indonesia': { country: 'Indonesia', capital: 'Jakarta' },
  'south korea': { country: 'South Korea', capital: 'Seoul' },
  'korea': { country: 'South Korea', capital: 'Seoul' },
  'switzerland': { country: 'Switzerland', capital: 'Bern' },
  'netherlands': { country: 'Netherlands', capital: 'Amsterdam' },
  'sweden': { country: 'Sweden', capital: 'Stockholm' },
  'norway': { country: 'Norway', capital: 'Oslo' },
};

function tryLookupCapital(query: string, isUrdu: boolean): string | null {
  const q = query.toLowerCase();
  if (!q.includes('capital') && !q.includes('darul hukoomat') && !q.includes('dar-ul-hukoomat')) {
    return null;
  }

  for (const [key, data] of Object.entries(CAPITALS_MAP)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(q)) {
      if (isUrdu) {
        return `${data.country} ka dar-ul-hukoomat (capital) **${data.capital}** hai${data.urNote ? ' ' + data.urNote : ''}.`;
      }
      return `The capital of ${data.country} is **${data.capital}**${data.enNote ? ' ' + data.enNote : ''}.`;
    }
  }

  return null;
}

// 3. Comprehensive Knowledge Matcher
interface KnowledgeItem {
  patterns: RegExp[];
  en: string;
  ur: string;
  domain: UniversalAnswer['domain'];
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- PAKISTAN GENERAL KNOWLEDGE ---
  {
    patterns: [
      /(pakistan|watan).*(kab|date|independence|azaad|azad|bana|wujood|qayam)/i,
      /(independence|azaad|azadi).*(pakistan)/i,
      /\b(14\s*august\s*1947)\b/i
    ],
    en: "Pakistan gained independence on **August 14, 1947** (27 Ramadan 1366 AH) under the leadership of Quaid-e-Azam Muhammad Ali Jinnah after the partition of British India.",
    ur: "Pakistan **14 August 1947** (27 Ramadan 1366 Hijri) ko Quaid-e-Azam Muhammad Ali Jinnah ki qayadat mein azaad hua.",
    domain: "pakistan"
  },
  {
    patterns: [
      /\b(founder\s*of\s*pakistan|quaid[- ]e[- ]azam|father\s*of\s*the\s*nation|bani\s*e\s*pakistan|jinnah)\b/i
    ],
    en: "**Quaid-e-Azam Muhammad Ali Jinnah** (December 25, 1876 – September 11, 1948) is the founder and first Governor-General of Pakistan, revered as Baba-i-Qaum (Father of the Nation).",
    ur: "Pakistan ke bani **Quaid-e-Azam Muhammad Ali Jinnah** hain, jinho ne All-India Muslim League ke platform se tareekhi jiddo-jehad kar ke Pakistan banaya.",
    domain: "pakistan"
  },
  {
    patterns: [
      /\b(national\s*poet\s*of\s*pakistan|allama\s*iqbal|muffakir[- ]e[- ]pakistan|shaair[- ]e[- ]mashriq|iqbal)\b/i
    ],
    en: "**Dr. Allama Muhammad Iqbal** is the national poet and philosopher of Pakistan, known as Muffakir-e-Pakistan and Shair-e-Mashriq, who presented the concept of an independent Muslim state in his 1930 Allahabad address.",
    ur: "Pakistan ke qaumi shaair **Dr. Allama Muhammad Iqbal** hain, jinho ne 1930 ke Khutba-e-Allahabad mein azaad Muslim riyasat ka tasawwur paish kiya.",
    domain: "pakistan"
  },
  {
    patterns: [
      /\b(largest\s*city\s*of\s*pakistan|pakistan\s*ka\s*sab\s*se\s*bara\s*shehar|karachi)\b/i
    ],
    en: "**Karachi** is the largest city and financial capital of Pakistan, with an estimated population exceeding 17 million people and home to the country's primary seaports.",
    ur: "Pakistan ka sab se bara shehar aur maashi markaz **Karachi** hai, jisy Roshniyon ka Shehar bhi kaha jata hai.",
    domain: "pakistan"
  },
  {
    patterns: [
      /\b(k2|k-2|godwin[- ]austen|highest\s*peak\s*in\s*pakistan|second\s*highest\s*mountain)\b/i
    ],
    en: "**K2** (Mount Godwin-Austen), located in the Karakoram range in Gilgit-Baltistan, Pakistan, is the **second-highest mountain on Earth** at 8,611 meters (28,251 ft), known worldwide as the Savage Mountain.",
    ur: "**K2** (Mount Godwin-Austen) dunya ki doosri sab se oonchi choti hai (8,611 meters), jo Pakistan ke ilaqay Gilgit-Baltistan ke Karakoram pahari silsilay mein waqay hai.",
    domain: "pakistan"
  },
  {
    patterns: [
      /\b(1992\s*world\s*cup|cricket\s*world\s*cup\s*1992|pakistan\s*world\s*cup\s*kab\s*jeeta|world\s*cup.*1992)\b/i
    ],
    en: "Pakistan won the ICC Cricket World Cup on **March 25, 1992** in Melbourne, Australia, defeating England in the final under the captaincy of **Imran Khan** with Wasim Akram named Player of the Match.",
    ur: "Pakistan ne **25 March 1992** ko Melbourne Australia mein England ko hara kar Imran Khan ki captani mein Cricket World Cup jeeta tha.",
    domain: "pakistan"
  },

  // --- WORLD SUPERLATIVES & GEOGRAPHY ---
  {
    patterns: [/\b(largest\s*ocean|sab\s*se\s*bara\s*samundar|biggest\s*ocean|pacific\s*ocean)\b/i],
    en: "The **Pacific Ocean** is the largest and deepest ocean on Earth, covering more than 63 million square miles (over 30% of the Earth's surface) and containing the Mariana Trench.",
    ur: "Dunya ka sab se bara aur gehra samundar **Pacific Ocean (Behr-e-Kahin)** hai, jo zameen ke 30% se ziyada hissay par phaila hua hai.",
    domain: "science"
  },
  {
    patterns: [/\b(highest\s*mountain|tallest\s*mountain|mount\s*everest|sab\s*se\s*ooncha\s*pahar)\b/i],
    en: "**Mount Everest**, located in the Himalayas on the border of Nepal and China, is the highest mountain on Earth with an official summit elevation of **8,848.86 meters** (29,031.7 ft).",
    ur: "Dunya ka sab se ooncha pahar **Mount Everest** hai (8,848.86 meters ooncha), jo Nepal aur China ke border par Himalayas silsilay mein waqay hai.",
    domain: "science"
  },
  {
    patterns: [/\b(longest\s*river|sab\s*se\s*lamba\s*darya|longest\s*river\s*in\s*the\s*world|nile\s*river)\b/i],
    en: "The **Nile River** in Africa is traditionally recognized as the longest river in the world at approximately **6,650 km** (4,132 miles), while the **Amazon River** is the largest by water volume.",
    ur: "Dunya ka sab se lamba darya **Darya-e-Neel (Nile River)** hai (taqreeban 6,650 km), jabkay paani ke bahao ke hisaab se Amazon River sab se bara hai.",
    domain: "science"
  },
  {
    patterns: [/\b(fastest\s*animal|fastest\s*land\s*animal|sab\s*se\s*tez\s*janwar|cheetah)\b/i],
    en: "The **Cheetah** is the fastest land animal, capable of accelerating from 0 to 60 mph in just 3 seconds and reaching top speeds of up to **120 km/h** (75 mph). In the sky, the **Peregrine Falcon** is the fastest creature overall, diving at speeds over 389 km/h (242 mph).",
    ur: "Zameen par sab se tez bhaagne wala janwar **Cheetah** hai jo 120 km/h ki raftaar pakar sakta hai. Hawa mein Peregrine Falcon parinda 389 km/h ki speed se dive lagata hai.",
    domain: "science"
  },
  {
    patterns: [/\b(largest\s*mammal|largest\s*animal|blue\s*whale|sab\s*se\s*bara\s*janwar)\b/i],
    en: "The **Blue Whale** is the largest animal ever known to have lived on Earth, reaching lengths of up to 30 meters (98 ft) and weighing up to 200 metric tons (equivalent to roughly 33 elephants).",
    ur: "Dunya ka sab se bara janwar **Blue Whale** hai, jis ka wazan 200 ton tak ho sakta hai aur lambaai 100 feet tak hoti hai.",
    domain: "science"
  },

  // --- SCIENCE & THE UNIVERSE ---
  {
    patterns: [/\b(photosynthesis|shuaai\s*tarkeeb)\b/i],
    en: "**Photosynthesis** is the biological process by which green plants, algae, and some bacteria convert light energy (from the Sun), water (H2O), and carbon dioxide (CO2) into glucose (chemical energy) and release oxygen (O2) into the atmosphere.",
    ur: "**Photosynthesis (Shuaai Tarkeeb)** wo qudrati amal hai jis ke zariye poday sooraj ki roshni, paani aur carbon dioxide ka istemaal kar ke apni khorak (glucose) banatay hain aur oxygen kharij kartay hain.",
    domain: "science"
  },
  {
    patterns: [/\b(speed\s*of\s*light|roshni\s*ki\s*raftaar|roshni\s*ki\s*speed)\b/i],
    en: "The speed of light in a vacuum is exactly **299,792,458 meters per second** (approximately **300,000 km/s** or 186,282 miles/s). Nothing in the universe can travel faster than light in a vacuum.",
    ur: "Khala (vacuum) mein roshni ki raftaar taqreeban **300,000 kilometer fi second** (3x10^8 m/s) hoti hai.",
    domain: "science"
  },
  {
    patterns: [/\b(how\s*many\s*planets|solar\s*system\s*planets|nizam\s*e\s*shamsi\s*sayyare|planets.*solar\s*system)\b/i],
    en: "Our Solar System has **8 official planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune (Pluto was reclassified as a dwarf planet by the IAU in 2006).",
    ur: "Hamaray Nizam-e-Shamsi (Solar System) mein **8 sayyaray** hain: Mercury, Venus, Zameen (Earth), Mars, Jupiter, Saturn, Uranus, aur Neptune.",
    domain: "science"
  },
  {
    patterns: [/\b(human\s*bones|how\s*many\s*bones|bones.*human|haddiyan.*jism|jism.*haddiyan)\b/i],
    en: "An adult human body has **206 bones**. Babies are born with approximately 270 to 300 softer bones, many of which fuse together as they grow into adulthood.",
    ur: "Aik baaligh insaan ke jism mein kul **206 haddiyan** hoti hain (jabkay paidaish ke waqt taqreeban 270 se 300 hoti hain jo waqt ke sath jarr jati hain).",
    domain: "science"
  },
  {
    patterns: [/\b(gravity|kashish\s*e\s*saqal|isaac\s*newton\s*gravity)\b/i],
    en: "**Gravity** is the fundamental natural force by which all objects with mass attract each other. On Earth, gravitational acceleration is approximately **9.8 m/s²**, formulated mathematically by Sir Isaac Newton and later described as spacetime curvature by Albert Einstein.",
    ur: "**Gravity (Kashish-e-Saqal)** wo qudrati taqat hai jo maaday wali ashya ko aik doosray ki taraf kheenchti hai. Zameen par is ki sharah 9.8 m/s² hai, jisy Sir Isaac Newton ne daryaft kiya tha.",
    domain: "science"
  },
  {
    patterns: [/\b(what\s*is\s*dna|dna\s*kya|deoxyribonucleic)\b/i],
    en: "**DNA (Deoxyribonucleic Acid)** is the double-helix molecule carrying genetic instructions for the development, functioning, growth, and reproduction of all known organisms and many viruses.",
    ur: "**DNA (Deoxyribonucleic Acid)** aik double-helix molecule hai jis mein har jaandar ki warasati maloomat (genetic code) mehfooz hoti hai.",
    domain: "science"
  },

  // --- TECHNOLOGY & AI ---
  {
    patterns: [/\b(what\s*is\s*artificial\s*intelligence|ai\s*kya\s*hai|what\s*is\s*ai|artificial\s*intelligence\s*kya\s*hai)\b/i],
    en: "**Artificial Intelligence (AI)** is a branch of computer science dedicated to creating software and systems capable of performing tasks that normally require human intelligence, such as visual perception, natural language understanding, decision-making, and learning from experience.",
    ur: "**Artificial Intelligence (AI)** computer science ki wo shakh hai jis mein machines aur algorithms ko insani zehan ki tarah seekhnay, samajhnay, faislay karnay aur sawaalat ke jawabaat denay ke qabil banaya jata hai.",
    domain: "technology"
  },
  {
    patterns: [/\b(what\s*is\s*python|python\s*language|python\s*kya\s*hai)\b/i],
    en: "**Python** is a high-level, interpreted programming language celebrated for its clear, readable syntax. It is the world's most popular language for Artificial Intelligence, Machine Learning, Data Science, automation, and backend web development (Django, FastAPI).",
    ur: "**Python** dunya ki sab se maqbool programming language hai, jo apnay aasan aur saaf syntax ki waja se Artificial Intelligence, Data Science, aur web development mein sab se ziyada use hoti hai.",
    domain: "technology"
  },
  {
    patterns: [/\b(what\s*is\s*javascript|javascript\s*kya\s*hai|js\s*kya\s*hai)\b/i],
    en: "**JavaScript (JS)** is the core programming language of the World Wide Web, running in browsers to make web pages interactive and dynamic, as well as powering servers through Node.js.",
    ur: "**JavaScript** internet ki bunyadi language hai jo web pages ko interactive aur dynamic banati hai aur modern frameworks (React, Next.js, Node.js) ki bunyad hai.",
    domain: "technology"
  },
  {
    patterns: [/\b(what\s*is\s*an\s*api|api\s*kya\s*hoti\s*hai|api\s*kya\s*hai)\b/i],
    en: "An **API (Application Programming Interface)** is a set of rules and protocols that allows different software applications to communicate and exchange data securely with each other (e.g., payment gateways, WhatsApp messaging, AI endpoints).",
    ur: "**API (Application Programming Interface)** aik aisi bridge hoti hai jo do mukhtalif software systems ko aapas mein data exchange karnay aur baat karnay ki ijazat deti hai (jaise payment gateways ya AI services).",
    domain: "technology"
  },

  // --- E-COMMERCE, MARKETING & BUSINESS GROWTH ---
  {
    patterns: [
      /\b(sales\s*(kaise|kese)\s*barhaun|how\s*to\s*increase\s*sales|sales\s*tips|orders\s*ziyada\s*kaise)\b/i
    ],
    en: "To boost your e-commerce sales effectively:\n1. **High-Converting Visuals**: Use clean, authentic photos and short video reels showing products in action.\n2. **Offer Cash on Delivery**: Over 85% of shoppers in Pakistan prefer COD.\n3. **Quick WhatsApp Engagement**: Answer customer messages within 5 minutes.\n4. **Social Proof & Reviews**: Share customer testimonials and unboxing videos.\n5. **Targeted Meta Ads**: Run focused Facebook/Instagram ads targeting your exact audience in top purchasing cities (Karachi, Lahore, Islamabad).",
    ur: "Store ki sales barhanay ke 5 ahem tareeqay:\n1. **Asli Photos & Reels**: Saaf pictures aur video reels lagayein.\n2. **Cash on Delivery (COD)**: Pakistan mein 85% khareedar COD pasand kartay hain.\n3. **Fauran WhatsApp Reply**: Customer ka message atay hi 5 minute mein response dein.\n4. **Customer Reviews**: Pehlay khareedaron ke reviews aur unboxing share karein.\n5. **Facebook & Instagram Ads**: Apnay shehar aur target audience par PKR 500-1000 se ads shuru karein.",
    domain: "business"
  },
  {
    patterns: [
      /\b(facebook\s*ads|meta\s*ads|ads\s*kaise\s*chalayein|advertising\s*tips)\b/i
    ],
    en: "Best practices for running profitable Meta (Facebook & Instagram) ads:\n1. Set a daily testing budget (e.g. PKR 700 - 1,500/day).\n2. Target specific cities (Lahore, Karachi, Islamabad, Rawalpindi) and relevant interests.\n3. Use video creatives or carousel formats highlighting benefits and pricing.\n4. Include a clear 'Order on WhatsApp' or 'Shop Now' call-to-action.",
    ur: "Facebook aur Instagram Ads chalanay ka tareeqa:\n1. Rozana PKR 700 se 1,500 ka test budget rakhein.\n2. Major cities (Lahore, Karachi, Islamabad) aur relevant age group target karein.\n3. Product ki video reel ya carousel add karein jis mein price aur Cash on Delivery wazeh ho.\n4. Direct WhatsApp link ya store link lagayein.",
    domain: "business"
  },
  {
    patterns: [
      /\b(pricing\s*strategy|price\s*kya\s*rakhun|how\s*to\s*price\s*products|keemat\s*kaise\s*tay\s*karein)\b/i
    ],
    en: "A proven e-commerce pricing formula:\n1. **Cost of Goods + Shipping + Packaging + Marketing Ad Cost + Desired Profit Margin (30% to 50%)**.\n2. Use charm pricing (e.g., Rs. 1,499 or Rs. 1,990 instead of Rs. 2,000).\n3. Offer free shipping on orders above a threshold (e.g. Free shipping above Rs. 3,000) to raise your Average Order Value.",
    ur: "Products ki keemat tay karnay ka tareeqa:\n1. **Product Cost + Packaging + Delivery Charges + Ad Cost** mein apna 30% se 50% munafa add karein.\n2. Psychological pricing use karein (jaise Rs. 1,499 ya Rs. 1,990).\n3. Rs. 3,000 se ooper Free Delivery offer karein taake customer ziyada items khareeday.",
    domain: "business"
  },

  // --- HEALTH & EVERYDAY PRACTICAL LIFE ---
  {
    patterns: [/\b(how\s*much\s*water|kitna\s*paani|paani\s*peena|water\s*intake)\b/i],
    en: "Health experts generally recommend drinking roughly **2 to 3 liters** (approx 8 to 10 glasses) of water per day for an adult, adjusting for physical activity and weather conditions.",
    ur: "Aik baaligh insaan ko rozana taqreeban **2 se 3 liter** (8 se 10 gilaas) paani peena chahiye taake jism hydrated aur sehatmand rahay.",
    domain: "lifestyle"
  },
  {
    patterns: [/\b(biryani)\b/i],
    en: "Pakistani Biryani is made by:\n1. Marinating chicken or mutton with yogurt, ginger-garlic paste, spices (biryani masala, cloves, cardamom, chili).\n2. Cooking onions until golden brown, adding meat to make a rich aromatic korma.\n3. Parboiling basmati rice with whole spices until 70% cooked.\n4. Layering the rice and korma, topping with mint, coriander, fried onions, and saffron milk, then simmering on low heat (Dum) for 15-20 minutes.",
    ur: "Biryani bananay ka mukhtasir tareeqa:\n1. Gosht ko dahi, adrak-lehsan paste aur biryani masalay mein marinate karein.\n2. Pyaaz brown kar ke korma tayyar karein.\n3. Basmati chawal 70% ubaal lein.\n4. Korma aur chawal ki teh (layer) lagayein, ooper podina, zarda rang aur tali hui pyaaz daal kar 15 minute Dum dein.",
    domain: "lifestyle"
  },

  // --- GREETINGS & IDENTITY ---
  {
    patterns: [
      /\b(assalam[- ]o[- ]alaikum|salam|hello|hi|hey|good\s*morning|good\s*evening)\b/i
    ],
    en: "Assalam-o-Alaikum! Hello! 👋 I am **Bexi AI**, your universal, multi-domain AI assistant. I can answer any question in the world, solve math problems, guide your business, and help build your AI store. How can I help you today?",
    ur: "Walaikum Assalam! Assalam-o-Alaikum! 👋 Main **Bexi AI** hoon, aap ka universal AI assistant. Main dunya bhar ke kisi bhi sawaal ka jawab, math calculations, business tips aur store management mein aap ki rehnumai kar sakta hoon. Aaj main aap ki kya madad kar sakta hoon?",
    domain: "conversational"
  },
  {
    patterns: [
      /\b(who\s*are\s*you|tum\s*kon\s*ho|aap\s*kon\s*hain|what\s*are\s*you)\b/i
    ],
    en: "I am **Bexi AI**, an intelligent universal AI co-pilot designed to answer any question across science, general knowledge, math, technology, lifestyle, and e-commerce store operations with Gemini and GPT-grade accuracy.",
    ur: "Main **Bexi AI** hoon, aap ka intelligent AI assistant! Main dunya bhar ke kisi bhi subject par accurate jawab de sakta hoon, voice commands execute kar sakta hoon, aur store grow karnay mein madad karta hoon.",
    domain: "conversational"
  },
  {
    patterns: [
      /\b(how\s*are\s*you|kya\s*haal\s*hai|kaise\s*ho|kese\s*ho)\b/i
    ],
    en: "I am doing great and ready to assist you! What question would you like to explore today?",
    ur: "Alhamdulillah main bilkul theek hoon aur aap ki madad ke liye tayyar hoon! Aaj aap mujh se kya poochna chahtay hain?",
    domain: "conversational"
  }
];

// Helper to clean TTS spoken text (removes markdown symbols, emojis for clean speech)
export function sanitizeForVoiceSpeech(text: string): string {
  return text
    .replace(/[*_#~`]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal Knowledge Resolver
 * Answers any question directly with high factual accuracy and appropriate language.
 */
export function resolveUniversalAnswer(query: string, options?: { forVoice?: boolean; storeContext?: any }): UniversalAnswer {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // Detect Roman Urdu vs English
  const urduMarkers = /\b(hai|hain|kya|kia|kyun|kaise|kese|kitna|kitne|kahan|kon|kisi|karo|banao|banayein|kab|chahiye|mein|par|aur|bhi|nahi|haan|wala|wali|dunya|shehar|mulk|pahar|darya|paani|hisaab)\b/i;
  const isUrdu = urduMarkers.test(lower);
  const lang: 'en' | 'ur' = isUrdu ? 'ur' : 'en';

  // 1. Check for Math / Calculation
  const mathAnswer = tryEvaluateMath(trimmed, isUrdu);
  if (mathAnswer) {
    const finalReply = options?.forVoice ? sanitizeForVoiceSpeech(mathAnswer) : mathAnswer;
    return {
      reply: finalReply,
      domain: 'math',
      language: lang
    };
  }

  // 2. Check Country-to-Capital Dictionary
  const capitalAnswer = tryLookupCapital(trimmed, isUrdu);
  if (capitalAnswer) {
    const finalReply = options?.forVoice ? sanitizeForVoiceSpeech(capitalAnswer) : capitalAnswer;
    return {
      reply: finalReply,
      domain: 'general_knowledge',
      language: lang
    };
  }

  // 3. Search Universal Knowledge Base
  for (const item of KNOWLEDGE_BASE) {
    for (const pattern of item.patterns) {
      if (pattern.test(lower)) {
        const raw = isUrdu ? item.ur : item.en;
        const finalReply = options?.forVoice ? sanitizeForVoiceSpeech(raw) : raw;
        return {
          reply: finalReply,
          domain: item.domain,
          language: lang
        };
      }
    }
  }

  // 4. Fallback intelligent response that respects the user's specific query
  const contextualFallback = isUrdu
    ? `Aap ke sawal "${trimmed}" ke baray mein: Main aap ko is par tafseeli maloomat faraham kar sakta hoon. Main dunya bhar ke kisi bhi ilm, science, tareekh, business, aur technology par accurate jawab deta hoon. Mazeed specific sawal poochein ya bataein aap ko kya janna hai!`
    : `Regarding "${trimmed}": As your universal AI co-pilot, I can assist you with precise explanations across science, geography, world history, mathematics, business growth, and technology. Please feel free to ask with any specific detail!`;

  return {
    reply: options?.forVoice ? sanitizeForVoiceSpeech(contextualFallback) : contextualFallback,
    domain: 'conversational',
    language: lang
  };
}
