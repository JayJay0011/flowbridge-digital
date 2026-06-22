alter table public.services
add column if not exists cta_label text,
add column if not exists cta_url text,
add column if not exists content_sections jsonb;

alter table public.portfolio
add column if not exists gallery_urls text[],
add column if not exists video_urls text[];

alter table public.case_studies
add column if not exists gallery_urls text[],
add column if not exists content_sections jsonb;

insert into public.services (title, slug, description, cta_label, cta_url, content_sections, status)
values
(
  'Automation & Systems Architecture',
  'automation-systems-architecture',
  'We design structured automation systems that eliminate manual processes, improve operational visibility, and create scalable business infrastructure.',
  'Book an Automation Systems Call',
  'https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation',
  '[
    {"title":"When Operations Start Slowing Growth","variant":"light","columns":2,"items":["Manual follow-ups and repetitive admin tasks","Disconnected tools and fragmented workflows","Missed leads and unclear pipeline visibility","Scaling that feels chaotic instead of controlled","No structured onboarding process","Lack of real-time operational clarity"]},
    {"title":"What Automation Looks Like Inside Your Business","columns":2,"items":[{"title":"CRM Workflow Engineering","body":"Structured pipelines, tagging logic, lifecycle automation, and revenue tracking visibility."},{"title":"Lead Routing & Automation Logic","body":"Automated assignment, qualification systems, and backend routing architecture."},{"title":"Onboarding & Client Journey Systems","body":"Automated onboarding, follow-up sequencing, and status tracking frameworks."},{"title":"Cross-Platform Integrations","body":"Secure integrations across CRM, email platforms, internal tools, and custom APIs."}]},
    {"title":"Our Implementation Process","variant":"light","items":[{"title":"01 Diagnose Operational Bottlenecks","body":"We map your workflows and identify structural inefficiencies."},{"title":"02 Design Structured Automation Architecture","body":"We architect systems aligned with your growth model."},{"title":"03 Deploy, Test & Optimize","body":"We implement, refine, and ensure long-term scalability."}]},
    {"title":"The Result: Operational Clarity & Scalable Infrastructure","variant":"dark","body":"After implementation, businesses experience reduced manual workload, structured lead management, improved execution speed, and backend systems built for long-term scale."}
  ]'::jsonb,
  'published'
),
(
  'CRM & Pipeline Engineering',
  'crm-pipeline',
  'We design structured CRM systems that create visibility, automate lead management, and bring revenue clarity to your operations.',
  'Book a CRM Systems Call',
  'https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation',
  '[
    {"title":"When Revenue Feels Unpredictable","items":["Leads falling through the cracks","No clear visibility into sales stages","Manual follow-ups draining your team","Disconnected marketing and sales systems","No structured pipeline reporting","Scaling without operational clarity"]},
    {"title":"What CRM Engineering Looks Like","variant":"light","columns":2,"items":[{"title":"Lifecycle Workflow Automation","body":"Automated lead capture, tagging, routing, and stage progression to eliminate manual bottlenecks."},{"title":"Pipeline Visibility Systems","body":"Structured deal stages, revenue tracking dashboards, and reporting clarity for founders."},{"title":"Sales Process Engineering","body":"Defined follow-up logic, automation triggers, and systematic opportunity management."},{"title":"Cross-Platform Integration","body":"Connecting CRM with email systems, booking tools, payment platforms, and internal dashboards."}]},
    {"title":"Platforms We Engineer On","variant":"light","columns":4,"items":["HubSpot","GoHighLevel","Pipedrive","Bitrix24","Airtable","Zapier","Make","n8n"]},
    {"title":"Expected Outcomes","variant":"dark","items":["Clear revenue visibility","Automated lead management","Structured sales progression","Reduced manual oversight","Scalable backend growth systems"]}
  ]'::jsonb,
  'published'
),
(
  'Growth Infrastructure',
  'growth-infrastructure',
  'We build structured email marketing systems, lead nurturing workflows, and conversion infrastructure that turns traffic into predictable revenue.',
  'Book a Growth Systems Call',
  'https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation',
  '[
    {"title":"When Marketing Feels Disconnected","items":["Leads enter but never convert","No structured follow-up system","Email campaigns feel random","No lifecycle automation","Poor visibility into retention metrics","Revenue fluctuates unpredictably"]},
    {"title":"What Growth Infrastructure Includes","variant":"light","columns":2,"items":[{"title":"Lifecycle Email Automation","body":"Welcome sequences, abandoned cart recovery, re-engagement flows, onboarding campaigns, and post-purchase automation."},{"title":"Lead Nurturing Systems","body":"Structured drip campaigns that educate prospects and move them through a defined buyer journey."},{"title":"Conversion Funnel Structuring","body":"Landing pages, offer sequencing, form automation, and backend tagging logic for better segmentation."},{"title":"Data & Performance Visibility","body":"Revenue tracking dashboards, engagement reporting, and structured analytics systems."}]},
    {"title":"Platforms & Tools","variant":"light","columns":4,"items":["Klaviyo","MailerLite","ActiveCampaign","HubSpot","ConvertKit","Mailchimp","Brevo","Custom CRM Integrations"]},
    {"title":"What You Can Expect","variant":"dark","items":["Higher conversion rates","Structured customer journeys","Automated retention systems","Revenue predictability","Scalable growth backend"]}
  ]'::jsonb,
  'published'
),
(
  'Platform Development',
  'platform-development',
  'We design and build modern web applications, internal tools, and structured digital platforms that support operational clarity, automation, and scalable business growth.',
  'Book a Platform Build Call',
  'https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation',
  '[
    {"title":"When Your Tools Don''t Match Your Growth","items":["You rely on disconnected third-party platforms","Manual admin work slows internal operations","Client onboarding lacks structure","Your team works across scattered spreadsheets","No centralized dashboard for visibility","Off-the-shelf software does not fit your model"]},
    {"title":"What We Build","variant":"light","columns":2,"items":[{"title":"Custom Web Applications","body":"Scalable web apps built with structured backend logic, automation integration, and performance-focused architecture."},{"title":"Internal Operations Dashboards","body":"Admin panels, CRM dashboards, analytics systems, and operational control centers."},{"title":"Client Portals","body":"Secure login environments for order tracking, document sharing, onboarding workflows, and service transparency."},{"title":"Automation-Integrated Platforms","body":"Applications designed to work seamlessly with APIs, CRM systems, workflow automation tools, and backend data logic."}]},
    {"title":"Technology Stack","variant":"light","columns":2,"items":[{"title":"Frontend & Application Frameworks","body":"Next.js, Bubble.io, Glide, Adalo, and Flutter."},{"title":"Backend & Infrastructure","body":"Supabase, Firebase, secure authentication systems, REST and API integrations."},{"title":"Automation & Workflow","body":"n8n, Zapier, webhook architecture, and cross-platform data sync."},{"title":"Payments & Monetization","body":"Stripe integrations, subscription logic, and secure transaction flows."}]},
    {"title":"Expected Outcomes","variant":"dark","items":["Centralized operational control","Reduced manual work","Improved system scalability","Clear data visibility","Stronger backend infrastructure"]}
  ]'::jsonb,
  'published'
),
(
  'Operational Support',
  'operational-support',
  'We design structured backend support systems, documentation frameworks, and execution workflows that keep your business running smoothly without operational bottlenecks.',
  'Book an Ops Systems Call',
  'https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation',
  '[
    {"title":"When Growth Creates Operational Strain","items":["Team members unsure of process ownership","Manual delegation without structure","Inconsistent onboarding workflows","Lack of documented systems","Founder overwhelmed with backend tasks","No operational continuity plan"]},
    {"title":"What Operational Support Includes","variant":"light","columns":2,"items":[{"title":"Structured Delegation Systems","body":"Defined task assignment logic, workflow triggers, and operational ownership clarity."},{"title":"SOP Documentation Frameworks","body":"Creation of structured standard operating procedures to ensure execution consistency."},{"title":"Virtual Assistant Systems","body":"Backend task routing, onboarding frameworks, and scalable remote support structuring."},{"title":"Execution Oversight Infrastructure","body":"Internal dashboards, workflow monitoring, and structured accountability frameworks."}]},
    {"title":"Platforms & Collaboration Systems","variant":"light","columns":2,"items":[{"title":"Project & Task Management","body":"Asana, Jira, Trello, Monday.com, and ClickUp."},{"title":"Documentation & Knowledge Systems","body":"Notion, structured SOP frameworks, and internal wikis."},{"title":"Workflow & Data Structuring","body":"Airtable, CRM integrations, and task routing automation."},{"title":"Team Communication","body":"Slack, internal process channels, and structured reporting systems."}]},
    {"title":"Expected Outcomes","variant":"dark","items":["Clear delegation structure","Reduced founder workload","Documented operational systems","Improved team accountability","Sustainable backend growth"]}
  ]'::jsonb,
  'published'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  cta_label = excluded.cta_label,
  cta_url = excluded.cta_url,
  content_sections = excluded.content_sections,
  status = excluded.status;

