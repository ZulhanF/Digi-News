export async function fetchJsonCached(url, ttlMs = 300000) {
	const storageKey = `cache:${url}`;
	const now = Date.now();

	let cached;
	try {
		const raw = localStorage.getItem(storageKey);
		if (raw) {
			cached = JSON.parse(raw);
		}
	} catch {}

	const isFresh = cached && typeof cached.timestamp === "number" && (now - cached.timestamp) < ttlMs && cached.data;
	if (isFresh) {
		return cached.data;
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		try {
			localStorage.setItem(storageKey, JSON.stringify({ timestamp: now, data }));
		} catch {}
		return data;
	} catch (error) {
		if (cached && cached.data) {
			return cached.data;
		}
		throw error;
	}
}
