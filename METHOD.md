# METHOD — gta6-trophy-guide-01 (Leonida) — rebuild 3

## Why a rebuild

Two earlier builds of this entry could not enter: the first had no recording
running when its session started, and the second's recording died mid-build
when its cleanup deleted `.git/` during the session. This is a fresh rebuild
under a recording started by the parent before this session began. Every file
below was written in this session, from scratch, using the earlier METHOD.md
only as a reference design. The old agent-written files were deleted in place
first (main.ts, app/, screenshots/, README.md, METHOD.md, shots.json,
.gitignore) — `.git/`, `.makefun/`, LICENSE, serve.ts and vendor/ were left
untouched, and the existing anchor was kept (drand round 34099923, emitted
2026-11-19T15:45:33Z, after the 11:00 UTC opening).

## What was built

An offline web app (static files under `app/`, no build step) that is the best
GTA 6 trophy guide and tracker we could build from public information on
launch day, Nov 19, 2026:

- **Checklist** — all 55 PS5 trophies with official names, descriptions and
  grades; checkbox tracker with progress saved in localStorage; export to
  file, import back, and a shareable progress link (earned ids in the URL
  hash); filters by kind (Story, Missable, Collectibles, Activities, Robbery,
  Exploration, Money, Platinum), grade, earned state, and free-text search; a
  spoiler setting (on by default) that hides the 28 hidden trophies' names
  and descriptions until earned; a detail panel beside the list showing the
  selected trophy's own-words guide, steps, count target and named sources.
- **Roadmap to Platinum** — facts grid (about 200 hours, 4/10, 1 playthrough,
  no online trophies, potentially 1 missable), three stages with hour
  estimates and steps, the full 100% Completion checklist table, and the
  "All 55 trophies in roadmap order" table (every trophy in the order this
  guide tackles it, with grade, stage and key fact).
- **Missable Watch** — Positive Mental Attitude (the only potentially
  missable trophy) with the Chapter 1 warning, the save strategy (manual
  saves every chapter, 15 slots, no mission replay), and the cheats warning
  (61 cheats, post-story only, disable trophies and saving).
- **Audit strip** — visible under the header: 55/55 verified, sources named
  and dated, 5 unconfirmed triggers disclosed.
- **Entrypoint** `main.ts` (Node 22 stdlib only) copies `app/` and
  `screenshots/` to `/output` and writes `dossier.json` via the vendored
  `vendor/makefun-frontend.ts` (unchanged). Two runs produce byte-identical
  output.
- **Screenshots** (4 × 1280×800 JPEG, each ≤256 KiB, viewed by the builder):
  1-checklist (cover: checklist + Positive Mental Attitude guide open),
  2-roadmap, 3-missable, 4-tracker (Activities filter, Cunning Stunts open).

## Trophy data — sourced vs assumed

- **Official names, descriptions, grades (all 55): SOURCED.** Re-derived in
  this session from PlanetGTA6's full list (Nov 18, 2026), which reports the
  official English names and descriptions as shown on PSN, taken from
  Exophase and cross-checked with PSNProfiles and TrueAchievements: all 55
  names, descriptions and grades match the kit starter's official list
  exactly. Grade split confirmed: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze;
  28 hidden.
- **Unlock guidance (per trophy): SOURCED, own words.** From GTA Zone's
  full trophy guide (Nov 18, 2026), whose tips come from PowerPyx and
  GTABase: counts (250/397 stunts, 42 shooting-range golds, 14 drone spots,
  20/40 races, 8 strands, 18 meditation spots, 3/18 card sets, 100 WAiNK
  locations, 50/80 challenges, 100 vehicles, 5/8 vaults, 9 gangs, $250k
  laundering, $100k spending, 8 garages, 10 Scooter Bros registrations),
  the Strangers & Freaks counting list (Kirk, Kyle, Yago, Pilot Pete), the
  100% Completion checklist (PowerPyx), the ~200h / 4/10 roadmap, and the
  missable analysis. Every guide names its sources beside it in the app.
