import { describe, expect, it, vi, beforeEach } from 'vitest';
import mockEvents from '../../engine/test/testHelpers/mockEvents';
import mockMap from '../../engine/test/testHelpers/mockMap';

vi.mock('@/engine/js/events', () => mockEvents);
vi.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

import { createEntity } from '../../engine/js/entities/character/EntityBuilder';
import {
    DieEquippedMixin,
    DieEquipped,
    DieEquipment,
    DieSlotType,
    DieEquipmentChangedEvent,
    IsDieEquipped,
} from '../../src/game/DieEquippedMixin';
import Entity from '../../engine/js/entities/character/Entity';
import Events from '../../engine/js/events';
import { normalizeFaceStyleId } from '../../src/game/DieEquipmentTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntity(): Entity & DieEquipped {
    return createEntity()
        .withMixin(DieEquippedMixin)
        .withOptions({ name: 'test-die' })
        .build() as Entity & DieEquipped;
}

function makeItem(name: string, slotType: DieSlotType): DieEquipment {
    if (slotType === DieSlotType.FACE_STYLE) {
        return {
            id: name,
            name,
            type: slotType,
            faceStyleId: normalizeFaceStyleId(name),
        };
    }

    return { id: name, name, type: slotType };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DieEquippedMixin', () => {

    describe('IsDieEquipped', () => {
        it('returns true for an entity with the mixin applied', () => {
            const entity = makeEntity();
            expect(IsDieEquipped(entity)).toBe(true);
        });

        it('returns false for a plain entity without the mixin', () => {
            const plain = createEntity().withOptions({ name: 'plain' }).build();
            expect(IsDieEquipped(plain)).toBe(false);
        });
    });

    describe('initial state', () => {
        it('starts with all slots empty', () => {
            const entity = makeEntity();
            expect(entity.getEquipped(DieSlotType.MOD)).toBeNull();
            expect(entity.getEquipped(DieSlotType.FACE_STYLE)).toBeNull();
            expect(entity.getEquipped(DieSlotType.BODY_STYLE)).toBeNull();
        });

        it('hasEquipped returns false for empty slots', () => {
            const entity = makeEntity();
            expect(entity.hasEquipped(DieSlotType.MOD)).toBe(false);
        });
    });

    describe('construction-time pre-population', () => {
        it('pre-populates slots from options.equipped', () => {
            const mod = makeItem('weight-10g', DieSlotType.MOD);
            const face = makeItem('etched', DieSlotType.FACE_STYLE);

            const entity = createEntity()
                .withMixin(DieEquippedMixin)
                .withOptions({ name: 'pre-populated', equipped: [mod, face] })
                .build() as Entity & DieEquipped;

            expect(entity.getEquipped(DieSlotType.MOD)).toBe(mod);
            expect(entity.getEquipped(DieSlotType.FACE_STYLE)).toBe(face);
            expect(entity.getEquipped(DieSlotType.BODY_STYLE)).toBeNull();
        });
    });

    describe('install', () => {
        it('puts an item into the correct slot', () => {
            const entity = makeEntity();
            const item = makeItem('weight-5g', DieSlotType.MOD);

            entity.install(item);

            expect(entity.getEquipped(DieSlotType.MOD)).toBe(item);
        });

        it('replaces the previous item in a slot', () => {
            const entity = makeEntity();
            const first = makeItem('weight-5g', DieSlotType.MOD);
            const second = makeItem('weight-10g', DieSlotType.MOD);

            entity.install(first);
            entity.install(second);

            expect(entity.getEquipped(DieSlotType.MOD)).toBe(second);
        });

        it('installing in one slot does not affect others', () => {
            const entity = makeEntity();
            entity.install(makeItem('polished', DieSlotType.BODY_STYLE));

            expect(entity.getEquipped(DieSlotType.MOD)).toBeNull();
            expect(entity.getEquipped(DieSlotType.FACE_STYLE)).toBeNull();
        });

        it('raises DieEquipmentChanged with correct previous/current on fresh install', () => {
            const entity = makeEntity();
            const item = makeItem('weight-5g', DieSlotType.MOD);
            const received: DieEquipmentChangedEvent[] = [];

            Events.Subscribe(Events.List.DieEquipmentChanged, (e: DieEquipmentChangedEvent) => {
                received.push(e);
            });

            entity.install(item);

            expect(received).toHaveLength(1);
            expect(received[0].slot).toBe('mod');
            expect(received[0].slotType).toBe(DieSlotType.MOD);
            expect(received[0].previous).toBeNull();
            expect(received[0].current).toBe(item);
            expect(received[0].previousId).toBeNull();
            expect(received[0].currentId).toBe(item.id);
        });

        it('raises DieEquipmentChanged with old item as previous on replacement', () => {
            const entity = makeEntity();
            const first = makeItem('weight-5g', DieSlotType.MOD);
            const second = makeItem('weight-10g', DieSlotType.MOD);
            const received: DieEquipmentChangedEvent[] = [];

            entity.install(first);
            Events.Subscribe(Events.List.DieEquipmentChanged, (e: DieEquipmentChangedEvent) => {
                received.push(e);
            });
            entity.install(second);

            expect(received[0].previous).toBe(first);
            expect(received[0].current).toBe(second);
        });
    });

    describe('uninstall', () => {
        it('removes the item from the slot', () => {
            const entity = makeEntity();
            entity.install(makeItem('weight-5g', DieSlotType.MOD));

            entity.uninstall(DieSlotType.MOD);

            expect(entity.getEquipped(DieSlotType.MOD)).toBeNull();
            expect(entity.hasEquipped(DieSlotType.MOD)).toBe(false);
        });

        it('is a no-op when slot is already empty', () => {
            const entity = makeEntity();
            expect(() => entity.uninstall(DieSlotType.MOD)).not.toThrow();
        });

        it('raises DieEquipmentChanged with null current on uninstall', () => {
            const entity = makeEntity();
            const item = makeItem('etched', DieSlotType.FACE_STYLE);
            entity.install(item);

            const received: DieEquipmentChangedEvent[] = [];
            Events.Subscribe(Events.List.DieEquipmentChanged, (e: DieEquipmentChangedEvent) => {
                received.push(e);
            });

            entity.uninstall(DieSlotType.FACE_STYLE);

            expect(received).toHaveLength(1);
            expect(received[0].slot).toBe('faceStyle');
            expect(received[0].previous).toBe(item);
            expect(received[0].current).toBeNull();
            expect(received[0].previousId).toBe(item.id);
            expect(received[0].currentId).toBeNull();
        });

        it('does not raise event when uninstalling from an empty slot', () => {
            const entity = makeEntity();
            const received: DieEquipmentChangedEvent[] = [];

            Events.Subscribe(Events.List.DieEquipmentChanged, (e: DieEquipmentChangedEvent) => {
                received.push(e);
            });

            entity.uninstall(DieSlotType.MOD);

            expect(received).toHaveLength(0);
        });
    });

    describe('validateOptions', () => {
        it('returns null when no equipped option is provided', () => {
            const result = DieEquippedMixin.validateOptions?.({ name: 'test' });
            expect(result).toBeNull();
        });

        it('returns error when equipped is not an array', () => {
            const result = DieEquippedMixin.validateOptions?.({
                name: 'test',
                equipped: 'not-an-array' as unknown as DieEquipment[],
            } as any);
            expect(result).not.toBeNull();
            expect(result![0]).toMatch(/array/);
        });

        it('returns error when an item is missing name or type', () => {
            const result = DieEquippedMixin.validateOptions?.({
                name: 'test',
                equipped: [{ name: 'ok', type: DieSlotType.MOD }, { name: '' } as any],
            } as any);
            expect(result).not.toBeNull();
        });
    });
});
