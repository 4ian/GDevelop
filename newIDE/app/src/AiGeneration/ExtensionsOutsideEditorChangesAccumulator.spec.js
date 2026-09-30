// @flow
import {
  makeExtensionsOutsideEditorChangesAccumulator,
  doExtensionChangesNeedCodeRegeneration,
} from './ExtensionsOutsideEditorChangesAccumulator';

describe('ExtensionsOutsideEditorChangesAccumulator', () => {
  it('is empty until changes are added', () => {
    const accumulator = makeExtensionsOutsideEditorChangesAccumulator();
    expect(accumulator.isEmpty()).toBe(true);

    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: false,
    });
    expect(accumulator.isEmpty()).toBe(false);
  });

  it('lists each changed extension once', () => {
    const accumulator = makeExtensionsOutsideEditorChangesAccumulator();
    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: false,
    });
    accumulator.add({
      extensionNames: ['MyExtension', 'OtherExtension'],
      needsCodeRegeneration: false,
    });

    const changes = accumulator.flush();
    expect(changes.extensionNames.sort()).toEqual([
      'MyExtension',
      'OtherExtension',
    ]);
    expect(changes.needsCodeRegeneration).toBe(false);
    expect(changes.deleted).toBe(false);
  });

  it('merges `needsCodeRegeneration` and `deleted` with an OR', () => {
    const accumulator = makeExtensionsOutsideEditorChangesAccumulator();
    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: false,
    });
    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: true,
    });
    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: false,
    });

    const changes = accumulator.flush();
    expect(changes.extensionNames).toEqual(['MyExtension']);
    expect(changes.needsCodeRegeneration).toBe(true);
    expect(changes.deleted).toBe(false);

    const otherAccumulator = makeExtensionsOutsideEditorChangesAccumulator();
    otherAccumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: true,
      deleted: true,
    });
    otherAccumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: true,
    });
    expect(otherAccumulator.flush().deleted).toBe(true);
  });

  it('is emptied by a flush', () => {
    const accumulator = makeExtensionsOutsideEditorChangesAccumulator();
    accumulator.add({
      extensionNames: ['MyExtension'],
      needsCodeRegeneration: true,
    });
    accumulator.flush();

    expect(accumulator.isEmpty()).toBe(true);
    expect(accumulator.flush()).toEqual({
      extensionNames: [],
      needsCodeRegeneration: false,
      deleted: false,
    });
  });

  describe('doExtensionChangesNeedCodeRegeneration', () => {
    it('only reloads the metadata when nothing structural changed', () => {
      expect(
        doExtensionChangesNeedCodeRegeneration({
          extensionNames: ['MyExtension'],
          needsCodeRegeneration: false,
        })
      ).toBe(false);
    });

    it('regenerates the code when a declaration changed', () => {
      expect(
        doExtensionChangesNeedCodeRegeneration({
          extensionNames: ['MyExtension'],
          needsCodeRegeneration: true,
        })
      ).toBe(true);
    });

    it('regenerates the code when an extension was deleted', () => {
      expect(
        doExtensionChangesNeedCodeRegeneration({
          extensionNames: ['MyExtension'],
          needsCodeRegeneration: false,
          deleted: true,
        })
      ).toBe(true);
    });
  });
});
