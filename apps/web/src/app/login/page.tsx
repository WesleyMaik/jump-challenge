import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<main className="flex flex-col items-stretch justify-center max-w-[30rem] w-full m-auto h-screen">
			<LoginForm className="p-4" />
		</main>
	);
}
