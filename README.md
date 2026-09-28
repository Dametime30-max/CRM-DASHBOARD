# Wills Matter Dashboard — browser-only prototype

> **PROTOTYPE — Do not enter real client information.**
> Data is stored locally in this browser (localStorage) and is **not encrypted**.
> This is a workflow aid only. Checklist prompts are not legal advice and do not
> replace the firm's precedents, procedures or supervision.

The whole application is one file: **`wills-dashboard.html`**.

- No installation, no administrator access, no server, no internet connection.
- Plain HTML, CSS and JavaScript. No external libraries, fonts, images or APIs.
- The page blocks all network requests itself, using a Content Security Policy.

## How to open it (Windows)

1. On GitHub, open the repository and switch to the branch `claude/adoring-keller-fqk9wp`.
2. Click **`wills-dashboard.html`**, then click the **Download raw file** button (the download arrow).
3. Save it somewhere you'll find it again, for example `Documents\Wills Prototype\`.
4. Double-click the file. It opens in your default browser.
   If it opens in a different program, right-click it and choose
   **Open with → Microsoft Edge** (or Google Chrome).

Use the **same browser** each time. Edge and Chrome keep separate data.

## Prototype data

These buttons are in the left sidebar, under **Prototype data**:

| Button | What it does |
|---|---|
| **Export Data** | Downloads all current data as `wills-dashboard-export-YYYY-MM-DD.json` to your Downloads folder. |
| **Import Data** | Choose a previously exported `.json` file. It asks for confirmation, then **replaces** all current data. |
| **Reset Sample Data** | Asks for confirmation, then deletes everything and reloads the 8 fictional sample matters and the default template. |

The data lives in the browser, not in the HTML file. So:

- Replacing the HTML file with a newer version keeps your data.
- **Clearing browsing data** (or a work policy that clears it when the browser
  closes) deletes it. Use **Export Data** if you want to keep a copy.

## What's in it

- **Dashboard.** Summary cards, matters requiring attention (with reasons),
  upcoming dates, recent matters, and a searchable, filterable, sortable matter table.
- **Matters.** Every matter, including finalised and closed ones.
- **New Matter.** Matter details plus client-circumstance questions.
  Answering "Yes" reveals follow-up fields (children, spouse, trust, SMSF, BDBN and others).
- **Matter workspace.** "What needs my attention?", a **Continue** button, and 12
  working tabs: Overview, Instructions, Family, Estate, Beneficiaries,
  Executors & Guardians, Drafting, Execution, Tasks, Dates, Notes, Documents.
- **Smart workflow.** The 7-stage checklist has **core** items plus **additional
  items triggered by the client's circumstances** (for example "Has BDBN = Yes" adds
  "Review BDBN"). Changing an answer adds or removes items straight away.
  Items can be ticked, marked N/A and annotated. Progress = completed ÷ applicable items.
- **Checklist Template.** Add, edit, delete, reorder, choose the stage, and set
  core or conditional (with a condition). Changes affect **new** matters only.

## Limitations (prototype)

- Data is stored unencrypted in one browser on one computer. There are no user
  accounts, access controls or audit log, and no sharing between users.
- Other web pages opened from local files in the same browser can read this data.
- Browser storage is limited to roughly 5 MB, which is plenty for many test
  matters but not a database.
- The document register records documents. It does not store files.
- Not suitable for real client information or production legal practice.

## History

The earlier Next.js/SQLite prototype was replaced by this single file. It remains
in the git history at commit `8a04905`.
