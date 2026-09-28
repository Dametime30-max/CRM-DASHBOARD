==============================================================
  WILLS MATTER DASHBOARD  -  PROTOTYPE
==============================================================

  *** PROTOTYPE - DO NOT ENTER REAL CLIENT INFORMATION. ***

  Data is stored locally in this browser and is NOT encrypted.
  Use made-up (fictional) names and details only.

  This is a workflow aid for testing a Wills matter process.
  It is NOT legal advice and does not replace the firm's
  precedents, procedures or supervision.


--------------------------------------------------------------
1. WHAT IS IN THIS FOLDER
--------------------------------------------------------------

  wills-dashboard.html   <- THE APPLICATION. Double-click this.
  README.txt             <- These instructions.
  BACKUP\                <- A spare copy of the application,
                            and a good place to keep your
                            exported data files.


--------------------------------------------------------------
2. WHAT THE APPLICATION IS
--------------------------------------------------------------

  A simple Wills matter dashboard that runs inside Microsoft
  Edge (or Google Chrome). You can:

   - see all Wills matters and what needs attention
   - create, edit and delete matters
   - answer client-circumstance questions (spouse, children,
     family trust, SMSF, BDBN, overseas assets, etc.) - the
     checklist adds extra steps based on the answers
   - tick off checklist items, mark them N/A, and add notes
   - record tasks, key dates, file notes and a document list
   - edit the checklist template used for new matters

  You do NOT need to install anything. No internet connection,
  no administrator access and no other software is needed.


--------------------------------------------------------------
3. HOW TO OPEN IT
--------------------------------------------------------------

  1. Open this folder (on your Desktop: "Wills Matter Dashboard").
  2. Double-click  wills-dashboard.html
  3. It opens in your web browser.

  If it opens in the wrong program:
     Right-click wills-dashboard.html
     -> Open with -> Microsoft Edge

  TIP: Always use the SAME browser (e.g. always Edge).
       Edge and Chrome each keep their own separate data.


--------------------------------------------------------------
4. HOW TO USE IT
--------------------------------------------------------------

  Use the menu on the left:

   Dashboard           Overview: what is overdue, due soon,
                       upcoming dates and recent matters.
   Matters             All matters. Search, filter and sort.
                       Click a matter to open it.
   New Matter          Create a matter. Only Client and Matter
                       Number are required.
   Checklist Template  Change the checklist used for NEW matters.

  Inside a matter:
   - "WHAT NEEDS MY ATTENTION?" is shown at the top.
   - "Continue" jumps to the next unfinished checklist item.
   - Use the tabs (Overview, Instructions, Family, Estate, ...
     Tasks, Dates, Notes, Documents) to move around.
   - Changes save automatically.

  The 8 matters that come with the application are fictional
  and are marked "SAMPLE DATA".


--------------------------------------------------------------
5. WHERE YOUR DATA IS KEPT (IMPORTANT)
--------------------------------------------------------------

  Your data is NOT saved inside wills-dashboard.html.
  It is saved inside the web browser on this computer
  (the browser's "local storage").

  This means:
   - Closing and reopening the browser keeps your data.
   - Moving or renaming the HTML file keeps your data.
   - A different browser, or a different computer, will NOT
     see your data.
   - CLEARING BROWSER DATA (cookies / site data / "clear
     browsing data") MAY DELETE ALL OF YOUR INFORMATION.
     Some work computers do this automatically.
   - The data is NOT encrypted. Do not enter real client
     information.

  So: EXPORT YOUR DATA REGULARLY (see section 7).


--------------------------------------------------------------
6. HOW TO CREATE BACKUPS
--------------------------------------------------------------

  There are two different things to back up:

  a) The APPLICATION (the program itself)
     A spare copy is already in:
        BACKUP\wills-dashboard-backup.html
     If wills-dashboard.html is ever deleted or damaged,
     copy the backup file back into this folder and rename
     it to  wills-dashboard.html

     Note: the backup copy is the same program. If you open
     it, it shows the SAME data as the main file (the data
     lives in the browser, not in the file).

  b) YOUR DATA (matters, checklists, tasks, notes, etc.)
     Use "Export Data" (section 7). Move the exported file
     into the BACKUP folder so you know where it is.


--------------------------------------------------------------
7. HOW TO EXPORT DATA  (save a copy of your data)
--------------------------------------------------------------

  1. Open wills-dashboard.html
  2. In the left menu, under "Prototype data",
     click  Export Data
  3. A file is saved to your Downloads folder, named like:
        wills-dashboard-export-2026-09-28.json
  4. Move that file into this folder's BACKUP folder.

  Do this regularly, and always before clearing browser data
  or using "Reset Sample Data".


--------------------------------------------------------------
8. HOW TO IMPORT DATA  (restore a copy of your data)
--------------------------------------------------------------

  1. Open wills-dashboard.html
  2. In the left menu, click  Import Data
  3. Choose a previously exported .json file
     (e.g. from the BACKUP folder).
  4. Click OK to confirm.

  WARNING: Importing REPLACES everything currently in the
  application with the contents of the file.


--------------------------------------------------------------
9. HOW TO RESET THE SAMPLE DATA
--------------------------------------------------------------

  1. Open wills-dashboard.html
  2. In the left menu, click  Reset Sample Data
  3. Click OK to confirm.

  WARNING: This DELETES all matters, progress, tasks, dates,
  notes, documents and template changes in this browser, and
  reloads the 8 fictional sample matters. Export first if you
  want to keep anything.


--------------------------------------------------------------
10. IMPORTANT LIMITATIONS
--------------------------------------------------------------

   - PROTOTYPE ONLY. Not suitable for real client matters.
   - Data is stored in one browser on one computer only.
   - Data is not encrypted and has no password protection.
   - Other web pages opened from files on this computer, in
     the same browser, could read this data.
   - No user accounts, no sharing between people, no audit
     trail.
   - Browser storage is limited (about 5 MB) - fine for
     testing, but it is not a database.
   - The Documents tab is a register (a list) only. It does
     not store the actual files.
   - Clearing browser data may permanently remove your data
     unless you have exported it.

==============================================================
