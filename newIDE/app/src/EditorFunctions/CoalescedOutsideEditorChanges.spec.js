// @flow
import { makeCoalescedOutsideEditorChanges } from './CoalescedOutsideEditorChanges';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';

const gd: libGDevelop = global.gd;

const makeNotifications = () => ({
  onSceneEventsModifiedOutsideEditor: jest.fn<Array<any>, void>(),
  onInstancesModifiedOutsideEditor: jest.fn<Array<any>, void>(),
  onObjectsModifiedOutsideEditor: jest.fn<Array<any>, void>(),
  onEffectsModifiedOutsideEditor: jest.fn<Array<any>, void>(),
  onObjectGroupsModifiedOutsideEditor: jest.fn<Array<any>, void>(),
  onExtensionsModifiedOutsideEditor: jest.fn<Array<any>, void>(),
});

type FakeNotifications = ReturnType<typeof makeNotifications>;

const makeFakeEventsFunctionsExtensionsState = () => {
  const state = {
    reloadProjectEventsFunctionsExtensions: jest.fn<Array<any>, Promise<void>>(
      () => Promise.resolve()
    ),
    reloadProjectEventsFunctionsExtensionMetadata: jest.fn<Array<any>, void>(),
  };
  // $FlowFixMe[prop-missing] - only the methods used by the module.
  return ((state: any): EventsFunctionsExtensionsState & typeof state);
};

