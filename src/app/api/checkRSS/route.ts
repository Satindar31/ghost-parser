import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";

export async function GET(req: Request) {
	try {
		const rssFeeds = await prisma.feed.findMany({
			include: {
				webhooks: true,
			},
		});

		console.time("Total RSS Check Time");
		for (const feed of rssFeeds) {
			const res = await fetch(feed.rssUrl);
			if (!res.ok) {
				console.error(`Failed to fetch RSS feed for ${feed.rssUrl}`);
				continue;
			}
			const rss = await parseStringPromise(await res.text(), { trim: true });
			const latestPost = rss.rss.channel[0].item[0];
			const latestGuid = latestPost.guid[0]._ || latestPost.link[0];
			const latestPostAuthor = latestPost["dc:creator"]
				? latestPost["dc:creator"][0]
				: "Unknown";

			// Skip if no new post
			if (feed.lastPostGuid === latestGuid) continue;

			// Update last post
			await prisma.feed.update({
				where: { id: feed.id },
				data: { lastPostGuid: latestGuid },
			});

			// Notify all webhooks for this feed
			for (const webhook of feed.webhooks) {
				console.log(`Notifying webhook: ${webhook.sendToURL}`);
				if (webhook.type == "CUSTOM") {
					let payload = {
						event: "new_post",
						feedUrl: feed.rssUrl,
						title: latestPost.title[0],
						link: latestPost.link[0],
						published: latestPost.pubDate[0],
						content: latestPost.description[0] || "",
					};

					fetch(webhook.sendToURL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					}).catch(console.error);
				} else if (webhook.type == "DISCORD") {
					const blogFavicon = rss.rss.channel[0].image
						? rss.rss.channel[0].image[0].url[0]
						: "https://ghost.org/favicon.ico";
					let payload = {
						embeds: [
							{
								title: `New post in blog`,
								description: `[${latestPost.title[0]}](${latestPost.link[0]})`,
								timestamp: new Date(latestPost.pubDate[0]).toISOString(),
								color: 5814783,
								footer: {
									text: "Ghost RSS Feed Reader",
									icon_url: blogFavicon,
								},
								author: {
									name: latestPostAuthor,
									icon_url: blogFavicon,
								},
							},
						],

						username: rss.rss.channel[0].title[0],
						avatar_url: blogFavicon,
					};

					fetch(webhook.sendToURL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});
				} else if (webhook.type == "SLACK") {
					const payload = {
						blocks: [
							{
								type: "header",
								text: {
									type: "plain_text",
									text: "New post in blog",
									emoji: true,
								},
							},
							{
								type: "divider",
							},
							{
								type: "section",
								text: {
									type: "mrkdwn",
									text: "Title: " + latestPost.title[0],
								},
								accessory: {
									type: "button",
									text: {
										type: "plain_text",
										text: "Read Post",
										emoji: true,
									},
									url: latestPost.link[0],
									action_id: "button-action",
								},
							},
							{
								type: "context",
								elements: [
									{
										type: "plain_text",
										text: `Author: ${latestPostAuthor}`,
										emoji: true,
									},
								],
							},
						],
					};
					fetch(webhook.sendToURL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});
				}
			}
		}
		console.timeEnd("Total RSS Check Time");

		return Response.json({ message: "Feeds checked successfully" });
	} catch (err: any) {
		console.error(err);
		return Response.json({ error: err.message }, { status: 500 });
	}
}
