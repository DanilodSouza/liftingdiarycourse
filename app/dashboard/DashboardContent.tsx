"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkoutData } from "@/data/workouts";

interface DashboardContentProps {
  workouts: WorkoutData[];
  selectedDate: string;
}

export default function DashboardContent({
  workouts,
  selectedDate,
}: DashboardContentProps) {
  const router = useRouter();
  const date = new Date(selectedDate);
  const [open, setOpen] = useState(false);

  function handleDateChange(newDate: Date | undefined) {
    if (!newDate) return;
    setOpen(false);
    router.push(`/dashboard?date=${format(newDate, "yyyy-MM-dd")}`);
  }

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        Workout Dashboard
      </h1>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={
              <Button variant="outline" className="gap-2 text-zinc-700 dark:text-zinc-300">
                <CalendarIcon className="size-4" />
                {format(date, "do MMM yyyy")}
              </Button>
            } />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Workouts for {format(date, "do MMM yyyy")}
          </p>

          {workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-zinc-400 dark:text-zinc-500">
              <p className="text-sm">No workouts logged for this date.</p>
              <Button onClick={() => router.push(`/dashboard/workout/new?date=${format(date, "yyyy-MM-dd")}`)}>Log New Workout</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <Card
                  key={workout.id}
                  className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {workout.name}
                      </CardTitle>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 text-right">
                        <p>Started {format(new Date(workout.startedAt), "h:mm a")}</p>
                        {workout.completedAt && (
                          <p>Finished {format(new Date(workout.completedAt), "h:mm a")}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workout.exercises.length === 0 ? (
                      <p className="text-sm text-zinc-400">No exercises recorded.</p>
                    ) : (
                      <div className="space-y-5">
                        {workout.exercises.map((exercise) => (
                          <div key={exercise.id}>
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                              {exercise.name}
                            </h3>
                            {exercise.sets.length === 0 ? (
                              <p className="text-xs text-zinc-400">
                                No sets recorded.
                              </p>
                            ) : (
                              <table className="w-full text-sm font-mono">
                                <thead>
                                  <tr className="text-left text-xs text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                                    <th className="pb-1 font-medium">Set</th>
                                    <th className="pb-1 font-medium">Weight</th>
                                    <th className="pb-1 font-medium">Reps</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exercise.sets.map((set) => (
                                    <tr
                                      key={set.setNumber}
                                      className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
                                    >
                                      <td className="py-1.5 text-zinc-500 dark:text-zinc-400">
                                        {set.setNumber}
                                      </td>
                                      <td className="py-1.5 text-zinc-900 dark:text-zinc-100 font-medium">
                                        {set.weight != null
                                          ? `${set.weight} kg`
                                          : "—"}
                                      </td>
                                      <td className="py-1.5 text-zinc-900 dark:text-zinc-100">
                                        {set.reps != null ? set.reps : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
