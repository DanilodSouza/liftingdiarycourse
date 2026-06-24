#!/usr/bin/env python3
"""
Query the workouts table for the past 12 months and plot a monthly bar chart.
Exports the chart as workout_chart.png in the current working directory.
"""

import os
import sys
from pathlib import Path

# Load .env if DATABASE_URL isn't already in the environment
if not os.environ.get("DATABASE_URL"):
    try:
        from dotenv import load_dotenv
        env_path = Path.cwd() / ".env"
        if env_path.exists():
            load_dotenv(env_path)
        else:
            print("ERROR: .env file not found in the current directory.", file=sys.stderr)
            sys.exit(1)
    except ImportError:
        print("ERROR: python-dotenv is not installed. Run: pip install python-dotenv", file=sys.stderr)
        sys.exit(1)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env or environment.", file=sys.stderr)
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 is not installed. Run: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

try:
    import matplotlib
    matplotlib.use("Agg")  # non-interactive backend, safe for all environments
    import matplotlib.pyplot as plt
    import matplotlib.ticker as mticker
except ImportError:
    print("ERROR: matplotlib is not installed. Run: pip install matplotlib", file=sys.stderr)
    sys.exit(1)

QUERY = """
SELECT
    TO_CHAR(DATE_TRUNC('month', "startedAt"), 'Mon YYYY') AS month_label,
    DATE_TRUNC('month', "startedAt") AS month_date,
    COUNT(*) AS workout_count
FROM workouts
WHERE "startedAt" >= NOW() - INTERVAL '1 year'
GROUP BY month_date, month_label
ORDER BY month_date;
"""

conn = psycopg2.connect(DATABASE_URL)
try:
    with conn.cursor() as cur:
        cur.execute(QUERY)
        rows = cur.fetchall()
finally:
    conn.close()

if not rows:
    print("No workouts found in the past year. No chart generated.")
    sys.exit(0)

labels = [row[0] for row in rows]
counts = [int(row[2]) for row in rows]

fig, ax = plt.subplots(figsize=(max(8, len(labels) * 0.9), 5))

bars = ax.bar(labels, counts, color="#4F81BD", edgecolor="white", linewidth=0.5)

ax.set_xlabel("Month", fontsize=12, labelpad=8)
ax.set_ylabel("Number of Workouts", fontsize=12, labelpad=8)
ax.set_title("Workouts per Month (Past 12 Months)", fontsize=14, fontweight="bold", pad=14)

ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
ax.set_ylim(0, max(counts) + max(1, int(max(counts) * 0.15)))

for bar, count in zip(bars, counts):
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.1,
        str(count),
        ha="center",
        va="bottom",
        fontsize=10,
        fontweight="bold",
    )

plt.xticks(rotation=45, ha="right", fontsize=9)
plt.tight_layout()

output_path = Path.cwd() / "workout_chart.png"
plt.savefig(output_path, dpi=150, bbox_inches="tight")
plt.close()

print(f"Chart saved to: {output_path}")
