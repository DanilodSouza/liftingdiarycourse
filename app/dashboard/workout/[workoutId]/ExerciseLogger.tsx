"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  saveExerciseSets,
} from "@/actions/exercises";
import type { WorkoutData } from "@/data/workouts";

type LocalSet = {
  setNumber: number;
  weight: string;
  reps: string;
};

type LocalExercise = {
  workoutExerciseId: number;
  name: string;
  sets: LocalSet[];
  saved: boolean;
};

function toLocalSets(
  sets: WorkoutData["exercises"][number]["sets"]
): LocalSet[] {
  return sets.map((s) => ({
    setNumber: s.setNumber,
    weight: s.weight ?? "",
    reps: s.reps != null ? String(s.reps) : "",
  }));
}

interface Props {
  workout: WorkoutData;
}

export default function ExerciseLogger({ workout }: Props) {
  const [exercises, setExercises] = useState<LocalExercise[]>(() =>
    workout.exercises.map((e) => ({
      workoutExerciseId: e.id,
      name: e.name,
      sets: toLocalSets(e.sets),
      saved: true,
    }))
  );

  const [newExerciseName, setNewExerciseName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();

  function handleAddExercise() {
    if (!newExerciseName.trim()) return;
    setAddError(null);
    startAddTransition(async () => {
      try {
        const result = await addExerciseToWorkout({
          workoutId: workout.id,
          exerciseName: newExerciseName.trim(),
        });
        setExercises((prev) => [
          ...prev,
          {
            workoutExerciseId: result.workoutExerciseId,
            name: result.exerciseName,
            sets: [],
            saved: true,
          },
        ]);
        setNewExerciseName("");
      } catch (err) {
        setAddError(err instanceof Error ? err.message : "Failed to add exercise");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Exercises
      </h2>

      {exercises.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No exercises yet. Add one below.
        </p>
      )}

      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.workoutExerciseId}
          exercise={exercise}
          onChange={(updated) =>
            setExercises((prev) =>
              prev.map((e) =>
                e.workoutExerciseId === exercise.workoutExerciseId
                  ? updated
                  : e
              )
            )
          }
          onRemove={() =>
            setExercises((prev) =>
              prev.filter(
                (e) => e.workoutExerciseId !== exercise.workoutExerciseId
              )
            )
          }
        />
      ))}

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            Add Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="new-exercise"
                className="text-zinc-700 dark:text-zinc-300"
              >
                Exercise Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-exercise"
                  placeholder="e.g. Barbell Back Squat"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExercise();
                    }
                  }}
                  disabled={isAdding}
                />
                <Button
                  type="button"
                  onClick={handleAddExercise}
                  disabled={isAdding || !newExerciseName.trim()}
                >
                  {isAdding ? "Adding…" : "Add"}
                </Button>
              </div>
            </div>
            {addError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {addError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: LocalExercise;
  onChange: (updated: LocalExercise) => void;
  onRemove: () => void;
}

function ExerciseCard({ exercise, onChange, onRemove }: ExerciseCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  function updateSet(index: number, field: "weight" | "reps", value: string) {
    const updated = exercise.sets.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange({ ...exercise, sets: updated, saved: false });
    setSavedOk(false);
  }

  function addSet() {
    const nextNumber = exercise.sets.length + 1;
    onChange({
      ...exercise,
      sets: [...exercise.sets, { setNumber: nextNumber, weight: "", reps: "" }],
      saved: false,
    });
    setSavedOk(false);
  }

  function removeSet(index: number) {
    const updated = exercise.sets
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    onChange({ ...exercise, sets: updated, saved: false });
    setSavedOk(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await saveExerciseSets({
          workoutExerciseId: exercise.workoutExerciseId,
          sets: exercise.sets.map((s) => ({
            setNumber: s.setNumber,
            weight: s.weight.trim() || null,
            reps: s.reps.trim() ? parseInt(s.reps, 10) : null,
          })),
        });
        onChange({ ...exercise, saved: true });
        setSavedOk(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save sets");
      }
    });
  }

  function handleRemove() {
    setError(null);
    startRemoveTransition(async () => {
      try {
        await removeExerciseFromWorkout({
          workoutExerciseId: exercise.workoutExerciseId,
        });
        onRemove();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove exercise");
      }
    });
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            {exercise.name}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving || isPending}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
          >
            {isRemoving ? "Removing…" : "Remove"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {exercise.sets.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center text-xs font-medium text-zinc-500 dark:text-zinc-400 px-1">
              <span>#</span>
              <span>Weight (kg)</span>
              <span>Reps</span>
              <span />
            </div>
            {exercise.sets.map((set, i) => (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center"
              >
                <span className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  {set.setNumber}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="—"
                  value={set.weight}
                  onChange={(e) => updateSet(i, "weight", e.target.value)}
                  disabled={isPending}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="—"
                  value={set.reps}
                  onChange={(e) => updateSet(i, "reps", e.target.value)}
                  disabled={isPending}
                  className="h-8 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  disabled={isPending}
                  className="text-zinc-400 hover:text-red-500 disabled:opacity-40 text-lg leading-none"
                  aria-label="Remove set"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {exercise.sets.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No sets yet.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {savedOk && (
          <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSet}
            disabled={isPending}
          >
            + Add Set
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending || exercise.saved}
          >
            {isPending ? "Saving…" : "Save Sets"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
