import "./style.css";
import { fetchJsonCached } from "./cache.js";

document.addEventListener("DOMContentLoaded", () => {
	const apiKey = import.meta.env.VITE_HEADLINE_API_KEY;

	const fetchHeadline = async () => {
		try {
			const url = `https://newsapi.org/v2/everything?q=artificial+intelligence&from=2025-08-01&to=2025-08-31&sortBy=popularity&language=en&pageSize=10&apiKey=${apiKey}`;
			const data = await fetchJsonCached(url, 300000); // 5 menit TTL

			if (data.articles && data.articles.length > 0) {
				renderHeadline(data.articles);
			} else {
				throw new Error("No articles found in response");
			}
		} catch (error) {
			console.error("Error fetching headline:", error);
		}
	};

	function renderHeadline(articles) {
		const container = document.querySelector(".carousel");
		container.innerHTML = "";

		articles.forEach((article, index) => {
			const headline = document.createElement("div");
			headline.className = "headline bg-black flex flex-col md:flex-row carousel-item w-full snap-start px-10";

			headline.innerHTML = `<div class="title flex flex-col gap-2 m-4 md:m-10 max-h-65 min-w-0" id="${
				index + 1
			}">
					<h1 class="text-xl md:text-2xl font-bold max-w-full md:max-w-sm">
						${article.title}
					</h1>
					<p class="text-xs md:text-sm max-w-full md:max-w-sm text-neutral-400">
						${article.description} <a href="${
						article.url
					}" target="_blank" class="font-bold hover:underline">Read more...</a>
					</p>
					<p class="text-xs text-neutral-500 mt-auto">${
						article.source.name
					} | ${new Date(article.publishedAt).toLocaleString()}</p>
				</div>
				<div class="img py-4 md:py-10 px-4 md:px-0">
					<img
						src="${article.urlToImage}"
						alt="${article.title}"
						class="w-full md:w-120 h-48 md:h-65 object-cover rounded"
					/>
				</div>`;

			container.appendChild(headline);
		});
		let index = 0;
		const slides = document.querySelectorAll('.carousel-item');
		const carousel = document.querySelector('.carousel');
		
		setInterval(() => {
			index = (index + 1) % slides.length;
			const nextSlide = slides[index];
			
			carousel.scrollTo({
				left: nextSlide.offsetLeft - 10, 
				behavior: 'smooth'
			});
		}, 3000);
	}

	fetchHeadline();
});
