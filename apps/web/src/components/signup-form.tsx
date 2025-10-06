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
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";
import { useState } from "react";
import Logo from "@assets/jump.svg";
import { signup } from "@/app/actions/auth";
import { SignupFormData, SignupFormSchema } from "@/lib/definitions/signup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignupForm({
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
	} = useForm<SignupFormData>({
		resolver: zodResolver(SignupFormSchema),
	});

	async function handleSubmitForm(data: SignupFormData) {
		const { confirmPassword, ...signupData } = data;
		try {
			await signup(signupData);
			toast.success("Signup successful");
			router.push("/login");
		} catch (error) {
			toast.error("Signup failed");
			console.error("Error signing up:", error);
		}
	}

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<Image src={Logo} alt="Jump" width={150} className="m-auto" />
					<CardTitle className="sr-only">Signup</CardTitle>
					<CardDescription>
						Enter your name, email and password below to signup
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(handleSubmitForm)}>
						<FieldGroup className="gap-2">
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									id="name"
									type="text"
									{...register("name")}
									placeholder="John Doe"
									required
								/>
								<FieldDescription className="text-red-500">
									{errors.name?.message}
								</FieldDescription>
							</Field>
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
								<div className="flex items-center">
									<FieldLabel htmlFor="confirmPassword">
										Confirm Password
									</FieldLabel>
								</div>
								<InputGroup>
									<InputGroupInput
										id="confirmPassword"
										type={showPassword ? "text" : "password"}
										{...register("confirmPassword")}
										placeholder="Confirm your password"
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
									{errors.confirmPassword?.message}
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit" className="cursor-pointer">
									Sign Up
								</Button>
								<FieldDescription className="text-center">
									Already have an account?{" "}
									<a href="/login" className="text-blue-400">
										Login
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
