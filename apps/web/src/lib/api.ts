export function api<T>(url: string, options: RequestInit) {
	return fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`, {
		...options,
		credentials: 'include', // Inclui cookies em requisições cross-origin
	});
}

export function apiUrl(url: string) {
	return `${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`;
}
