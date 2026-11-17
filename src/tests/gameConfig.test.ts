import { describe, it, expect } from 'vitest';
import { GAME_FEATURES } from '../gameConfig';

// The final 2nd-year column set, as specified in the "Reshape the feature columns" ticket.
const FINAL_COLUMN_LABELS = [
    'Antatt kjønn',
    'Type',
    'Høyde',
    'Region',
    'Verv-whipped',
    'Mystisk kolonne', // placeholder name for the successor of "Certified mojavebabe"
];

// Høyde keeps its six ranked tiers unchanged (low -> high)
const HEIGHT_TIERS = [
    'Lommeformat',
    'Litt kortere enn menneskehøyde',
    'Menneskehøyde',
    'Langbeint',
    'Takhøyde',
    'Tårnhøyde',
];

describe('GAME_FEATURES (final column set)', () => {
    it('renders exactly the final columns, in order', () => {
        expect(GAME_FEATURES.map((f) => f.label)).toEqual(FINAL_COLUMN_LABELS);
    });

    it('no longer shows the Profil column', () => {
        expect(GAME_FEATURES.some((f) => f.label === 'Profil' || f.key === 'profil')).toBe(false);
    });

    it('no longer shows a Certified mojavebabe column', () => {
        expect(GAME_FEATURES.some((f) => f.label.toLowerCase().includes('mojavebabe'))).toBe(false);
    });

    it('keeps the six Høyde tiers, low to high, untouched', () => {
        const height = GAME_FEATURES.find((f) => f.label === 'Høyde');
        expect(height?.type).toBe('RANKED');
        expect(height?.rankOrder).toEqual(HEIGHT_TIERS);
    });
});
