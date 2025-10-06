import { SignupFormData, SignupFormSchema } from "@/lib/definitions/signup";
import { LoginFormData, LoginFormSchema } from "@/lib/definitions/login";
import { api } from "@/lib/api";

export async function signup({
	name,
	email,
	password,
}: Omit<SignupFormData, "confirmPassword">) {
	const validatedFields = SignupFormSchema.omit({
		confirmPassword: true,
	}).safeParse({
		name,
		email,
		password,
	});

	if (!validatedFields.success) {
		throw new Error("Invalid signup data.");
	}

	return await api("/auth/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
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

	return await api("/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(validatedFields.data),
	});
}
