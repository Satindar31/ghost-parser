"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
	const [parsedRss, setParsedRss] = React.useState<{ items: any[] } | null>(
		null
	);
	const [loading, setLoading] = React.useState(false);
	const [rssUrl, setRssUrl] = React.useState("https://demo.ghost.io/");

	async function fetchRss(e: React.FormEvent | null = null) {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		const res = await fetch(`/api/rss?url=${encodeURIComponent(rssUrl)}`, {
			cache: "default",
			next: { revalidate: 60 },
		});
		const data = await res.json();
		setParsedRss(data);
		setLoading(false);
	}
	React.useEffect(() => {
		fetchRss();
	}, []);
	return (
		<div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<div className="w-full max-w-3xl p-4">
				<header className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
						Ghost RSS Feed Reader
					</h1>
				</header>
			</div>
			<main className="w-full max-w-3xl p-4">
				<form
					onSubmit={(e) => fetchRss(e)}
					className="flex items-stretch w-full mb-2"
				>
					<Input
						placeholder="https://demo.ghost.io/"
						className="h-10 flex-1 rounded-l-md rounded-r-none"
						type="text"
						value={rssUrl}
						onChange={(e) => setRssUrl(e.target.value)}
					/>
					<Button
						type="submit"
						className="ml-2 h-10 rounded-r-md rounded-l-none"
						variant={"outline"}
					>
						Fetch RSS
					</Button>
				</form>
				<>
					{loading ? (
						<p className="mb-2 text-zinc-600 dark:text-zinc-300">Loading...</p>
					) : parsedRss ? (
						parsedRss.items.map((item: any) => (
							<Card
								key={item.id}
								className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
							>
								<CardHeader>
									<CardTitle>{item.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="mb-4 text-zinc-700 dark:text-zinc-300">
										{item.contentSnippet}
									</p>
								</CardContent>
								<CardFooter>
									<Link
										href={item.link}
										className="text-blue-600 hover:underline dark:text-blue-400"
										target="_blank"
										rel="noopener"
									>
										Read more
									</Link>
								</CardFooter>
							</Card>
						))
					) : (
						<p>No RSS feed loaded.</p>
					)}
				</>
			</main>
		</div>
	);
}
