import { api } from "@/lib/api";
import { User } from "@/types/user";

export async function profile() {
	return await api<User>("/users/me", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
}
