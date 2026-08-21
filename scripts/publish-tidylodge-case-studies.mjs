import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-tidylodge-public-media";
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

const studies = [
  {
    slug: "appointment-to-quote-routing",
    title: "Appointment-to-Quote Routing Automation",
    industry: "Professional Services",
    summary:
      "A structured booking workflow that connects appointment changes, quoting records, and operational updates without relying on manual handoffs.",
    body:
      "A professional-services team needed appointment changes to flow into its quoting process reliably. The automation standardized dates, checked existing records, applied routing conditions, and updated the operating record so the team could continue from the correct stage.",
    results: [
      "Structured appointment-change processing",
      "Automated record lookup and updates",
      "Clearer handoff between booking and quoting workflows",
    ],
    sections: [
      {
        title: "The Workflow Challenge",
        items: [
          "Appointment changes required manual checking before downstream work could continue",
          "Scheduling and quoting data lived in separate systems",
          "Teams needed a reliable way to identify the correct record and next step",
        ],
      },
      {
        title: "The Automation Architecture",
        variant: "light",
        columns: 2,
        items: [
          { title: "Booking Trigger", body: "Appointment changes initiate the workflow from the scheduling platform." },
          { title: "Data Normalization", body: "Dates and identifiers are standardized before they are used downstream." },
          { title: "Record Matching", body: "The workflow locates the corresponding operating record before applying updates." },
          { title: "Conditional Routing", body: "Filters ensure only the right appointment changes progress through the automation." },
        ],
      },
    ],
    visual: "Appointment routing",
    nodes: ["Appointment change", "Record match", "Quote update", "Team handoff"],
  },
  {
    slug: "quote-follow-up-reissue-system",
    title: "Quote Follow-Up & Reissue System",
    industry: "Professional Services",
    summary:
      "A multi-step automation that checks quote status, separates signed and unsigned outcomes, and drives the correct next action without manual chasing.",
    body:
      "Quote follow-up was dependent on manual status checks and repeated outreach. This workflow introduced scheduled checks, conditional logic, quote-status retrieval, follow-up paths, and reissue handling so the business could keep opportunities moving with a defined process.",
    results: [
      "Scheduled quote-status review",
      "Separate paths for signed and unsigned quotes",
      "Structured reissue and follow-up process",
    ],
    sections: [
      {
        title: "Where The Process Was Breaking Down",
        items: [
          "Quote follow-up depended on someone remembering to check each record",
          "Signed and unsigned quotes needed different actions",
          "Expired quotes required a consistent reissue workflow",
        ],
      },
      {
        title: "How The System Responds",
        variant: "light",
        columns: 2,
        items: [
          { title: "Scheduled Review", body: "The workflow checks quote status on a defined schedule." },
          { title: "Decision Paths", body: "Signed quotes are handled separately from opportunities requiring follow-up." },
          { title: "Validity Checks", body: "Timing logic identifies records that need review or renewal." },
          { title: "Reissue Handling", body: "The appropriate follow-up request and record update happen from the same workflow." },
        ],
      },
    ],
    visual: "Quote follow-up",
    nodes: ["Scheduled review", "Quote status", "Follow-up path", "Reissue request"],
  },
  {
    slug: "invoice-collection-orchestration",
    title: "Invoice Collection Orchestration",
    industry: "Professional Services",
    summary:
      "A payment workflow framework designed to handle multiple invoice routes, including insurance, deposits, instalments, and pay-in-full scenarios.",
    body:
      "The team needed a dependable way to create and manage invoices across different payment arrangements. We structured separate automation routes for common payment models while keeping the overall process consistent and easier to manage.",
    results: [
      "Defined automation routes for payment scenarios",
      "More consistent invoice-generation process",
      "Clearer operational ownership for collections workflows",
    ],
    sections: [
      {
        title: "A Complex Payment Environment",
        items: [
          "Different services required different payment arrangements",
          "Invoice creation had to respect the correct payment schedule",
          "The team needed a more repeatable collections workflow",
        ],
      },
      {
        title: "Structured Payment Paths",
        variant: "light",
        columns: 2,
        items: [
          { title: "Insurance Workflows", body: "Dedicated logic supports insurance-related invoicing." },
          { title: "Deposit Workflows", body: "Initial and final-payment stages follow a clear sequence." },
          { title: "Instalment Workflows", body: "Separate paths handle agreed multi-payment structures." },
          { title: "Pay-in-Full Workflow", body: "A streamlined route supports full-payment arrangements." },
        ],
      },
    ],
    visual: "Invoice orchestration",
    nodes: ["Payment type", "Invoice route", "Collection status", "Operational update"],
  },
  {
    slug: "payment-reminders-and-confirmations",
    title: "Payment Reminder & Confirmation Workflow",
    industry: "Professional Services",
    summary:
      "A timed reminder system that coordinates pre-due, due-date, and overdue payment communications alongside confirmation updates.",
    body:
      "Payment follow-up was too easy to delay when it relied on manual reminders. The new workflow created timed reminder paths around the invoice due date and included confirmation handling so payment status could be communicated more consistently.",
    results: [
      "Timed payment-reminder sequence",
      "Clear before-due, due-date, and overdue paths",
      "Structured payment-confirmation updates",
    ],
    sections: [
      {
        title: "The Collection Follow-Up Gap",
        items: [
          "Reminders could be missed when they were handled manually",
          "Payment status needed a clear communication rhythm",
          "Teams needed confirmation updates after deposits were received",
        ],
      },
      {
        title: "A Timed Communications System",
        variant: "light",
        columns: 2,
        items: [
          { title: "Pre-Due Reminder", body: "A scheduled touchpoint prepares the customer before the payment deadline." },
          { title: "Due-Date Reminder", body: "The workflow provides a consistent reminder on the payment date." },
          { title: "Overdue Follow-Up", body: "A separate path manages overdue payment communication." },
          { title: "Confirmation Update", body: "Deposit confirmations are routed through the same operational system." },
        ],
      },
    ],
    visual: "Payment reminders",
    nodes: ["Before due", "Due today", "Overdue", "Payment confirmed"],
  },
];

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);
}

