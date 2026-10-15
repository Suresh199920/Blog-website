/**
 * Sample content, used only when Supabase isn't configured.
 *
 * This exists so a fresh clone shows a finished-looking site instead of
 * a wall of empty states. It is never used once real keys are present:
 * every query in `lib/` returns real data as soon as `isSupabaseConfigured`
 * is true, so there is no demo code left in a live deployment.
 *
 * Images come from picsum.photos, a public placeholder image service.
 */
import type {
  Category,
  Post,
  Album,
  Video,
} from "@/types/database";
import type { PostWithRelations } from "@/lib/posts";
import type { PhotoWithAlbum } from "@/lib/photos";
import type { SiteSettings } from "@/lib/settings";

const img = (seed: string, width = 1200, height = 800) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

export const demoCategories: Category[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "engineering",
    name: "Engineering",
    description: "Building things for the web, and the mistakes along the way.",
    sort_order: 1,
    created_at: "2025-01-05T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "photography",
    name: "Photography",
    description: "Notes on light, framing and patience.",
    sort_order: 2,
    created_at: "2025-01-05T09:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "notes",
    name: "Notes",
    description: "Shorter write-ups and things I don't want to forget.",
    sort_order: 3,
    created_at: "2025-01-05T09:00:00.000Z",
  },
];

const cat = (slug: string) =>
  demoCategories.find((category) => category.slug === slug) ?? null;

type DemoPost = Post & Pick<PostWithRelations, "category" | "author">;

const demoAuthor = {
  display_name: "Sam Carter",
  avatar_url: null,
};

function makePost(
  overrides: Partial<DemoPost> & Pick<DemoPost, "id" | "slug" | "title" | "content">
): DemoPost {
  const categorySlug = overrides.category?.slug ?? null;

  return {
    excerpt: null,
    cover_image: null,
    cover_alt: null,
    category_id: cat(categorySlug ?? "")?.id ?? null,
    author_id: null,
    tags: [],
    status: "published",
    is_featured: false,
    reading_minutes: 5,
    published_at: "2026-01-15T10:00:00.000Z",
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z",
    category: categorySlug ? cat(categorySlug) : null,
    author: demoAuthor,
    ...overrides,
  };
}

