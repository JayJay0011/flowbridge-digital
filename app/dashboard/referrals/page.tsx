export default function DashboardReferralsPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Refer a friend</h2>
      <p className="text-[var(--dash-muted)] mt-2">
        Share Flowbridge with your network and earn rewards.
      </p>

      <div className="mt-8 border border-[var(--dash-border)] rounded-2xl p-6 bg-[var(--dash-surface-2)]">
        <h3 className="text-lg font-semibold">Your referral link</h3>
        <p className="text-sm text-[var(--dash-muted)] mt-2">
          Invite new clients and earn service credits.
        </p>
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            value="https://flowbridgedigital.com/referral/your-link"
            readOnly
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm"
          />
          <button className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
            Copy link
          </button>
        </div>
      </div>
    </section>
  );
}
