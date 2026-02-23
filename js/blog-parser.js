const blogContainer = document.getElementById("blog-content");
const blogList = document.getElementById("blog-list");

if (blogContainer && blogList) {
    if (window.marked && marked.use) {
        marked.use({
            renderer: {
                html: () => "",
            },
        });
        marked.setOptions({ mangle: false, headerIds: false });
    }

    const posts = [
        {
            title: "Why learning needs room to breathe",
            date: "Feb 2026",
            summary: "A gentle argument for slower, deeper study.",
            file: "content/blogs/post-001.md",
        },
    ];

    const loadPost = (post, index) => {
        blogList.querySelectorAll(".blog-item").forEach((item, itemIndex) => {
            item.classList.toggle("active", itemIndex === index);
        });

        fetch(post.file)
            .then((response) => {
                if (!response.ok) throw new Error("Markdown file not found");
                return response.text();
            })
            .then((text) => {
                blogContainer.innerHTML = marked.parse(text);
            })
            .catch(() => {
                blogContainer.innerHTML =
                    "<p>Error loading blog post. Note: Fetching local files requires a local live server to bypass browser security policies.</p>";
            });
    };

    blogList.innerHTML = posts
        .map(
            (post, index) => `
                <div class="blog-item" data-index="${index}">
                    <strong>${post.title}</strong><br>
                    <span class="card-meta">${post.date}</span>
                    <p class="card-meta" style="margin-top: 6px;">${post.summary}</p>
                </div>
            `
        )
        .join("");

    blogList.addEventListener("click", (event) => {
        const item = event.target.closest(".blog-item");
        if (!item) return;
        const index = Number(item.dataset.index);
        loadPost(posts[index], index);
    });

    loadPost(posts[0], 0);
}