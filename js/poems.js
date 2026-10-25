(function () {
  const poemLinks = document.querySelectorAll(".blog-nav a[data-pdf]");
  const poemPdfViewer = document.getElementById("poem-pdf-viewer");

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }

  async function renderPoem(path) {
    if (!window.pdfjsLib) {
      poemPdfViewer.textContent =
        "PDF viewer could not be loaded. Please try again when you are online.";
      return;
    }
    try {
      poemPdfViewer.textContent = "Loading poem...";
      const pdfDoc = await pdfjsLib.getDocument({
        url: path,
        disableWorker: window.location.protocol === "file:",
      }).promise;
      const viewerWidth = Math.max(poemPdfViewer.clientWidth, 320);
      poemPdfViewer.innerHTML = "";
      for (let n = 1; n <= pdfDoc.numPages; n++) {
        const page = await pdfDoc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: (viewerWidth - 24) / base.width,
        });
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.cssText =
          "display:block;width:100%;height:auto;margin-bottom:16px";
        poemPdfViewer.appendChild(canvas);
        await page.render({
          canvasContext: canvas.getContext("2d"),
          transform: [outputScale, 0, 0, outputScale, 0, 0],
          viewport,
        }).promise;
      }
    } catch {
      poemPdfViewer.textContent = "This poem could not be loaded.";
    }
  }

  function showPoem(link) {
    poemLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    renderPoem(link.dataset.pdf);
  }

  function showFromHash() {
    const link =
      Array.from(poemLinks).find(
        (l) => l.getAttribute("href") === location.hash,
      ) || document.querySelector('.poem-list a[href="#poem-jalte-diye"], a[href="#poem-jalte-diye"]');
    if (link) showPoem(link);
  }

  poemLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (location.hash !== link.getAttribute("href")) {
        history.pushState(null, "", link.getAttribute("href"));
      }
      showPoem(link);
    });
  });

  window.addEventListener("popstate", showFromHash);
  showFromHash();
})();
