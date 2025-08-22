import { fetchJsonCached } from "./cache.js";

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = import.meta.env.VITE_LOCAL_API_KEY;

  const fetchLocal = async () => {
    try {
      const url = `https://newsapi.org/v2/everything?q=ai&sortBy=publishedAt&language=id&pageSize=9&apiKey=${apiKey}`;
      const data = await fetchJsonCached(url, 300000); // 5 menit TTL
      if (data.articles && data.articles.length > 0) {
        renderLocal(data.articles);
      } else {
        throw new Error("No articles found in response");
      }
    } catch (error) {
      console.error("Error fetching headline:", error);
    }
  };

  function renderLocal(articles) {
    const container = document.querySelector(".local-container");
    if (!container) return;
    container.innerHTML = "";

    const articlesWithImages = articles.filter(
      (article) =>
        article &&
        typeof article.urlToImage === "string" &&
        /^https?:\/\//.test(article.urlToImage)
    );

    articlesWithImages.slice(0, 6).forEach((article) => {
      const wrapper = document.createElement("div");
      // Grid item responsive: full width mobile, keep natural width desktop
      wrapper.className = "w-full";
      wrapper.innerHTML = `<div class="local-1 flex flex-col gap-2 w-full bg-neutral-100 p-2 md:p-0">
        <img src="${article.urlToImage}" class="w-full h-44 md:h-50 object-cover" alt="${article.title}" />
        <a href="${article.url}" class="hover:underline">
          <h1 class="text-black text-md font-medium line-clamp-2 hover:underline">${article.title}</h1>
        </a>
        <p class="text-xs text-black line-clamp-2">${article.description ?? ""}</p>
        <p class="text-xs text-neutral-500 mt-auto">${article.source?.name ?? ""} | ${new Date(article.publishedAt).toLocaleString()}</p>
      </div>`;
      container.appendChild(wrapper);
    });
  }

  fetchLocal();
});
