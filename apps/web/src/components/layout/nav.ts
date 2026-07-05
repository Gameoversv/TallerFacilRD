import {
  Banknote,
  BarChart3,
  BellRing,
  Car,
  ClipboardList,
  HandCoins,
  HardHat,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operación",
    items: [
      { href: "/recepciones", label: "Recepción", icon: ClipboardList },
      { href: "/ordenes", label: "Órdenes de trabajo", icon: Wrench },
      { href: "/vehiculos", label: "Vehículos", icon: Car },
      { href: "/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Inventario",
    items: [
      { href: "/inventario", label: "Inventario", icon: Package },
      { href: "/compras", label: "Compras", icon: ShoppingCart },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/facturas", label: "Facturas", icon: ReceiptText },
      { href: "/cuentas-cobrar", label: "Cuentas x Cobrar", icon: HandCoins },
      { href: "/caja", label: "Caja", icon: Banknote },
    ],
  },
  {
    label: "Equipo",
    items: [{ href: "/empleados", label: "Empleados", icon: HardHat }],
  },
  {
    label: "Análisis",
    items: [
      { href: "/reportes", label: "Reportes", icon: BarChart3 },
      { href: "/recordatorios", label: "Recordatorios", icon: BellRing },
    ],
  },
  {
    label: "Cuenta",
    items: [{ href: "/mi-cuenta", label: "Mi cuenta", icon: UserCog }],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
