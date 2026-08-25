import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = "/private/tmp/flowbridge-pipedrive-zapier-showcase";
const bucket = "public-assets";
const assetRoot = "/Users/akin/Desktop/Pipedrive Portfolio";

const envPath = path.join(repoRoot, ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function image(sourceName, outputName, cropTop = 76) {
  return {
    type: "image",
    sourceName,
    source: path.join(assetRoot, sourceName),
    name: outputName,
    cropTop,
  };
}

function video(sourceName, outputName) {
  return {
    type: "video",
    sourceName,
    source: path.join(assetRoot, sourceName),
    name: outputName,
  };
}

const studies = [
  {
    title: "Pipedrive Mortgage Lead Pipeline Setup",
    slug: "pipedrive-mortgage-lead-pipeline-setup",
    industry: "Mortgage CRM Operations",
    summary:
      "A Pipedrive mortgage lead pipeline rebuild that organizes active leads, stage ownership, values, and next-activity visibility across the full sales process.",
    body:
      "This project structured a mortgage lead operation inside Pipedrive so the team could see where every lead sat, which conversations needed attention, and how high-value applications moved through the pipeline. The supporting screenshots show the pipeline architecture, stage model, and working CRM view used for daily follow-up.",
    assets: [
      image("Pipedrive Pipeines Integration.png", "pipeline-cover.webp"),
      image("Piplines Structure.png", "pipeline-structure.webp"),
      image("ONCE HOME SOLUTIONS PIPEDRIVE PIPELINE SETUP 2.png", "once-home-pipeline.webp"),
      image("Pipedrive Expert copie.png", "pipeline-expert-view.webp"),
    ],
    videos: [video("Pipedrive CRM.mov", "pipedrive-crm-demo.mov")],
    results: [
      "Mapped lead and application stages into a clear Pipedrive pipeline",
      "Improved daily visibility across active leads, waiting stages, application progress, and closed paths",
      "Kept pipeline and automation proof together through linked portfolio media",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Mortgage leads were spread across many stages without a simple operating view",
          "Follow-up ownership and next actions needed to be visible without checking each record manually",
          "Pipeline value and stage progress needed to support daily sales decisions",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Pipeline Architecture",
            body: "Structured Pipedrive stages around the real sales journey from new lead through application progress and completion.",
          },
          {
            title: "Stage Visibility",
            body: "Organized records by status, value, and next activity so the team could prioritize the right follow-up.",
          },
          {
            title: "CRM Hygiene",
            body: "Kept pipeline naming, active stages, and owner visibility clean enough for daily operations.",
          },
          {
            title: "Proof Library",
            body: "Stored screenshots and video walkthroughs as reusable implementation evidence.",
          },
        ],
      },
    ],
  },
  {
    title: "Zapier Pipedrive Booking Assignment Automation",
    slug: "zapier-pipedrive-booking-assignment-automation",
    industry: "Booking and CRM Automation",
    summary:
      "A Zapier workflow that turns new TidyCal bookings into assigned Pipedrive deal updates and follow-up activities.",
    body:
      "This automation connects scheduled booking events to Pipedrive lookup, deal updates, and owner-specific activity creation. It keeps booked appointments from sitting outside the CRM and gives each assigned team member a clear next action.",
    assets: [
      image("Pipedrive Automation 3.png", "booking-assignment-cover.webp"),
      image("Pipedrive Automation.png", "booking-assignment-flow.webp"),
      image("Booking Activity- Tidycal with Pipedrive.png", "tidycal-booking-activity.webp"),
      image("PD Expert.png", "multi-owner-followup-flow.webp"),
    ],
    videos: [],
    results: [
      "New booking events route into Pipedrive lookup and deal update steps",
      "Assignee-specific paths keep each team member's follow-up activity clear",
      "Booking, CRM, and activity creation steps are visible in one automation flow",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Booked calls needed to update the right Pipedrive records quickly",
          "Different owners needed different activity paths without manual sorting",
          "Booking data had to stay connected to CRM follow-up work",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Booking Trigger",
            body: "Used new booking events as the starting point for CRM lookup and routing.",
          },
          {
            title: "Pipedrive Matching",
            body: "Found matching people and deals before updating records to avoid disconnected activity.",
          },
          {
            title: "Owner Paths",
            body: "Split actions by assignee so each person received the correct CRM updates.",
          },
          {
            title: "Follow-Up Activities",
            body: "Created next steps inside Pipedrive after the appointment was booked.",
          },
        ],
      },
    ],
  },
  {
    title: "Pipedrive Zapier Lead Application Completion Workflow",
    slug: "pipedrive-zapier-lead-app-completion-workflow",
    industry: "Lead Intake Automation",
    summary:
      "A Zapier workflow for completed lead applications that normalizes intake data, routes by responsible owner, updates Pipedrive, and creates follow-up actions.",
    body:
      "This workflow receives completed lead application events, validates and formats the intake data, routes the lead by owner, updates Pipedrive, and creates the right follow-up actions. The result is a cleaner handoff from application completion to sales follow-through.",
    assets: [
      image("LeadApp Completed Pipedrive.png", "lead-app-completed-cover.webp"),
      image("Zapier PD Automation.png", "new-isa-lead-flow.webp"),
    ],
    videos: [video("Had Convo Pipedrive Recording.mov", "had-convo-pipedrive-demo.mov")],
    results: [
      "Turned completed lead applications into structured CRM updates",
      "Split follow-up paths by responsible owner without manual assignment",
      "Preserved a working video walkthrough alongside implementation screenshots",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Completed applications needed immediate CRM updates",
          "Owner-specific routing had to happen without slowing down the team",
          "Lead data needed formatting before it reached sales records",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Intake Normalization",
            body: "Formatted dates, numbers, and application values before CRM updates ran.",
          },
          {
            title: "Path Routing",
            body: "Used path logic to send each lead through the correct owner workflow.",
          },
          {
            title: "Pipedrive Updates",
            body: "Updated people, deals, and activities from the same lead event.",
          },
          {
            title: "Follow-Up Readiness",
            body: "Kept the team ready to respond after the application was completed.",
          },
        ],
      },
    ],
  },
  {
    title: "Pipedrive Zapier Automation Estate",
    slug: "pipedrive-zapier-automation-estate",
    industry: "Sales Automation Infrastructure",
    summary:
      "A broad Zapier and Pipedrive automation estate covering lead status changes, nurture rules, appointment activity, and lifecycle campaign controls.",
    body:
      "This portfolio record documents a wider automation estate across Pipedrive, Zapier, and supporting tools. The workflows cover lead movement, appointment activity, campaign cleanup, and multiple operational rules that keep CRM activity from becoming manual busywork.",
    assets: [
      image("30+ Pipedrive Zapier Automation.png", "zapier-automation-estate-cover.webp"),
      image("Pipedrive Automation 2.png", "zapier-automation-list.webp", 120),
    ],
    videos: [],
    results: [
      "Consolidated multiple active lead-management automations into one documented portfolio record",
      "Supported stage-based follow-up, campaign stop logic, and CRM activity hygiene",
      "Showed breadth of operational automation across Pipedrive, Zapier, and supporting apps",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Many CRM actions depended on repetitive manual updates",
          "Campaign and follow-up status needed to react to deal movement",
          "The automation estate needed to stay visible and documented",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Automation Inventory",
            body: "Grouped a large set of Pipedrive/Zapier automations into a visible operating system.",
          },
          {
            title: "Stage-Based Rules",
            body: "Used deal changes to trigger appropriate downstream follow-up and cleanup actions.",
          },
          {
            title: "Marketing Cleanup",
            body: "Reduced irrelevant nurture by stopping campaigns when deal context changed.",
          },
          {
            title: "Operational Evidence",
            body: "Connected screenshots of active workflows to a public-facing case record.",
          },
        ],
      },
    ],
  },
  {
    title: "Fairway Pipedrive Zapier Lead Routing and SMS Workflow",
    slug: "fairway-pipedrive-zapier-lead-routing-sms",
    industry: "Mortgage Lead Routing",
    summary:
      "A Zapier workflow that routes parsed lead intake into contacts, Pipedrive people, deals, logs, and SMS follow-up.",
    body:
      "This workflow turns parsed lead intake into clean sales operations. It creates or updates contacts, writes the right CRM records, logs source data, and starts SMS follow-up so new leads do not sit untouched.",
    assets: [image("Faiway Pipedrive Automation.png", "fairway-lead-routing-cover.webp")],
    videos: [video("Pipedrive Recording.mov", "fairway-pipedrive-demo.mov")],
    results: [
      "Converted parsed lead requests into CRM records and follow-up actions",
      "Connected intake, contacts, Pipedrive, spreadsheets, and SMS into one route",
      "Reduced handoff gaps between new lead capture and first response",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Lead requests needed to become CRM records without retyping",
          "Contact, deal, tracking, and SMS actions had to run in sequence",
          "The team needed fewer gaps between intake and first response",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Parsed Intake",
            body: "Used parsed lead data as the source for contact and deal creation.",
          },
          {
            title: "CRM Record Creation",
            body: "Created Pipedrive people and deals from the incoming request.",
          },
          {
            title: "Tracking Logs",
            body: "Wrote supporting records to spreadsheets for operational visibility.",
          },
          {
            title: "SMS Follow-Up",
            body: "Triggered text outreach after CRM records were prepared.",
          },
        ],
      },
    ],
  },
  {
    title: "Pipedrive MailerLite Campaign Stop Automation",
    slug: "pipedrive-mailerlite-campaign-stop-automation",
    industry: "Lifecycle Marketing Automation",
    summary:
      "A lifecycle automation that responds to Pipedrive deal events by cleaning up MailerLite campaign membership and routing related lead data.",
    body:
      "This automation uses Pipedrive deal movement to control downstream MailerLite campaign membership and related lead routing. It prevents prospects from continuing through irrelevant nurture after their sales status changes.",
    assets: [
      image("Zapier Pipedrive.png", "mailerlite-campaign-stop-cover.webp"),
      image("Pipedrive zap.png", "ghl-routing-flow.webp"),
    ],
    videos: [],
    results: [
      "Stopped irrelevant campaign follow-up when deal status changed",
      "Used Pipedrive events to trigger targeted MailerLite cleanup actions",
      "Kept lead-routing logic connected to lifecycle marketing rules",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Marketing campaigns needed to respond to CRM deal state",
          "Closed or moved deals should not keep receiving irrelevant nurture",
          "Lead routing logic needed to stay connected to sales context",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Deal Event Trigger",
            body: "Used Pipedrive updates to start lifecycle automation.",
          },
          {
            title: "Campaign Cleanup",
            body: "Removed contacts from MailerLite groups based on deal status.",
          },
          {
            title: "Routing Logic",
            body: "Used Zapier path and code steps where conditional routing was required.",
          },
          {
            title: "Cleaner Lifecycle",
            body: "Kept sales and marketing follow-up aligned with the customer journey.",
          },
        ],
      },
    ],
  },
];