export const demoPosts: DemoPost[] = [
  makePost({
    id: "a1000000-0000-4000-8000-000000000001",
    slug: "designing-for-the-slow-web",
    title: "Designing for the slow web",
    excerpt:
      "Fast sites are a feature, not a personality. What changes when you assume the connection is bad and the device is small?",
    cover_image: img("slow-web"),
    cover_alt: "A quiet road winding through hills at dusk",
    category: cat("engineering"),
    tags: ["performance", "css", "accessibility"],
    is_featured: true,
    reading_minutes: 7,
    published_at: "2026-02-18T09:30:00.000Z",
    updated_at: "2026-02-18T09:30:00.000Z",
    content: `Most sites are built for a machine that does not exist. A gigabit connection, a fast processor, and a user who never once opened developer tools.

Designing for the slow web is less about accepting slowness and more about **not depending on speed at all**.

## Start with the text

The fastest interface is plain text rendered by the browser. It reflows, it scales with the user's font size, it works when CSS fails, and it can be read aloud.

If a layout falls apart without its stylesheet, the stylesheet was doing too much.

## Images are usually the problem

Ask what each image is for. A decorative image can be lazy-loaded. An image that carries meaning needs alt text that says the same thing. Anything that is neither is just weight.

\`\`\`
A 400 KB hero image costs every visitor,
including the one on a train with two bars of signal.
\`\`\`

## Measure, then cut

Performance work gets interesting when you stop guessing. The profile is always more revealing than the guess:

- Which transfer dominates the total?
- Is the layout stable, or does it jump?
- Does the page stay usable while the rest loads?

## The payoff

Speed is a form of respect. Someone on a slow connection, on an old phone, on a bad day — they are still a reader. Building for them is mostly a matter of not making them wait for things they never asked for.`,
  }),
  makePost({
    id: "a1000000-0000-4000-8000-000000000002",
    slug: "server-actions-changed-how-i-write",
    title: "Server Actions changed how I write forms",
    excerpt:
      "No client state machine, no fetch wrapper, no API route to keep in sync. Just a function that validates and writes.",
    cover_image: img("server-actions"),
    cover_alt: "Abstract shapes arranged in a grid",
    category: cat("engineering"),
    tags: ["nextjs", "react", "forms"],
    is_featured: true,
    reading_minutes: 6,
    published_at: "2026-02-04T14:15:00.000Z",
    updated_at: "2026-02-04T14:15:00.000Z",
    content: `The traditional React form was always three things wearing a trench coat: client state, a change handler, and a fetch call to an endpoint you had to remember to write.

Server Actions collapse that into one function.

## The whole handler

\`\`\`ts
"use server";

export async function savePost(prev: State, formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await supabase.from("posts").insert(parsed.data);

  revalidatePath("/blog");
  return { success: "Saved" };
}
\`\`\`

No endpoint. No \`useState\` for the field values. No \`onSubmit\` handler.

## What actually improves

The part I did not expect was error handling. When validation lives next to the write, it is much harder to forget a case. The failure mode is a visible error message, not a \`500\` from a route that forgot to validate.

## What did not improve

Client-side validation. You still want it, because waiting for a round trip to tell someone their email is malformed is rude. The two layers are not redundant — one is about correctness, the other about responsiveness.`,
  }),
  makePost({
    id: "a1000000-0000-4000-8000-000000000003",
    slug: "the-case-for-ordinary-photography",
    title: "The case for ordinary photography",
    excerpt:
      "The photo you almost didn't take is usually the one worth keeping.",
    cover_image: img("ordinary-photo"),
    cover_alt: "An everyday street scene in flat afternoon light",
    category: cat("photography"),
    tags: ["photography", "essays"],
    is_featured: true,
    reading_minutes: 5,
    published_at: "2026-01-28T16:45:00.000Z",
    updated_at: "2026-01-28T16:45:00.000Z",
    content: `I used to think a photograph had to justify itself. Good light, clean composition, a subject worth talking about. Anything else felt like clutter.

That standard is expensive. Most days are not interesting, and the light is almost never right.

## The frame you skipped

The photos I keep are rarely the ones I planned. They are the ones taken while walking to the shop, or while waiting for a kettle, or because something about a wall caught my eye for half a second.

They are technically imperfect. They are also the only record I have of how those particular Tuesdays looked.

## Practical notes

- Carry the camera you will actually use. The good one in the drawer is not a camera.
- Shoot more than you think you need. You will throw most of it away.
- Do not upgrade gear to avoid making pictures.

## What changed

I stopped waiting for good conditions, which meant I stopped having nothing to show. The gap between "I should photograph this" and "I took a photo" turned out to be about four seconds of willingness.`,
  }),
  makePost({
    id: "a1000000-0000-4000-8000-000000000004",
    slug: "row-level-security-explained",
    title: "Row level security, explained properly",
    excerpt:
      "The most important eight lines in any Supabase app are the ones that decide who can read a row.",
    cover_image: img("rls"),
    cover_alt: "Rows of keys hanging on a rack",
    category: cat("engineering"),
    tags: ["supabase", "postgres", "security"],
    reading_minutes: 8,
    published_at: "2026-01-20T11:00:00.000Z",
    updated_at: "2026-01-20T11:00:00.000Z",
    content: `A row level security policy is a promise about your database: *this* person may see *these* rows, and nobody else may.

It runs before your query returns, on every single row access. That makes it the cheapest place to enforce a rule and the easiest place to forget one.

## The default is deny

RLS is off until you turn it on, and once it is on, a table with **no policy** denies everything — including your own app.

\`\`\`sql
alter table posts enable row level security;

create policy "Anyone can read published posts"
  on posts for select
  using (status = 'published');
\`\`\`

## Reading policies

\`\`\`
USING       → which existing rows are visible
WITH CHECK  → which new rows may be written
\`\`\`

A \`select\` policy only needs \`USING\`. An \`insert\` policy only needs \`WITH CHECK\`. A \`for all\` policy needs both, and forgetting the second is how insert-only holes appear.

## Test it from the outside

Policies are easy to get subtly wrong and hard to test by hand. The reliable check is to query as a non-admin user:

\`\`\`ts
const anon = createClient(url, anonKey);
const { data } = await anon.from("posts").select("*");
\`\`\`

If you see a draft in that result, a policy is too permissive.`,
  }),
  makePost({
    id: "a1000000-0000-4000-8000-000000000005",
    slug: "notes-on-markdown-and-xss",
    title: "Notes on Markdown and XSS",
    excerpt:
      "Rendering user-authored Markdown safely is mostly a question of what you allow, not what you escape.",
    cover_image: img("markdown"),
    cover_alt: "Handwritten notes beside a laptop",
    category: cat("notes"),
    tags: ["security", "markdown"],
    reading_minutes: 4,
    published_at: "2026-01-12T08:20:00.000Z",
    updated_at: "2026-01-12T08:20:00.000Z",
    content: `Markdown is HTML with shortcuts. That sentence contains the entire security problem: if you render it to HTML and inject that HTML, you have handed over script execution.

## Allow-list, not block-list

Blocking \`<script>\` is a losing game. There are event handlers, \`javascript:\` URLs, \`iframe\` sources, and a new one every time you read a CVE.

\`\`\`ts
sanitizeHtml(dirty, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt"],
  },
  allowedSchemes: ["http", "https", "mailto"],
});
\`\`\`

The list of things you *do* allow is short, finite, and reviewable. That is the property worth having.

## One more thing

Sanitise on the way in, or on the way out — but be consistent. Doing it in only one place means the other path is a hole waiting for a migration.`,
  }),
  makePost({
    id: "a1000000-0000-4000-8000-000000000006",
    slug: "a-week-of-taking-photos",
    title: "A week of taking photos",
    excerpt:
      "Seven days, one rule: photograph something every day, however ordinary.",
    cover_image: img("week-photos"),
    cover_alt: "A collection of everyday objects on a table",
    category: cat("photography"),
    tags: ["photography", "practice"],
    reading_minutes: 4,
    published_at: "2026-01-06T19:30:00.000Z",
    updated_at: "2026-01-06T19:30:00.000Z",
    content: `A daily practice is easy to start and easy to abandon. What made this one stick was lowering the bar until refusing was awkward.

## The rule

One photograph a day. Not a good one. Not a considered one. One.

## What that produced

Monday was a shadow on a wall. Tuesday was the same bin I'd photographed three weeks running. Wednesday was genuinely good and I nearly didn't take it because the light had already moved.

That is the pattern, and it is the argument for the low bar: **the good ones arrive attached to the ordinary ones.**

## What I kept

Four out of seven. The others I deleted without sentiment, which only worked because the rule was never "keep every frame".`,
  }),
];

