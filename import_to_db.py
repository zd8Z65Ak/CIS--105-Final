#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sqlite3
import pandas as pd


def import_csv_to_sqlite(csv_path: Path, db_path: Path, table_name: str) -> None:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)

    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        df.to_sql(table_name, conn, if_exists="replace", index=False)


def main() -> int:
    parser = argparse.ArgumentParser(description="Import CSV into a SQLite database table.")
    parser.add_argument("--csv", type=Path, default=Path("data/2025_nfl_draft_table.csv"), help="Path to source CSV")
    parser.add_argument("--db", type=Path, default=Path("data/draft.sql"), help="Path to SQLite database file to create/use")
    parser.add_argument("--table", type=str, default="draft", help="Destination table name")
    args = parser.parse_args()

    import_csv_to_sqlite(args.csv, args.db, args.table)
    print(f"Imported {args.csv} into {args.db} as table '{args.table}'.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