const selectedSourceNames = [
  "Had Convo Pipedrive Recording.mov",
  "Pipedrive CRM.mov",
  "Pipedrive Recording.mov",
  "ONCE HOME SOLUTIONS PIPEDRIVE PIPELINE SETUP 2.png",
  "Pipedrive Automation 3.png",
  "Pipedrive Pipeines Integration.png",
  "30+ Pipedrive Zapier Automation.png",
  "Booking Activity- Tidycal with Pipedrive.png",
  "Faiway Pipedrive Automation.png",
  "LeadApp Completed Pipedrive.png",
  "PD Expert.png",
  "Pipedrive Automation.png",
  "Pipedrive Automation 2.png",
  "Pipedrive Expert copie.png",
  "Pipedrive zap.png",
  "Piplines Structure.png",
  "Zapier PD Automation.png",
  "Zapier Pipedrive.png",
];

function assertSources() {
  const used = studies.flatMap((study) => [
    ...study.assets.map((asset) => asset.sourceName),
    ...study.videos.map((asset) => asset.sourceName),
  ]);
  const selected = new Set(selectedSourceNames);
  const usedSet = new Set(used);
  const duplicates = used.filter((name, index) => used.indexOf(name) !== index);
  const missing = selectedSourceNames.filter((name) => !usedSet.has(name));
  const unexpected = used.filter((name) => !selected.has(name));
  const absentFiles = used.filter((name) => !existsSync(path.join(assetRoot, name)));

  if (selectedSourceNames.length !== 18) {
    throw new Error(`Expected 18 selected sources, got ${selectedSourceNames.length}.`);
  }
  if (duplicates.length || missing.length || unexpected.length || absentFiles.length) {
    throw new Error(
      [
        duplicates.length ? `Duplicate source usage: ${duplicates.join(", ")}` : "",
        missing.length ? `Missing selected sources: ${missing.join(", ")}` : "",
        unexpected.length ? `Unexpected sources: ${unexpected.join(", ")}` : "",
        absentFiles.length ? `Source files not found: ${absentFiles.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  console.log(`Used ${used.length}/${selectedSourceNames.length} selected source files.`);
}

function watermarkSvg(width, height) {
  const stepX = 420;
  const stepY = 220;
  let text = "";

  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      text += `<text x="${x}" y="${y}" fill="rgba(255,255,255,0.16)" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" transform="rotate(-28 ${x} ${y})">Flowbridge Digital</text>`;
    }
  }

  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${text}</svg>`,
  );
}

async function preparePublicImage(asset, slug) {
  let pipeline = sharp(asset.source).rotate();
  const metadata = await pipeline.metadata();
  const top = Math.min(asset.cropTop ?? 0, Math.max(0, (metadata.height ?? 0) - 240));

  if (top > 0 && metadata.width && metadata.height) {
    pipeline = pipeline.extract({
      left: 0,
      top,
      width: metadata.width,
      height: metadata.height - top,
    });
  }

  const baseBuffer = await pipeline.resize({ width: 1600, withoutEnlargement: true }).toBuffer();
  const outputMetadata = await sharp(baseBuffer).metadata();
  const width = outputMetadata.width ?? 1600;
  const height = outputMetadata.height ?? 900;
  const outputPath = path.join(outputDirectory, slug, asset.name);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(baseBuffer)
    .composite([{ input: watermarkSvg(width, height), gravity: "center" }])
    .webp({ quality: 84 })
    .toFile(outputPath);

  return outputPath;
}

async function uploadImage(study, asset) {
  const outputPath = await preparePublicImage(asset, study.slug);
  const storagePath = `admin-media/showcase/${study.slug}/${asset.name}`;
  const bytes = await readFile(outputPath);
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: "image/webp",
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for ${asset.sourceName}: ${error.message}`);
  }

  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function uploadVideo(study, asset) {
  const storagePath = `admin-media/showcase/${study.slug}/${asset.name}`;
  const bytes = await readFile(asset.source);
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: "video/quicktime",
    upsert: true,
  });

  if (error) {
    throw new Error(`Video upload failed for ${asset.sourceName}: ${error.message}`);
  }

  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function upsertPortfolio(payload) {
  const withVideos = {
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary,
    cover_url: payload.cover_url,
    gallery_urls: payload.gallery_urls,
    video_urls: payload.video_urls,
    outcomes: payload.results,
    case_study_slug: payload.slug,
    status: "published",
  };

  const first = await supabase.from("portfolio").upsert(withVideos, { onConflict: "slug" });
  if (!first.error) return;

  if (!/video_urls/i.test(first.error.message)) {
    throw first.error;
  }

  console.warn("portfolio.video_urls is not available; retrying portfolio upsert without videos.");
  const { video_urls, ...withoutVideos } = withVideos;
  const retry = await supabase.from("portfolio").upsert(withoutVideos, { onConflict: "slug" });
  if (retry.error) throw retry.error;
}

