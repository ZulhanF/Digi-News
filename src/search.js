import { fetchJsonCached } from "./cache.js";

function filterArticlesWithImages(articles) {
	return (articles || []).filter(
		(a) => a && a.fields && typeof a.fields.thumbnail === "string" && /^https?:\/\//.test(a.fields.thumbnail)
	);
}

function renderSearchPage(mainEl, initialQuery = "") {
	mainEl.innerHTML = `
		<section class="px-6 py-6 flex flex-col gap-4">
			<input id="search-q" type="search" class="input input-xl input-bordered w-full" placeholder="Search news..." />
			<div id="search-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"></div>
		</section>
	`;
	const input = mainEl.querySelector("#search-q");
	const resultsEl = mainEl.querySelector("#search-results");
	if (initialQuery) {
		input.value = initialQuery;
		resultsEl.innerHTML = `<p class="text-sm text-neutral-400">Searching...</p>`;
	}
	return { input, resultsEl };
}

async function searchAndRender(query, apiKey, resultsEl) {
	if (!query || !apiKey) {
		resultsEl.innerHTML = `<p class="text-sm text-neutral-400">Enter a search term.</p>`;
		return;
	}
	resultsEl.innerHTML = `<p class="text-sm text-neutral-400">Searching...</p>`;
	const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=thumbnail,headline,trailText&order-by=relevance&page-size=12&section=technology&api-key=${apiKey}`;
	try {
		const data = await fetchJsonCached(url, 120000);
		const items = filterArticlesWithImages(data?.response?.results || []);
		if (!items.length) {
			resultsEl.innerHTML = `<p class="text-sm text-neutral-400">No results.</p>`;
			return;
		}
		resultsEl.innerHTML = "";
		items.forEach((article) => {
			const card = document.createElement("article");
			card.className = "flex flex-col gap-2 p-4 rounded";
			const title = article.webTitle;
			const url = article.webUrl;
			const thumb = article.fields?.thumbnail;
			const descHtml = article.fields?.trailText || "";
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = descHtml;
			const descText = tempDiv.textContent || tempDiv.innerText || "";
			const section = article.sectionName || "The Guardian";
			const dateIso = article.webPublicationDate;
			card.innerHTML = `
				<img src="${thumb}" alt="${title}" class="w-full h-40 object-cover rounded" />
				<a href="${url}" target="_blank" class="hover:underline">
					<h3 class="text-md font-semibold line-clamp-2">${title}</h3>
				</a>
				<p class="text-xs text-neutral-400 line-clamp-2">${descText}</p>
				<p class="text-xs text-neutral-500 mt-auto">${section} | ${new Date(dateIso).toLocaleString()}</p>
			`;
			resultsEl.appendChild(card);
		});
	} catch (e) {
		resultsEl.innerHTML = `<p class="text-sm text-red-400">Failed to search. Please try again.</p>`;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const apiKey = import.meta.env.VITE_SEARCH_API_KEY;
	const mainEl = document.querySelector("main");
	const navbarInput = document.querySelector(".navbar input[type='search']");
	if (!mainEl || !navbarInput) return;

	navbarInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const q = navbarInput.value.trim();
			const { input, resultsEl } = renderSearchPage(mainEl, q);
			searchAndRender(q, apiKey, resultsEl);
			input.addEventListener("keydown", (ke) => {
				if (ke.key === "Enter") {
					ke.preventDefault();
					searchAndRender(input.value.trim(), apiKey, resultsEl);
				}
			});
		}
	});
});
