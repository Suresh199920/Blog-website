const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
];

const PATH_PREFIXES = ["embed", "shorts", "live", "v"];

/** YouTube ids are exactly 11 chars of URL-safe base64. */
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isValidYouTubeId(value: string): boolean {
  return ID_PATTERN.test(value);
}

/**
 * Turn anything a person might paste into an 11-character video id.
 *
 * Accepts watch URLs, short `youtu.be` links, /embed, /shorts and
 * /live paths, `si=` share links, bare ids, and anything with extra
 * query params (`&t=42`, `&list=...`, tracking, ...).
 *
 * Returns `null` for anything that isn't a YouTube video so the
 * admin form can reject it before it reaches the database.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();

  if (!value) return null;

  // Bare id pasted straight into the field.
  if (ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const hostname = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.includes(hostname)) return null;

  // youtu.be/<id> is the only host where the id is the whole path.
  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && ID_PATTERN.test(id) ? id : null;
  }

  // youtube.com/watch?v=<id> — the most common shape.
  const queryId = url.searchParams.get("v");
  if (queryId && ID_PATTERN.test(queryId)) return queryId;

  // youtube.com/{embed,shorts,live,v}/<id>
  const segments = url.pathname.split("/").filter(Boolean);
  const [prefix, candidate] = segments;
  if (prefix && PATH_PREFIXES.includes(prefix.toLowerCase())) {
    return candidate && ID_PATTERN.test(candidate) ? candidate : null;
  }

  return null;
}

/** Canonical watch URL for an id. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Embed URL. `youtube-nocookie.com` is used because it does not set
 * tracking cookies until the visitor actually presses play.
 */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youtubeThumbnailUrl(
  id: string,
  quality: "hq" | "mq" | "max" = "hq"
): string {
  return `https://i.ytimg.com/vi/${id}/${quality}default.jpg`;
}

/** Seconds -> `12:34` or `1:02:03`. Returns "" for null/0. */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
}

/** Parse `mm:ss` / `hh:mm:ss` / plain seconds into a number. */
export function parseDuration(input: string): number | null {
  const value = input.trim();
  if (!value) return null;

  if (/^\d+$/.test(value)) return Number(value);

  const parts = value.split(":");
  if (parts.length < 2 || parts.length > 3) return null;

  const nums = parts.map((part) => {
    if (!/^\d+$/.test(part.trim())) return null;
    return Number(part.trim());
  });

  if (nums.some((n) => n === null)) return null;
  const [a, b, c] = nums as number[];

  return parts.length === 3 ? a * 3600 + b * 60 + c : a * 60 + b;
}