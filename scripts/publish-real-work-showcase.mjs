import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-real-work-showcase";
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

const showcaseRoot = "/Users/akin/Documents/New project/flowbridge-content-import";

const studies = [
  {
    slug: "pipedrive-mailerlite-sales-automation",
    title: "Pipedrive and MailerLite Sales Automation",
    industry: "CRM & Email Automation",
    summary:
      "A Pipedrive-triggered automation system that updates email campaign membership when sales opportunities change stage.",
    body:
      "This workflow connects CRM stage movement with email-list logic so contacts can be moved out of irrelevant campaigns once a deal reaches the right status. The setup reduces manual list cleanup and keeps nurture journeys aligned with the actual sales pipeline.",
    results: [
      "CRM stage changes trigger downstream email workflow updates",
      "MailerLite campaign membership is cleaned up through automation",
      "Sales and follow-up systems stay better aligned",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "CRM stages and email nurture groups were not staying aligned",
          "Contacts could remain in campaigns after their deal status changed",
          "Manual cleanup created room for missed or incorrect follow-up",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Pipedrive Trigger",
            body: "Deal updates initiate the automation when the opportunity reaches the defined stage.",
          },
          {
            title: "Person Lookup",
            body: "The workflow retrieves the associated contact before applying email actions.",
          },
          {
            title: "Conditional Filter",
            body: "Only the right deal movements continue through the campaign cleanup path.",
          },
          {
            title: "MailerLite Update",
            body: "The contact is removed from the relevant campaign groups to avoid mismatched messaging.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${showcaseRoot}/watermarked-showcase/pipedrive-zapier-flow.webp`,
        name: "cover.webp",
        cropTop: 82,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/pipedrive-zap-routing.webp`,
        name: "zap-routing.webp",
        cropTop: 82,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/pipedrive-automation-map.webp`,
        name: "automation-map.webp",
        cropTop: 82,
      },
    ],
  },
  {
    slug: "make-freshsales-routing-automation",
    title: "Make.com Freshsales Routing Automation",
    industry: "RevOps Automation",
    summary:
      "A Make.com scenario that routes CRM activity through filters, routers, and communication actions for cleaner operational follow-up.",
    body:
      "This automation uses Make.com as the orchestration layer between CRM updates, AI/message steps, Google Workspace actions, Slack updates, and downstream records. The result is a structured process that turns CRM events into trackable actions instead of disconnected manual follow-up.",
    results: [
      "CRM activity is routed through a structured Make.com scenario",
      "Branching logic separates follow-up paths",
      "Internal notifications and records are updated from one workflow",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "CRM activity needed different actions depending on context",
          "Follow-up relied on scattered manual checks",
          "The team needed one orchestration layer to coordinate updates",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "CRM Trigger",
            body: "Freshsales activity starts the scenario from a reliable event source.",
          },
          {
            title: "Router Logic",
            body: "Make.com routers split records into the correct operational path.",
          },
          {
            title: "Workspace Updates",
            body: "Google Workspace and internal records are updated from the same workflow.",
          },
          {
            title: "Team Notification",
            body: "Slack and communication steps keep the team informed without manual checking.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${showcaseRoot}/watermarked-showcase/make-freshsales-cover.webp`,
        name: "cover.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/make-freshsales-router.webp`,
        name: "router.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/make-call-logging.webp`,
        name: "call-logging.webp",
        cropTop: 70,
      },
    ],
  },
  {
    slug: "bitrix24-operations-workflow-architecture",
    title: "Bitrix24 Operations Workflow Architecture",
    industry: "CRM Implementation",
    summary:
      "A Bitrix24 CRM structure and automation workflow built to organize company operations, stage movement, and repeatable internal processes.",
    body:
      "This project focused on structuring Bitrix24 around real operational workflows instead of leaving teams with a blank CRM. The work included company structure planning, workflow mapping, and automation logic that helps internal teams keep records moving through a clearer process.",
    results: [
      "Company structure mapped inside Bitrix24",
      "Workflow automation logic documented and configured",
      "Internal process stages made easier to manage",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "The CRM needed a structure that matched the way the business worked",
          "Operational steps were difficult to follow without mapped automation",
          "Teams needed clearer ownership and stage progression",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Company Structure",
            body: "The CRM hierarchy was mapped so users could understand how records should be organized.",
          },
          {
            title: "Automation Blueprint",
            body: "Business process steps were translated into a repeatable Bitrix24 workflow.",
          },
          {
            title: "Stage Logic",
            body: "The workflow supports structured progression from one operational step to another.",
          },
          {
            title: "Process Visibility",
            body: "The system gives administrators a clearer view of how work moves through the CRM.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${showcaseRoot}/watermarked-showcase/bitrix-company-structure-cover.webp`,
        name: "cover.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/bitrix-workflow-map.webp`,
        name: "workflow-map.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked-showcase/bitrix-automation.webp`,
        name: "automation.webp",
        cropTop: 70,
      },
    ],
  },
  {
    slug: "airtable-membership-operations-system",
    title: "Airtable Membership Operations System",
    industry: "Operations Database",
    summary:
      "An Airtable automation and workflow setup that manages membership records, approvals, and record updates from one structured system.",
    body:
      "This Airtable system turns record status changes into automated actions. The setup checks matching records, updates existing entries, creates records when needed, and supports a cleaner membership operations process without forcing every step to be handled manually.",
    results: [
      "Airtable automation responds to record status changes",
      "Record matching and update logic is built into the workflow",
      "Membership operations become easier to maintain from one database",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Membership approvals needed consistent database updates",
          "Record matching had to happen before creating or changing entries",
          "Manual Airtable updates made the process slower and easier to miss",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Status Trigger",
            body: "Airtable starts the automation when a record matches the approval condition.",
          },
          {
            title: "Record Search",
            body: "The workflow checks for an existing record before deciding what to update or create.",
          },
          {
            title: "Conditional Action",
            body: "Different actions run depending on whether a matching record already exists.",
          },
          {
            title: "Database Update",
            body: "The correct Airtable record is updated or created to keep the system consistent.",
          },
        ],
      },
    ],
    assets: [
      {
        source: "/Users/akin/Desktop/Airtable Portfolio/Airtable Automation.jpeg",
        name: "cover.webp",
        cropTop: 74,
      },
      {
        source: "/Users/akin/Desktop/Airtable Portfolio/Button Automation.png",
        name: "button-automation.webp",
        cropTop: 74,
      },
      {
        source: "/Users/akin/Desktop/Airtable Portfolio/Joined Workflow.jpeg",
        name: "joined-workflow.webp",
        cropTop: 74,
      },
    ],
  },
  {
    slug: "zapier-quickbooks-invoice-workflows",
    title: "Zapier and QuickBooks Invoice Workflows",
    industry: "Accounting Automation",
    summary:
      "A multi-path invoicing and reminder automation system for payment workflows, follow-ups, and confirmation updates.",
    body:
      "This automation work connected appointment, quote, invoice, payment, and reminder events into structured Zapier workflows. Instead of manually checking payment schedules or remembering follow-ups, each route handles a defined operational scenario and pushes the next step forward.",
    results: [
      "Invoice workflows split by payment and service type",
      "Payment reminders run from scheduled automation paths",
      "Operational confirmation updates are handled more consistently",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Different payment scenarios required different invoice handling",
          "Reminder timing had to stay consistent around due dates",
          "Teams needed confirmation updates without manually checking every record",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Payment Route Logic",
            body: "Separate automation routes handle insurance, deposit, installment, and pay-in-full paths.",
          },
          {
            title: "QuickBooks Action",
            body: "Invoice records are created or updated from structured workflow events.",
          },
          {
            title: "Reminder Schedule",
            body: "Before-due, due-date, and overdue reminders run as timed automation steps.",
          },
          {
            title: "Confirmation Flow",
            body: "Payment confirmation messages are coordinated through the same operational system.",
          },
        ],
      },
    ],
    assets: [
      {
        source: `${showcaseRoot}/watermarked/05-eight-phase-program-insurance-to-quickbooks.webp`,
        name: "cover.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked/04-insurance-to-quickbooks-invoice-orchestrator.webp`,
        name: "invoice-orchestrator.webp",
        cropTop: 70,
      },
      {
        source: `${showcaseRoot}/watermarked/12-payment-reminder-seven-days-before-due.webp`,
        name: "payment-reminder.webp",
        cropTop: 70,
      },
    ],
  },
];

const genericSlugs = [
  "appointment-to-quote-routing",
  "quote-follow-up-reissue-system",
  "invoice-collection-orchestration",
  "payment-reminders-and-confirmations",
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
    .webp({ quality: 82 })
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

console.log("Hiding generic placeholder entries...");
await supabase.from("portfolio").update({ status: "draft" }).in("slug", genericSlugs);
await supabase.from("case_studies").update({ status: "draft" }).in("slug", genericSlugs);

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

console.log(`Published ${studies.length} real-work portfolio and case-study pairs.`);
