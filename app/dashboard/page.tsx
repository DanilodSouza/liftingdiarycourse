import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForDate } from "@/data/workouts";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { date: dateParam } = await searchParams;
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  const workouts = await getWorkoutsForDate(userId, selectedDate);

  return (
    <DashboardContent
      workouts={workouts}
      selectedDate={selectedDate.toISOString()}
    />
  );
}
