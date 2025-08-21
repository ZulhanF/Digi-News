import { fetchJsonCached } from "./cache.js";

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = import.meta.env.VITE_SIDE_API_KEY;

  const fetchSide = async () => {
    try {
      const url = `https://gnews.io/api/v4/search?q=ai&lang=en&max=8&apikey=${apiKey}`;
      const data = await fetchJsonCached(url, 300000);
      if (data.articles && data.articles.length > 0) {
        renderSide(data.articles);
      }
    } catch (error) {
      console.error("Error fetching headline:", error);
    }
  };

  function renderSide(articles) {
    const rightContainer = document.querySelector(".right-side");
    const bottomContainer = document.querySelector(".bottom-side");

    if (rightContainer) {
      rightContainer.innerHTML = "";
      articles.slice(0, 3).forEach((article) => {
        const item = document.createElement("div");
        item.className = "right-1";
        item.innerHTML = `<a href="${article.url}" class="hover:underline"><h1 class="text-md line-clamp-2">${article.title}</h1></a>
        <p class="text-xs text-neutral-500 mt-2">${article.source.name} | ${new Date(article.publishedAt).toLocaleString()}</p>`;
        rightContainer.appendChild(item);
      });
    }

    if (bottomContainer) {
      bottomContainer.innerHTML = "";
      articles.slice(3, 7).forEach((article) => {
        const item = document.createElement("div");
        item.className = "bott-1 flex flex-col gap-2 max-w-85";
        item.innerHTML = `<a href="${article.url}" class="hover:underline line-clamp-2 md:line-clamp-none"><h1 class="text-md">${article.title}</h1></a>
        <p class="text-xs text-neutral-500 mt-auto line-clamp-2 md:line-clamp-none">${article.source.name} | ${new Date(article.publishedAt).toLocaleString()}</p>`;
        bottomContainer.appendChild(item);
      });
    }
  }

  fetchSide();
});
