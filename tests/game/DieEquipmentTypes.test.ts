import { describe, expect, it } from 'vitest';
import {
    FACE_STYLE_IDS,
    isFaceStyleId,
    normalizeFaceStyleId,
} from '../../src/game/DieEquipmentTypes';

describe('DieEquipmentTypes face style ids', () => {
    it('exposes expected face style catalog for slot typing', () => {
        expect(FACE_STYLE_IDS).toEqual(['none', 'circle', 'lock', 'x', 'clover']);
    });

    it('recognizes known face style ids', () => {
        expect(isFaceStyleId('lock')).toBe(true);
        expect(isFaceStyleId('x')).toBe(true);
        expect(isFaceStyleId('clover')).toBe(true);
    });

    it('rejects unknown face style ids', () => {
        expect(isFaceStyleId('skull')).toBe(false);
        expect(isFaceStyleId('padlock')).toBe(false);
    });

    it('normalizes unknown or empty values to circle fallback', () => {
        expect(normalizeFaceStyleId('')).toBe('circle');
        expect(normalizeFaceStyleId(undefined)).toBe('circle');
        expect(normalizeFaceStyleId('unknown-style')).toBe('circle');
    });
});
