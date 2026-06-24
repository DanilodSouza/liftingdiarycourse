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
  const today = new Date();
  const dateString = dateParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [year, month, day] = dateString.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  const workouts = await getWorkoutsForDate(userId, selectedDate);

  return (
    <DashboardContent
      workouts={workouts}
      selectedDate={dateString}
    />
  );
}
