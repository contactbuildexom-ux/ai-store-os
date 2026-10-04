export const sendWhatsAppOrder = (
  sellerWhatsAppNumber: string, // Misal ke tor par: "923001234567" (Country code ke sath)
  productName: string,
  price: number,
  customerName: string,
  customerAddress: string
) => {
  // 1. Message format
  const message = `Hello! Main order place karna chahta hoon:%0A%0A*Product:* ${productName}%0A*Price:* Rs. ${price}%0A*Name:* ${customerName}%0A*Address:* ${customerAddress}%0A%0AKindly mera order confirm kar dein!`;

  // 2. WhatsApp Web / App URL
  const whatsappUrl = `https://wa.me/${sellerWhatsAppNumber}?text=${message}`;

  // 3. Open whatsapp in new tab
  window.open(whatsappUrl, '_blank');
};