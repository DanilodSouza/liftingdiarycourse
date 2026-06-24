"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { findOrCreateExercise } from "@/data/exercises";
import {
  addWorkoutExercise,
  removeWorkoutExercise,
  replaceExerciseSets,
} from "@/data/sets";
import { getWorkoutById } from "@/data/workouts";

const AddExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1).max(255),
});

export async function addExerciseToWorkout(input: unknown): Promise<{
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
}> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { workoutId, exerciseName } = AddExerciseSchema.parse(input);

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = await findOrCreateExercise(exerciseName);
  const order = workout.exercises.length;
  const { id: workoutExerciseId } = await addWorkoutExercise(
    workoutId,
    exercise.id,
    order
  );

  return {
    workoutExerciseId,
    exerciseId: exercise.id,
    exerciseName: exerciseName.trim(),
  };
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkout(input: unknown): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { workoutExerciseId } = RemoveExerciseSchema.parse(input);
  await removeWorkoutExercise(userId, workoutExerciseId);
}

const SetSchema = z.object({
  setNumber: z.number().int().positive(),
  weight: z.string().nullable(),
  reps: z.number().int().positive().nullable(),
});

const SaveSetsSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  sets: z.array(SetSchema),
});

export async function saveExerciseSets(input: unknown): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { workoutExerciseId, sets } = SaveSetsSchema.parse(input);
  await replaceExerciseSets(userId, workoutExerciseId, sets);
}
