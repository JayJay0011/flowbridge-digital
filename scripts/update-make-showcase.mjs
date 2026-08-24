import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-make-showcase";
const bucket = "public-assets";

const oldSlug = "make-freshsales-routing-automation";
const slug = "make-call-logging-summary-automation";

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

const study = {
  slug,
  title: "Make.com Call Logging and Summary Automation",
  industry: "Call Operations Automation",
  summary:
    "A two-phase Make.com automation system for call recording intake, call logging, summary processing, Google Sheets updates, and Slack notifications.",
  body:
    "This Make.com build connects call recording and call summary workflows into one operational process. The first phase receives call recordings, stores files in Google Drive, logs structured call data in Google Sheets, sends Slack notifications, and updates rows after matching records. The second phase receives call summaries, waits for the required processing window, aggregates text, retrieves matching sheet records, calls an HTTP message endpoint, parses the returned data, and updates the tracking sheet and Slack channel.",
  results: [
    "Call recording and call summary events are routed through separate Make.com phases",
    "Google Drive, Google Sheets, HTTP, JSON parsing, text parsing, and Slack actions are coordinated from one workflow system",
    "Call records can be logged, matched, updated, and reported without manual spreadsheet handling",
  ],
  sections: [
    {
      title: "The Workflow Problem",
      items: [
        "Call recordings and summaries needed to be captured without relying on manual spreadsheet updates",
        "The process required file storage, record matching, delayed summary handling, and team notifications",
        "Call activity needed to remain traceable across Google Drive, Google Sheets, and Slack",
      ],
    },
    {
      title: "System Built",
      variant: "light",
      columns: 2,
      items: [
        {
          title: "Call Recording Intake",
          body: "A webhook receives the call recording event and starts the Phase 1 logging workflow.",
        },
        {
          title: "File and Row Handling",
          body: "Recordings are downloaded, stored in Google Drive, and logged into Google Sheets.",
        },
        {
          title: "Summary Processing",
          body: "The Phase 2 workflow waits, aggregates summary text, searches sheet records, and parses returned data.",
        },
        {
          title: "Team Notification",
          body: "Slack messages keep the operations team updated when call logs and summaries move forward.",
        },
      ],
    },
  ],
  assets: [
    {
      source: "/Users/akin/Desktop/Make.com Projects/Call Summaries Automation.png",
      name: "make-call-summaries-phase-two.webp",
      cropTop: 72,
    },
    {
      source: "/Users/akin/Desktop/Make.com Projects/Make.com Call Logging Automation.png",
      name: "make-call-logging-phase-one.webp",
      cropTop: 72,
    },
  ],
};

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

async function preparePublicImage(asset) {
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

async function getPageTwoCreatedAt() {
  const { data, error } = await supabase
    .from("portfolio")
    .select("slug,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const withoutMake = (data ?? []).filter((item) => item.slug !== oldSlug && item.slug !== slug);
  const lastPageOneItem = withoutMake[8];

  if (!lastPageOneItem?.created_at) {
    return "2026-05-01T00:00:00.000Z";
  }

  return new Date(Date.parse(lastPageOneItem.created_at) - 1000).toISOString();
}

async function updateOrInsert(table, payload) {
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("id")
    .in("slug", [oldSlug, slug])
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase.from(table).update(payload).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from(table).insert(payload);
  if (error) throw error;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

console.log("Processing Make.com screenshots...");
const urls = [];
for (const asset of study.assets) {
  console.log(`Processing ${asset.name}`);
  const localPath = await preparePublicImage(asset);
  const remotePath = `admin-media/showcase/${slug}/${asset.name}`;
  console.log(`Uploading ${remotePath}`);
  urls.push(await uploadMedia(localPath, remotePath));
}

const createdAt = await getPageTwoCreatedAt();
const coverUrl = urls[0];
const galleryUrls = urls.slice(1);

await updateOrInsert("case_studies", {
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
  created_at: createdAt,
});

await updateOrInsert("portfolio", {
  title: study.title,
  slug: study.slug,
  summary: study.summary,
  cover_url: coverUrl,
  gallery_urls: galleryUrls,
  outcomes: study.results,
  case_study_slug: study.slug,
  status: "published",
  created_at: createdAt,
});

await supabase.from("portfolio").update({ status: "draft" }).eq("slug", oldSlug);
await supabase.from("case_studies").update({ status: "draft" }).eq("slug", oldSlug);

const { data: portfolioOrder, error: orderError } = await supabase
  .from("portfolio")
  .select("slug,status,created_at")
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .limit(12);
if (orderError) throw orderError;

const { data: makePortfolio, error: portfolioError } = await supabase
  .from("portfolio")
  .select("slug,title,status,cover_url,gallery_urls,case_study_slug,created_at")
  .eq("slug", slug)
  .maybeSingle();
if (portfolioError) throw portfolioError;

const { data: makeCaseStudy, error: caseStudyError } = await supabase
  .from("case_studies")
  .select("slug,title,status,cover_url,gallery_urls,created_at")
  .eq("slug", slug)
  .maybeSingle();
if (caseStudyError) throw caseStudyError;

console.log("Updated Make portfolio:", makePortfolio);
console.log("Updated Make case study:", makeCaseStudy);
console.log("Top published portfolio order:", portfolioOrder);
