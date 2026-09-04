const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const POSTS_PATH = path.join(ROOT, "data", "posts.json");
const POSTS_DIR = path.join(ROOT, "posts");
const SITE_URL = process.env.SITE_URL || "https://reallyrealeducation.org";

function readPosts() {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(POSTS_PATH, "utf8").trim();
  return raw ? JSON.parse(raw) : [];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getPostPermalink(post) {
  return `${SITE_URL}/posts/${post.id}.html`;
}

function renderPostPage(post) {
  const permalink = getPostPermalink(post);
  const fallbackTitle = `Daily Quote ${post.imageNumber || ""}`;
  const title = `${post.title || fallbackTitle} | Really Real Education`;
  const description =
    post.excerpt || "Daily learning quote from Really Real Education.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Really Real Education">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(post.image)}">
    <meta property="og:url" content="${escapeHtml(permalink)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@JalteDiyeNPO">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(post.image)}">
    <link rel="canonical" href="${escapeHtml(permalink)}">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="icon" href="../assets/images/our mission.png" type="image/x-icon">
</head>
<body>
    <div class="page">
        <header class="site-header">
            <div class="site-header-inner">
                <div class="brand">
                    <div class="brand-title">Really Real Education</div>
                    <div class="brand-tagline">An Educational Initiative of <a href="https://jaltediyefoundation.org" target="_blank" rel="noopener noreferrer">Jalte Diye Foundation</a></div>
                </div>
                <nav class="site-nav">
                    <a href="../index.html">Home</a>
                    <a href="../books.html">Books</a>
                    <a href="../blog.html">Blogs</a>
                  <a href="../waking-up.html">Apply</a>
                </nav>
            </div>
        </header>

            <div class="projects-bar">
              <div class="projects-bar-inner">
                <span class="projects-label">Our Projects</span>
                <div class="projects-links">
                  <a href="../GVan.html">GVan</a>
                  <a href="../Cogentic.html" aria-current="page">Cogentic</a>
                  <a href="../Nurolab.html">Nurolab</a>
                </div>
              </div>
            </div>

        <main class="container">
            <section class="section">
                <div class="section-head posts-section-head">
                    <div>
                    <h1 class="section-title">Daily Posts Feed</h1>
                    <p class="section-desc">A fresh post is added every day</p>
                    </div>
                    <a class="btn secondary" href="../Cogentic.html">Back to all posts</a>
                </div>
              <article class="post-card" id="${escapeHtml(post.id)}">
                    <img class="post-image"
src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="eager">
                    <div class="post-body">
                        <h2 class="post-title">${escapeHtml(post.title || fallbackTitle)}</h2>
                        ${post.theme ? `<p class="card-meta">Theme: ${escapeHtml(post.theme)}</p>` : ""}
                        <p class="card-meta">Last updated: ${escapeHtml(formatDate(post.date))}</p>
                        <p>${escapeHtml(description)}</p>
                        ${post.hashtags ? `<p class="post-hashtags">${escapeHtml(post.hashtags)}</p>` : ""}
                    </div>
                </article>
            </section>
        </main>

        <footer class="footer">
            <div>Built by Jalte Diye Foundation for Learners at reallyrealeducation.org.</div>
            <div class="footer-links">
                <a href="https://jaltediyefoundation.org" target="_blank" rel="noopener noreferrer">Privacy &amp; Terms</a>
                <a href="../compliance.html">Compliance</a>
                <a href="../founder.html">Founder's message</a>
            </div>
            <div class="footer-links">
              <a class="social-link" href="https://www.facebook.com/JalteDiyeFoundation/" target="_blank" rel="noopener noreferrer" aria-label="Jalte Diye Foundation on Facebook"><img class="social-icon" src="../assets/images/Facebook_Logo_Primary.png" alt="Facebook"></a>
              <a class="social-link" href="https://www.instagram.com/jalte_diye_foundation/" target="_blank" rel="noopener noreferrer" aria-label="Jalte Diye Foundation on Instagram"><img class="social-icon" src="../assets/images/Instagram_Glyph_Gradient.png" alt="Instagram"></a>
              <a class="social-link" href="https://www.linkedin.com/company/jalte-diye-foundation/" target="_blank" rel="noopener noreferrer" aria-label="Jalte Diye Foundation on LinkedIn"><img class="social-icon" src="../assets/images/LI-In-Bug.png" alt="LinkedIn"></a>
              <a class="social-link" href="https://x.com/JalteDiyeNPO" target="_blank" rel="noopener noreferrer" aria-label="Jalte Diye Foundation on X"><img class="social-icon" src="../assets/images/logo-black.png" alt="X"></a>
              <a class="social-link" href="https://www.youtube.com/@JalteDiyeNPO" target="_blank" rel="noopener noreferrer" aria-label="Jalte Diye Foundation on YouTube"><img class="social-icon" src="../assets/images/yt_icon_red_digital.png" alt="YouTube"></a>
            </div>
            <div class="fine-print">You can subscribe to us on social media for updates.</div>
        </footer>
    </div>
</body>
</html>
`;
}

function main() {
  const posts = readPosts();
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  for (const post of posts) {
    const outputPath = path.join(POSTS_DIR, `${post.id}.html`);
    fs.writeFileSync(outputPath, renderPostPage(post), "utf8");
  }

  console.log(`Generated ${posts.length} post pages.`);
}

main();
