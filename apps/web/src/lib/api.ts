export function api<T>(url: string, options: RequestInit) {
	return fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`, options);
}

export function apiUrl(url: string) {
	return `${process.env.NEXT_PUBLIC_BASE_API_URL}${url}`;
}
