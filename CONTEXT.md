# Cybdatle — project context for LLMs / new contributors

Cybdatle is a daily "guess who" web game (Wordle/Loldle style) about the 2nd-year class — its
students, lecturers and rooms (the Rom). Forked and rebranded from komtekle (the 5th-year game,
github.com/perhenrikgithub/komtekle). UI text is **Norwegian**. Hosting is not decided yet, so
the share URL still points at the old komtekle site as a placeholder. No backend: everything is
client-side, deterministic per date, and progress lives in `localStorage`. See `GLOSSARY.md`
for the domain vocabulary and `docs/adr/0001-fresh-timeline-at-fork.md` for the timeline reset.

## Stack
- Vite + React 19 + TypeScript, Tailwind CSS 3, `canvas-confetti`.
- Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm test` (vitest), `npm run typecheck`.
- Tests: `src/tests/` (vitest). Seams: daily picks (`charachterPickLogic`) and roster/columns.
- `t.py` (repo root): helper that lists characters without an image, images without a character
  and roster entries with identical parameters.

## File map
| File | Purpose |
|---|---|
| `src/App.tsx` | Shell: title, mode switcher (`klassisk` / `bilde`, synced to `?mode=bilde`), Halloween styling. |
| `src/ClassicGame.tsx` | Classic mode: guess a character, each guess shows coloured feedback per feature column (desktop table + mobile cards). |
| `src/ImageGame.tsx` | Image mode ("Bilde"): zoomed-in photo of the target, zooms out one step (`ZOOM_STEPS`, 7 steps) per wrong guess. Zoom focus point is seeded per date. |
| `src/charachterPickLogic.ts` | (sic, misspelled filename) Daily target selection for both modes + `useDailyGuesses` localStorage hook. |
| `src/gameConfig.ts` | `AVOID_N_LAST_CHARACTERS` (currently 7) and `GAME_FEATURES` (the columns of classic mode). |
| `src/utils.ts` | `seededRandom` (FNV-1a + murmur fmix32 → [0,1)), `getImagePath`, `evaluateFeature`, `isPotentialAnswer`, `isHalloween`, confetti. |
| `src/share.ts` | Builds the share text (emoji grid) for whatever modes were won today. |
| `src/types.ts` | `Character`, `FeatureConfig`, `ComparisonResult`. |
| `src/components/SearchBox.tsx` | Autocomplete name input (hides already-guessed names; `showImages={false}` in image mode). |
| `src/components/WinCard.tsx` | Win screen + share button. |
| `src/data/characters.json` | **The data.** Array of characters (the 12-character core cast as of 2026-11-17). |
| `public/character_images/` | One `.jpg` per character + `default_male_avatar.jpg` / `default_female_avatar.jpg`. |

## Data model (`characters.json`)
```json
{
  "name": "Sahara",
  "gender": "Inkjekjønn",                   // "Mann" | "Kvinne" | "Inkjekjønn" (rooms)
  "role": ["Rom", "Kjøkken"],               // string or string[] (PARTIAL feature); students get ["Student", "2."]
  "height": "Takhøyde",                     // must be one of the rankOrder values in gameConfig
  "mystisk": "Nei",                         // placeholder successor of "certified mojavebabe", renamed by the joke pass
  "verv-whipped": "Nei",                    // "Ja" | "Nei"  (underscore spelling also accepted)
  "region": "Sør",
  "dateAdded": "2026-11-25"                 // YYYY-MM-DD, REQUIRED — see below
}
```
- Characters are not only people: rooms ("Sahara", "Mojave", "A3") are valid entries with
  gender `Inkjekjønn`. The core cast is six rooms + six lecturers; the 2nd-year student roster
  is added on top (see the class-roster ticket).
- **Fresh timeline**: every entry so far carries `dateAdded: "2026-11-25"` (launch day) — that
  is the fork's timeline reset, see the ADR. From launch day the compatibility rule binds:
  set `dateAdded` to the date an entry goes live (today or later), **never in the past** —
  otherwise past days' (and therefore today's exclusion list) change.
- Don't reorder, rename or delete entries casually: the pick is an index into the eligible
  list, so changing the list changes which character each day maps to.
- Image file name = `name.toLowerCase()` with everything except `a-z0-9æøå` stripped, + `.jpg`
  (e.g. "Thomas Zinner" → `thomaszinner.jpg`). Characters without an image fall back to the
  default avatar in classic mode and are skipped in image mode.
- The image folder still holds most upstream komtekle photos and lacks the new characters
  (A3, Nomade, Orosj, Stas and every future student). `t.py` reports both directions; that
  mismatch list is expected until the class roster and photo tickets land.

## Adding a feature column
See README: add the key to every character, then add an entry to `GAME_FEATURES` with
`type: 'EXACT' | 'PARTIAL' | 'RANKED'` (RANKED needs `rankOrder`, low→high). Components and share text
are driven entirely by `GAME_FEATURES`.

## Daily target selection (the important/fragile part)
- Date key = **UTC** date (`new Date().toISOString().slice(0,10)`). In Norway the day flips at 01:00/02:00
  local time, not midnight.
- Everyone gets the same target because it's `seededRandom(seed + dateKey)` over the eligible list.
  Seeds: classic `classic-${date}`, image `bilde-v2-${date}`, zoom focus `bilde-x-`/`bilde-y-`.
- Goal: don't repeat a character within `AVOID_N_LAST_CHARACTERS` days (per mode), and image mode must
  never equal today's classic target. With a small roster the avoid window can exhaust the image pool;
  the fallback then prefers anyone else with a photo over repeating today's classic target.
- localStorage keys: `cybdatle-${date}` (classic guesses), `cybdatle-bilde-${date}` (image guesses),
  `cybdatle-bilde-vunnet-${date}` (image won flag). Changing the algorithm mid-day means players who
  already started see a different target, so ship algorithm changes so they take effect from a future date.

### How picks work (fresh timeline)
`getPicksForDate(date)` in `charachterPickLogic.ts` returns `{ classic, image }`, memoized.
- From `PICK_HISTORY_START` (the launch date 2026-11-25) on, picks are **chained forward**: each day excludes the
  characters *actually* served in that mode during the previous `AVOID_N_LAST_CHARACTERS` days.
  Image mode additionally excludes today's classic target and only chooses characters that have an image.
- Days before `PICK_HISTORY_START` run the legacy algorithm, a kept-over upstream safety net; on the fresh
  timeline no entry is eligible before launch, so those days serve nothing. Never move
  `PICK_HISTORY_START` now — from launch day on it guards this game's own reproducible history.
- Which images exist comes from the `virtual:character-images` module, generated at build time by a small
  plugin in `vite.config.js` from `public/character_images/`. Adding an image changes the image-mode pool,
  so (like `dateAdded`) add images/characters before the day they should go live, not mid-day.
- Exports: `getDailyClassicCharacter(date)`, `getDailyImageCharacter(date)`, `getPicksForDate`, `hasImage`.

History: komtekle's first version (2026-10-09 → 10-22, upstream) excluded the *unfiltered* picks of past
days instead of the real ones, so repeats happened; upstream fixed it with the chaining above. Cybdatle
inherits the fixed algorithm and applies the same no-repeat + no-classic-collision guarantees on its own
timeline (`src/tests/dailyPicks.test.ts` pins them).
