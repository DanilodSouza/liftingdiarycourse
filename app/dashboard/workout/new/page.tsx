import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NewWorkoutForm from "./NewWorkoutForm";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date } = await searchParams;

  return (
    <main className="flex-1 p-6 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        New Workout
      </h1>
      <NewWorkoutForm initialDate={date} />
    </main>
  );
}
