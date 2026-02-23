let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const scale = 1.4;
const canvas = document.getElementById("pdf-render");
const pdfButtons = document.querySelectorAll("[data-pdf]");

if (canvas) {
    const ctx = canvas.getContext("2d");

    const renderPage = (num) => {
        pageIsRendering = true;
        pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = { canvasContext: ctx, viewport };
            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;
                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });
            document.getElementById("page-num").textContent = num;
        });
    };

    const queueRenderPage = (num) => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    const onPrevPage = () => {
        if (!pdfDoc || pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    };

    const onNextPage = () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    };

    const loadPdf = (url) => {
        pdfjsLib
            .getDocument(url)
            .promise.then((pdfDoc_) => {
                pdfDoc = pdfDoc_;
                pageNum = 1;
                document.getElementById("page-count").textContent = pdfDoc.numPages;
                renderPage(pageNum);
            })
            .catch(() => {
                canvas.style.display = "none";
                document.getElementById("page-num").parentElement.innerHTML =
                    "<em>Please place the selected PDF inside assets/pdfs to view.</em>";
            });
    };

    document.getElementById("prev-page").addEventListener("click", onPrevPage);
    document.getElementById("next-page").addEventListener("click", onNextPage);

    pdfButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            pdfButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            canvas.style.display = "block";
            loadPdf(button.dataset.pdf);
        });
        if (index === 0) {
            button.classList.add("active");
        }
    });

    if (pdfButtons.length > 0) {
        loadPdf(pdfButtons[0].dataset.pdf);
    }
}