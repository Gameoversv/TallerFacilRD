"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useChangePassword } from "@/hooks/useAccount";
import { getUser } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiErrorResponse;
  return apiError.response?.data?.error ?? "Error al cambiar la contraseña";
}

export default function MiCuentaPage() {
  const user = getUser();
  const isOwner = user?.role === "OWNER";

  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function validate(): string | null {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (newPassword !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Contraseña actualizada");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mi cuenta"
        description="Consulta tus datos y administra tu contraseña de acceso."
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos de la cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nombre: </span>
            {user?.name ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Correo: </span>
            {user?.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Rol: </span>
            {user?.role ?? "—"}
          </p>
        </CardContent>
      </Card>

      {isOwner ? (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="text-base">Cambio de contraseña restringido</CardTitle>
            <CardDescription className="text-amber-200/80">
              Como propietario del taller, por seguridad no puedes cambiar tu contraseña
              aquí. Contacta a un super-admin para restablecerla.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {formError && <p className="text-xs text-destructive">{formError}</p>}
              {successMessage && (
                <p className="text-xs text-emerald-500">{successMessage}</p>
              )}

              <Button type="submit" disabled={changePassword.isPending} className="w-full">
                {changePassword.isPending ? "Guardando..." : "Cambiar contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