function makeAlbum(
  id: string,
  slug: string,
  name: string,
  description: string,
  cover: string,
  sortOrder: number
): Album {
  return {
    id,
    slug,
    name,
    description,
    cover_photo: cover,
    sort_order: sortOrder,
    created_at: "2025-06-01T09:00:00.000Z",
  };
}

export const demoAlbums: Album[] = [
  makeAlbum(
    "c1000000-0000-4000-8000-000000000001",
    "street-level",
    "Street level",
    "Ordinary scenes, close attention.",
    img("album-street", 900, 600),
    1
  ),
  makeAlbum(
    "c1000000-0000-4000-8000-000000000002",
    "coastline",
    "Coastline",
    "Long exposures and grey mornings.",
    img("album-coast", 900, 600),
    2
  ),
  makeAlbum(
    "c1000000-0000-4000-8000-000000000003",
    "desk",
    "Desk",
    "Whatever was on it that week.",
    img("album-desk", 900, 600),
    3
  ),
];

function makePhoto(
  id: string,
  seed: string,
  title: string,
  albumSlug: string | null,
  caption: string,
  sortOrder: number
): PhotoWithAlbum {
  return {
    id,
    album_id: albumSlug ? demoAlbums.find((a) => a.slug === albumSlug)!.id : null,
    title,
    caption,
    image_path: img(seed, 1200, 800),
    alt_text: title,
    width: 1200,
    height: 800,
    sort_order: sortOrder,
    created_at: "2026-02-01T10:00:00.000Z",
    album: albumSlug
      ? (() => {
          const album = demoAlbums.find((a) => a.slug === albumSlug)!;
          return { id: album.id, name: album.name, slug: album.slug };
        })()
      : null,
  };
}

