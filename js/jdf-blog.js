(function () {
  const list = document.getElementById("blog-list");
  if (!list) return;
  const search = document.getElementById("blog-search");
  const select = document.getElementById("blog-category");
  const status = document.getElementById("blog-status");
  const monthNav = document.getElementById("blog-months");
  let posts = [];
  let activeMonth = "";

  function monthLabel(key) {
    return new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }

  function buildMonths() {
    const counts = {};
    posts.forEach((p) => {
      const key = (p.date || "").slice(0, 7);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    const items = [["", "All months", posts.length]].concat(
      Object.keys(counts)
        .sort()
        .reverse()
        .map((k) => [k, monthLabel(k), counts[k]]),
    );
    monthNav.textContent = "";
    items.forEach(([key, label, count]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.dataset.month = key;
      a.textContent = label + " (" + count + ")";
      if (key === activeMonth) a.classList.add("active");
      li.appendChild(a);
      monthNav.appendChild(li);
    });
  }

  function setMonth(key) {
    activeMonth = key;
    monthNav.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("active", a.dataset.month === key);
    });
    render();
  }

  monthNav.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-month]");
    if (!a) return;
    e.preventDefault();
    setMonth(a.dataset.month);
  });

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function postId(p) {
    const m = /activity:(\d+)/.exec(p.url || "");
    return m ? "post-" + m[1] : "";
  }

  function share(p, id, btn) {
    const url = location.origin + location.pathname + "#" + id;
    const done = (msg) => {
      btn.textContent = msg;
      setTimeout(() => (btn.textContent = "Share"), 2000);
    };
    const copied =
      navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(url).then(
            () => true,
            () => false,
          )
        : Promise.resolve(false);

    if (navigator.share) {
      navigator.share({ title: p.title, url }).catch(() => {});
      copied.then((ok) => ok && done("Link copied!"));
      return;
    }
    copied.then((ok) => {
      if (ok) done("Link copied!");
      else window.prompt("Copy this link:", url);
    });
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const cat = select.value;
    const shown = posts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (activeMonth && (p.date || "").slice(0, 7) !== activeMonth)
        return false;
      return (
        !q || (p.title + " " + (p.excerpt || "")).toLowerCase().includes(q)
      );
    });

    list.textContent = "";
    shown.forEach((p) => {
      const card = document.createElement("article");
      card.className = "blog-item blog-card";

      const meta = [];
      if (p.date && formatDate(p.date)) meta.push(formatDate(p.date));
      if (p.category) meta.push(p.category);
      if (meta.length) {
        const m = document.createElement("p");
        m.className = "card-meta";
        m.textContent = meta.join(" \u2022 ");
        card.appendChild(m);
      }

      const h = document.createElement("h3");
      h.className = "card-title";
      h.textContent = p.title;
      card.appendChild(h);

      if (p.excerpt) {
        const e = document.createElement("p");
        e.className = "blog-excerpt";
        e.textContent = p.excerpt;
        card.appendChild(e);
      }

      const id = postId(p);
      if (id) card.id = id;

      const actions = document.createElement("div");
      actions.className = "blog-actions";
      if (p.url) {
        const a = document.createElement("a");
        a.href = p.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "View on LinkedIn";
        a.setAttribute("aria-label", "View on LinkedIn: " + p.title);
        actions.appendChild(a);
      }
      if (id) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "blog-share-btn";
        b.textContent = "Share";
        b.setAttribute("aria-label", "Copy share link for: " + p.title);
        b.addEventListener("click", () => share(p, id, b));
        actions.appendChild(b);
      }
      card.appendChild(actions);
      list.appendChild(card);
    });

    status.textContent = shown.length + (shown.length === 1 ? " post" : " posts");
  }

  function focusLinkedPost() {
    const id = location.hash.slice(1);
    if (!id || id.indexOf("post-") !== 0) return;
    let el = document.getElementById(id);
    if (!el) {
      search.value = "";
      select.value = "";
      setMonth("");
      el = document.getElementById(id);
    }
    if (el) {
      el.classList.add("blog-card--linked");
      el.scrollIntoView({ block: "center" });
    }
  }

  fetch("data/blog-posts.json")
    .then((r) => r.json())
    .then((data) => {
      posts = data;
      Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))
        .sort()
        .forEach((c) => {
          const o = document.createElement("option");
          o.value = c;
          o.textContent = c;
          select.appendChild(o);
        });
      buildMonths();
      render();
      focusLinkedPost();
    })
    .catch(() => {
      status.textContent =
        "Posts could not be loaded right now. Please visit our LinkedIn page.";
    });

  search.addEventListener("input", render);
  select.addEventListener("change", render);
})();
