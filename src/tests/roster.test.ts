import { describe, it, expect } from 'vitest';
import characterData from '../data/characters.json';
import { GAME_FEATURES } from '../gameConfig';
import { getFeatureValue } from '../utils';
import { Character } from '../types';

const characters = characterData as Character[];

// Fresh-timeline fork: the whole core cast arrives on launch day
const LAUNCH = '2026-11-25';

// The core cast from the "Core cast rewrite" ticket: six rooms + six lecturers
const CORE_ROOMS = ['A3', 'Komtekloungen', 'Sahara', 'Mojave', 'Ngorongoro', 'Nomade'];
const CORE_LECTURERS = ['Thomas Zinner', 'Katrien', 'Tjerand', 'Poul', 'Orosj', 'Stas'];

// Gone with the 5th-year roster, the dropped lecturers and the cursed objects
const MUST_NOT_APPEAR = [
    'Ortega', 'Peter Herrmann', 'Kurusch', 'Jan', 'T-ruls',
    'Bæsjestøvsuger', 'Komtekrommet', 'Serengeti', 'Per',
];

const names = () => characters.map((c) => c.name);
const rolesOf = (c: Character) => (Array.isArray(c.role) ? c.role : [c.role]);

describe('core cast roster', () => {
    it('contains exactly the six rooms and six lecturers', () => {
        const rooms = characters.filter((c) => rolesOf(c).includes('Rom')).map((c) => c.name);
        const lecturers = characters.filter((c) => rolesOf(c).includes('Lecturer')).map((c) => c.name);
        expect(rooms.sort()).toEqual([...CORE_ROOMS].sort());
        expect(lecturers.sort()).toEqual([...CORE_LECTURERS].sort());
        expect(names().sort()).toEqual([...CORE_ROOMS, ...CORE_LECTURERS].sort());
    });

    it('has no duplicate names', () => {
        expect(new Set(names()).size).toBe(names().length);
    });

    it('keeps no 5th-year students, dropped lecturers or cursed objects', () => {
        for (const gone of MUST_NOT_APPEAR) {
            expect(names(), `${gone} should be gone`).not.toContain(gone);
        }
        expect(characters.some((c) => rolesOf(c).includes('5.'))).toBe(false);
    });

    it('every entry carries dateAdded on the launch date', () => {
        for (const c of characters) {
            expect(c.dateAdded, `${c.name} dateAdded`).toBe(LAUNCH);
        }
    });
});

describe('roster matches the final column shape', () => {
    it('every character has a non-empty value for every game column', () => {
        for (const c of characters) {
            for (const feature of GAME_FEATURES) {
                const value = getFeatureValue(c, feature.key);
                expect(value, `${c.name} → ${feature.key}`).toBeDefined();
                expect(String(value).length, `${c.name} → ${feature.key}`).toBeGreaterThan(0);
            }
        }
    });

    it('Høyde values stay inside the six ranked tiers', () => {
        const height = GAME_FEATURES.find((f) => f.key === 'height')!;
        for (const c of characters) {
            expect(height.rankOrder, `${c.name} height "${c.height}"`).toContain(c.height);
        }
    });

    it('no character carries leftover Profil or Certified mojavebabe data', () => {
        for (const c of characters) {
            const keys = Object.keys(c);
            expect(keys, `${c.name} profil`).not.toContain('profil');
            expect(keys, `${c.name} mojavebabe`).not.toContain('certified mojavebabe');
            expect(keys, `${c.name} mojavebabe`).not.toContain('certified_mojavebabe');
        }
    });
});
