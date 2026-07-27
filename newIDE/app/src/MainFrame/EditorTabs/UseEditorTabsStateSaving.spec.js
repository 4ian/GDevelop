// @flow
import * as React from 'react';
import TestRenderer from 'react-test-renderer';

import useEditorTabsStateSaving from './UseEditorTabsStateSaving';
import {
  getEditorTabsInitialState,
  openEditorTab,
  changeCurrentTab,
  closeEditorTab,
  type EditorTabsState,
  type EditorOpeningOptions,
  type EditorKind,
} from './EditorTabsHandler';
import PreferencesContext, {
  initialPreferences,
} from '../Preferences/PreferencesContext';

const act = (TestRenderer: any).act;

// The editor containers pull in the whole rendering stack (PIXI, Three, Spine),
// which is irrelevant here: only the tabs bookkeeping is tested.
jest.mock('../EditorContainers/EventsEditorContainer', () => ({
  EventsEditorContainer: class {},
}));
jest.mock('../EditorContainers/DebuggerEditorContainer', () => ({
  DebuggerEditorContainer: class {},
}));
jest.mock(
  '../EditorContainers/EventsFunctionsExtensionEditorContainer',
  () => ({
    EventsFunctionsExtensionEditorContainer: class {},
  })
);
jest.mock('../EditorContainers/ExternalEventsEditorContainer', () => ({
  ExternalEventsEditorContainer: class {},
}));
jest.mock('../EditorContainers/ExternalLayoutEditorContainer', () => ({
  ExternalLayoutEditorContainer: class {},
}));
jest.mock('../EditorContainers/ResourcesEditorContainer', () => ({
  ResourcesEditorContainer: class {},
}));
jest.mock('../EditorContainers/SceneEditorContainer', () => ({
  SceneEditorContainer: class {},
}));
jest.mock('../EditorContainers/CustomObjectEditorContainer', () => ({
  CustomObjectEditorContainer: class {},
}));

const keyedKinds = [
  'layout',
  'layout events',
  'external layout',
  'external events',
  'events functions extension',
  'custom object',
];

const getEditorOpeningOptions = ({
  kind,
  name,
  dontFocusTab,
}: {|
  kind: EditorKind,
  name: string,
  dontFocusTab?: boolean,
  project?: ?gdProject,
  paneIdentifier?: 'left' | 'center' | 'right',
  continueProcessingFunctionCallsOnMount?: boolean,
|}): EditorOpeningOptions => ({
  kind,
  paneIdentifier: 'center',
  label: name,
  icon: undefined,
  renderCustomIcon: undefined,
  projectItemName: name || null,
  tabOptions: undefined,
  renderEditorContainer: () => null,
  key: keyedKinds.includes(kind) ? `${kind} ${name}` : kind,
  extraEditorProps: undefined,
  dontFocusTab,
  closable: kind !== 'start page',
});

const openTab = (state: EditorTabsState, kind: EditorKind, name: string) =>
  openEditorTab(state, getEditorOpeningOptions({ kind, name }));

/** Home page tab, then `sceneCount` scene tabs, the last one being focused. */
const makeTabsWithScenes = (sceneCount: number): EditorTabsState => {
  let state = openTab(getEditorTabsInitialState(), 'start page', '');
  for (let i = 1; i <= sceneCount; i++) {
    state = openTab(state, 'layout', `Scene${i}`);
  }
  return changeCurrentTab(state, 'center', sceneCount);
};

const getCenterEditors = (state: EditorTabsState) => state.panes.center.editors;

const makeFakePreferences = () => {
  const editorStateByProject: { [projectId: string]: any } = {};
  return {
    editorStateByProject,
    preferences: {
      ...initialPreferences,
      setEditorStateForProject: (projectId: string, editorState: any) => {
        if (editorState === null) {
          delete editorStateByProject[projectId];
          return;
        }
        editorStateByProject[projectId] = {
          ...(editorStateByProject[projectId] || {}),
          ...editorState,
        };
      },
      getEditorStateForProject: (projectId: string) =>
        editorStateByProject[projectId] || null,
    },
  };
};

type HarnessApi = {|
  editorTabs: EditorTabsState,
  setEditorTabs: EditorTabsState => void,
  openEditorTabsFromPersistedState: (project: any) => number,
  hasAPreviousSaveForEditorTabsState: (project: any) => boolean,
|};

