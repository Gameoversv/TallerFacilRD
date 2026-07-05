"use client";

import { useEffect, useState } from "react";
import { Megaphone, AlertTriangle, Info } from "lucide-react";
import { useAdminAnnouncement, useSaveAnnouncement } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MAX_MESSAGE_LENGTH = 500;

type Level = "INFO" | "WARNING";

export default function AnuncioPage() {
  const { data, isLoading } = useAdminAnnouncement();
  const saveAnnouncement = useSaveAnnouncement();

  const [message, setMessage] = useState("");
  const [level, setLevel] = useState<Level>("INFO");
  const [active, setActive] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const announcement = data?.data;
    if (!announcement) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(announcement.message);
    setLevel(announcement.level);
    setActive(announcement.active);
  }, [data]);

  async function handleSave() {
    setSaved(false);
    await saveAnnouncement.mutateAsync({ message, level, active });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const isValid = message.trim().length > 0 && message.length <= MAX_MESSAGE_LENGTH;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">WorkshopTrack HQ</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Anuncio global</h1>
        <p className="text-sm text-muted-foreground">
          Muestra un banner a todos los talleres en su panel principal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="announcement-message">Mensaje</Label>
              <span
                className={cn(
                  "text-xs",
                  message.length > MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <textarea
              id="announcement-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={4}
              placeholder="Escribe el mensaje que verán los talleres…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-level">Nivel</Label>
            <select
              id="announcement-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="INFO">Informativo</option>
              <option value="WARNING">Advertencia</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            Activo (visible para los talleres)
          </label>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={!isValid || saveAnnouncement.isPending}>
              {saveAnnouncement.isPending ? "Guardando…" : "Guardar"}
            </Button>
            {saved && <span className="text-xs text-emerald-400">Guardado</span>}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vista previa
          </h2>
          {active && message.trim().length > 0 ? (
            <BannerPreview message={message} level={level} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              El banner no se mostrará mientras esté inactivo o el mensaje esté vacío.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BannerPreview({ message, level }: { message: string; level: Level }) {
  const isWarning = level === "WARNING";
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        isWarning
          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
          : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p className="min-w-0 break-words">{message}</p>
      <Megaphone className="ml-auto mt-0.5 h-4 w-4 shrink-0 opacity-50" />
    </div>
  );
}
