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
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Status, CreateTodo } from "@/types/todo";
import { Frown, Kanban, List, Pencil } from "lucide-react";
import { getAllTodos, createTodo, updateTodo } from "@/app/actions/todos";
import { Skeleton } from "./ui/skeleton";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";
import { useForm } from "react-hook-form";
import { TodoFormData } from "@/lib/definitions/todo";
import { zodResolver } from "@hookform/resolvers/zod";
import { TodoFormSchema } from "@/lib/definitions/todo";

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
							className="cursor-pointer"
						>
							<Kanban className="h-4 w-4" />
							Kanban
						</Button>
						<Button
							variant={isList ? "default" : "outline"}
							size="sm"
							onClick={handleIsList}
							className="cursor-pointer"
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
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<TodoFormData>({
		resolver: zodResolver(TodoFormSchema),
	});
	const queryClient = useQueryClient();

	const { mutate: addTodo, isPending } = useMutation({
		mutationFn: (newTodo: CreateTodo) => createTodo(newTodo),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			reset();
		},
	});

	const handleSubmitForm = ({ title, description }: TodoFormData) => {
		if (!title.trim()) {
			return;
		}

		addTodo({
			title: title.trim(),
			description: description.trim(),
		});
	};

	return (
		<form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
			<Field>
				<FieldLabel>Title</FieldLabel>
				<Input {...register("title")} placeholder="Enter todo title" required />
				<FieldError>{errors.title?.message}</FieldError>
			</Field>
			<Field>
				<FieldLabel>Description</FieldLabel>
				<Textarea
					{...register("description")}
					placeholder="Enter todo description"
				/>
				<FieldError>{errors.description?.message}</FieldError>
			</Field>
			<DialogFooter>
				<DialogClose asChild className="cursor-pointer">
					<Button type="button" variant="outline">
						Cancel
					</Button>
				</DialogClose>
				<DialogClose asChild className="cursor-pointer">
					<Button type="submit" disabled={!isValid}>
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

		console.log({
			active,
			over,
		});

		if (!over) {
			return;
		}
		const columnName = over.id as string;
		const newStatus = columnToStatus[columnName as keyof typeof columnToStatus];
		if (!newStatus) {
			return;
		}

		const currentTodo = features.find((feature) => feature.id === active.id);
		const currentStatus = currentTodo?.originalTodo?.status;

		if (newStatus === currentStatus) {
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
						{features.filter((feature) => feature.status.name === status.name)
							.length ? (
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
											<div className="w-full flex flex-col">
												<div className="w-full flex gap-2 items-center justify-between">
													<h2 className="m-0 flex-1 font-medium text-sm">
														{feature.name}
													</h2>
													<button className="cursor-pointer text-foreground bg-transparent hover:bg-accent/50">
														<Pencil size={14} />
													</button>
												</div>
												<p className="m-0 text-muted-foreground text-xs">
													{feature.description.slice(0, 100)}...
												</p>
											</div>
										</ListItem>
									))}
							</ListItems>
						) : (
							<p className="p-4 text-sm text-muted-foreground">
								No task added here.
							</p>
						)}
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
									<div className="w-full flex flex-row gap-2 justify-between">
										<p className="m-0 flex-1 font-medium text-sm">
											{feature.name}
										</p>
										<Button
											variant="link"
											className="cursor-pointer text-foreground bg-transparent hover:bg-accent/50"
										>
											<Pencil size={12} />
										</Button>
									</div>
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
