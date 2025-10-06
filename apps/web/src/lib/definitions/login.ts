import z from "zod";

export const LoginFormSchema = z.object({
	email: z.email("Email should be a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password should have at least 6 characters"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