describe('makeCoalescedOutsideEditorChanges', () => {
  let project: gdProject;
  let scene: gdLayout;
  let otherScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Scene', 0);
    otherScene = project.insertNewLayout('OtherScene', 1);
  });

  afterEach(() => {
    project.delete();
  });

  const make = (notifications: FakeNotifications = makeNotifications()) => {
    const eventsFunctionsExtensionsState = makeFakeEventsFunctionsExtensionsState();
    const onExtensionsRegenerated = jest.fn<Array<any>, void>();
    const coalesced = makeCoalescedOutsideEditorChanges({
      project,
      eventsFunctionsExtensionsState,
      // $FlowFixMe[incompatible-type] - jest mocks instead of the callbacks.
      notifications,
      onExtensionsRegenerated,
    });
    return {
      coalesced,
      notifications,
      eventsFunctionsExtensionsState,
      onExtensionsRegenerated,
    };
  };

  it('sends nothing when nothing was changed', () => {
    const { coalesced, notifications } = make();
    coalesced.flush();
    Object.keys(notifications).forEach(name => {
      expect(notifications[name]).not.toHaveBeenCalled();
    });
  });

  it('sends one instances notification per target', () => {
    const { coalesced, notifications } = make();
    coalesced.onInstancesModifiedOutsideEditor({ scene });
    coalesced.onInstancesModifiedOutsideEditor({ scene });
    coalesced.onInstancesModifiedOutsideEditor({ scene: otherScene });
    expect(
      notifications.onInstancesModifiedOutsideEditor
    ).not.toHaveBeenCalled();

    coalesced.flush();
    expect(
      notifications.onInstancesModifiedOutsideEditor
    ).toHaveBeenCalledTimes(2);
    expect(notifications.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
      { scene }
    );
    expect(notifications.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
      { scene: otherScene }
    );
  });

  it('merges the generated event ids of a scene into one notification', () => {
    const { coalesced, notifications } = make();
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(['a']),
    });
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(['b']),
    });
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene: otherScene,
      newOrChangedAiGeneratedEventIds: new Set(['c']),
    });

    coalesced.flush();
    const calls = notifications.onSceneEventsModifiedOutsideEditor.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0].scene).toBe(scene);
    expect([...calls[0][0].newOrChangedAiGeneratedEventIds].sort()).toEqual([
      'a',
      'b',
    ]);
    expect(calls[1][0].scene).toBe(otherScene);
    expect([...calls[1][0].newOrChangedAiGeneratedEventIds]).toEqual(['c']);
  });

  it('keeps the events of a function apart from the events of a scene', () => {
    const extension = project.insertNewEventsFunctionsExtension('Ext', 0);
    const eventsFunction = extension
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    const { coalesced, notifications } = make();
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(['a']),
    });
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene: null,
      eventsFunction,
      extensionName: 'Ext',
      newOrChangedAiGeneratedEventIds: new Set(['b']),
    });

    coalesced.flush();
    expect(
      notifications.onSceneEventsModifiedOutsideEditor
    ).toHaveBeenCalledTimes(2);
  });

  it('merges `isNewObjectTypeUsed` of the objects changes of a target with an OR', () => {
    const { coalesced, notifications } = make();
    coalesced.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
    coalesced.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: true,
    });
    coalesced.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
    coalesced.onObjectsModifiedOutsideEditor({
      scene: otherScene,
      isNewObjectTypeUsed: false,
    });

    coalesced.flush();
    expect(notifications.onObjectsModifiedOutsideEditor).toHaveBeenCalledTimes(
      2
    );
    expect(notifications.onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
      scene,
      isNewObjectTypeUsed: true,
    });
    expect(notifications.onObjectsModifiedOutsideEditor).toHaveBeenCalledWith({
      scene: otherScene,
      isNewObjectTypeUsed: false,
    });
  });

  it('sends one object groups notification per target', () => {
    const { coalesced, notifications } = make();
    coalesced.onObjectGroupsModifiedOutsideEditor({ scene });
    coalesced.onObjectGroupsModifiedOutsideEditor({ scene });

    coalesced.flush();
    expect(
      notifications.onObjectGroupsModifiedOutsideEditor
    ).toHaveBeenCalledTimes(1);
  });

  it('reloads the effects once, before the other notifications', () => {
    const order = [];
    const notifications = makeNotifications();
    notifications.onEffectsModifiedOutsideEditor.mockImplementation(() => {
      order.push('effects');
    });
    notifications.onInstancesModifiedOutsideEditor.mockImplementation(() => {
      order.push('instances');
    });
    const { coalesced } = make(notifications);
    coalesced.onInstancesModifiedOutsideEditor({ scene });
    coalesced.onEffectsModifiedOutsideEditor();
    coalesced.onEffectsModifiedOutsideEditor();

    coalesced.flush();
    expect(order).toEqual(['effects', 'instances']);
  });

  it('does not send again what a previous flush sent', () => {
    const { coalesced, notifications } = make();
    coalesced.onInstancesModifiedOutsideEditor({ scene });
    coalesced.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(['a']),
    });
    coalesced.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
    coalesced.onObjectGroupsModifiedOutsideEditor({ scene });
    coalesced.onEffectsModifiedOutsideEditor();
    coalesced.flush();

    coalesced.onInstancesModifiedOutsideEditor({ scene: otherScene });
    coalesced.flush();

    expect(
      notifications.onInstancesModifiedOutsideEditor
    ).toHaveBeenCalledTimes(2);
    expect(
      notifications.onSceneEventsModifiedOutsideEditor
    ).toHaveBeenCalledTimes(1);
    expect(notifications.onObjectsModifiedOutsideEditor).toHaveBeenCalledTimes(
      1
    );
    expect(
      notifications.onObjectGroupsModifiedOutsideEditor
    ).toHaveBeenCalledTimes(1);
    expect(notifications.onEffectsModifiedOutsideEditor).toHaveBeenCalledTimes(
      1
    );
  });

  describe('extensions', () => {
    it('does nothing when no extension was changed', async () => {
      const {
        coalesced,
        notifications,
        eventsFunctionsExtensionsState,
        onExtensionsRegenerated,
      } = make();
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).not.toHaveBeenCalled();
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).not.toHaveBeenCalled();
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).not.toHaveBeenCalled();
      expect(onExtensionsRegenerated).not.toHaveBeenCalled();
    });

    it('reloads only the metadata of the changed extensions when no code regeneration is needed', async () => {
      const extension = project.insertNewEventsFunctionsExtension('Ext', 0);
      const {
        coalesced,
        notifications,
        eventsFunctionsExtensionsState,
        onExtensionsRegenerated,
      } = make();
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext'],
        needsCodeRegeneration: false,
      });
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext', 'NotInProject'],
        needsCodeRegeneration: false,
      });
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).not.toHaveBeenCalled();
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).toHaveBeenCalledTimes(1);
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).toHaveBeenCalledWith(project, extension);
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionNames: ['Ext', 'NotInProject'],
        needsCodeRegeneration: false,
        deleted: false,
      });
      expect(onExtensionsRegenerated).toHaveBeenCalledTimes(1);
    });

    it('regenerates all the extensions once when one needs code regeneration', async () => {
      project.insertNewEventsFunctionsExtension('Ext', 0);
      project.insertNewEventsFunctionsExtension('OtherExt', 1);
      const {
        coalesced,
        notifications,
        eventsFunctionsExtensionsState,
        onExtensionsRegenerated,
      } = make();
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext'],
        needsCodeRegeneration: false,
      });
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['OtherExt'],
        needsCodeRegeneration: true,
      });
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).toHaveBeenCalledTimes(1);
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).toHaveBeenCalledWith(project);
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).not.toHaveBeenCalled();
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionNames: ['Ext', 'OtherExt'],
        needsCodeRegeneration: true,
        deleted: false,
      });
      expect(onExtensionsRegenerated).toHaveBeenCalledTimes(1);
    });

    it('regenerates the extensions when one was deleted', async () => {
      const { coalesced, eventsFunctionsExtensionsState } = make();
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['DeletedExt'],
        needsCodeRegeneration: false,
        deleted: true,
      });
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).toHaveBeenCalledTimes(1);
    });

    it('does not regenerate again what was already regenerated', async () => {
      project.insertNewEventsFunctionsExtension('Ext', 0);
      const {
        coalesced,
        notifications,
        eventsFunctionsExtensionsState,
      } = make();
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext'],
        needsCodeRegeneration: true,
      });
      await coalesced.ensureExtensionsUpToDate();
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).toHaveBeenCalledTimes(1);
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledTimes(1);
    });

    it('reloads the metadata of one extension without flushing the batch', async () => {
      const extension = project.insertNewEventsFunctionsExtension('Ext', 0);
      const {
        coalesced,
        notifications,
        eventsFunctionsExtensionsState,
        onExtensionsRegenerated,
      } = make();
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext'],
        needsCodeRegeneration: true,
      });

      coalesced.reloadExtensionMetadata('Ext');
      coalesced.reloadExtensionMetadata('NotInProject');
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).toHaveBeenCalledTimes(1);
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).toHaveBeenCalledWith(project, extension);
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).not.toHaveBeenCalled();
      expect(onExtensionsRegenerated).not.toHaveBeenCalled();

      // The code regeneration is still pending for the batch.
      await coalesced.ensureExtensionsUpToDate();
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).toHaveBeenCalledTimes(1);
    });

    it('still notifies the editors without a project', async () => {
      const notifications = makeNotifications();
      const eventsFunctionsExtensionsState = makeFakeEventsFunctionsExtensionsState();
      const onExtensionsRegenerated = jest.fn<Array<any>, void>();
      const coalesced = makeCoalescedOutsideEditorChanges({
        project: null,
        eventsFunctionsExtensionsState,
        // $FlowFixMe[incompatible-type] - jest mocks instead of the callbacks.
        notifications,
        onExtensionsRegenerated,
      });
      coalesced.onExtensionsModifiedOutsideEditor({
        extensionNames: ['Ext'],
        needsCodeRegeneration: true,
      });
      coalesced.reloadExtensionMetadata('Ext');
      await coalesced.ensureExtensionsUpToDate();

      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions
      ).not.toHaveBeenCalled();
      expect(
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata
      ).not.toHaveBeenCalled();
      expect(
        notifications.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledTimes(1);
      expect(onExtensionsRegenerated).toHaveBeenCalledTimes(1);
    });
  });
});
