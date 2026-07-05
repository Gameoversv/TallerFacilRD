"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ResetPasswordResult {
  email: string;
  temporaryPassword: string;
}

interface ResetPasswordDialogProps {
  result: ResetPasswordResult | null;
  onClose: () => void;
}

export function ResetPasswordDialog({ result, onClose }: ResetPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={!!result}
      onOpenChange={(open) => {
        if (!open) {
          setCopied(false);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contraseña temporal generada</DialogTitle>
          <DialogDescription>
            {result && (
              <>
                Nueva contraseña para <span className="font-medium text-foreground">{result.email}</span>.
                {" "}Esta contraseña solo se muestra una vez — cópiala y compártela de forma segura.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <code className="flex-1 select-all break-all font-mono text-sm">
            {result?.temporaryPassword}
          </code>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
