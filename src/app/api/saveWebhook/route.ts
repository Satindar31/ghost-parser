import { WebhookType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    const { url, sendToURL, type } = await req.json();

	let urlParam = "";
	if (url.endsWith("/rss") || url?.endsWith("/rss/")) {
		urlParam = url;
	} else {
		if(url.endsWith("/")) {
            urlParam = `${url}rss`;
        } else {
            urlParam = `${url}/rss`;
        }
	}
    console.log(`Saving webhook for URL: ${urlParam}, SendToURL: ${sendToURL}, Type: ${type}`);
    const save = await prisma.webhook.create({
        data: {
            url: urlParam,
            sendToURL: sendToURL,
            type: type.toUpperCase() as WebhookType,
            feed: {
                connectOrCreate: {
                    where: { rssUrl: urlParam },
                    create: { rssUrl: urlParam },
                }
            }
        }
    })
    return new Response(JSON.stringify(save), { status: 200 });
}