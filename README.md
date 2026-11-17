# Cybdatle

The daily "guess who" game for the 2nd-year class, forked from [komtekle](https://github.com/perhenrikgithub/komtekle).

## Fresh timeline (fork note)

Upstream komtekle lived by a strict no-edit compatibility rule: roster entries were never
renamed, deleted or back-dated, because every past day's puzzle had to stay reproducible.

**That rule was deliberately reset at this fork** (see
[ADR 0001](docs/adr/0001-fresh-timeline-at-fork.md)). Cybdatle declares a fresh timeline:

- The entire roster was introduced on the launch date **2026-11-25**, so every entry carries
  `dateAdded: 2026-11-25` — this is why the dates cluster on a single day.
- Daily picks start on the same day (`PICK_HISTORY_START = 2026-11-25`). Days before launch
  serve nothing ("Ingen tilgjengelige karakterer").
- From launch day onward the old compatibility rule applies again: never back-date `dateAdded`,
  and don't rename or reorder entries, so past puzzles stay stable.

## Feature Configuration

Game columns, evaluation logic, and share output are driven by the `GAME_FEATURES` array in `src/gameConfig.ts`. 

You do not need to update React components or helper functions when adding or changing fields.

### Adding a Feature

1. **Add the field to characters in `src/data/characters.json`**:
   ```json
   {
     "name": "Per",
     "kaffe_drikker": "Ja" <!-- Example of new field -->
   }
   ```

2. **Add an entry to `GAME_FEATURES` in `src/gameConfig.ts`**:
   ```typescript
   {
     key: 'kaffe_drikker',      // JSON key name
     label: 'Kaffedrikker',     // Column header text
     type: 'EXACT',             // Comparison strategy
     widthClass: 'w-28'// Width of column in the UI, or any valid Tailwind sizing class
   }
   ```

Column order in the UI matches the order of objects in this array.

### Comparison Types (`type`)

#### 1. `EXACT`
Standard string equality check
* **Green:**  Match
* **Red:**  Mismatch
* **e.g.:** Yes/No, Gender, Where from (region).

```typescript
{
  key: 'region',
  label: 'Region',
  type: 'EXACT',
  widthClass: 'w-32 shrink-0'
}
```


#### 2. `PARTIAL`
Array comparison for overlapping values.
* **Green:** Exact set match (same items)
* **Yellow:** At least one overlapping value
* **Red:** No shared values
* **e.g.:** Tags, roles, hobbies (`["Student", "5."]`).
* **Requirement:** Must supply an array of strings in the JSON data.

```typescript
{
  key: 'role',
  label: 'Type',
  type: 'PARTIAL',
  widthClass: 'w-32'
}
```


#### 3. `RANKED`
Ordinal comparison based on an ordered list (cells with arrow indicators).
* **Green:** Exact match
* **Yellow:** Off by 1 index
* **Red:** Off by 2 or more indices
* **Arrows:** Displays an up/down arrow pointing toward the target value.
* **Requirement:** Must supply `rankOrder` ordered from lowest to highest.
* **e.g.:** Height, age, study year.

```typescript
{
  key: 'height',
  label: 'Høyde',
  type: 'RANKED',
  rankOrder: [
    'Lommeformat',
    'Litt kortere enn menneskehøyde',
    'Menneskehøyde',
    'Langbeint',
    'Takhøyde',
    'Tårnhøyde'
  ],
  widthClass: 'w-32 shrink-0'
}
```