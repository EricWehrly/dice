import { EntityBuilder, EntityMixin, createEntityFrom } from '../../engine/js/entities/character/EntityBuilder';
import { Die, type DieOptions } from './Die';

type DieConstructor<T extends Die = Die> = new (options?: DieOptions) => T;

export default class DieCharacterFactory {
    private static _defaultMixins: EntityMixin[] = [];

    static get DefaultMixins(): EntityMixin[] {
        return [...this._defaultMixins];
    }

    static createCharacter<T extends Die>(
        options: DieOptions = {},
        SuperClass?: DieConstructor<T>
    ): EntityBuilder<T> {
        const BaseClass = SuperClass ?? (Die as unknown as DieConstructor<T>);
        let builder = createEntityFrom(BaseClass);

        for (const mixin of DieCharacterFactory._defaultMixins) {
            builder = builder.withMixin(mixin) as EntityBuilder<T>;
        }

        return builder.withOptions(options) as EntityBuilder<T>;
    }

    static MakeCharacter<T extends Die>(
        mixins: EntityMixin[] = [],
        options: DieOptions = {},
        SuperClass?: DieConstructor<T>
    ): T {
        let builder = DieCharacterFactory.createCharacter(options, SuperClass);

        for (const mixin of mixins) {
            builder = builder.withMixin(mixin) as EntityBuilder<T>;
        }

        return builder.build();
    }

    static SetDefaultMixin(mixin: EntityMixin, isDefault = true): void {
        if (isDefault) {
            if (!DieCharacterFactory._defaultMixins.find((m) => m.name === mixin.name)) {
                DieCharacterFactory._defaultMixins.push(mixin);
            }
            return;
        }

        const index = DieCharacterFactory._defaultMixins.findIndex((m) => m.name === mixin.name);
        if (index >= 0) {
            DieCharacterFactory._defaultMixins.splice(index, 1);
        }
    }
}

export { DieCharacterFactory };
export const MakeDieCharacter = DieCharacterFactory.MakeCharacter;
