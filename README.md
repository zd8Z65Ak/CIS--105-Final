## Wikipedia Table Scraper (2025 NFL Draft)

This repo contains a simple Python scraper that downloads a specific table from the Wikipedia page for the 2025 NFL Draft and saves it to CSV (and optionally JSON).

### Quick Start

1) Create/activate the workspace Python environment (already handled in Codespaces).
2) Install dependencies:

```bash
pip install -r requirements.txt
```

3) Run the scraper (prints a small preview and writes CSV to `data/`):

```bash
python scraping.py --preview
```

This will fetch the table with class `wikitable sortable plainrowheaders jquery-tablesorter` from:

- https://en.wikipedia.org/wiki/2025_NFL_draft

and save to:

- `data/2025_nfl_draft_table.csv`

### Customization

- `--url`: Page URL to scrape (defaults to the 2025 NFL Draft page)
- `--class`: Space-separated class names to match on the `<table>` element
- `--table-index`: If multiple tables match, pick which one (0-based)
- `--out-csv`: Output CSV path (default: `data/2025_nfl_draft_table.csv`)
- `--out-json`: Optional JSON output path
- `--preview`: Print the first few rows to the console

Example saving both CSV and JSON:

```bash
python scraping.py \
	--out-csv data/draft.csv \
	--out-json data/draft.json \
	--preview
```

### Notes

- The scraper sets a browser-like User-Agent to reduce the chance of being blocked.
- If the precise composite class is not found, it falls back to the first `wikitable` on the page.

## Import to SQLite

After scraping, import the CSV into a SQLite database file named `draft` with a table `draft`:

```bash
python import_to_db.py --csv data/2025_nfl_draft_table.csv --db data/draft --table draft
```

Preview the first rows from the database:

```bash
python -c "import sqlite3, pandas as pd; conn=sqlite3.connect('data/draft'); print(pd.read_sql_query('SELECT * FROM draft LIMIT 5', conn))"
```

## Steelers Picks Web App

This simple frontend loads `Steeler Picks.csv` from the project root and lets you:

- Browse a list of players and view details
- Use a dropdown (top-right) to switch players
- See a map centered on the player's college location (via OpenStreetMap/Nominatim)

### Run locally

Open `index.html` directly, or serve the folder with a static server for better CORS behavior:

```bash
# Option A: Python simple server
python -m http.server 8000
# Then open http://localhost:8000/

# Option B: VS Code Live Server extension
# Install and click "Go Live" in the status bar.
```

Ensure your `Steeler Picks.csv` has headers. Expected columns (flexible):

- Round | Rnd
- Ovr_Pick_No | Pick
- NFL_Team
- Player | Name
- Position | Pos
- College
- Conference
- Notes

The app attempts to geocode the `College` string; if the service rate-limits, wait a bit or serve locally.
# CIS--105-Final