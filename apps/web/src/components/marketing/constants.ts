const WHATSAPP_NUMBER = "18296321220";
const WHATSAPP_TEXT = "Hola, quiero información de WorkshopTrack para mi taller.";

export const MARKETING = {
  brandName: "WorkshopTrack",
  priceMonthly: "RD$2,500",
  pricePerDay: "RD$85",
  trialDays: 15,
  registerHref: "/register",
  loginHref: "/login",
  portalHref: "/portal",
  whatsappHref: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
  whatsappDisplay: "829-632-1220",
  ctaPrimaryLabel: "Prueba gratis 15 días",
  ctaSecondaryLabel: "Escríbanos por WhatsApp",
} as const;
