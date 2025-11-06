import express from "express";
import axios from "axios";

const router = express.Router();

// Store previously fetched articles (in-memory)
let allArticles = [];

router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    console.log("NEWS_API_KEY:", apiKey ? "Loaded ✅" : "Missing ❌");

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "latest news",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
        apiKey,
      },
    });

    if (!response.data.articles || response.data.articles.length === 0) {
      console.warn("No new articles fetched from API.");
      return res.render("news", { title: "News Feed", articles: allArticles });
    }

    const newArticles = response.data.articles.map((item) => ({
      title: item.title,
      description: item.description || "No description available.",
      url: item.url,
      urlToImage:
        item.urlToImage ||
        `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
      publishedAt: new Date(item.publishedAt),
    }));

    const uniqueNewArticles = newArticles.filter(
      (item) => !allArticles.some((old) => old.title === item.title)
    );

    allArticles = [...uniqueNewArticles, ...allArticles];
    allArticles.sort((a, b) => b.publishedAt - a.publishedAt);

    res.render("news", { title: "News Feed", articles: allArticles });
  } catch (error) {
    if (error.response) {
      console.error("API Response Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response from API:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    res.render("news", { title: "News Feed", articles: allArticles });
  }
});

export default router;