import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";

export const revalidate = 0;

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params) {
  const { data: item } = await supabasePublic
    .from("case_studies")
    .select("title,summary")
    .eq("slug", params.slug)
    .single();

  if (!item) {
    return { title: "Case Study" };
  }

  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function CaseStudyDetailPage({ params }: Params) {
  const { data: item } = await supabasePublic
    .from("case_studies")
    .select("title,summary,industry,body,cover_url,results")
    .eq("slug", params.slug)
    .single();

  if (!item) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Case study not found</h1>
          <p className="mt-4 text-slate-600">
            This case study is not available. Browse all case studies instead.
          </p>
          <Link
            href="/case-studies"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            View case studies →
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = item.body
    ? item.body
        .split("\n")
        .map((entry: string) => entry.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="bg-white text-slate-900">
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Case Study
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">{item.title}</h1>
          {item.summary ? (
            <p className="text-lg text-slate-200 max-w-3xl">{item.summary}</p>
          ) : null}
          {item.industry ? (
            <p className="text-sm text-slate-400">Industry: {item.industry}</p>
          ) : null}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">
          <div className="aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden">
            {item.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                Cover image
              </div>
            )}
          </div>

          {item.results?.length ? (
            <div>
              <h2 className="text-2xl font-semibold">Results</h2>
              <ul className="mt-4 space-y-3 text-slate-600 list-disc list-inside">
                {item.results.map((result: string) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {paragraphs.length ? (
            <div className="space-y-4 text-slate-600 leading-relaxed">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">
              Detailed case study narrative will be added soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
