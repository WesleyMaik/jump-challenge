export type Todo = {
	id: string;
	title: string;
	description: string;
	status: Status;
	userId: string;
	createdAt: string;
	updatedAt: string;
};

export type Status = "PENDING" | "IN_PROGRESS" | "DONE";

export interface CreateTodo {
	title: string;
	description: string;
	status?: Status;
}

export interface UpdateTodo {
	title?: string;
	description?: string;
	status?: Status;
}
