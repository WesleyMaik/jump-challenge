// actions/todos
import { Todo, CreateTodo, UpdateTodo } from "@/types/todo";
import { api } from "@/lib/api";

export async function getAllTodos(): Promise<Todo[]> {
	const response = await api<Todo[]>("/todos", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return response;
}

export async function getTodoById(id: string): Promise<Todo> {
	const response = await api<Todo>(`/todos/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return response;
}

// Create new todo
export async function createTodo(todo: CreateTodo): Promise<Todo> {
	const response = await api<Todo>("/todos", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(todo),
	});

	return response;
}

// Update todo
export async function updateTodo(id: string, todo: UpdateTodo): Promise<Todo> {
	const response = await api<Todo>(`/todos/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(todo),
	});

	return response;
}

// Delete todo
export async function deleteTodo(id: string): Promise<{ message: string }> {
	const response = await fetch(`/todos/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to delete todo: ${response.statusText}`);
	}

	return response.json();
}
