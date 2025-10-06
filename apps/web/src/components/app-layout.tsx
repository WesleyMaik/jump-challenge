import { PropsWithChildren, useId } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { UserDropdown } from "@/components/user-dropdown";
import logo from "@assets/jump.svg";

export function AppLayout({ children }: PropsWithChildren) {
	const id = useId();

	return (
		<div className="flex h-svh">
			<SidebarProvider>
				<SidebarInset className="overflow-auto ">
					<header className="bg-sidebar/50 backdrop-blur-sm sticky top-0 z-50 -mx-2 px-2 border-b">
						<div className="flex shrink-0 items-center gap-4 py-4 w-full max-w-7xl mx-auto">
							<div className="flex-1">
								<Image src={logo} alt="Jump Todo" width={96} />
							</div>
							<div>
								<div className="relative inline-flex">
									<Input
										id={id}
										className="h-8 ps-9 pe-9 bg-border/50 border-transparent w-fit min-w-65 shadow-none"
										aria-label="Search"
										placeholder="Search something..."
									/>
									<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground peer-disabled:opacity-50">
										<Search size={16} aria-hidden="true" />
									</div>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<UserDropdown />
							</div>
						</div>
					</header>
					<div className="flex max-lg:flex-col flex-1 gap-6 p-4 w-full max-w-7xl mx-auto">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
