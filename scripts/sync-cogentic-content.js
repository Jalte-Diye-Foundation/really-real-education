const fs = require("node:fs");
const path = require("node:path");

const POSTS_PATH = path.join(__dirname, "..", "data", "posts.json");
const SITE_URL = process.env.SITE_URL || "https://reallyrealeducation.org";

// TODO: switch to the org repo once the deploy-pipeline fix is merged upstream:
// "https://raw.githubusercontent.com/Jalte-Diye-Foundation/Cogentic/main"
const COGENTIC_REPO_RAW =
  process.env.COGENTIC_REPO_RAW ||
  "https://raw.githubusercontent.com/Jalte-Diye-Foundation/Cogentic/main";

const METADATA_URL = `${COGENTIC_REPO_RAW}/website_assets/latest/metadata.json`;
const MAX_FETCH_ATTEMPTS = 4;
const FETCH_RETRY_DELAY_MS = 15_000;

function readPosts() {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }
  const content = fs.readFileSync(POSTS_PATH, "utf8").trim();
  return content ? JSON.parse(content) : [];
}

function writePosts(posts) {
  fs.writeFileSync(POSTS_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
}

async function fetchMetadata() {
  let lastError;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(METADATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not fetch Cogentic metadata.json: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_FETCH_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, FETCH_RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

function normalizeHashtags(hashtags) {
  if (Array.isArray(hashtags)) {
    return hashtags.filter(Boolean).join(" ");
  }
  return String(hashtags || "").trim();
}

function validateMetadata(metadata, expectedDate) {
  if (!metadata || typeof metadata !== "object") {
    throw new Error("Cogentic metadata.json must be a JSON object.");
  }

  if (metadata.date !== expectedDate) {
    throw new Error(
      `Cogentic metadata is for ${metadata.date || "an unknown date"}, expected ${expectedDate}.`
    );
  }

  if (!String(metadata.quote || "").trim() && !String(metadata.explanation || "").trim()) {
    throw new Error("Cogentic metadata.json has no quote or explanation.");
  }
}

function buildPost(metadata) {
  const quote = (metadata.quote || "").trim();
  const explanation = (metadata.explanation || "").trim();
  const caption = (metadata.caption || "").trim();
  const dateStr = metadata.date || new Date().toISOString().slice(0, 10);

  // Single source of truth for the post id: always date-based, so
  // daily-post.js (fallback) and this sync always agree on one id
  // per calendar day instead of creating two separate entries.
  const postId = `post-${dateStr}`;

  const archivedImageUrl = `${COGENTIC_REPO_RAW}/website_assets/archive/${dateStr}/poster.jpg`;

  return {
    id: postId,
    title: quote || "AI Quote of the Day",
    date: dateStr,
    excerpt: explanation || caption || "Daily AI-generated quote from Cogentic.",
    image: archivedImageUrl,
    source: metadata.source || "Cogentic AI",
    theme: metadata.theme || "",
    hashtags: normalizeHashtags(metadata.hashtags),
    permalink: `${SITE_URL}/posts/${postId}.html`
  };
}

async function main() {
  const expectedDate = new Date().toISOString().slice(0, 10);
  const metadata = await fetchMetadata();
  validateMetadata(metadata, expectedDate);

  const post = buildPost(metadata);
  const posts = readPosts();

  // Match by date OR by id so any pre-existing entry for today
  // (e.g. one created earlier by the fallback script) is replaced
  // instead of duplicated.
  const existingIndex = posts.findIndex((p) => p.date === post.date || p.id === post.id);

  if (existingIndex !== -1) {
    posts[existingIndex] = { ...posts[existingIndex], ...post };
    console.log(`Merged Cogentic AI content into existing post for ${post.date}.`);
  } else {
    posts.unshift(post);
    console.log(`Synced Cogentic AI post for ${post.date}.`);
  }

  writePosts(posts);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
