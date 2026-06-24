import { ilike } from "drizzle-orm";
import { DB } from "@/DB/index";
import { exercisesTable } from "@/DB/Schema";

export async function getExercises(): Promise<{ id: number; name: string }[]> {
  return DB.select({ id: exercisesTable.id, name: exercisesTable.name }).from(
    exercisesTable
  );
}

export async function findOrCreateExercise(
  name: string
): Promise<{ id: number }> {
  const trimmed = name.trim();
  const [existing] = await DB.select({ id: exercisesTable.id })
    .from(exercisesTable)
    .where(ilike(exercisesTable.name, trimmed))
    .limit(1);

  if (existing) return existing;

  const [created] = await DB.insert(exercisesTable)
    .values({ name: trimmed })
    .returning({ id: exercisesTable.id });
  return created;
}
