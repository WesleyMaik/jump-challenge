"use client";

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
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonGroup } from "./ui/button-group";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns = [
	{ id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
	{ id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
	{ id: faker.string.uuid(), name: "Done", color: "#10B981" },
];

const users = Array.from({ length: 4 })
	.fill(null)
	.map(() => ({
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		image: faker.image.avatar(),
	}));

const exampleFeatures = Array.from({ length: 20 })
	.fill(null)
	.map(() => {
		const status = faker.helpers.arrayElement(columns);
		return {
			id: faker.string.uuid(),
			name: capitalize(faker.company.buzzPhrase()),
			startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
			endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
			column: status.id,
			status: status,
			owner: faker.helpers.arrayElement(users),
		};
	});

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
				<ButtonGroup className="cursor-pointer">
					<Button
						variant="outline"
						className={cn("cursor-pointer", !isList ? "bg-accent" : "")}
						onClick={handleIsKanban}
					>
						Kanban
					</Button>
					<Button
						variant="outline"
						className={cn("cursor-pointer", isList ? "bg-accent" : "")}
						onClick={handleIsList}
					>
						List
					</Button>
				</ButtonGroup>
				<Button className="bg-blue-500 hover:bg-blue-400 text-white cursor-pointer">
					Add Feature
				</Button>
			</div>
			<div className="w-full">
				<TodoItems isList={isList} />
			</div>
		</div>
	);
}

function TodoItems({ isList }: TodoListProps) {
	const [features, setFeatures] = useState(exampleFeatures);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) {
			return;
		}
		const status = columns.find((status) => status.name === over.id);
		if (!status) {
			return;
		}
		setFeatures(
			features.map((feature) => {
				if (feature.id === active.id) {
					return { ...feature, status, column: status.id };
				}
				return feature;
			})
		);
	};

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
		<KanbanProvider
			columns={columns}
			data={features}
			onDataChange={setFeatures}
		>
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