async function publishStudy(study) {
  const imageUrls = [];
  for (const asset of study.assets) {
    imageUrls.push(await uploadImage(study, asset));
  }

  const videoUrls = [];
  for (const asset of study.videos) {
    videoUrls.push(await uploadVideo(study, asset));
  }

  const coverUrl = imageUrls[0];
  const galleryUrls = imageUrls.slice(1);

  const caseStudyPayload = {
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
  };

  const caseStudyResult = await supabase
    .from("case_studies")
    .upsert(caseStudyPayload, { onConflict: "slug" });
  if (caseStudyResult.error) {
    throw new Error(`Case study upsert failed for ${study.slug}: ${caseStudyResult.error.message}`);
  }

  await upsertPortfolio({
    ...study,
    cover_url: coverUrl,
    gallery_urls: galleryUrls,
    video_urls: videoUrls,
  });

  const caseVerify = await supabase
    .from("case_studies")
    .select("slug,title,status")
    .eq("slug", study.slug)
    .single();
  if (caseVerify.error) {
    throw new Error(`Case study verification failed for ${study.slug}: ${caseVerify.error.message}`);
  }

  const portfolioVerify = await supabase
    .from("portfolio")
    .select("slug,title,status")
    .eq("slug", study.slug)
    .single();
  if (portfolioVerify.error) {
    throw new Error(`Portfolio verification failed for ${study.slug}: ${portfolioVerify.error.message}`);
  }

  console.log(`Published ${study.slug}`);
}

async function main() {
  assertSources();
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const study of studies) {
    await publishStudy(study);
  }

  console.log(`Published ${studies.length} Pipedrive/Zapier case studies.`);
  console.log(`Published ${studies.length} linked Pipedrive/Zapier portfolio records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
