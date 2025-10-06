"use client";

import { AppLayout } from "@/components/app-layout";
import { TodoList } from "@/components/todo-list";

export default function AppPage() {
	return (
		<AppLayout>
			<TodoList />
		</AppLayout>
	);
}
