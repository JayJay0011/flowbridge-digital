alter table public.funnel_events
  drop constraint if exists funnel_events_event_name_check;

alter table public.funnel_events
  add constraint funnel_events_event_name_check
  check (event_name in (
    'page_view', 'gig_viewed', 'checkout_started', 'offer_accepted',
    'payment_completed', 'delivery_submitted', 'revision_requested',
    'order_completed', 'review_submitted'
  ));
