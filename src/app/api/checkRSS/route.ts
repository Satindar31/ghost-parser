import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";

export async function GET(req: Request) {
	try {
		const rssFeeds = await prisma.feed.findMany({
			include: {
				webhooks: true,
			},
		});
        console.log("Fetched RSS feeds:", rssFeeds);

		for (const feed of rssFeeds) {
            console.log(`Checking feed: ${feed.rssUrl}`);
			const res = await fetch(feed.rssUrl);
			if (!res.ok) {
				console.error(`Failed to fetch RSS feed for ${feed.rssUrl}`);
				continue;
			}
			const rss = await parseStringPromise(await res.text(), { trim: true });
			const latestPost = rss.rss.channel[0].item[0];
			const latestGuid = latestPost.guid[0]._ || latestPost.link[0];
            console.log(latestPost)
            console.log(`Latest post GUID: ${latestGuid}`);

			// Skip if no new post
            console.log(`Latest post GUID: ${latestGuid}, Last stored GUID: ${feed.lastPostGuid}`);
			if (feed.lastPostGuid === latestGuid) continue;

			// Update last post
			await prisma.feed.update({
				where: { id: feed.id },
				data: { lastPostGuid: latestGuid },
			});
            console.log(`New post detected for feed ${feed.rssUrl}: ${latestPost.title}`);

			// Notify all webhooks for this feed
			for (const webhook of feed.webhooks) {
                console.log(`Notifying webhook: ${webhook.sendToURL}`);
				let payload = {
					event: "new_post",
					feedUrl: feed.rssUrl,
					title: latestPost.title[0],
					link: latestPost.link[0],
					published: latestPost.pubDate[0],
					content: latestPost.description[0] || "",
				};

				await fetch(webhook.sendToURL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}).catch(console.error);
			}
		}

		return Response.json({ message: "Feeds checked successfully" });
	} catch (err: any) {
		console.error(err);
		return Response.json({ error: err.message }, { status: 500 });
	}
}
