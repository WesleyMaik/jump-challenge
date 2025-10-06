"use client";

import { useState } from "react";
import { faker } from "@faker-js/faker";
import {
	DragEndEvent,
	KanbanBoard,
	KanbanCard,
	KanbanCards,
	KanbanHeader,
	KanbanProvider,
} from "@/components/ui/kanban";
import {
	ListGroup,
	ListHeader,
	ListItem,
	ListItems,
	ListProvider,
} from "@/components/ui/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Status, CreateTodo } from "@/types/todo";
import { Frown, Kanban, List } from "lucide-react";
import { getAllTodos, createTodo, updateTodo } from "@/app/actions/todos";
import { Skeleton } from "./ui/skeleton";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";

const statusToColumn = {
	PENDING: "Planned",
	IN_PROGRESS: "In Progress",
	DONE: "Done",
} as const;

const columnToStatus = {
	Planned: "PENDING",
	"In Progress": "IN_PROGRESS",
	Done: "DONE",
} as const;

const columns = [
	{ id: "Planned", name: "Planned", color: "#6B7280" },
	{ id: "In Progress", name: "In Progress", color: "#F59E0B" },
	{ id: "Done", name: "Done", color: "#10B981" },
];

const users = Array.from({ length: 4 })
	.fill(null)
	.map(() => ({
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		image: faker.image.avatar(),
	}));

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

type TodoListProps = {
	isList?: boolean;
};

export function TodoList() {
	const [isList, setIsList] = useState(false);

	function handleIsList() {
		setIsList(true);
	}

	function handleIsKanban() {
		setIsList(false);
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex gap-4 justify-between">
				<div className="flex gap-2">
					<ButtonGroup>
						<Button
							variant={!isList ? "default" : "outline"}
							size="sm"
							onClick={handleIsKanban}
						>
							<Kanban className="h-4 w-4" />
							Kanban
						</Button>
						<Button
							variant={isList ? "default" : "outline"}
							size="sm"
							onClick={handleIsList}
						>
							<List className="h-4 w-4" />
							List
						</Button>
					</ButtonGroup>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							className="cursor-pointer bg-blue-500 hover:bg-blue-400 text-white"
							size="sm"
						>
							Add Todo
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Todo</DialogTitle>
							<DialogDescription>
								Create a new todo item to track your tasks.
							</DialogDescription>
						</DialogHeader>
						<AddTodoForm />
					</DialogContent>
				</Dialog>
			</div>
			<TodoItems isList={isList} />
		</div>
	);
}

