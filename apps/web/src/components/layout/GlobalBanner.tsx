"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "dismissed-announcement";

function getDismissedId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DISMISSED_KEY);
}

function setDismissedId(id: string): void {
  localStorage.setItem(DISMISSED_KEY, id);
}

export default function GlobalBanner() {
  const { data } = useAnnouncement();
  const [dismissedId, setLocalDismissedId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalDismissedId(getDismissedId());
  }, []);

  const announcement = data?.data;
  if (!announcement || !announcement.active) return null;

  const currentId = `${announcement.id}:${announcement.updated_at}`;
  if (dismissedId === currentId) return null;

  const isWarning = announcement.level === "WARNING";

  function handleDismiss() {
    setDismissedId(currentId);
    setLocalDismissedId(currentId);
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 border-b px-4 py-2.5 text-sm sm:items-center",
        isWarning
          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
          : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
      )}
      <p className="min-w-0 flex-1 break-words">{announcement.message}</p>
      <button
        onClick={handleDismiss}
        aria-label="Cerrar anuncio"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
