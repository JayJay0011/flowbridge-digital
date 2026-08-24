import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-bitrix-sdr-showcase";
const bucket = "public-assets";

function loadEnvironment(file) {
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadEnvironment(path.join(projectDirectory, ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials in .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const desktopRoot = "/Users/akin/Desktop";

const studies = [
  {
    slug: "bitrix24-sdr-lead-workflow-automation",
    title: "Bitrix24 SDR Lead Workflow Automation",
    industry: "Sales Development Automation",
    summary:
      "A Bitrix24 lead workflow automation for SDR routing, callback requests, no-answer handling, meeting-prep tasks, disqualification paths, bad-data handling, and DNC controls.",
    body:
      "This Bitrix24 project organized SDR lead processing inside a lead workflow template. The workflow branches leads by condition, creates meeting-prep tasks, moves leads through meeting scheduled and engaged follow-up stages, handles callback requests, no-answer outcomes, bad data, disqualified leads, and do-not-call paths. It gives sales operations a repeatable CRM process instead of relying on manual status updates.",
    results: [
      "SDR lead outcomes were mapped into repeatable Bitrix24 workflow branches",
      "Callback, no-answer, bad-data, disqualified, and DNC paths were structured inside the CRM",
      "Meeting-prep and follow-up actions were connected to lead-stage movement",
    ],
    sections: [
      {
        title: "The SDR Workflow Problem",
        items: [
          "Lead outcomes needed to be handled consistently across SDR activity",
          "Callback requests, no-answer leads, and follow-up stages needed structured routing",
          "Bad-data, disqualified, and do-not-call records needed clear exception paths",
          "Meeting-prep and handover tasks needed to be triggered from CRM stage movement",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Lead Workflow Template",
            body: "Bitrix24 lead workflow logic routes SDR records through condition branches based on sales activity outcomes.",
          },
          {
            title: "Stage Movement Rules",
            body: "Leads can move through meeting scheduled, engaged follow-up, disqualified, callback, and exception paths.",
          },
          {
            title: "Task Creation",
            body: "Meeting-prep and follow-up actions are created directly from the CRM workflow instead of being tracked manually.",
          },
          {
            title: "Exception Handling",
            body: "No-answer, bad-data, invalid-contact, and do-not-call logic keep the lead pipeline cleaner for SDR follow-up.",
          },
        ],
      },
      {
        title: "Operational Outcome",
        body:
          "The setup gives the sales team a structured Bitrix24 SDR process for routing leads, triggering tasks, and keeping lead statuses aligned with real follow-up outcomes.",
      },
    ],
    assets: [
      {
        source: `${desktopRoot}/SDR Workflow.png`,
        name: "bitrix24-sdr-workflow.webp",
        cropTop: 0,
      },
      {
        source: `${desktopRoot}/SDR Automation Bitrix24.png`,
        name: "bitrix24-sdr-automation-template.webp",
        cropTop: 0,
      },
    ],
  },
];

function watermarkSvg(width, height) {
  const marks = [];
  const stepX = 420;
  const stepY = 260;
  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      marks.push(
        `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#0f172a" fill-opacity="0.11" transform="rotate(-32 ${x} ${y})">Flowbridge Digital</text>`
      );
    }
  }
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${marks.join("")}</svg>`);
}

async function preparePublicImage(asset, slug) {
  const meta = await sharp(asset.source).metadata();
  const cropTop = Math.min(asset.cropTop ?? 0, Math.max(0, (meta.height ?? 0) - 200));
  const width = meta.width ?? 1600;
  const height = Math.max(200, (meta.height ?? 1000) - cropTop);
  const outputPath = path.join(outputDirectory, slug, asset.name);

  await mkdir(path.dirname(outputPath), { recursive: true });

  const baseImage = await sharp(asset.source)
    .extract({ left: 0, top: cropTop, width, height })
    .resize({ width: 1600, withoutEnlargement: false })
    .toBuffer({ resolveWithObject: true });

  await sharp(baseImage.data)
    .composite([
      {
        input: watermarkSvg(baseImage.info.width, baseImage.info.height),
        gravity: "northwest",
      },
    ])
    .webp({ quality: 84 })
    .toFile(outputPath);

  return outputPath;
}

async function uploadMedia(localPath, remotePath) {
  const content = readFileSync(localPath);
  const { error } = await supabase.storage.from(bucket).upload(remotePath, content, {
    cacheControl: "3600",
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(remotePath).data.publicUrl;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const study of studies) {
  console.log(`Preparing ${study.slug}...`);
  const urls = [];
  for (const asset of study.assets) {
    console.log(`Processing ${asset.name}`);
    const localPath = await preparePublicImage(asset, study.slug);
    const remotePath = `admin-media/showcase/${study.slug}/${asset.name}`;
    console.log(`Uploading ${remotePath}`);
    urls.push(await uploadMedia(localPath, remotePath));
  }

  const coverUrl = urls[0];
  const galleryUrls = urls.slice(1);

  const { error: caseStudyError } = await supabase.from("case_studies").upsert(
    {
      title: study.title,
      slug: study.slug,
      summary: study.summary,
      industry: study.industry,
      body: study.body,
      cover_url: coverUrl,
      gallery_urls: galleryUrls,
      content_sections: study.sections,
      results: study.results,
      status: "published",
    },
    { onConflict: "slug" }
  );
  if (caseStudyError) throw caseStudyError;

  const { error: portfolioError } = await supabase.from("portfolio").upsert(
    {
      title: study.title,
      slug: study.slug,
      summary: study.summary,
      cover_url: coverUrl,
      gallery_urls: galleryUrls,
      outcomes: study.results,
      case_study_slug: study.slug,
      status: "published",
    },
    { onConflict: "slug" }
  );
  if (portfolioError) throw portfolioError;

  console.log(`Published ${study.slug}`);
}

const slugs = studies.map((study) => study.slug);
const { data: caseStudies, error: caseStudyCheckError } = await supabase
  .from("case_studies")
  .select("slug,status,cover_url")
  .in("slug", slugs)
  .order("slug");
if (caseStudyCheckError) throw caseStudyCheckError;

const { data: portfolio, error: portfolioCheckError } = await supabase
  .from("portfolio")
  .select("slug,status,cover_url,case_study_slug")
  .in("slug", slugs)
  .order("slug");
if (portfolioCheckError) throw portfolioCheckError;

console.log("Case studies:", caseStudies);
console.log("Portfolio:", portfolio);
console.log(`Published ${studies.length} Bitrix24 SDR portfolio and case-study pair.`);
