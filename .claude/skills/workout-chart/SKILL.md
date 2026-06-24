---
name: workout-chart
description: >
  Queries the PostgreSQL database for all workout entries logged over the past year and generates
  a bar chart image (PNG) showing workout frequency by month. Use this skill whenever the user
  asks to visualize workouts, chart workout history, see how many workouts they did per month,
  generate a workout summary chart, plot workout data, or export workout stats as an image —
  even if they don't say "chart" explicitly. Also trigger when the user asks things like
  "how active have I been?" or "show me my workout trends."
---

# Workout Chart Skill

Generate a monthly workout frequency bar chart from the database and export it as a PNG.

## What this skill does

1. Reads `DATABASE_URL` from the project's `.env` file
2. Queries the `workouts` table for all entries in the past 12 months
3. Groups results by calendar month
4. Runs `scripts/plot_workouts.py` to render and export a bar chart as a PNG

## Steps

### 1. Find the .env file

Look for `.env` in the current working directory (project root). The `DATABASE_URL` key holds a PostgreSQL connection string like:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

### 2. Check Python availability (Windows)

On Windows, try these commands in order until one works:

```powershell
python --version
python3 --version
py --version
```

If none work, Python is not installed. Tell the user to install it from https://www.python.org/downloads/ and make sure to check "Add Python to PATH" during installation. Stop here until they confirm it's installed.

### 3. Install dependencies

Use whichever Python command worked above (replace `python` as needed):

```bash
python -m pip install psycopg2-binary matplotlib python-dotenv
```

Skip this step if the packages are already installed (the script will tell you if they're missing).

### 4. Run the chart script

```bash
python .claude/skills/workout-chart/scripts/plot_workouts.py
```

The script automatically loads `DATABASE_URL` from `.env` in the current directory.

### 5. Output

The script saves `workout_chart.png` in the current working directory and prints the full path. Tell the user where the file was saved so they can open it.

## Error handling

- If `DATABASE_URL` is missing from `.env`, tell the user and stop.
- If the query returns no data for the past year, tell the user "No workouts found in the past year" rather than generating an empty chart.
- If Python is not available, guide the user to install it (see step 2).
- If a package is missing, the script prints a clear `pip install` command — run it and retry.
