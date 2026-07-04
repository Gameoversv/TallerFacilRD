export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-svh flex-col bg-background">{children}</div>;
}
