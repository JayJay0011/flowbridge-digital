import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const filePath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(filePath);
const projectDirectory = path.resolve(scriptsDirectory, "..");
const outputDirectory = "/private/tmp/flowbridge-manychat-showcase";
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
    slug: "manychat-instagram-comment-dm-automation",
    title: "Manychat Instagram Comment-to-DM Automation",
    industry: "Social Messaging Automation",
    summary:
      "A Manychat automation setup for Instagram comment triggers, private replies, follow-up messages, smart delays, tagging, and campaign visibility.",
    body:
      "This Manychat project turned Instagram comments into a structured direct-message journey. The automation listens for post or Reel comment triggers, sends the first private reply, routes contacts through follow-up messages and smart delays, applies tags, and gives the team a published-flow view with campaign activity metrics. The setup keeps social engagement from staying inside comments by moving interested users into a controlled messaging sequence.",
    results: [
      "Instagram comment triggers route contacts into automated Manychat reply flows",
      "Follow-up messages, smart delays, and tags were structured inside the messaging journey",
      "Published-flow metrics give the team visibility into sends and unique contacts",
    ],
    sections: [
      {
        title: "The Messaging Problem",
        items: [
          "Instagram comment engagement needed an immediate private-reply path",
          "Follow-up messages had to continue after the first response without manual chasing",
          "Contacts needed to be tagged and routed based on reply behavior",
          "The team needed visibility into published flow activity and message performance",
        ],
      },
      {
        title: "System Built",
        variant: "light",
        columns: 2,
        items: [
          {
            title: "Comment Trigger",
            body: "Manychat listens for Instagram comments on selected posts or Reels and starts the automation.",
          },
          {
            title: "Private Reply Flow",
            body: "The first message moves the user from public comments into a guided direct-message conversation.",
          },
          {
            title: "Smart Delays and Follow-Up",
            body: "Timed follow-up steps continue the conversation when contacts do not respond immediately.",
          },
          {
            title: "Tagging and Visibility",
            body: "Tags and published-flow metrics help the team track who entered the journey and how messages performed.",
          },
        ],
      },
      {
        title: "Operational Outcome",
        body:
          "The setup gives the brand a repeatable Manychat flow for turning Instagram engagement into a managed DM sequence, with message steps, delays, tags, and performance visibility in one place.",
      },
    ],
    assets: [
      {
        source: `${desktopRoot}/Manychat.png`,
        name: "manychat-dock-comment-dm-flow.webp",
        cropTop: 70,
      },
      {
        source: `${desktopRoot}/Mr WiredUp Manychat.png`,
        name: "manychat-mr-wiredup-comment-flow.webp",
        cropTop: 70,
      },
      {
        source: `${desktopRoot}/Manychat Flow.png`,
        name: "manychat-message-builder-preview.webp",
        cropTop: 70,
      },
      {
        source: `${desktopRoot}/Manychat Automation.png`,
        name: "manychat-automation-library.webp",
        cropTop: 70,
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
console.log(`Published ${studies.length} Manychat portfolio and case-study pair.`);
