"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/login?taller=${slug}`);
  }, [router, slug]);

  return null;
}
