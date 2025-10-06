export async function api<T>(url: string, options: RequestInit): Promise<T> {
	return fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`, {
		...options,
		credentials: "include",
	}).then((res) => res.json() as Promise<T>);
}

export function apiUrl(url: string) {
	return `${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`;
}
