import { SignupFormData, SignupFormSchema } from "@/lib/definitions/signup";
import { LoginFormData, LoginFormSchema } from "@/lib/definitions/login";

export async function signup({ name, email, password }: SignupFormData) {
	const validatedFields = SignupFormSchema.safeParse({
		name,
		email,
		password,
	});

	if (!validatedFields.success) {
		throw new Error("Invalid signup data.");
	}

	return await fetch("/api/auth/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(validatedFields.data),
	});
}

//login
export async function login({ email, password }: LoginFormData) {
	const validatedFields = LoginFormSchema.safeParse({
		email,
		password,
	});

	if (!validatedFields.success) {
		throw new Error("Invalid login data.");
	}

	return await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(validatedFields.data),
	});
}
