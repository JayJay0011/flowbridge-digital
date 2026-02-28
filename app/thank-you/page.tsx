export default function ThankYouPage() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center bg-white p-10 rounded-2xl shadow-md">

        <div className="text-5xl mb-6">✅</div>

        <h1 className="text-3xl font-semibold mb-4">
          Consultation Request Submitted
        </h1>

        <p className="text-slate-600 mb-6">
          Thank you for your submission.  
          Our team will review your details and reach out within 24 hours.
        </p>

        <a
          href="/"
          className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Return to Home
        </a>

      </div>
    </main>
  );
}
