import { WebhookType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    const { url, sendToURL, type } = await req.json();

    const save = await prisma.webhook.create({
        data: {
            url: url,
            sendToURL: sendToURL,
            type: type.toUpperCase() as WebhookType,
        }
    })
    return new Response(JSON.stringify(save), { status: 200 });
}