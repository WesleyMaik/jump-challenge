import { SignupForm } from "@/components/signup-form";

export default function LoginPage() {
	return (
		<main className="flex flex-col items-stretch justify-center max-w-[30rem] w-full m-auto h-screen">
			<SignupForm className="p-4" />
		</main>
	);
}
