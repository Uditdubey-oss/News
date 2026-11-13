
const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const newsTitle = document.getElementById("newsTitle");
const refreshBtn = document.getElementById("refreshBtn");

let currentCategory = "general";
let currentSearch = "";

// Fetch category news
async function fetchNews(category = "general") {
    currentCategory = category;
    currentSearch = "";

    searchInput.value = "";
    newsTitle.textContent =
        category === "general"
            ? "Top Headlines"
            : category.charAt(0).toUpperCase() + category.slice(1) + " News";

    await loadNews(`/api/news?category=${category}`);
}

// Fetch and display news
async function loadNews(url) {
    newsContainer.innerHTML =
        '<div class="message">Loading latest news...</div>';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        displayNews(data.articles || []);

    } catch (error) {
        newsContainer.innerHTML = "";

        const message = document.createElement("p");
        message.className = "message";
        message.textContent = error.message;

        newsContainer.appendChild(message);
    }
}

// Display news cards
function displayNews(articles) {
    newsContainer.innerHTML = "";

    if (articles.length === 0) {
        newsContainer.innerHTML =
            '<div class="message">No news articles found. Try another search.</div>';
        return;
    }

    articles.forEach(article => {
        const card = document.createElement("article");
        card.className = "news-card";

        // News image
        const image = document.createElement("img");
        image.className = "news-image";
        image.src = article.image || "https://placehold.co/600x400?text=DailyNews";
        image.alt = article.title || "News image";
        image.loading = "lazy";

        image.onerror = () => {
            image.src = "https://placehold.co/600x400?text=Image+Unavailable";
        };

        // Content section
        const content = document.createElement("div");
        content.className = "news-content";

        const source = document.createElement("span");
        source.className = "news-source";
        source.textContent = article.source?.name || "News";

        const title = document.createElement("h3");
        title.textContent = article.title || "Untitled News";

        const description = document.createElement("p");
        description.className = "news-description";
        description.textContent =
            article.description || "No description available.";

        const date = document.createElement("span");
        date.className = "news-date";

        date.textContent = article.publishedAt
            ? new Date(article.publishedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            })
            : "Date unavailable";

        // Original article link
        const link = document.createElement("a");
        link.className = "read-more";
        link.textContent = "Read Full Article →";

        try {
            const articleURL = new URL(article.url);

            if (articleURL.protocol === "https:" ||
                articleURL.protocol === "http:") {
                link.href = articleURL.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            } else {
                link.textContent = "Article link unavailable";
            }
        } catch {
            link.textContent = "Article link unavailable";
        }

        content.append(source, title, description, date, link);

        card.append(image, content);

        newsContainer.appendChild(card);
    });
}

// Category buttons
document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelector(".category.active")
            ?.classList.remove("active");

        button.classList.add("active");

        fetchNews(button.dataset.category);
    });

});

// Search functionality
searchForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        searchInput.focus();
        return;
    }

    currentSearch = query;

    newsTitle.textContent = `Search Results: ${query}`;

    document.querySelector(".category.active")
        ?.classList.remove("active");

    await loadNews(`/api/search?q=${encodeURIComponent(query)}`);

});

// Refresh news
refreshBtn.addEventListener("click", () => {

    if (currentSearch) {
        loadNews(`/api/search?q=${encodeURIComponent(currentSearch)}`);
    } else {
        fetchNews(currentCategory);
    }

});

// Initial news
fetchNews();
