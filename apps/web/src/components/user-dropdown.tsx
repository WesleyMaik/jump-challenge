"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logout } from "@/app/actions/logout";
import { useQuery } from "@tanstack/react-query";
import { profile } from "@/app/actions/user";
import { User } from "@/types/user";

const getInitials = (name: string) => {
	if (!name) return "";
	const words = name.trim().split(/\s+/);

	if (words.length === 1) {
		return words?.[0]?.charAt(0).toUpperCase() || "";
	}

	return (words?.[0]?.charAt(0) || "") + (words?.[1]?.charAt(0) || "");
};

export function UserDropdown() {
	const [open, setOpen] = React.useState(true);
	const router = useRouter();
	const { data: user } = useQuery<User>({
		queryKey: ["profile"],
		queryFn: async () => await profile(),
	});

	function handleLogout() {
		toast.success("Logout successful");
		router.push("/login");
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<Button
					variant="outline"
					className="gap-2 px-2 bg-sidebar/50 shadow-none border-none rounded-full"
				>
					<Avatar className="size-8 rounded-lg">
						<AvatarFallback className="rounded-lg bg-accent">
							{getInitials(user?.name || "")}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="size-8 rounded-lg">
							<AvatarFallback className="rounded-lg">
								{getInitials(user?.name || "")}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{user?.name}</span>
							<span className="text-muted-foreground truncate text-xs">
								{user?.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem className="cursor-pointer" disabled>
						<UserRound />
						Account
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<form action={logout} className="w-full">
					<DropdownMenuItem
						className="cursor-pointer text-red-600! hover:bg-red-100!"
						onClick={handleLogout}
						asChild
					>
						<button type="submit" className="w-full">
							<LogOutIcon className="text-red-600!" />
							Log out
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
