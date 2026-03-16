import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ package?: string; id?: string } | undefined>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function CheckoutSlugRedirect({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const id = resolvedSearchParams?.id?.trim();
  const pkg = resolvedSearchParams?.package?.trim();

  const next = new URLSearchParams();
  if (id) next.set("id", id);
  if (pkg) next.set("package", pkg);

  redirect(`/checkout${next.toString() ? `?${next.toString()}` : ""}`);
}
