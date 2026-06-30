# Readify

A personal reading tracker with a GitHub-style contribution graph. Each day you log what you read; the site visualizes your reading streak, topics, and timeline.

## Features

- GitHub-style reading activity heatmap
- Current and longest streak counters
- Tag-based topic filtering
- Reverse-chronological reading timeline
- Static site deployable to GitHub Pages

## Local development

```bash
npm install
npm run dev
```

## Add a reading

```bash
npm run add
```

The CLI prompts for a URL, date, tags, and optional note. It fetches the page title automatically and appends the entry to `data/readings.json`.

After adding an entry, commit the change:

```bash
git add data/readings.json
git commit -m "Add reading: <title>"
git push
```

Each commit updates both your real GitHub contribution graph and the in-app reading graph.

## Deploy to GitHub Pages

1. Push this repo to GitHub (repo name should be `readify` to match the configured base path).
2. In the repo settings, go to **Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

If your repo name differs, update `base` in `vite.config.js` to `/<your-repo-name>/`.

## Data format

Entries live in `data/readings.json`:

```json
{
  "date": "2026-06-29",
  "url": "https://example.com/article",
  "title": "Some Article",
  "tags": ["ml", "systems"],
  "note": ""
}
```
