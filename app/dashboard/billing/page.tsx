import Link from "next/link";

export default function DashboardBillingPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Billing</h2>
      <p className="text-[var(--dash-muted)] mt-2">
        Payment for an order is completed securely through Stripe Checkout.
      </p>

      <div className="mt-8 max-w-2xl border border-[var(--dash-border)] rounded-2xl p-6 bg-[var(--dash-surface)]">
        <h3 className="text-lg font-semibold">How payment works</h3>
        <p className="text-[var(--dash-muted)] mt-3 text-sm leading-6">
          Published gig packages are charged at the listed package price. For a custom project or an agreed installment, Flowbridge sends you an offer in your inbox; you can review the scope and amount there, then pay that offer through Stripe Checkout.
        </p>
        <p className="text-[var(--dash-muted)] mt-3 text-sm leading-6">
          Flowbridge does not store your card details on this site. Stripe handles the payment securely.
        </p>
        <Link href="/dashboard/orders" className="mt-5 inline-flex text-sm font-semibold underline">
          View your orders
        </Link>
        </div>
    </section>
  );
}