- **Assumed / not yet confirmed (flagged honestly in the app):** the exact
  triggers for 5 hidden trophies — In The Beginning…, Capital Offense, Bad
  Luck I Guess, The Truth Is Out There, Ten Pin — plus Fair Game's exact
  animal. Neither PowerPyx nor GTABase had pinned them down as of Nov 18,
  2026. Each of those six guides says so in plain language and gives the
  best reading of the official description instead of inventing steps.
- **No Rockstar logo, artwork, box art or game screenshots** anywhere; the
  look is our own (dark indigo + neon pink/cyan). No guide text is copied
  from other guides — all guidance is written in our own words.

## Kit checks

- `node cli/makefun.mjs check --kit . --repo <repo>` (fresh level-20 kit):
  **5 passed, 0 failed** (entrypoint, repo_created_after_open, competition_open,
  snapshot, license_osi). Transcript checks are skipped locally — the site runs
  them on the sealed recordings. At-submission checks (repo_owner,
  source_bundle, duplicate_snapshot) are the site's at submit time.
- `main.ts` run twice: `out/` and `out2/` byte-identical.

## Competitor comparison (Mrx: "utamakan kesempurnaan")

- Leaderboard (2,487 entries, fetched Nov 19 ~22:25 WIB): #1 nightshift-labs
  "SUNLINE: 55-trophy checklist with full official descriptions, audit strip,
  cited guides with dated sources, platinum roadmap showing all 55 with key
  facts, missable watch list, spoilers, save". All entries have `repo_url: ""`
  and `source_withheld: true` during the dev phase, so no competitor repo could
  be fetched; comparison used the leaderboard titles + the judge criteria
  (tracker+data, roadmap+missables, cited guidance, polish).
- This rebuild carries both comparison fixes: a visible audit strip under the
  header (55/55 verified, sources named and dated, 5 unconfirmed triggers
  disclosed), and the "All 55 trophies in roadmap order" table in the roadmap
  view. Where we win: full official descriptions + grades on every trophy;
  cited guides with dated sources shown beside each trophy; a real tracker
  (localStorage, export/import, shareable progress link); roadmap with the 100%
  checklist numbers AND all 55 in roadmap order; missable watch with the
  Chapter 1 warning and save/cheat advice; spoiler setting that actually hides
  hidden trophies until earned; 4 screenshots that show the guide, roadmap,
  missables and tracker at a glance. The 5 unconfirmed triggers are honestly
  flagged rather than solved — nobody has solved them yet as of Nov 18, 2026,
  so this is a data limit, not a build gap.

## Submit-ready state (for the parent)

- **Repo dir:** `~/workspace/makefun/gta6-trophy-guide-01/` (anchor
  `0caf6c709ec2299374aad528b90e26628cbc6e79`, drand round 34099923, emitted
  after the competition opened). **Local commit
  `1a07981f376ebc150e837743e3037bc9755b8bbf`** (14 files changed vs the
  previous rebuild commit, author mrxclaxxyz <mrxclaxx@gmail.com>).
  Kit check re-run on the final commit: 5 passed, 0 failed.
- **Recording:** started by the parent BEFORE this session began — this
  session's work is witnessed. Parent seals it and submits with the
  recording id.
- **Do NOT create the GitHub repo from this session** (parent handles it).
  When the repo is created: README.md (from the official template, referral
  qk6r6d3e) is in the repo root; About must be set to description
  "The best GTA 6 trophy guide and tracker — all 55 PS5 trophies, cited
  guides, platinum roadmap and missable watch. Built by an AI agent for
  make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.",
  homepage https://make.fun/bounty/gta6-trophy-guide-01, topics makefun,
  ai-agents, bounties, games. Include the MIT LICENSE in the first upload
  batch (a browser-created empty repo does not carry it — the
  news-image-20261119 lesson).
- **Deadline:** entries close 2026-11-21T11:00:00Z (21 Nov 18:00 WIB).
- **Title:** "Leonida — GTA VI Trophy Guide & Tracker".
