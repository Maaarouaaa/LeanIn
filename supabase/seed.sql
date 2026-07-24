-- Seed demo profile and Circles for Circle Match

insert into public.profiles (id, display_name, email, preferences)
values (
  '11111111-1111-1111-1111-111111111111',
  'Amina Okonkwo',
  'amina.demo@leanin.connect',
  null
)
on conflict (id) do update
set display_name = excluded.display_name,
    email = excluded.email;

truncate table public.join_requests;
delete from public.circles;

insert into public.circles (
  id, slug, name, category, description, who_its_for, topics, career_stages,
  format, frequency, location, schedule, next_meeting, member_count,
  image_src, image_alt, meets_weeknights, leader, members
) values
(
  '22222222-2222-2222-2222-222222222201',
  'bay-area-leadership-lab',
  'The Bay Area Leadership Lab',
  'Leadership',
  'For women stepping into wider influence—leading teams, shaping strategy, and building confidence in the room.',
  'Women managers, directors, and rising leaders in the Bay Area who want peer coaching on influence, sponsorship, and executive presence.',
  array['growing-as-a-leader', 'building-confidence', 'finding-mentorship'],
  array['mid-career', 'senior-leader'],
  'in-person', 'monthly', 'Oakland, CA', '2nd Thursday · 6:30 PM', 'August 13', 10,
  '/assets/circles/leadership-lab.jpg',
  'Two women smiling together at a community gathering outdoors',
  true,
  '{"name":"Maya Robinson","title":"VP, People & Culture","bio":"Maya facilitates with warmth and precision, helping members practice the conversations that expand their influence.","initials":"MR","since":"2022"}'::jsonb,
  '[{"name":"Maya","role":"People","initials":"MR"},{"name":"Priya","role":"Product","initials":"PS"},{"name":"Alina","role":"Finance","initials":"AK"},{"name":"Tess","role":"Impact","initials":"TW"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222202',
  'women-building-in-tech',
  'Women Building in Tech',
  'Technology',
  'A virtual Circle for engineers, PMs, and designers growing craft, confidence, and sponsorship in technology.',
  'Women in product and technology roles who want candid peer learning and practical career strategy.',
  array['growing-in-technology', 'growing-as-a-leader', 'finding-mentorship'],
  array['early-career', 'mid-career'],
  'virtual', 'monthly', 'Virtual · Global', '1st Tuesday · 7:00 PM', 'August 4', 8,
  '/assets/circles/women-tech.jpg',
  'Woman presenting at a technology workplace gathering',
  true,
  '{"name":"Priya Nandakumar","title":"Director of Engineering","bio":"Priya balances craft deep-dives with honest conversation about advancement in tech.","initials":"PN","since":"2023"}'::jsonb,
  '[{"name":"Jordan","role":"Engineer","initials":"JL"},{"name":"Samira","role":"EM","initials":"SH"},{"name":"Nora","role":"PM","initials":"NC"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222203',
  'founders-in-progress',
  'Founders in Progress',
  'Entrepreneurship',
  'For women building companies who want honest conversation about fundraising, hiring, and sustainable ambition.',
  'Founders and aspiring entrepreneurs seeking peer accountability and practical founder wisdom.',
  array['entrepreneurship', 'growing-as-a-leader', 'building-confidence'],
  array['founder', 'mid-career', 'senior-leader'],
  'in-person', 'monthly', 'San Francisco, CA', 'Monthly · 6:00 PM', 'August 20', 8,
  '/assets/circles/founders.jpg',
  'Woman speaking with confidence at a founders meetup',
  true,
  '{"name":"Imani Cole","title":"Founder & CEO","bio":"Imani has raised two rounds and treats Circles like a trusted board of peers.","initials":"IC","since":"2021"}'::jsonb,
  '[{"name":"Leah","role":"Founder","initials":"LO"},{"name":"Quinn","role":"Co-founder","initials":"QP"},{"name":"Aisha","role":"Solo founder","initials":"AR"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222204',
  'returning-with-confidence',
  'Returning with Confidence',
  'Career Returners',
  'Rebuild momentum after a career pause with practical re-entry planning and encouragement from women who have been there.',
  'Women returning to work after caregiving, relocation, or a deliberate career break.',
  array['returning-to-work', 'building-confidence', 'finding-mentorship'],
  array['returning-to-work', 'career-transition', 'mid-career'],
  'hybrid', 'biweekly', 'San Francisco, CA', '1st & 3rd Thursday · 6:00 PM', 'August 6', 9,
  '/assets/circles/returning.jpg',
  'Professional woman smiling outdoors in soft daylight',
  true,
  '{"name":"Elena Vasquez","title":"People Ops Leader","bio":"Elena returned to work after five years and now coaches others through the same transition.","initials":"EV","since":"2022"}'::jsonb,
  '[{"name":"Maya","role":"Marketing","initials":"MB"},{"name":"Hana","role":"Analyst","initials":"HK"},{"name":"Ruth","role":"PM","initials":"RA"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222205',
  'work-life-integration-lab',
  'Work-Life Integration Lab',
  'Wellbeing',
  'Experiment with boundaries, energy management, and values-aligned ambition in a judgment-free Circle.',
  'Women who want sustainable success—especially caregivers and high performers resetting their pace.',
  array['work-life-integration', 'building-confidence', 'returning-to-work'],
  array['mid-career', 'returning-to-work', 'senior-leader'],
  'virtual', 'weekly', 'Virtual · Global', 'Wednesdays · 8:00 AM', 'July 29', 7,
  '/assets/circles/work-life.jpg',
  'Two colleagues collaborating across a sunlit table',
  false,
  '{"name":"Camille Dubois","title":"Executive Coach","bio":"Camille helps members design experiments they can actually keep.","initials":"CD","since":"2024"}'::jsonb,
  '[{"name":"Bee","role":"Manager","initials":"BT"},{"name":"Olivia","role":"Consultant","initials":"OG"},{"name":"Nadia","role":"Physician","initials":"NF"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222206',
  'career-transition-circle-chicago',
  'Career Transition Circle · Chicago',
  'Career Transitions',
  'A grounded, in-person Circle for women changing industries, functions, or levels—with space to process uncertainty and plan next moves.',
  'Women actively navigating a career transition who want local community and practical peer feedback.',
  array['navigating-career-transition', 'finding-mentorship', 'building-confidence'],
  array['career-transition', 'early-career', 'mid-career'],
  'in-person', 'biweekly', 'Chicago, IL', 'Alternating Saturdays · 10:00 AM', 'August 1', 12,
  '/assets/circles/transition.jpg',
  'Team workshop conversation around a shared table',
  false,
  '{"name":"Keisha Morgan","title":"Career Strategist","bio":"Keisha has guided hundreds of transitions and keeps meetings focused and kind.","initials":"KM","since":"2020"}'::jsonb,
  '[{"name":"Anna","role":"UX","initials":"AP"},{"name":"Michelle","role":"Sales","initials":"MT"},{"name":"Fatima","role":"Ops","initials":"FD"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222207',
  'early-career-amplify',
  'Early Career Amplify',
  'Early Career',
  'Build confidence, communication skills, and a professional network in your first chapters of work.',
  'Women in the first 1–5 years of their careers who want mentorship energy and peer community.',
  array['building-confidence', 'finding-mentorship', 'growing-as-a-leader'],
  array['early-career'],
  'hybrid', 'monthly', 'Austin, TX', 'Last Tuesday · 6:00 PM', 'July 28', 14,
  '/assets/circles/early-career.jpg',
  'Young professionals collaborating outdoors',
  true,
  '{"name":"Jasmine Brooks","title":"Program Manager","bio":"Jasmine creates a welcoming space for questions you might not ask at work.","initials":"JB","since":"2023"}'::jsonb,
  '[{"name":"Zoe","role":"Associate","initials":"ZN"},{"name":"Carla","role":"Coordinator","initials":"CM"},{"name":"Priya","role":"Analyst","initials":"PS"}]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222208',
  'midcareer-momentum',
  'Mid-Career Momentum',
  'Career Growth',
  'Navigate the messy middle: scope expansion, sponsorship, and deciding what leadership looks like for you next.',
  'Women 7–15 years into their careers who want thoughtful peers—not just another networking mixer.',
  array['growing-as-a-leader', 'finding-mentorship', 'navigating-career-transition', 'building-confidence'],
  array['mid-career', 'career-transition'],
  'in-person', 'monthly', 'New York, NY', 'Second Monday · 6:30 PM', 'August 10', 10,
  '/assets/circles/product-tech.jpg',
  'Professionals collaborating in a bright workspace',
  true,
  '{"name":"Danielle Wright","title":"VP, Strategy","bio":"Danielle facilitates with editorial clarity and a bias toward actionable takeaways.","initials":"DW","since":"2021"}'::jsonb,
  '[{"name":"Sofia","role":"Director","initials":"SA"},{"name":"Grace","role":"Counsel","initials":"GP"},{"name":"Talia","role":"Design Lead","initials":"TG"}]'::jsonb
);
