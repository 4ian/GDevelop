// @flow
import {
  getOutsideEditorChangesTargetKey,
  getSceneEventsOutsideEditorChangesKey,
} from './OutsideEditorChanges';

// The keys only read the pointers of the gd objects: fakes are enough.
const fakeGdObject = (ptr: number): any => ({ ptr });

describe('OutsideEditorChanges keys', () => {
  it('coalesces per scene, per external layout and per custom object variant', () => {
    const scene = fakeGdObject(1);
    const externalLayout = fakeGdObject(2);
    const eventsBasedObject = fakeGdObject(3);

    expect(getOutsideEditorChangesTargetKey({ scene })).toBe('scene:1');
    expect(
      getOutsideEditorChangesTargetKey({ scene, isNewObjectTypeUsed: true })
    ).toBe('scene:1');
    expect(getOutsideEditorChangesTargetKey({ scene: null })).toBe(
      'scene:none'
    );
    expect(getOutsideEditorChangesTargetKey({ scene, externalLayout })).toBe(
      'external-layout:2'
    );
    // The default variant ("") and a named variant are different targets.
    expect(
      getOutsideEditorChangesTargetKey({
        scene: null,
        eventsBasedObject,
        variantName: '',
      })
    ).toBe('events-based-object:3:');
    expect(
      getOutsideEditorChangesTargetKey({
        scene: null,
        eventsBasedObject,
        variantName: 'Dark',
      })
    ).toBe('events-based-object:3:Dark');
  });

  it('coalesces events changes per scene or per function', () => {
    const scene = fakeGdObject(1);
    const eventsFunction = fakeGdObject(4);
    expect(
      getSceneEventsOutsideEditorChangesKey({
        scene,
        newOrChangedAiGeneratedEventIds: new Set(),
      })
    ).toBe('scene:1');
    expect(
      getSceneEventsOutsideEditorChangesKey({
        scene: null,
        eventsFunction,
        extensionName: 'UI',
        newOrChangedAiGeneratedEventIds: new Set(),
      })
    ).toBe('events-function:4');
  });
});
