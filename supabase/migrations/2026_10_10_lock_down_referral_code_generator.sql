-- Referral codes are generated in the authenticated server route using the
-- service role. The SECURITY DEFINER helper does not need public API access.
revoke execute on function public.generate_referral_code() from public, anon, authenticated;
grant execute on function public.generate_referral_code() to service_role;