function AddTodoForm() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<Status>("PENDING");
	const queryClient = useQueryClient();

	const { mutate: addTodo, isPending } = useMutation({
		mutationFn: (newTodo: CreateTodo) => createTodo(newTodo),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			setTitle("");
			setDescription("");
			setStatus("PENDING");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			addTodo({
				title: title.trim(),
				description: description.trim(),
				status,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Field>
				<FieldLabel>Title</FieldLabel>
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter todo title"
					required
				/>
			</Field>
			<Field>
				<FieldLabel>Description</FieldLabel>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Enter todo description"
				/>
			</Field>
			<Field>
				<FieldLabel>Status</FieldLabel>
				<select
					value={status}
					onChange={(e) => setStatus(e.target.value as Status)}
					className="w-full p-2 border rounded"
				>
					<option value="PENDING">Pending</option>
					<option value="IN_PROGRESS">In Progress</option>
					<option value="DONE">Done</option>
				</select>
			</Field>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="outline">
						Cancel
					</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button type="submit" disabled={isPending || !title.trim()}>
						{isPending ? "Adding..." : "Add Todo"}
					</Button>
				</DialogClose>
			</DialogFooter>
		</form>
	);
}

function TodoItems({ isList }: TodoListProps) {
	const queryClient = useQueryClient();

	const { data: todos = [], isLoading } = useQuery({
		queryKey: ["todos"],
		queryFn: getAllTodos,
	});

	const { mutate: updateTodoStatus } = useMutation({
		mutationFn: ({ id, status }: { id: string; status: Status }) =>
			updateTodo(id, { status }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const features = todos.map((todo) => ({
		id: todo.id,
		name: todo.title,
		startAt: new Date(todo.createdAt),
		endAt: new Date(todo.updatedAt),
		column: statusToColumn[todo.status],
		status: {
			id: statusToColumn[todo.status],
			name: statusToColumn[todo.status],
			color:
				columns.find((col) => col.name === statusToColumn[todo.status])
					?.color || "#6B7280",
		},
		owner: faker.helpers.arrayElement(users),
		description: todo.description,
		originalTodo: todo,
	}));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) {
			return;
		}
		const columnName = over.id as string;
		const newStatus = columnToStatus[columnName as keyof typeof columnToStatus];
		if (!newStatus) {
			return;
		}
		updateTodoStatus({ id: active.id as string, status: newStatus });
	};

	if (isLoading) {
		return (
			<div className="flex justify-center p-8 gap-4">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="bg-muted w-[30rem] h-[40rem]" />
				))}
			</div>
		);
	}

	if (todos.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Frown />
					</EmptyMedia>
					<EmptyTitle>No To-Dos yet</EmptyTitle>
					<EmptyDescription>
						You haven&apos;t created any todos yet. Get started by creating your
						first todo.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (isList) {
		return (
			<ListProvider onDragEnd={handleDragEnd} className="gap-4">
				{columns.map((status) => (
					<ListGroup id={status.name} key={status.name}>
						<ListHeader color={status.color} name={status.name} />
						<ListItems>
							{features
								.filter((feature) => feature.status.name === status.name)
								.map((feature, index) => (
									<ListItem
										id={feature.id}
										index={index}
										key={feature.id}
										name={feature.name}
										parent={feature.status.name}
									>
										<div
											className="h-2 w-2 shrink-0 rounded-full"
											style={{ backgroundColor: feature.status.color }}
										/>
										<p className="m-0 flex-1 font-medium text-sm">
											{feature.name}
										</p>
										{feature.owner && (
											<Avatar className="h-4 w-4 shrink-0">
												<AvatarImage src={feature.owner.image} />
												<AvatarFallback>
													{feature.owner.name?.slice(0, 2)}
												</AvatarFallback>
											</Avatar>
										)}
									</ListItem>
								))}
						</ListItems>
					</ListGroup>
				))}
			</ListProvider>
		);
	}

	return (
		<KanbanProvider columns={columns} data={features} onDragEnd={handleDragEnd}>
			{(column) => (
				<KanbanBoard id={column.id} key={column.id}>
					<KanbanHeader>
						<div className="flex items-center gap-2">
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: column.color }}
							/>
							<span>{column.name}</span>
						</div>
					</KanbanHeader>
					<KanbanCards id={column.id}>
						{(feature: (typeof features)[number]) => (
							<KanbanCard
								column={column.id}
								id={feature.id}
								key={feature.id}
								name={feature.name}
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex flex-col gap-1">
										<p className="m-0 flex-1 font-medium text-sm">
											{feature.name}
										</p>
									</div>
									{feature.owner && (
										<Avatar className="h-4 w-4 shrink-0">
											<AvatarImage src={feature.owner.image} />
											<AvatarFallback>
												{feature.owner.name?.slice(0, 2)}
											</AvatarFallback>
										</Avatar>
									)}
								</div>
								{feature.description && (
									<p className="m-0 text-muted-foreground text-xs mb-2">
										{feature.description}
									</p>
								)}
								<p className="m-0 text-muted-foreground text-xs">
									{shortDateFormatter.format(feature.startAt)} -{" "}
									{dateFormatter.format(feature.endAt)}
								</p>
							</KanbanCard>
						)}
					</KanbanCards>
				</KanbanBoard>
			)}
		</KanbanProvider>
	);
}
