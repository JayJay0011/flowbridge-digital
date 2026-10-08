import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ package?: string; id?: string; canceled?: string } | undefined>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function CheckoutSlugRedirect({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const id = resolvedSearchParams?.id?.trim();
  const pkg = resolvedSearchParams?.package?.trim();
  const canceled = resolvedSearchParams?.canceled?.trim();

  const next = new URLSearchParams();
  if (id) next.set("id", id);
  if (pkg) next.set("package", pkg);
  if (canceled === "1") next.set("canceled", canceled);

  redirect(`/checkout${next.toString() ? `?${next.toString()}` : ""}`);
}
