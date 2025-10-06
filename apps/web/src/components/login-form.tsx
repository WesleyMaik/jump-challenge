"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { useForm } from "react-hook-form";
import { LoginFormSchema, LoginFormData } from "@/lib/definitions/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";
import { useState } from "react";
import Logo from "@assets/jump.svg";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(LoginFormSchema),
	});

	async function handleSubmitForm(data: LoginFormData) {
		console.log(data);
		try {
			const response = await login(data);
			if (response.ok) {
				router.push("/app");
			} else {
				console.error("Login failed");
			}
		} catch (error) {
			console.error("Error logging in:", error);
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<Image src={Logo} alt="Jump" width={150} className="m-auto" />
					<CardTitle className="sr-only">Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(handleSubmitForm)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									{...register("email")}
									placeholder="mail@example.com"
									required
								/>
								<FieldDescription className="text-red-500">
									{errors.email?.message}
								</FieldDescription>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
								</div>
								<InputGroup>
									<InputGroupInput
										id="password"
										type={showPassword ? "text" : "password"}
										{...register("password")}
										placeholder="Enter your password"
										required
									/>
									<InputGroupAddon
										align="inline-end"
										className="cursor-pointer"
									>
										{showPassword ? (
											<EyeOff size={20} onClick={togglePasswordVisibility} />
										) : (
											<Eye size={20} onClick={togglePasswordVisibility} />
										)}
									</InputGroupAddon>
								</InputGroup>
								<FieldDescription className="text-red-500">
									{errors.password?.message}
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit" className="cursor-pointer">
									Login
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<a href="/signup" className="text-blue-400">
										Sign up
									</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
