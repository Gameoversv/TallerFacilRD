import type { Metadata } from "next";

import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Modules } from "@/components/marketing/modules";
import { MoneyPunches } from "@/components/marketing/money-punches";
import { Pains } from "@/components/marketing/pains";
import { Pricing } from "@/components/marketing/pricing";

export const metadata: Metadata = {
  title: "GarageFlow — Deje de perder plata en su taller",
  description:
    "Software para talleres automotrices en República Dominicana: recepción con foto y firma, órdenes de trabajo, facturación con ITBIS, cuentas por cobrar y más. Prueba gratis 15 días.",
};

export default function LandingPage() {
  return (
    <main id="inicio" className="flex-1">
      <Hero />
      <Pains />
      <MoneyPunches />
      <Modules />
      <HowItWorks />
      <Pricing />
      <Faq />
      <FinalCta />
    </main>
  );
}
