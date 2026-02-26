# Supabase Setup

1. In Supabase, open the SQL editor and run `schema.sql`.
   - If you already ran it, run `migrations/2026_02_26_add_username.sql`.
2. To seed draft gigs, run `seed_gigs.sql`.
3. To seed draft portfolio items, run `seed_portfolio.sql`.
4. To add messaging support, run `migrations/2026_02_26_add_messages.sql`.
5. To add reviews + profile fields, run `migrations/2026_02_26_add_reviews_profile_fields.sql`.
2. Create a storage bucket named `public-assets` (public read).
3. Create an admin user in Supabase Auth (email + password).
4. Promote that user to admin by running:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

5. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (for admin-only server actions).

Notes:
- Public data is limited to items with `status = 'published'`.
- Admins can manage gigs, services, portfolio, and orders.
- Clients can create and view their own orders only.