const renderHarness = ({
  initialEditorTabs,
  currentProjectId,
  preferences,
}: {|
  initialEditorTabs: EditorTabsState,
  currentProjectId: string | null,
  preferences: any,
|}) => {
  const apiRef: { current: HarnessApi | null } = { current: null };

  const Harness = ({ projectId }: {| projectId: string | null |}) => {
    const [editorTabs, setEditorTabs] = React.useState(initialEditorTabs);
    const api = useEditorTabsStateSaving({
      editorTabs,
      setEditorTabs,
      currentProjectId: projectId,
      getEditorOpeningOptions,
    });
    apiRef.current = { ...api, editorTabs, setEditorTabs };
    return null;
  };

  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <PreferencesContext.Provider value={preferences}>
        <Harness projectId={currentProjectId} />
      </PreferencesContext.Provider>
    );
  });

  return {
    apiRef,
    setProjectId: (projectId: string | null) => {
      act(() => {
        renderer.update(
          <PreferencesContext.Provider value={preferences}>
            <Harness projectId={projectId} />
          </PreferencesContext.Provider>
        );
      });
    },
    setEditorTabs: (updater: EditorTabsState => EditorTabsState) => {
      act(() => {
        const api = apiRef.current;
        if (!api) throw new Error('Harness not rendered.');
        api.setEditorTabs(updater(api.editorTabs));
      });
    },
  };
};

const flushDebounce = () => {
  act(() => {
    jest.advanceTimersByTime(1500);
  });
};