insert into public.case_studies (title, slug, summary, industry, body, cover_url, gallery_urls, content_sections, results, status)
values
(
  'CRM Rebuild & Automation Architecture for a Scaling MedSpa Clinic',
  'medspa-crm-rebuild',
  'Replacing fragmented lead tracking and manual follow-ups with a structured CRM system, lifecycle automation, and operational visibility.',
  'MedSpa / Clinic',
  'The clinic had steady lead volume from paid ads and referrals, but follow-ups, visibility, and team coordination were fragmented.',
  '/medspa-mockup.png',
  array['/medspa-crm-pipeline.png','/medspa-automation-system.png'],
  '[
    {"title":"Business Context","body":"The clinic was experiencing steady lead volume from paid ads and referrals but struggled with follow-ups, visibility, and internal coordination."},
    {"title":"The Operational Bottlenecks","variant":"light","columns":2,"items":["Leads manually entered into spreadsheets","No structured pipeline visibility","Inconsistent follow-up processes","Booking confirmations handled manually","No lifecycle tagging logic","Disconnected booking and CRM systems","Limited reporting clarity","Team confusion around lead ownership"]},
    {"title":"The Structured Solution","variant":"light","columns":2,"items":[{"title":"Structured CRM Pipeline","body":"Designed a centralized pipeline tracking new leads, consultation bookings, treatments, and post-care stages."},{"title":"Lead to Consultation Automation","body":"Automated tagging, SMS reminders, booking workflows, post-treatment follow-ups, re-engagement campaigns, and retention flows."}]},
    {"title":"Strategic Insight","body":"Growth constraints were not caused by lack of demand, but by operational fragmentation. Rebuilding structured systems gave the clinic clarity, efficiency, and scalable infrastructure."}
  ]'::jsonb,
  array['Improved lead tracking accuracy','Reduced manual administrative workload','Structured client lifecycle visibility','Increased booking consistency','Clear reporting for performance analysis'],
  'published'
),
(
  'Ecommerce Automation Infrastructure',
  'ecommerce-automation',
  'Designing structured backend systems to eliminate order confusion, automate fulfillment workflows, and create real-time operational visibility.',
  'Ecommerce',
  'A growing ecommerce brand needed structured order tracking, CRM logic, and fulfillment automation as volume increased.',
  '/ecommerce-dashboard.png',
  array['/ecommerce-crm.png','/ecommerce-order-automation.png'],
  '[
    {"title":"The Challenge","body":"A growing ecommerce brand was experiencing order tracking gaps, manual follow-ups, fragmented CRM logic, and delayed fulfillment processes."},
    {"title":"Centralized Revenue & Order Dashboard","body":"A real-time dashboard gave the team clear visibility into order status, revenue movement, and operational bottlenecks."},
    {"title":"CRM & Automation Flow Structuring","variant":"light","body":"CRM stages, customer tags, and fulfillment triggers were organized into a cleaner backend operating system."}
  ]'::jsonb,
  array['100% automated order status tracking','Real-time dashboard visibility','Reduced manual admin workload','Structured CRM tagging and lifecycle flows','Faster fulfillment coordination'],
  'published'
),
(
  'Internal Operations Dashboard for Scaling Agency',
  'internal-operations',
  'Replacing fragmented reporting systems with a centralized operational dashboard, structured task management workflows, and real-time performance visibility.',
  'Agency Operations',
  'The agency was growing quickly but lacked centralized reporting and real-time operational visibility.',
  '/internal-ops-dashboard.png',
  array['/internal-ops-tasks.png','/internal-ops-automation.png'],
  '[
    {"title":"Business Context","body":"Project tracking was scattered across Slack, spreadsheets, and task tools. Leadership had no real-time operational visibility."},
    {"title":"Core Operational Gaps","variant":"light","columns":3,"items":[{"title":"Disconnected Reporting","body":"No single dashboard for revenue, delivery progress, or team performance metrics."},{"title":"Task Visibility Issues","body":"Project bottlenecks were discovered too late, causing delayed client deliverables."},{"title":"Manual Admin Work","body":"Staff manually updated spreadsheets instead of relying on automation-integrated systems."}]},
    {"title":"Operational Outcomes","variant":"dark","columns":3,"items":[{"title":"+42%","body":"Improvement in project delivery speed."},{"title":"-55%","body":"Reduction in manual admin processes."},{"title":"Full Visibility","body":"Leadership-level real-time performance tracking."}]}
  ]'::jsonb,
  array['Improved project delivery speed','Reduced manual admin processes','Leadership-level real-time performance tracking'],
  'published'
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  industry = excluded.industry,
  body = excluded.body,
  cover_url = excluded.cover_url,
  gallery_urls = excluded.gallery_urls,
  content_sections = excluded.content_sections,
  results = excluded.results,
  status = excluded.status;
