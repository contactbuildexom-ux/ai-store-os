Buildexom - AI-Powered E-commerce Store BuilderThis repository contains the source code and architecture of the Buildexom platform, where users can build their online store in just a few minutes with the help of AI without any coding.   
📁 Folder Structure DetailsThis structure is followed to keep the folder clean:

├── app/
│   ├── page.tsx                         <-- Main Buildexom Landing Page (All landing sections will be rendered here)
│   ├── api/                             <-- Backend APIs (AI store creation, products, orders & plan limits)
│   ├── stores/                          <-- Customer Public Storefronts ([slug])
│   └── dashboard/                       <-- Store Owner Admin Dashboard (Abeera's workspace)
│
└── components/
    └── landing/                         <-- Modular sections of the Buildexom landing page:
        ├── Navbar.tsx                   <-- Sticky navbar with resources dropdown[cite: 11]
        ├── Hero.tsx                     <-- Hero section with AI prompt box & interactive mockups[cite: 12]
        ├── FeatureStrip.tsx             <-- 4 key features row[cite: 12]
        ├── HowItWorks.tsx               <-- 3 simple steps guide[cite: 12, 13]
        ├── StatsBar.tsx                 <-- Trust stats bar[cite: 13]
        ├── WhyChooseBuildexom.tsx       <-- Core benefits grid[cite: 13, 14]
        ├── Templates.tsx                <-- Ready-made template showcase cards[cite: 14]
        ├── WhatsappOrdering.tsx         <-- WhatsApp checkout showcase[cite: 14]
        ├── QrCodeSection.tsx            <-- Scan & Shop QR code module[cite: 17, 18]
        ├── Pricing.tsx                  <-- Basic, Pro & Business pricing tiers[cite: 14, 15]
        ├── Faq.tsx                      <-- Frequently asked questions accordion[cite: 15, 16]
        ├── FinalCta.tsx                 <-- Final call-to-action banner[cite: 16]
        └── Footer.tsx                   <-- 5-column footer with links and social icons[cite: 19, 20]