import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GarageFlow — Deje de perder plata en su taller",
  description:
    "Software para talleres automotrices en República Dominicana: recepción con foto y firma, órdenes de trabajo, facturación con ITBIS, cuentas por cobrar y más. Prueba gratis 15 días.",
};

export default function LandingPage() {
  return <main id="inicio" className="flex-1" />;
}
