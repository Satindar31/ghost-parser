"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { WebhookType } from "@/generated/prisma/enums";
import { toast } from "sonner";

export function SaveWebhookButton({url}: {url?: string}) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						className="ml-2 h-10 rounded-r-md rounded-l-none"
						variant="outline"
					>
						Save Webhook
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Save Webhook</DialogTitle>
						<DialogDescription>
							Enter details for webhook here. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<WebhookForm url={url} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button
					className="ml-2 h-10 rounded-r-md rounded-l-none"
					variant="outline"
				>
					Save webhook
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>Save webhook</DrawerTitle>
					<DrawerDescription>
						Enter details for webhook here. Click save when you&apos;re done.
					</DrawerDescription>
				</DrawerHeader>
				<WebhookForm url={url} className="px-4" />
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
const webtype = [
	// { label: "Discord", value: WebhookType.DISCORD },
	// { label: "Slack", value: WebhookType.SLACK },
	{ label: "Custom", value: WebhookType.CUSTOM },
];

function WebhookForm({ className, url }: React.ComponentProps<"form"> & { url?: string }) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();

		const formData = new FormData(e.target as HTMLFormElement);
		const webhookUrl = formData.get("URL") as string;

		const res = fetch("/api/saveWebhook", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url,
				sendToURL: webhookUrl,
				type: value,
			}),
		});
		toast.promise(res, {
			loading: "Saving webhook...",
			success: "Webhook saved!",
			error: "Error saving webhook.",
		});
	}

	return (
		<form
			onSubmit={(e) => onSubmit(e)}
			className={cn("grid items-start gap-6", className)}
		>
			<div className="grid gap-3">
				<Label htmlFor="type">Type</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{value
								? webtype.find((webhooktype) => webhooktype.value === value)
										?.label
								: "Select webhook type..."}
							<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0">
						<Command>
							<CommandInput placeholder="Search framework..." />
							<CommandList>
								<CommandEmpty>No framework found.</CommandEmpty>
								<CommandGroup>
									{webtype.map((webhooktype) => (
										<CommandItem
											key={webhooktype.value}
											value={webhooktype.value}
											onSelect={(currentValue) => {
												setValue(currentValue === value ? "" : currentValue);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													value === webhooktype.value
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{webhooktype.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
			<div className="grid gap-3">
				<Label htmlFor="URL">Webhook URL</Label>
				<Input id="URL" name="URL" placeholder="https://discord.com/" />
			</div>
			<Button type="submit">Save</Button>
		</form>
	);
}