describe('useEditorTabsStateSaving', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves the opened tabs, without the home page tab', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    renderHarness({
      initialEditorTabs: makeTabsWithScenes(3),
      currentProjectId: 'project-1',
      preferences,
    });

    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs).toEqual({
      currentTab: 3,
      editors: [
        { projectItemName: 'Scene1', editorKind: 'layout' },
        { projectItemName: 'Scene2', editorKind: 'layout' },
        { projectItemName: 'Scene3', editorKind: 'layout' },
      ],
    });
  });

  it('saves the reduced list of tabs after some are closed', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    const harness = renderHarness({
      initialEditorTabs: makeTabsWithScenes(4),
      currentProjectId: 'project-1',
      preferences,
    });

    flushDebounce();
    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      4
    );

    harness.setEditorTabs(editorTabs => {
      let newEditorTabs = editorTabs;
      for (const editorTab of getCenterEditors(editorTabs).slice(3)) {
        newEditorTabs = closeEditorTab(newEditorTabs, editorTab);
      }
      return newEditorTabs;
    });
    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      2
    );
  });

  it('keeps saving tabs when the home page tab is focused', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    const harness = renderHarness({
      initialEditorTabs: makeTabsWithScenes(4),
      currentProjectId: 'project-1',
      preferences,
    });

    flushDebounce();
    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      4
    );

    // Close all scene tabs but 2, then go back to the home page tab before
    // the debounced save had a chance to run.
    harness.setEditorTabs(editorTabs => {
      let newEditorTabs = editorTabs;
      for (const editorTab of getCenterEditors(editorTabs).slice(3)) {
        newEditorTabs = closeEditorTab(newEditorTabs, editorTab);
      }
      return changeCurrentTab(newEditorTabs, 'center', 0);
    });
    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      2
    );
  });

  it('saves tabs closed one by one while the home page tab stays focused', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    const harness = renderHarness({
      initialEditorTabs: makeTabsWithScenes(4),
      currentProjectId: 'project-1',
      preferences,
    });

    flushDebounce();
    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      4
    );

    // Go to the home page tab, then close scene tabs from their close button,
    // leaving plenty of time for the debounced save to run between each.
    harness.setEditorTabs(editorTabs =>
      changeCurrentTab(editorTabs, 'center', 0)
    );
    flushDebounce();
    harness.setEditorTabs(editorTabs =>
      closeEditorTab(editorTabs, getCenterEditors(editorTabs)[4])
    );
    flushDebounce();
    harness.setEditorTabs(editorTabs =>
      closeEditorTab(editorTabs, getCenterEditors(editorTabs)[3])
    );
    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      2
    );
  });

  it('saves the pending tabs changes when the project is closed', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    const harness = renderHarness({
      initialEditorTabs: makeTabsWithScenes(4),
      currentProjectId: 'project-1',
      preferences,
    });

    flushDebounce();
    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      4
    );

    // Close tabs, then close the project before the debounced save ran.
    harness.setEditorTabs(editorTabs => {
      let newEditorTabs = editorTabs;
      for (const editorTab of getCenterEditors(editorTabs).slice(3)) {
        newEditorTabs = closeEditorTab(newEditorTabs, editorTab);
      }
      return newEditorTabs;
    });
    harness.setProjectId(null);
    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs.editors).toHaveLength(
      2
    );
  });

  it('does not wipe the saved tabs while a project is being opened', () => {
    const { preferences, editorStateByProject } = makeFakePreferences();
    editorStateByProject['project-1'] = {
      editorTabs: {
        currentTab: 1,
        editors: [{ projectItemName: 'Scene1', editorKind: 'layout' }],
      },
    };

    // The project is set, but its tabs are not restored yet: only the home
    // page tab is there.
    renderHarness({
      initialEditorTabs: openTab(getEditorTabsInitialState(), 'start page', ''),
      currentProjectId: 'project-1',
      preferences,
    });
    flushDebounce();

    expect(editorStateByProject['project-1'].editorTabs.editors).toEqual([
      { projectItemName: 'Scene1', editorKind: 'layout' },
    ]);
  });

  describe('openEditorTabsFromPersistedState', () => {
    const makeFakeProject = (sceneNames: Array<string>) => ({
      getProjectUuid: () => 'project-1',
      hasLayoutNamed: (name: string) => sceneNames.includes(name),
      hasExternalLayoutNamed: () => false,
      hasExternalEventsNamed: () => false,
      hasEventsFunctionsExtensionNamed: () => false,
      hasEventsBasedObject: () => false,
    });

    it('reopens exactly the saved tabs, with the home page tab first', () => {
      const { preferences, editorStateByProject } = makeFakePreferences();
      editorStateByProject['project-1'] = {
        editorTabs: {
          currentTab: 2,
          editors: [
            { projectItemName: 'Scene1', editorKind: 'layout' },
            { projectItemName: 'Scene2', editorKind: 'layout' },
          ],
        },
      };
      const harness = renderHarness({
        initialEditorTabs: openTab(
          getEditorTabsInitialState(),
          'start page',
          ''
        ),
        currentProjectId: 'project-1',
        preferences,
      });

      let openedCount = 0;
      act(() => {
        const api = harness.apiRef.current;
        if (!api) throw new Error('Harness not rendered.');
        openedCount = api.openEditorTabsFromPersistedState(
          // $FlowFixMe[incompatible-call] - minimal project stub.
          makeFakeProject(['Scene1', 'Scene2'])
        );
      });

      expect(openedCount).toBe(2);
      const api = harness.apiRef.current;
      if (!api) throw new Error('Harness not rendered.');
      expect(
        getCenterEditors(api.editorTabs).map(editorTab => editorTab.key)
      ).toEqual(['start page', 'layout Scene1', 'layout Scene2']);
      expect(api.editorTabs.panes.center.currentTab).toBe(2);
    });

    it('skips the tabs of items that are not in the project anymore', () => {
      const { preferences, editorStateByProject } = makeFakePreferences();
      editorStateByProject['project-1'] = {
        editorTabs: {
          currentTab: 3,
          editors: [
            { projectItemName: 'Scene1', editorKind: 'layout' },
            { projectItemName: 'DeletedScene', editorKind: 'layout' },
            { projectItemName: 'Scene2', editorKind: 'layout' },
          ],
        },
      };
      const harness = renderHarness({
        initialEditorTabs: openTab(
          getEditorTabsInitialState(),
          'start page',
          ''
        ),
        currentProjectId: 'project-1',
        preferences,
      });

      act(() => {
        const api = harness.apiRef.current;
        if (!api) throw new Error('Harness not rendered.');
        api.openEditorTabsFromPersistedState(
          // $FlowFixMe[incompatible-call] - minimal project stub.
          makeFakeProject(['Scene1', 'Scene2'])
        );
      });

      const api = harness.apiRef.current;
      if (!api) throw new Error('Harness not rendered.');
      expect(
        getCenterEditors(api.editorTabs).map(editorTab => editorTab.key)
      ).toEqual(['start page', 'layout Scene1', 'layout Scene2']);
    });

    it('does not grow the saved tabs across an open/close cycle', () => {
      const { preferences, editorStateByProject } = makeFakePreferences();
      editorStateByProject['project-1'] = {
        editorTabs: {
          currentTab: 2,
          editors: [
            { projectItemName: 'Scene1', editorKind: 'layout' },
            { projectItemName: 'Scene2', editorKind: 'layout' },
          ],
        },
      };
      const harness = renderHarness({
        initialEditorTabs: openTab(
          getEditorTabsInitialState(),
          'start page',
          ''
        ),
        currentProjectId: 'project-1',
        preferences,
      });

      act(() => {
        const api = harness.apiRef.current;
        if (!api) throw new Error('Harness not rendered.');
        api.openEditorTabsFromPersistedState(
          // $FlowFixMe[incompatible-call] - minimal project stub.
          makeFakeProject(['Scene1', 'Scene2'])
        );
      });
      flushDebounce();

      expect(editorStateByProject['project-1'].editorTabs.editors).toEqual([
        { projectItemName: 'Scene1', editorKind: 'layout' },
        { projectItemName: 'Scene2', editorKind: 'layout' },
      ]);
    });
  });
});
