-- Admin policies call protected helper functions. Restrict them to signed-in
-- users so anonymous public-content reads only evaluate public read policies.
alter policy "Admin permissions: admin manage" on public.admin_permissions to authenticated;
alter policy "Blog: admin read" on public.blog_posts to authenticated;
alter policy "Blog: admin write" on public.blog_posts to authenticated;
alter policy "Case studies: admin read" on public.case_studies to authenticated;
alter policy "Case studies: admin write" on public.case_studies to authenticated;
alter policy "Gigs: admin read" on public.gigs to authenticated;
alter policy "Gigs: admin write" on public.gigs to authenticated;
alter policy "Messages: admin read" on public.messages to authenticated;
alter policy "Messages: admin write" on public.messages to authenticated;
alter policy "Offers: admin manage" on public.offers to authenticated;
alter policy "Orders: admin read" on public.orders to authenticated;
alter policy "Portfolio: admin read" on public.portfolio to authenticated;
alter policy "Portfolio: admin write" on public.portfolio to authenticated;
alter policy "Profiles: admin update" on public.profiles to authenticated;
alter policy "Reviews: admin read" on public.reviews to authenticated;
alter policy "Reviews: admin write" on public.reviews to authenticated;
alter policy "Services: admin read" on public.services to authenticated;
alter policy "Services: admin write" on public.services to authenticated;
alter policy "Tips: admin read" on public.tips to authenticated;
