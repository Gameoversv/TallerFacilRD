"use client";

import { useState } from "react";
import { useUserSearch } from "@/hooks/useSuperAdmin";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import Link from "next/link";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const { data, isLoading } = useUserSearch(email);

  const users = data?.data?.content ?? [];
  const total = data?.data?.total_elements ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">WorkshopTrack HQ</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Búsqueda de usuarios</h1>
        <p className="text-sm text-muted-foreground">Busca usuarios a través de todos los talleres</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por email…"
          className="pl-9"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {email.length < 2 ? (
        <p className="text-sm text-muted-foreground">Escribe al menos 2 caracteres para buscar.</p>
      ) : (
        <>
          {total > 0 && <p className="text-xs text-muted-foreground">{total} resultado{total > 1 ? "s" : ""}</p>}
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Nombre", "Email", "Rol", "Taller", "Estado"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}</tr>
                  ))
                  : users.length === 0
                    ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Sin resultados</td></tr>
                    : users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          {u.tenant_id ? (
                            <Link href={`/super-admin/talleres/${u.tenant_id}`} className="text-xs text-primary hover:underline font-mono">
                              {u.tenant_id.slice(0, 8)}…
                            </Link>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${u.active ? "text-emerald-400" : "text-rose-400"}`}>
                            {u.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
