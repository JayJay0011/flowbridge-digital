import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-make-pipedrive-showcase";
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

const makeRoot = "/Users/akin/Desktop/Make.com Projects";

const studies = [
  {
    slug: "make-pipedrive-disconnected-signal-handler",
    title: "Make.com Pipedrive Disconnected Signal Handler",
    industry: "CRM Operations Automation",
    summary:
      "A Make.com scenario that responds to disconnected call signals, checks Pipedrive contact status, updates CRM records, creates notes, and alerts Slack channels.",
    body:
      "This workflow handles disconnected call events by routing the webhook payload through Pipedrive lookup and update paths. It checks whether the person exists, updates phone status, creates CRM notes, and sends Slack messages to the correct channel so missed or disconnected call activity does not sit unnoticed.",
    results: [
      "Disconnected call signals are captured from a Make.com webhook",
      "Pipedrive person records are searched and updated based on routing logic",
      "CRM notes and Slack alerts are created from the same operational path",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Disconnected call activity needed to trigger an operational response",
          "Pipedrive records had to be checked before updating person status",
          "The team needed Slack visibility without manually inspecting every call event",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Webhook Intake",
            body: "Make.com receives the call disconnect event and starts the routing workflow.",
          },
          {
            title: "Pipedrive Lookup",
            body: "The scenario searches Pipedrive for the matching person record before applying updates.",
          },
          {
            title: "CRM Update",
            body: "Person phone status and CRM notes are updated depending on the route outcome.",
          },
          {
            title: "Slack Alert",
            body: "Slack messages notify the correct channel when call events need attention.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${makeRoot}/Make Automation.png`,
        name: "disconnected-signal-full-flow.webp",
        cropTop: 72,
      },
      {
        source: `${makeRoot}/Make.com.png`,
        name: "disconnected-signal-routing.webp",
        cropTop: 72,
      },
      {
        source: `${makeRoot}/Pipedrive to Slack Automation.png`,
        name: "pipedrive-to-slack-path.webp",
        cropTop: 72,
      },
    ],
  },
  {
    slug: "make-pipedrive-contact-notes-deal-timeline",
    title: "Make.com Pipedrive Contact Notes to Deal Timeline",
    industry: "CRM Data Sync",
    summary:
      "A scheduled Make.com workflow that watches Pipedrive notes, finds matching people and deals, syncs notes into deal timelines, and alerts Slack.",
    body:
      "This automation keeps Pipedrive deal timelines aligned with contact-level notes. The scenario watches new notes, retrieves the related person, searches matching deals, routes by match count, creates synced deal notes where needed, and sends Slack updates so important CRM context is not trapped only on the contact record.",
    results: [
      "Pipedrive notes are watched on a schedule",
      "Related people and deals are matched before timeline updates are created",
      "Deal timeline notes and Slack notifications are generated through Make.com",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Important contact notes could remain disconnected from the related deal timeline",
          "The workflow needed to search people and deals before creating synced notes",
          "The team needed alerts when CRM context was copied into the deal workflow",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Note Watcher",
            body: "Make.com watches Pipedrive notes on a recurring schedule.",
          },
          {
            title: "Person and Deal Matching",
            body: "The scenario retrieves the related person and searches for matching deals.",
          },
          {
            title: "Timeline Sync",
            body: "Matching routes create deal notes so context appears where the sales team works.",
          },
          {
            title: "Slack Update",
            body: "Slack is notified when the note sync process produces an operational update.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${makeRoot}/Make Automation Subscription Automation.png`,
        name: "contact-notes-to-deal-timeline.webp",
        cropTop: 72,
      },
      {
        source: `${makeRoot}/Pipedrive Automation.png`,
        name: "pipedrive-note-sync-route.webp",
        cropTop: 72,
      },
    ],
  },
  {
    slug: "make-pipedrive-stage-change-outreach-automation",
    title: "Make.com Pipedrive Stage Change and Outreach Automation",
    industry: "Sales Workflow Automation",
    summary:
      "A Make.com automation set for Pipedrive stage-change follow-up tasks and day-based outreach sequencing.",
    body:
      "This automation work connects Pipedrive stage movement with follow-up actions and multi-day outreach. One workflow watches deals and creates the right Pipedrive activities or Slack alerts based on stage conditions. Another workflow uses stored sequence records, retrieves Pipedrive organization context, routes by sequence day, sends day-one to day-three outreach messages, and updates the outreach records.",
    results: [
      "Pipedrive stage changes trigger specific follow-up activities and alerts",
      "Outreach records route into day-one, day-two, and day-three message paths",
      "Sequence records are updated after each outreach action runs",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Deal stage changes needed the right follow-up action without manual checking",
          "Outreach sequences had to move through day-based paths",
          "Pipedrive context and outreach records needed to stay synchronized",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Stage Trigger",
            body: "Pipedrive deal movement starts follow-up routes based on the current stage.",
          },
          {
            title: "Activity Creation",
            body: "The workflow creates relevant Pipedrive activities for offer, contract, and underwriting paths.",
          },
          {
            title: "Outreach Routing",
            body: "Sequence-day rules choose the correct day-one to day-three outreach message.",
          },
          {
            title: "Record Update",
            body: "Data-store records are updated after messages are sent so the journey can continue cleanly.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${makeRoot}/Pipedrive CRM Automation.png`,
        name: "stage-change-task-creation.webp",
        cropTop: 72,
      },
      {
        source: `${makeRoot}/Make.com Users Journey Automation.png`,
        name: "day-one-to-three-outreach.webp",
        cropTop: 72,
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
console.log(`Published ${studies.length} Make/Pipedrive portfolio and case-study pairs.`);
