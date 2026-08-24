import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-n8n-showcase";
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

const desktop = "/Users/akin/Desktop";

const studies = [
  {
    slug: "n8n-crm-lifecycle-dialer-operations-engine",
    title: "n8n CRM Lifecycle and Dialer Operations Engine",
    industry: "CRM Automation",
    summary:
      "A multi-branch n8n operations workflow for CRM and dialer events, contact routing, reminder paths, call outcomes, and operational logging.",
    body:
      "This automation uses n8n as the orchestration layer for CRM lifecycle and dialer activity. The workflow validates incoming events, checks for duplicate records, updates CRM contacts, preserves ownership, schedules appointment reminders, handles call outcomes, and writes operations logs so activity can be tracked from one structured engine.",
    results: [
      "CRM and dialer events are validated before downstream actions run",
      "Duplicate handling, contact ownership, and lead records are managed through workflow logic",
      "Appointment reminders, no-show paths, call outcomes, and operations logs are coordinated from one n8n engine",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "CRM and dialer events needed to be routed through different lifecycle paths",
          "Duplicate lead records and ownership changes had to be controlled before updates",
          "Follow-up reminders, no-show handling, and call outcomes needed a repeatable operations process",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Event Validation",
            body: "Incoming CRM and dialer webhook events are normalized and checked before routing.",
          },
          {
            title: "Contact Handling",
            body: "The workflow searches, creates, or updates CRM contact records depending on the event state.",
          },
          {
            title: "Reminder Logic",
            body: "Appointment confirmation and reminder paths are scheduled around booking windows.",
          },
          {
            title: "Operations Logging",
            body: "Each major path writes a structured operations log so the process stays auditable.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${desktop}/CRM Operations Admin.png`,
        name: "crm-lifecycle-dialer-engine.webp",
        cropTop: 95,
      },
    ],
  },
  {
    slug: "n8n-document-processing-ai-review-pipeline",
    title: "n8n Document Processing and AI Review Pipeline",
    industry: "AI Document Automation",
    summary:
      "A document-processing workflow that retrieves files from Google Drive, extracts PDF and DOCX content, builds an AI review request, and routes outputs by review status.",
    body:
      "This n8n proof of concept turns source documents into structured review outputs. It searches Google Drive, downloads source files, separates PDF and DOCX processing paths, extracts and normalizes text, attaches prompt context, generates an AI assessment, and routes the resulting outputs into review-ready or needs-attention paths.",
    results: [
      "Google Drive files are retrieved and routed by file type",
      "PDF and DOCX content extraction paths are handled separately",
      "AI review outputs are generated, parsed, scored, and routed into the correct delivery path",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Source documents could arrive as different file types",
          "Document text needed to be extracted before AI review could run reliably",
          "Review outputs needed a clear routing path instead of being handled manually",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Drive Intake",
            body: "The workflow searches for source documents in Google Drive and downloads the required file.",
          },
          {
            title: "File-Type Routing",
            body: "PDF and DOCX files go through separate extraction paths that match their structure.",
          },
          {
            title: "AI Review Request",
            body: "Extracted document text is combined with prompt context before the AI assessment step.",
          },
          {
            title: "Output Routing",
            body: "Generated outputs are parsed and sent toward review draft, raw output, or needs-attention storage.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${desktop}/Screenshot 2026-07-29 at 18.35.42.png`,
        name: "document-ai-review-full-flow.webp",
        cropTop: 95,
      },
      {
        source: `${desktop}/Screenshot 2026-07-27 at 20.36.59.png`,
        name: "drive-intake-extraction-start.webp",
        cropTop: 95,
      },
      {
        source: `${desktop}/Screenshot 2026-07-27 at 21.01.20.png`,
        name: "pdf-docx-routing-extraction.webp",
        cropTop: 95,
      },
    ],
  },
  {
    slug: "n8n-review-delivery-tracker-automation",
    title: "n8n Review and Delivery Tracker Automation",
    industry: "Delivery Operations",
    summary:
      "A delivery-operations workflow for review requests, delivery-state validation, approved file handling, delivery receipts, and tracker updates.",
    body:
      "This n8n workflow manages the review and delivery side of an operational process. It validates the review request, checks tracker state, routes by approved or blocked actions, prepares approved delivery files, creates delivery receipts, merges updates, and writes the final tracker state back into the operations system.",
    results: [
      "Review requests are validated before delivery work continues",
      "Approved delivery files and receipts are prepared through a repeatable path",
      "Tracker records are updated so delivery state remains visible",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Review and delivery actions needed clear state checks before execution",
          "Approved drafts had to be handled differently from blocked or already-delivered records",
          "Delivery receipts and tracker updates needed to stay connected to the same process",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Review Validation",
            body: "The workflow reads the tracker record and validates the requested review or delivery action.",
          },
          {
            title: "State Routing",
            body: "Approved, rejected, already delivered, and blocked states are routed separately.",
          },
          {
            title: "Delivery Preparation",
            body: "Approved files are found, validated, prepared, and uploaded through the delivery path.",
          },
          {
            title: "Tracker Update",
            body: "Delivery receipts and final state changes are merged into the tracker record.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${desktop}/Screenshot 2026-07-29 at 18.35.06.png`,
        name: "review-delivery-tracker-flow.webp",
        cropTop: 95,
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
console.log(`Published ${studies.length} n8n portfolio and case-study pairs.`);
