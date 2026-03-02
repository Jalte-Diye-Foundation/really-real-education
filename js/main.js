const bookGrid = document.getElementById("book-grid");

if (bookGrid) {
    const books = [
        {
            title: "Poems for Jalte Diye Foundation",
            author: "Narsingh Lal Sharma",
            tag: "Poetry",
            link: "https://www.amazon.in/-/hi/Narsingh-Lal-Sharma/dp/9394901701",
        },
        {
            title: "Education for Everyday Life",
            author: "Really Real Education",
            tag: "Learning",
            link: "https://www.amazon.in/-/hi/Narsingh-Lal-Sharma/dp/9394901701",
        },
    ];

    bookGrid.innerHTML = books
        .map((book, index) => {
            const coverImage =
                index % 2 === 0
                    ? "assets/images/badlav.jpg"
                    : "assets/images/Nirbhay_geet.jpg";

            return `
                <div class="book-card fade-up">
                    <div class="book-cover">
                        <img class="book-cover-image" src="${coverImage}" alt="${book.title} cover">
                    </div>
                    <div>
                        <h3>${book.title}</h3>
                        <p class="card-meta">${book.author}</p>
                    </div>
                    <div class="book-actions">
                        <span class="tag">${book.tag}</span>
                        <a href="${book.link}" target="_blank" rel="noopener noreferrer" class="btn">Buy</a>
                    </div>
                </div>
            `;
        })
        .join("");
}