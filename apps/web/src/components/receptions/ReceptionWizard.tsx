"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateReception,
  useAddReceptionPhoto,
  useAddReceptionSignature,
} from "@/hooks/useReceptions";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerVehicles } from "@/hooks/useVehicles";

const schema = z.object({
  vehicleId: z.string().uuid("Selecciona un vehículo"),
  customerId: z.string().uuid("Selecciona un cliente"),
  entryKm: z.number().int().positive("Kilometraje requerido"),
  reportedProblem: z.string().min(3, "Describe el problema"),
  notes: z.string().optional(),
  scratchesExterior: z.boolean().optional(),
  dentsExterior: z.boolean().optional(),
  lightsExterior: z.boolean().optional(),
  radioInterior: z.boolean().optional(),
  screenInterior: z.boolean().optional(),
  matsInterior: z.boolean().optional(),
  oilLevelMech: z.boolean().optional(),
  coolantMech: z.boolean().optional(),
  batteryMech: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ["Cliente & Vehículo", "Checklist", "Fotos", "Firma", "Confirmar"];

export function ReceptionWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  const createReception = useCreateReception();
  const addPhoto = useAddReceptionPhoto();
  const addSignature = useAddReceptionSignature();
  const { data: customersData } = useCustomers(customerSearch, 0);
  const customers = customersData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scratchesExterior: false, dentsExterior: false, lightsExterior: false,
      radioInterior: false, screenInterior: false, matsInterior: false,
      oilLevelMech: false, coolantMech: false, batteryMech: false,
    },
  });

  const selectedCustomerId = watch("customerId");
  const { data: vehiclesData } = useCustomerVehicles(selectedCustomerId ?? "");
  const vehicles = vehiclesData?.data ?? [];

  // Initialize signature pad when entering step 3
  useEffect(() => {
    if (step !== 3 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const pad = new SignaturePad(canvas, { penColor: "#1e293b" });
    padRef.current = pad;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);
      pad.clear();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
  }, [step]);

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setPhotos((prev) => [...prev, ...files]);
  };

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const clearSignature = () => padRef.current?.clear();

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    if (!padRef.current || padRef.current.isEmpty()) {
      setSignatureError("El cliente debe firmar antes de confirmar.");
      setStep(3);
      return;
    }
    const signatureData = padRef.current.toDataURL("image/png");

    try {
      const result = await createReception.mutateAsync({
        vehicle_id: data.vehicleId,
        entry_km: data.entryKm,
        reported_problem: data.reportedProblem,
        notes: data.notes,
        checklist: {
          exterior: {
            scratches: data.scratchesExterior,
            dents: data.dentsExterior,
            lights: data.lightsExterior,
          },
          interior: {
            radio: data.radioInterior,
            screen: data.screenInterior,
            mats: data.matsInterior,
          },
          mechanical: {
            oil_level: data.oilLevelMech,
            coolant: data.coolantMech,
            battery: data.batteryMech,
          },
        },
      });

      const id = result.data.id;

      for (const photo of photos) {
        await addPhoto.mutateAsync({ id, file: photo });
      }

      await addSignature.mutateAsync({ id, signatureData });

      router.push(`/recepciones/${id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setSubmitError(
        axiosErr?.response?.data?.error ?? axiosErr?.message ?? "Error al crear la recepción"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step
                  ? "bg-secondary text-white"
                  : i === step
                  ? "bg-secondary text-white ring-2 ring-offset-2 ring-ring"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-muted mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Cliente & Vehículo */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Cliente y Vehículo</h2>
            <div className="space-y-1">
              <Label>Buscar cliente</Label>
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Nombre o teléfono..."
              />
            </div>
            {customers.length > 0 && (
              <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setValue("customerId", c.id);
                      setValue("vehicleId", "");
                      setCustomerSearch(`${c.first_name} ${c.last_name}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/40 transition-colors ${
                      watch("customerId") === c.id ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {c.first_name} {c.last_name} — {c.phone}
                  </button>
                ))}
              </div>
            )}
            {errors.customerId && (
              <p className="text-xs text-destructive">{errors.customerId.message}</p>
            )}

            {selectedCustomerId && (
              <div className="space-y-1">
                <Label>Vehículo *</Label>
                {vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Este cliente no tiene vehículos registrados.</p>
                ) : (
                  <select
                    {...register("vehicleId")}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">— Seleccionar vehículo —</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} {v.year}
                        {v.license_plate ? ` (${v.license_plate})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {errors.vehicleId && (
                  <p className="text-xs text-destructive">{errors.vehicleId.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Kilometraje de entrada *</Label>
                <Input
                  {...register("entryKm", { valueAsNumber: true })}
                  type="number"
                  placeholder="52000"
                />
                {errors.entryKm && (
                  <p className="text-xs text-destructive">{errors.entryKm.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Problema reportado por el cliente *</Label>
              <textarea
                {...register("reportedProblem")}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                placeholder="Ej: Ruido en frenos delanteros, luz del motor encendida..."
              />
              {errors.reportedProblem && (
                <p className="text-xs text-destructive">{errors.reportedProblem.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Notas adicionales</Label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                placeholder="Observaciones internas..."
              />
            </div>
          </div>
        )}

        {/* Step 1: Checklist */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-lg">Checklist de inspección</h2>

            <ChecklistGroup label="Exterior">
              <CheckItem label="Rayones" id="scratches" {...register("scratchesExterior")} />
              <CheckItem label="Golpes / abolladuras" id="dents" {...register("dentsExterior")} />
              <CheckItem label="Luces funcionando" id="lights" {...register("lightsExterior")} />
            </ChecklistGroup>

            <ChecklistGroup label="Interior">
              <CheckItem label="Radio / audio" id="radio" {...register("radioInterior")} />
              <CheckItem label="Pantalla / navegación" id="screen" {...register("screenInterior")} />
              <CheckItem label="Alfombras" id="mats" {...register("matsInterior")} />
            </ChecklistGroup>

            <ChecklistGroup label="Mecánico">
              <CheckItem label="Nivel de aceite OK" id="oil" {...register("oilLevelMech")} />
              <CheckItem label="Nivel de coolant OK" id="coolant" {...register("coolantMech")} />
              <CheckItem label="Batería OK" id="battery" {...register("batteryMech")} />
            </ChecklistGroup>
          </div>
        )}

        {/* Step 2: Fotos */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Fotos del vehículo</h2>
            <p className="text-sm text-muted-foreground">
              Sube fotos del frente, atrás, laterales e interior para evitar reclamaciones.
            </p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePhotoDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors cursor-pointer"
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              <p className="text-sm text-muted-foreground">
                Arrastra fotos aquí o haz clic para seleccionar
              </p>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoInput}
              />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((f, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{photos.length} foto(s) seleccionada(s)</p>
          </div>
        )}

        {/* Step 3: Firma */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Firma del cliente</h2>
            <p className="text-sm text-muted-foreground">
              El cliente confirma con su firma que el estado del vehículo descrito es correcto.
            </p>
            <div className="rounded-xl border-2 border-border bg-white overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full touch-none block"
                style={{ height: "200px" }}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Limpiar firma
              </button>
            </div>
            {signatureError && (
              <p className="text-xs text-destructive">{signatureError}</p>
            )}
          </div>
        )}

        {/* Step 4: Confirmar */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Confirmar recepción</h2>
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="font-medium">Cliente:</span> {customerSearch}</p>
              <p><span className="font-medium">Problema:</span> {watch("reportedProblem")}</p>
              <p><span className="font-medium">Km entrada:</span> {watch("entryKm")}</p>
              <p><span className="font-medium">Fotos:</span> {photos.length}</p>
              <p>
                <span className="font-medium">Firma:</span>{" "}
                {padRef.current && !padRef.current.isEmpty() ? "✓ Capturada" : "⚠ Pendiente"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Al confirmar se creará la recepción, se subirán las fotos y se guardará la firma.
            </p>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <p className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            Atrás
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={async () => {
                if (step === 0) {
                  const customerId = watch("customerId");
                  const vehicleId = watch("vehicleId");
                  const entryKm = watch("entryKm");
                  const reportedProblem = watch("reportedProblem");
                  if (!customerId || !vehicleId || !entryKm || !reportedProblem) {
                    setSubmitError("Completa todos los campos obligatorios: cliente, vehículo, km y problema.");
                    return;
                  }
                  setSubmitError(null);
                }
                if (step === 3) {
                  if (!padRef.current || padRef.current.isEmpty()) {
                    setSignatureError("El cliente debe firmar antes de continuar.");
                    return;
                  }
                  setSignatureError(null);
                }
                setStep((s) => s + 1);
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || createReception.isPending}>
              {isSubmitting || createReception.isPending ? "Guardando..." : "Crear recepción"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ChecklistGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckItem({
  label,
  id,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-input accent-secondary"
        {...props}
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
