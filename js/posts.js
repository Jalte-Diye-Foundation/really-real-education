(function () {
  const feedContainer = document.getElementById("posts-feed");
  const postsUrl = "data/posts.json";
  const latestPoster =
    "https://raw.githubusercontent.com/Jalte-Diye-Foundation/Cogentic/main/website_assets/latest/poster.jpg";
  // Fallback post: day-of-year image shown when posts.json cannot be fetched.
  // Updated to day 101 = April 11 = quote_101.jpg
  const fallbackPosts = [
    {
      id: "post-2026-04-11",
      title: "Daily Quote 101",
      date: "2026-04-11",
      excerpt: "Daily learning quote post #101.",
      image:
        "https://raw.githubusercontent.com/Jalte-Diye-Foundation/Cogentic/main/Background1/quote_101.jpg",
      imageNumber: 101,
      permalink: "https://reallyrealeducation.org/posts/post-2026-04-11.html",
    },
  ];

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
    });
  }

  function getPostUrl(postId) {
    return `${window.location.origin}/posts/${postId}.html`;
  }

  function getResolvedPostUrl(post) {
    return post.permalink || getPostUrl(post.id);
  }

  function getQuoteNumber(post) {
    return post.imageNumber || post.title.match(/(\d+)/)?.[1] || "";
  }

  function createQuoteMessage(post) {
    const quoteNumber = getQuoteNumber(post);
    return [
      `Quote ${quoteNumber}`,
      "A small thought. A deeper meaning.",
      "",
      "If this resonates, share it with someone who needs it today.",
      "",
      "#DailyQuote #WorldPeace  #Education #LifelongLearning #Wisdom #SelfGrowth #InnerPeace",
    ].join("\n");
  }

  // Caption used when a platform composer opens after image sharing/download.
  function createCaption(post) {
    return `${post.title}\n${post.excerpt}\n\n${createQuoteMessage(post)}\n\nReally Real Education — Jalte Diye Foundation`;
  }

  function getPlatformShareUrl(platform, post) {
    const postUrl = getResolvedPostUrl(post);
    const text = `${post.title}\n\n${post.excerpt}`;

    const urls = {
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      X: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${postUrl}`)}`,
    };

    return urls[platform];
  }

  // Update Open Graph and Twitter Card meta tags so the page preview shows today's image
  // when someone shares the page URL itself (e.g. on WhatsApp, Slack, Discord).
  function updateOgTags(post) {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("content", value);
    };
    set("og-title", `${post.title} — Really Real Education`);
    set(
      "og-description",
      post.excerpt || "Daily learning quote from Really Real Education.",
    );
    set("og-image", post.image);
    set("og-url", getResolvedPostUrl(post));
    set("tw-title", `${post.title} — Really Real Education`);
    set(
      "tw-description",
      post.excerpt || "Daily learning quote from Really Real Education.",
    );
    set("tw-image", post.image);
    document.title = `${post.title} | Really Real Education`;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return Promise.resolve();
  }

  async function tryNativeImageShare(post) {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    const response = await fetch(post.image);
    if (!response.ok) {
      return false;
    }

    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const imageBlob = await response.blob();
    const quoteNumber = String(getQuoteNumber(post) || "image");
    const imageFile = new File([imageBlob], `quote-${quoteNumber}.jpg`, {
      type: mimeType,
    });

    if (!navigator.canShare({ files: [imageFile] })) {
      return false;
    }

    await navigator.share({
      files: [imageFile],
      title: `${post.title} | Really Real Education`,
      text: createCaption(post),
      url: getResolvedPostUrl(post),
    });
    return true;
  }

  async function onNativeShare(post) {
    try {
      const shared = await tryNativeImageShare(post);
      if (shared) {
        return;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
    }

    await copyTextToClipboard(getResolvedPostUrl(post));
    alert("Post link copied.");
  }

  function renderPosts(posts) {
    if (!posts.length) {
      feedContainer.innerHTML =
        '<article class="post-card"><p>No posts yet. The daily automation will add one shortly.</p></article>';
      return;
    }

    // Update OG tags with the newest (first) post so page-level shares show today's image.
    updateOgTags(posts[0]);

    feedContainer.innerHTML = posts
      .map((post) => {
        return `
          <article class="post-card" id="${escapeHtml(post.id)}">
             <img class="post-image"
src="${escapeHtml(post.image)}"alt="${escapeHtml(post.title)}" loading="lazy">
            <div class="post-body">
              <h2 class="post-title">${escapeHtml(post.title || `Daily Quote ${getQuoteNumber(post)}`)}</h2>
              ${post.theme ? `<p class="card-meta">Theme: ${escapeHtml(post.theme)}</p>` : ""}
              <p class="card-meta">Last updated: ${escapeHtml(formatDate(post.date))}</p>
              <p>${escapeHtml(post.excerpt)}</p>
              ${post.hashtags ? `<p class="post-hashtags">${escapeHtml(post.hashtags)}</p>` : ""}
              <div class="post-actions">
                <button class="btn secondary share-btn native-share" type="button" data-post-id="${escapeHtml(post.id)}">Share</button>
                <a class="btn secondary share-btn" href="${escapeHtml(getPlatformShareUrl("LinkedIn", post))}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a class="btn secondary share-btn" href="${escapeHtml(getPlatformShareUrl("X", post))}" target="_blank" rel="noopener noreferrer">X</a>
                <a class="btn secondary share-btn" href="${escapeHtml(getPlatformShareUrl("Facebook", post))}" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a class="btn secondary share-btn" href="${escapeHtml(getPlatformShareUrl("WhatsApp", post))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <button class="btn secondary share-btn copy-link" type="button" data-post-id="${escapeHtml(post.id)}">Copy link</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    const postById = Object.fromEntries(posts.map((post) => [post.id, post]));
    const nativeShareButtons = feedContainer.querySelectorAll(".native-share");
    nativeShareButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const postId = button.getAttribute("data-post-id") || "";
        const post = postById[postId];
        if (!post) {
          return;
        }
        onNativeShare(post);
      });
    });

    const copyLinkButtons = feedContainer.querySelectorAll(".copy-link");
    copyLinkButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const postId = button.getAttribute("data-post-id") || "";
        const post = postById[postId];
        if (!post) {
          return;
        }
        copyTextToClipboard(getResolvedPostUrl(post))
          .then(() => alert("Post link copied."))
          .catch(() => alert("Could not copy the post link."));
      });
    });
  }

  fetch(postsUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load posts: ${response.status}`);
      }
      return response.json();
    })
    .then((posts) => {
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      renderPosts(posts);
    })
    .catch((error) => {
      // Local file previews and restrictive hosts can block JSON fetch; show the first quote post as fallback.
      console.warn(
        "Unable to load posts.json, using fallback post list.",
        error,
      );
      renderPosts(fallbackPosts);
    });
})();
