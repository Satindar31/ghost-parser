import { NextRequest } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET(req: NextRequest) {
	const searchParams = new URLSearchParams(req.nextUrl.search);
	const _urlParam = searchParams.get("url");
	let urlParam = "";
	if (_urlParam?.endsWith("/rss") || _urlParam?.endsWith("/rss/")) {
		urlParam = _urlParam;
	} else {
		urlParam = `${_urlParam}/rss`;
	}
	const response = await fetch(`${urlParam}`);
	if (!response.ok) {
		console.error("Failed to fetch RSS feed");
		console.error("Status:", response.status);

		return new Response("Failed to fetch RSS feed", { status: 500 });
	}
	const text = await response.text();
	// Parse the RSS feed in a server environment
	const parsed = await parseStringPromise(text, { trim: true });

	// Extract relevant data from the parsed RSS feed
	const items = parsed.rss.channel[0].item.map((item: any) => ({
		id: item.guid[0]._,
		title: item.title[0],
		link: item.link[0],
		pubDate: item.pubDate[0],
		contentSnippet: item.description[0],
	}));
	return new Response(JSON.stringify({ items }), { status: 200 });
}
