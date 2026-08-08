// @flow
import { EventsEditorContainer } from './EventsEditorContainer';
import { ExternalEventsEditorContainer } from './ExternalEventsEditorContainer';

jest.mock('../../EventsSheet', () => function EventsSheet() {});
jest.mock('../../EmbeddedGame/EmbeddedGameFrame', () => ({
  setEditorHotReloadNeeded: jest.fn(),
}));

const makeEditor = (snapshotName: string): any => {
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const getEditorSelectionSnapshot = jest.fn(() => snapshotName);
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const onEventsModifiedOutsideEditor = jest.fn();
  return {
    getEditorSelectionSnapshot,
    onEventsModifiedOutsideEditor,
  };
};

describe('scene lifecycle editor containers', () => {
  it('keeps one editor per visited scene lifecycle function and routes outside changes by role', () => {
    const scene = ({}: any);
    const container: any = new EventsEditorContainer(({}: any));
    const updateEditor = makeEditor('update-selection');
    const signalEditor = makeEditor('signal-selection');
    container.state = {
      selectedLifecycleFunctionName: 'sceneSignal',
      mountedLifecycleFunctionNames: ['sceneUpdate', 'sceneSignal'],
    };
    container.editorsByLifecycleFunctionName = {
      sceneUpdate: (updateEditor: any),
      sceneSignal: (signalEditor: any),
    };
    container.getLayout = () => scene;

    expect(container.getEditorSelectionSnapshot()).toBe('signal-selection');

    const changedIds = new Set<string>(['changed-event']);
    container.onSceneEventsModifiedOutsideEditor({
      scene,
      lifecycleFunctionName: 'sceneUpdate',
      newOrChangedAiGeneratedEventIds: changedIds,
    });

    expect(updateEditor.onEventsModifiedOutsideEditor).toHaveBeenCalledWith({
      newOrChangedAiGeneratedEventIds: changedIds,
    });
    expect(signalEditor.onEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  });

  it('routes external-events changes to the matching lifecycle function', () => {
    const externalEvents = ({}: any);
    const container: any = new ExternalEventsEditorContainer(({}: any));
    const loadEditor = makeEditor('load-selection');
    const unloadEditor = makeEditor('unload-selection');
    container.state = {
      externalPropertiesDialogOpen: false,
      selectedLifecycleFunctionName: 'sceneUnload',
      mountedLifecycleFunctionNames: ['sceneLoad', 'sceneUnload'],
    };
    container.editorsByLifecycleFunctionName = {
      sceneLoad: (loadEditor: any),
      sceneUnload: (unloadEditor: any),
    };
    container.getExternalEvents = () => externalEvents;

    expect(container.getEditorSelectionSnapshot()).toBe('unload-selection');

    const changedIds = new Set<string>(['external-event']);
    container.onSceneEventsModifiedOutsideEditor({
      scene: ({}: any),
      externalEvents,
      lifecycleFunctionName: 'sceneLoad',
      newOrChangedAiGeneratedEventIds: changedIds,
    });

    expect(loadEditor.onEventsModifiedOutsideEditor).toHaveBeenCalledWith({
      newOrChangedAiGeneratedEventIds: changedIds,
    });
    expect(unloadEditor.onEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  });
});
