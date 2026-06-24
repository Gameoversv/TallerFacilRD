import { ReceptionWizard } from "@/components/receptions/ReceptionWizard";

export default function NuevaRecepcionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva recepción</h1>
      <ReceptionWizard />
    </div>
  );
}
