import { and, eq } from "drizzle-orm";
import { DB } from "@/DB/index";
import { workoutExercisesTable, workoutsTable, setsTable } from "@/DB/Schema";

export async function addWorkoutExercise(
  workoutId: number,
  exerciseId: number,
  order: number
): Promise<{ id: number }> {
  const [row] = await DB.insert(workoutExercisesTable)
    .values({ workoutId, exerciseId, order })
    .returning({ id: workoutExercisesTable.id });
  return row;
}

export async function removeWorkoutExercise(
  userId: string,
  workoutExerciseId: number
): Promise<void> {
  const [row] = await DB.select({ id: workoutExercisesTable.id })
    .from(workoutExercisesTable)
    .innerJoin(
      workoutsTable,
      eq(workoutsTable.id, workoutExercisesTable.workoutId)
    )
    .where(
      and(
        eq(workoutExercisesTable.id, workoutExerciseId),
        eq(workoutsTable.userId, userId)
      )
    )
    .limit(1);

  if (!row) throw new Error("Not found");

  await DB.delete(workoutExercisesTable).where(
    eq(workoutExercisesTable.id, workoutExerciseId)
  );
}

export async function replaceExerciseSets(
  userId: string,
  workoutExerciseId: number,
  sets: { setNumber: number; weight: string | null; reps: number | null }[]
): Promise<void> {
  const [row] = await DB.select({ id: workoutExercisesTable.id })
    .from(workoutExercisesTable)
    .innerJoin(
      workoutsTable,
      eq(workoutsTable.id, workoutExercisesTable.workoutId)
    )
    .where(
      and(
        eq(workoutExercisesTable.id, workoutExerciseId),
        eq(workoutsTable.userId, userId)
      )
    )
    .limit(1);

  if (!row) throw new Error("Not found");

  await DB.delete(setsTable).where(
    eq(setsTable.workoutExerciseId, workoutExerciseId)
  );

  if (sets.length > 0) {
    await DB.insert(setsTable).values(
      sets.map((s) => ({
        workoutExerciseId,
        setNumber: s.setNumber,
        weight: s.weight ?? undefined,
        reps: s.reps ?? undefined,
      }))
    );
  }
}
