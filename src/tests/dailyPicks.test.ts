import { describe, it, expect } from 'vitest';
import {
    PICK_HISTORY_START,
    getPicksForDate,
    hasImage,
} from '../charachterPickLogic';
import { AVOID_N_LAST_CHARACTERS } from '../gameConfig';
import { Character } from '../types';

// Fresh-timeline fork: everything is added on the launch date and picks start there.
const LAUNCH = '2026-11-25';

/** All YYYY-MM-DD keys from `from` to `to` (inclusive, UTC) */
function dateRange(from: string, to: string): string[] {
    const days: string[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
    return days;
}

function addDays(dateKey: string, days: number): string {
    const [y, m, dd] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, dd + days)).toISOString().slice(0, 10);
}

describe('fresh timeline', () => {
    it('pick-history start matches the fork launch date', () => {
        expect(PICK_HISTORY_START).toBe(LAUNCH);
    });

    it('resolves every day from before launch to far in the future without crashing', () => {
        for (const date of dateRange('2026-10-01', '2028-12-31')) {
            expect(() => getPicksForDate(date)).not.toThrow();
        }
    });

    it('serves nothing before the launch date (no characters exist yet)', () => {
        for (const date of dateRange('2026-10-01', '2026-11-24')) {
            const picks = getPicksForDate(date);
            expect(picks.classic, `classic on ${date}`).toBeNull();
            expect(picks.image, `image on ${date}`).toBeNull();
        }
    });

    it('serves a classic and an image target every day from launch onwards', () => {
        for (const date of dateRange(LAUNCH, '2028-12-31')) {
            const picks = getPicksForDate(date);
            expect(picks.classic, `classic on ${date}`).not.toBeNull();
            expect(picks.image, `image on ${date}`).not.toBeNull();
        }
    });
});

describe('daily pick rules (from launch onwards)', () => {
    const dates = dateRange(LAUNCH, '2027-12-31');
    const picks = dates.map(getPicksForDate);

    it('classic target is never repeated within the avoid window', () => {
        for (let i = AVOID_N_LAST_CHARACTERS; i < picks.length; i++) {
            const window = picks
                .slice(i - AVOID_N_LAST_CHARACTERS, i)
                .map((p) => p.classic!.name);
            expect(
                window,
                `${picks[i].classic!.name} repeated on ${dates[i]}`
            ).not.toContain(picks[i].classic!.name);
        }
    });

    it('image target always has a photo and is never today\'s classic target', () => {
        dates.forEach((date, i) => {
            const { classic, image } = picks[i];
            expect(hasImage(image!), `image on ${date} has no photo`).toBe(true);
            expect(image!.name).not.toBe(classic!.name);
        });
    });

    it('targets are eligible: every pick comes from the roster with dateAdded <= date', () => {
        dates.forEach((date, i) => {
            for (const c of [picks[i].classic, picks[i].image] as Character[]) {
                expect(c!.dateAdded <= date, `${c!.name} on ${date}`).toBe(true);
            }
        });
    });
});
