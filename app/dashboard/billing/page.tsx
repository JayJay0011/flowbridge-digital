export default function DashboardBillingPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Billing</h2>
      <p className="text-[var(--dash-muted)] mt-2">
        Add a payment method and manage invoices here.
      </p>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="border border-[var(--dash-border)] rounded-2xl p-6 bg-[var(--dash-surface-2)]">
          <h3 className="text-lg font-semibold">Add billing details</h3>
          <p className="text-[var(--dash-muted)] mt-2 text-sm">
            Cards will be stored securely via Stripe (integration coming next).
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Cardholder name</label>
              <input
                type="text"
                placeholder="Akin Johnson"
                className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Card number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Expiry</label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <button className="mt-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
              Save billing method
            </button>
          </div>
        </div>

        <div className="border border-[var(--dash-border)] rounded-2xl p-6 bg-[var(--dash-surface)]">
          <h3 className="text-lg font-semibold">Saved payment methods</h3>
          <p className="text-[var(--dash-muted)] mt-2 text-sm">
            No cards on file yet.
          </p>
          <div className="mt-4 border border-dashed border-[var(--dash-border)] rounded-xl p-4 text-sm text-[var(--dash-muted)]">
            Once Stripe is connected, your saved cards will appear here with
            last-4 and expiration.
          </div>
        </div>
      </div>
    </section>
  );
}
