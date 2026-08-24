import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-bitrix-abdellah-showcase";
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

const bitrixRoot = "/Users/akin/Desktop/Abdellah Bitrix24";

const studies = [
  {
    slug: "bitrix24-deal-workflow-spa-automation",
    title: "Bitrix24 Deal Workflow and SPA Automation",
    industry: "CRM Workflow Automation",
    summary:
      "A Bitrix24 workflow setup for deal automation, service-type routing, pricing calculations, discount approval, and Smart Process Automation creation.",
    body:
      "This Bitrix24 project used workflow templates and SPA automation to structure deal processing around service type, pricing calculations, margin and VAT logic, approval routing, revision handling, and automated SPA creation. The result was a cleaner operational flow where deal workflow logic and smart-process records could move through defined conditions instead of depending on manual follow-up.",
    results: [
      "Deal workflow branches were mapped around service type and conditional approval paths",
      "Pricing, margin, VAT, and discount approval steps were structured inside Bitrix24 automation",
      "Smart Process Automation records could be created from controlled deal workflow logic",
    ],
    sections: [
      {
        title: "The Workflow Problem",
        items: [
          "Deal processing needed clear service-type routing inside Bitrix24",
          "Pricing, margin, VAT, and discount checks had to run through repeatable workflow steps",
          "Supervisor approval and revision handling needed to sit inside the CRM process",
          "SPA creation needed to be connected to the deal workflow instead of handled manually",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Deal Workflow Template",
            body: "The full Bitrix24 workflow routes deals through conditions, calculations, approval checks, and revision paths.",
          },
          {
            title: "Pricing Logic",
            body: "Discount, margin, final price, and VAT calculation steps were organized inside the workflow sequence.",
          },
          {
            title: "Approval Routing",
            body: "Supervisor approval paths separate accepted discounts from deals that need revision before continuing.",
          },
          {
            title: "SPA Automation",
            body: "Smart Process Automation creation is triggered from the deal workflow through controlled Bitrix24 conditions.",
          },
        ],
      },
      {
        title: "Operational Outcome",
        body:
          "The setup gives the team a structured Bitrix24 process for deal automation and SPA creation, reducing manual routing decisions and making pricing/approval handling easier to follow.",
      },
    ],
    assets: [
      {
        source: `${bitrixRoot}/Full Workflow.jpeg`,
        name: "bitrix24-full-deal-workflow.webp",
        cropTop: 0,
      },
      {
        source: `${bitrixRoot}/SPA Automation.png`,
        name: "bitrix24-spa-automation.webp",
        cropTop: 68,
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
console.log(`Published ${studies.length} Bitrix24 portfolio and case-study pair.`);
