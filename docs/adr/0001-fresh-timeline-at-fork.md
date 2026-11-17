# Fresh timeline at the fork

Upstream komtekle promised that every past daily puzzle stays exactly reproducible: roster
entries are never renamed, reordered, deleted or back-dated, and the pick-history start marks
where its exclusion algorithm changed. Cybdatle forks that game for the 2nd-year class, whose
cast barely overlaps the 5th-year one. We decided to reset the timeline entirely: the whole
roster is introduced on the launch date 2026-11-25 with the same `dateAdded`,
`PICK_HISTORY_START` moves to that day, and komtekle's no-edit compatibility rule only
applies again from launch day onward. Keeping history would have meant preserving a 5th-year
roster, dropped lecturers and cursed objects we are deliberately dropping — dead weight for a
game whose players have never seen a komtekle puzzle.

## Consequences

- Every roster entry carries the same `dateAdded` (2026-11-25); the dates clustering on one
  day is intentional, not data sloppiness.
- Dates before the launch date serve no character ("Ingen tilgjengelige karakterer") instead
  of some upstream puzzle nobody here ever played.
- The legacy pre-history pick algorithm is kept only as a safety net for dates before
  `PICK_HISTORY_START`; with the fresh timeline it has no real players to serve.
- From launch day the old rule binds again: never back-date `dateAdded`, don't rename or
  reorder entries, or future contributors would rewrite served puzzles.
