#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
import time
from typing import List, Optional
from pathlib import Path

import requests
from bs4 import BeautifulSoup
import pandas as pd

DEFAULT_URL = "https://en.wikipedia.org/wiki/2025_NFL_draft"
DEFAULT_CLASS = "wikitable sortable plainrowheaders jquery-tablesorter"


def fetch_html(url: str, timeout: int = 20, retries: int = 3, backoff: float = 1.5) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }
    last_exc: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except Exception as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(backoff ** attempt)
            else:
                raise
    # Should not reach here
    if last_exc:
        raise last_exc
    raise RuntimeError("Unknown error fetching HTML")


def has_all_classes(tag, classes: List[str]) -> bool:
    tag_classes = tag.get("class", [])
    return all(cls in tag_classes for cls in classes)


def extract_table(html: str, required_classes: List[str], table_index: int = 0) -> pd.DataFrame:
    soup = BeautifulSoup(html, "lxml")

    # Find all tables that include all required classes (order-agnostic)
    candidates = [
        t for t in soup.find_all("table")
        if has_all_classes(t, required_classes)
    ]

    if not candidates:
        # Fallback: any wikitable if the exact composite class isn’t found
        candidates = soup.select("table.wikitable")

    if not candidates:
        raise ValueError("No matching tables found on the page.")

    if table_index < 0 or table_index >= len(candidates):
        raise IndexError(
            f"table_index {table_index} out of range; found {len(candidates)} matching tables"
        )

    table = candidates[table_index]

    # Let pandas do the heavy lifting for header/rowspans/colspans
    dfs = pd.read_html(str(table))
    if not dfs:
        raise ValueError("Failed to parse table into a DataFrame.")

    df = dfs[0]

    # Clean up: drop multiindex if created, strip column names, drop unnamed
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [" ".join([str(c) for c in tup if str(c) != "nan"]).strip() for tup in df.columns]

    df.columns = [str(c).strip() for c in df.columns]

    # Remove columns that look like unnamed placeholders
    df = df.loc[:, [c for c in df.columns if not str(c).lower().startswith("unnamed")]]

    return df


def save_output(df: pd.DataFrame, out_csv: Optional[Path], out_json: Optional[Path]):
    if out_csv:
        out_csv.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_csv, index=False)
    if out_json:
        out_json.parent.mkdir(parents=True, exist_ok=True)
        df.to_json(out_json, orient="records", indent=2)


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape a specific Wikipedia table and save it.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Wikipedia page URL to scrape")
    parser.add_argument(
        "--class",
        dest="class_str",
        default=DEFAULT_CLASS,
        help="Space-separated class names of the table to match",
    )
    parser.add_argument(
        "--table-index",
        type=int,
        default=0,
        help="If multiple tables match, choose the index (0-based)",
    )
    parser.add_argument(
        "--out-csv",
        type=Path,
        default=Path("data/2025_nfl_draft_table.csv"),
        help="Path to write CSV output",
    )
    parser.add_argument(
        "--out-json",
        type=Path,
        default=None,
        help="Optional path to write JSON output",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Print the first few rows to the console",
    )

    args = parser.parse_args(argv)

    try:
        html = fetch_html(args.url)
        required = [c for c in args.class_str.split() if c.strip()]
        df = extract_table(html, required_classes=required, table_index=args.table_index)
        save_output(df, args.out_csv, args.out_json)

        if args.preview:
            with pd.option_context("display.max_columns", None):
                print(df.head(10))

        print(
            f"Done. Rows: {len(df)} | Columns: {len(df.columns)} | Saved: "
            f"CSV={str(args.out_csv) if args.out_csv else 'no'} | "
            f"JSON={str(args.out_json) if args.out_json else 'no'}"
        )
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
