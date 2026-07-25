const fs = require("node:fs");
const path = require("node:path");

const POSTS_PATH = path.join(__dirname, "..", "data", "posts.json");

function readPosts() {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }

  const content = fs.readFileSync(POSTS_PATH, "utf8").trim();
  return content ? JSON.parse(content) : [];
}

function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

// This script used to build its own post from the old static
// `Background1/quote_NNN.jpg` images, keyed by day-of-year. That ran
// independently of the real Cogentic pipeline and created a *second*
// post entry for the same date (with the old background), which is
// what caused duplicate/repeated posts.
//
// Cogentic already generates one real, event-aware post per day
// (see scripts/sync-cogentic-content.js). This script now only acts
// as a safety-net log: if for some reason today's Cogentic sync
// hasn't produced a post yet, it says so instead of silently
// publishing a stale, unrelated image.
async function main() {
  const posts = readPosts();
  const today = formatToday();

  if (posts.some((post) => post.date === today)) {
    console.log("A post for today already exists (from Cogentic sync). Nothing to do.");
    return;
  }

  console.log(
    `No post for ${today} yet. Waiting on Cogentic content sync — not creating a fallback post from the old background set.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
