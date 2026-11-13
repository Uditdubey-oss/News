
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.GNEWS_API_KEY;

const categories = [
    "general",
    "business",
    "technology",
    "sports",
    "entertainment",
    "science"
];

// Fetch category news
app.get("/api/news", async (req, res) => {
    try {
        const category = req.query.category || "general";

        if (!categories.includes(category)) {
            return res.status(400).json({
                message: "Invalid news category"
            });
        }

        const url = new URL(
            "https://gnews.io/api/v4/top-headlines"
        );

        url.searchParams.set("category", category);
        url.searchParams.set("country", "in");
        url.searchParams.set("lang", "en");
        url.searchParams.set("max", "10");
        url.searchParams.set("apikey", API_KEY);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.errors?.[0] || "News API error"
            });
        }

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch news"
        });
    }
});

// Search news
app.get("/api/search", async (req, res) => {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                message: "Please enter a search keyword"
            });
        }

        const url = new URL(
            "https://gnews.io/api/v4/search"
        );

        url.searchParams.set("q", query);
        url.searchParams.set("country", "in");
        url.searchParams.set("lang", "en");
        url.searchParams.set("max", "10");
        url.searchParams.set("sortby", "publishedAt");
        url.searchParams.set("apikey", API_KEY);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.errors?.[0] || "Search failed"
            });
        }

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: "Unable to search news"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