export const demoPhotos: PhotoWithAlbum[] = [
  makePhoto("b1000000-0000-4000-8000-000000000001", "p-01", "Crossing", "street-level", "Four o'clock light, empty road.", 1),
  makePhoto("b1000000-0000-4000-8000-000000000002", "p-02", "Corner shop", "street-level", "Still open, which surprised me.", 2),
  makePhoto("b1000000-0000-4000-8000-000000000003", "p-03", "Bus stop", "street-level", "Nobody waiting. Good advertisement.", 3),
  makePhoto("b1000000-0000-4000-8000-000000000004", "p-04", "Fire escape", "street-level", "The shadow does all the work.", 4),
  makePhoto("b1000000-0000-4000-8000-000000000005", "p-05", "Tide line", "coastline", "Where the water gave up.", 5),
  makePhoto("b1000000-0000-4000-8000-000000000006", "p-06", "Grey morning", "coastline", "Thirty seconds at f/11.", 6),
  makePhoto("b1000000-0000-4000-8000-000000000007", "p-07", "Breakwater", "coastline", "Windier than it looks.", 7),
  makePhoto("b1000000-0000-4000-8000-000000000008", "p-08", "Headland", "coastline", "Last frame before the battery died.", 8),
  makePhoto("b1000000-0000-4000-8000-000000000009", "p-09", "Monday", "desk", "Not a still life. A Monday.", 9),
  makePhoto("b1000000-0000-4000-8000-00000000000a", "p-10", "Chargers", "desk", "The archaeology of charging cables.", 10),
  makePhoto("b1000000-0000-4000-8000-00000000000b", "p-11", "Notebook", "desk", "Mostly blank, which is the point.", 11),
  makePhoto("b1000000-0000-4000-8000-00000000000c", "p-12", "Reading", "desk", "Same chair for three years.", 12),
];

function makeVideo(
  id: string,
  title: string,
  description: string,
  category: string | null,
  seconds: number | null,
  featured: boolean,
  publishedAt: string
): Video {
  return {
    id,
    // Intentionally empty: the demo has no real YouTube video to embed.
    // `VideoCard` falls back to a placeholder rather than a broken image.
    youtube_id: "",
    youtube_url: "",
    title,
    description,
    category,
    duration_seconds: seconds,
    is_featured: featured,
    sort_order: 0,
    published_at: publishedAt,
    created_at: publishedAt,
    updated_at: publishedAt,
  };
}

export const demoVideos: Video[] = [
  makeVideo("d1000000-0000-4000-8000-000000000001", "A walk along the harbour", "Twenty minutes, one lens, no plan.", "Photography", 1180, true, "2026-02-16T10:00:00.000Z"),
  makeVideo("d1000000-0000-4000-8000-000000000002", "Reading Postgres query plans", "Why the index you added did nothing.", "Engineering", 2245, true, "2026-02-10T10:00:00.000Z"),
  makeVideo("d1000000-0000-4000-8000-000000000003", "Building a contact sheet", "Rolling film, scanning, and picking twelve frames.", "Photography", 942, false, "2026-01-30T10:00:00.000Z"),
  makeVideo("d1000000-0000-4000-8000-000000000004", "Long exposure without a tripod", "Walls, a doorway, and patience.", "Photography", 604, false, "2026-01-22T10:00:00.000Z"),
  makeVideo("d1000000-0000-4000-8000-000000000005", "Deploying a Next.js app", "Env vars, build output, and the first 500.", "Engineering", 1573, false, "2026-01-14T10:00:00.000Z"),
];

export const demoSettings: SiteSettings = {
  site_title: "Field Notes",
  banner_image: "",
  site_tagline:
    "Writing about engineering, photography, and the occasional detour.",
  site_description:
    "Essays and notes on building software, taking photographs, and paying attention. Includes a photo gallery and a video library.",
  about_body: `I'm **Sam Carter**. I build web software and take far too many photographs of ordinary things.

This site is where the two meet: longer write-ups about engineering and photography, a gallery of pictures I didn't think twice about, and a small library of videos.

## What you'll find here

- **Engineering** — mostly about the web platform, databases, and the performance work that nobody notices until it goes wrong.
- **Photography** — street work, long exposures, and the ongoing argument with myself about gear.
- **Notes** — shorter pieces, usually written because I wanted to remember something.

## Elsewhere

The best way to reach me is the [contact page](/contact).`,
  contact_email: "hello@example.com",
};