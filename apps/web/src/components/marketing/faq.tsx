import { ChevronDown } from "lucide-react";

import { MARKETING } from "./constants";

const FAQS = [
  {
    question: "¿Y no es caro?",
    answer: `¿Cuánto perdió el mes pasado en un reclamo o en una cuenta que no cobró? WorkshopTrack cuesta menos de ${MARKETING.pricePerDay} al día y se paga solo.`,
  },
  {
    question: "Yo no sé mucho de computadora",
    answer:
      "Es fácil. Se lo dejamos configurado y le enseñamos a usted y a su equipo. Si sabe usar WhatsApp, sabe usar esto.",
  },
  {
    question: "Ya llevo todo en mi cuaderno",
    answer:
      "El cuaderno no le avisa cuándo le toca mantenimiento al cliente ni quién le debe. WorkshopTrack sí.",
  },
  {
    question: "¿Y si se va la luz o el internet?",
    answer:
      "Corre en la nube: entra desde el celular con sus datos. No depende de una computadora en el taller.",
  },
  {
    question: "Déjeme pensarlo",
    answer:
      "Pruébelo gratis 15 días con los carros reales de su taller, sin tarjeta. Si no le sirve, no paga nada.",
  },
] as const;

export function Faq() {
  return (
    <section id="preguntas" className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Preguntas de taller
        </h2>

        <div className="mt-10 flex flex-col gap-3 lg:mt-14">
          {FAQS.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-border bg-card px-6 py-5 open:pb-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-semibold text-foreground marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-pretty text-base text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