function workflowVisualSvg(study, variation) {
  const width = 1600;
  const height = 1000;
  const nodes = variation === 0 ? study.nodes : [...study.nodes].reverse();
  const nodeMarkup = nodes
    .map((label, index) => {
      const x = 135 + index * 355;
      const isLast = index === nodes.length - 1;
      return `
        <rect x="${x}" y="450" width="280" height="150" rx="20" fill="#102747" stroke="#31577e" stroke-width="2"/>
        <circle cx="${x + 46}" cy="505" r="18" fill="#43c6d9"/>
        <text x="${x + 80}" y="513" fill="#f7fbff" font-family="Arial, sans-serif" font-size="25" font-weight="700">${escapeXml(label)}</text>
        <text x="${x + 36}" y="557" fill="#a7c4de" font-family="Arial, sans-serif" font-size="18">Structured operational step</text>
        ${isLast ? "" : `<path d="M ${x + 288} 525 H ${x + 337}" stroke="#45c5dc" stroke-width="5" stroke-linecap="round"/><path d="M ${x + 327} 513 L ${x + 344} 525 L ${x + 327} 537" fill="none" stroke="#45c5dc" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`}
      `;
    })
    .join("");
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#06152a"/><stop offset="1" stop-color="#0e3155"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="18" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="1300" cy="120" r="300" fill="#167fa8" opacity=".18" filter="url(#glow)"/>
      <circle cx="200" cy="910" r="260" fill="#2ba8c6" opacity=".12" filter="url(#glow)"/>
      <text x="130" y="155" fill="#69d6e5" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="8">FLOWBRIDGE DIGITAL</text>
      <text x="130" y="265" fill="#ffffff" font-family="Arial, sans-serif" font-size="66" font-weight="700">${escapeXml(study.visual)}</text>
      <text x="130" y="326" fill="#b7cbe0" font-family="Arial, sans-serif" font-size="30">Automation architecture designed for reliable operations.</text>
      <rect x="95" y="395" width="1410" height="270" rx="32" fill="#071a31" opacity=".72" stroke="#284f76" stroke-width="2"/>
      ${nodeMarkup}
      <text x="130" y="835" fill="#88a8c9" font-family="Arial, sans-serif" font-size="25">Flowbridge Digital case study visual · representative workflow diagram</text>
    </svg>
  `);
}

async function prepareImage(study, variation, outputName) {
  const outputPath = path.join(outputDirectory, outputName);
  await sharp(workflowVisualSvg(study, variation)).webp({ quality: 82 }).toFile(outputPath);
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
  const coverLocal = await prepareImage(study, 0, `${study.slug}-cover.webp`);
  const coverUrl = await uploadMedia(
    coverLocal,
    `admin-media/case-studies/imported/${study.slug}/cover.webp`
  );

  const galleryUrls = [];
  for (const index of [1, 2]) {
    const galleryLocal = await prepareImage(study, index, `${study.slug}-gallery-${index}.webp`);
    galleryUrls.push(
      await uploadMedia(
        galleryLocal,
        `admin-media/case-studies/imported/${study.slug}/gallery-${index}.webp`
      )
    );
  }

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

console.log(`Published ${studies.length} anonymized portfolio and case-study pairs.`);
