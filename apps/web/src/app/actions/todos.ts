// actions/todos
import { Todo, CreateTodo, UpdateTodo } from "@/app/types/todo";
import { api } from "@/lib/api";

export async function getAllTodos(): Promise<Todo[]> {
	const response = await api<Todo[]>("/todos", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch todos: ${response.statusText}`);
	}

	return response.json();
}

// Get todo by ID
export async function getTodoById(id: string): Promise<Todo> {
	const response = await fetch(`/todos/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch todo: ${response.statusText}`);
	}

	return response.json();
}

// Create new todo
export async function createTodo(todo: CreateTodo): Promise<Todo> {
	const response = await api("/todos", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(todo),
	});

	if (!response.ok) {
		throw new Error(`Failed to create todo: ${response.statusText}`);
	}

	return response.json();
}

// Update todo
export async function updateTodo(id: string, todo: UpdateTodo): Promise<Todo> {
	const response = await api(`/todos/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(todo),
	});

	if (!response.ok) {
		throw new Error(`Failed to update todo: ${response.statusText}`);
	}

	return response.json();
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
