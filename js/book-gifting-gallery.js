const supportedImage = /\.(jpe?g|png|webp)$/i;

const isValidName = (name) =>
  typeof name === "string" &&
  supportedImage.test(name) &&
  name === name.split(/[\\/]/).pop();

let lightbox;
const registry = new Map();

const slug = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const setHash = (id) => {
  const url = id
    ? `#${id}`
    : window.location.pathname + window.location.search;
  history.replaceState(null, "", url);
};

const openFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const entry = registry.get(id);
  if (!entry || (lightbox && !lightbox.isHidden() && lightbox.currentId() === id)) {
    return;
  }
  entry.open();
  entry.card.scrollIntoView({ block: "center" });
};

const getLightbox = () => {
  if (lightbox) return lightbox;

  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.hidden = true;

  const image = document.createElement("img");
  image.className = "lightbox-image";

  const makeButton = (className, label, text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lightbox-btn ${className}`;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
  };

  const closeButton = makeButton("lightbox-close", "Close", "\u00D7");
  const prevButton = makeButton("lightbox-prev", "Previous photo", "\u2039");
  const nextButton = makeButton("lightbox-next", "Next photo", "\u203A");
  const shareButton = makeButton("lightbox-share", "Copy link", "Copy link");
  overlay.append(image, closeButton, prevButton, nextButton, shareButton);
  document.body.appendChild(overlay);

  let items = [];
  let index = 0;

  shareButton.addEventListener("click", async () => {
    const url = `${window.location.origin}${window.location.pathname}#${items[index].id}`;
    try {
      await navigator.clipboard.writeText(url);
      shareButton.textContent = "Link copied!";
    } catch {
      window.prompt("Copy this link:", url);
    }
    setTimeout(() => (shareButton.textContent = "Copy link"), 1800);
  });

  const render = () => {
    image.src = items[index].src;
    image.alt = items[index].alt;
    setHash(items[index].id);
    const multiple = items.length > 1;
    prevButton.hidden = !multiple;
    nextButton.hidden = !multiple;
  };
  const step = (delta) => {
    index = (index + delta + items.length) % items.length;
    render();
  };
  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = "";
    setHash("");
  };

  closeButton.addEventListener("click", close);
  prevButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") close();
    if (items.length > 1 && event.key === "ArrowLeft") step(-1);
    if (items.length > 1 && event.key === "ArrowRight") step(1);
  });

  lightbox = {
    isHidden: () => overlay.hidden,
    currentId: () => items[index]?.id,
    open(newItems, startIndex) {
      items = newItems;
      index = startIndex;
      render();
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton.focus();
    },
  };
  return lightbox;
};

const createImage = (gallery, directory, name) => {
  const image = document.createElement("img");
  image.className = "book-cover-image book-gifting-photo";
  image.src = `${directory}${encodeURIComponent(name)}`;
  image.alt = gallery.dataset.imageAlt;
  image.loading = "lazy";
  return image;
};

const createSingleCard = (gallery, directory, name) => {
  const card = document.createElement("article");
  card.className = "book-card fade-up";
  const id = `${gallery.dataset.sharePrefix}-${slug(name)}`;
  card.id = id;
  const cover = document.createElement("div");
  cover.className = "book-cover";
  const image = createImage(gallery, directory, name);
  const markLandscape = () => {
    if (image.naturalWidth > image.naturalHeight) {
      card.classList.add("is-landscape");
    }
  };
  image.addEventListener("load", markLandscape);
  if (image.complete) {
    markLandscape();
  }
  const open = () =>
    getLightbox().open([{ src: image.src, alt: image.alt, id }], 0);
  registry.set(id, { card, open });
  cover.classList.add("is-zoomable");
  cover.addEventListener("click", open);
  cover.appendChild(image);
  card.appendChild(cover);
  return card;
};

const createSlideshowCard = (gallery, directory, names) => {
  const card = document.createElement("article");
  card.className = "book-card fade-up is-landscape is-slideshow";
  const cover = document.createElement("div");
  cover.className = "book-cover";
  const slides = names.map((name, index) => {
    const image = createImage(gallery, directory, name);
    image.classList.add("slide");
    image.classList.toggle("is-active", index === 0);
    image.dataset.shareId = `${gallery.dataset.sharePrefix}-${slug(name)}`;
    cover.appendChild(image);
    return image;
  });
  card.id = slides[0].dataset.shareId;
  const lightboxItems = () =>
    slides.map((slide) => ({
      src: slide.src,
      alt: slide.alt,
      id: slide.dataset.shareId,
    }));
  slides.forEach((slide, i) =>
    registry.set(slide.dataset.shareId, {
      card,
      open: () => {
        show(i);
        getLightbox().open(lightboxItems(), i);
      },
    }),
  );

  let current = 0;
  const dots = [];
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) =>
      slide.classList.toggle("is-active", i === current),
    );
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  };

  const makeButton = (className, label, text, step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    button.addEventListener("click", () => show(current + step));
    return button;
  };

  const dotsRow = document.createElement("div");
  dotsRow.className = "slide-dots";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slide-dot";
    dot.setAttribute("aria-label", `Show photo ${index + 1}`);
    dot.addEventListener("click", () => show(index));
    dots.push(dot);
    dotsRow.appendChild(dot);
  });

  cover.classList.add("is-zoomable");
  cover.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    getLightbox().open(lightboxItems(), current);
  });

  cover.append(
    makeButton("slide-btn slide-prev", "Previous photo", "\u2039", -1),
    makeButton("slide-btn slide-next", "Next photo", "\u203A", 1),
    dotsRow,
  );
  card.appendChild(cover);
  show(0);
  return card;
};

document.querySelectorAll("[data-image-manifest]").forEach((gallery) => {
  const manifestPath = gallery.dataset.imageManifest;
  const directory = manifestPath.slice(0, manifestPath.lastIndexOf("/") + 1);

  fetch(manifestPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Unable to load gallery image list: ${response.status}`,
        );
      }

      return response.json();
    })
    .then((entries) => {
      if (!Array.isArray(entries)) {
        throw new Error("Gallery image list must be an array.");
      }

      const valid = entries.every((entry) =>
        Array.isArray(entry)
          ? entry.length > 0 && entry.every(isValidName)
          : isValidName(entry),
      );
      if (!valid) {
        throw new Error(
          "Gallery image list contains an invalid filename or image type.",
        );
      }

      const cards = entries.flatMap((entry) => {
        if (!Array.isArray(entry)) {
          return [createSingleCard(gallery, directory, entry)];
        }

        const rowBreak = document.createElement("span");
        rowBreak.className = "gallery-row-break";
        return [createSlideshowCard(gallery, directory, entry), rowBreak];
      });

      if (cards.length > 0) {
        gallery.replaceChildren(...cards);
        openFromHash();
      }
    })
    .catch((error) => {
      console.error(error);
      gallery.textContent = "Photos could not be loaded. Please try again later.";
    });
});

document.querySelectorAll(".book-grid .book-card").forEach((card) => {
  const image = card.querySelector(".book-cover-image");
  const cover = card.querySelector(".book-cover");
  if (!image || !cover) return;
  const id = `book-${slug(image.getAttribute("src").split("/").pop())}`;
  card.id = id;
  const open = () =>
    getLightbox().open(
      [{ src: image.currentSrc || image.src, alt: image.alt, id }],
      0,
    );
  registry.set(id, { card, open });
  cover.classList.add("is-zoomable");
  cover.addEventListener("click", open);
});

window.addEventListener("hashchange", openFromHash);
openFromHash();