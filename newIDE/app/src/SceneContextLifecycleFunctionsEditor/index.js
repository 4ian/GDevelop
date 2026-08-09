// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import { type EventsSheetInterface } from '../EventsSheet';
import { type TreeViewInterface } from '../UI/TreeView';
import EditorMosaic, {
  type EditorMosaicInterface,
  type EditorMosaicNode,
  mosaicContainsNode,
} from '../UI/EditorMosaic';
import EventsFunctionsTreeView from '../EventsFunctionsList/EventsFunctionsTreeView';
import PreferencesContext, {
  type EditorMosaicName,
} from '../MainFrame/Preferences/PreferencesContext';
import {
  DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
  isSceneLifecycleFunctionName,
  sceneLifecycleFunctionDefinitions,
  type SceneLifecycleFunctionName,
} from '../SceneContextLifecycleFunctions';

const styles = {
  editor: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  hiddenEditor: {
    display: 'none',
  },
};

type Props = {|
  ownerKind: 'scene' | 'external-events',
  ownerName: string,
  renderFunctionEditor: ({|
    lifecycleFunctionName: SceneLifecycleFunctionName,
    isSelected: boolean,
    editorRef: React.RefSetter<EventsSheetInterface>,
  |}) => React.Node,
  onSelectedFunctionChanged: () => void,
|};

type State = {|
  selectedLifecycleFunctionName: SceneLifecycleFunctionName,
  mountedLifecycleFunctionNames: Array<SceneLifecycleFunctionName>,
|};

export type SceneContextLifecycleFunctionsEditorInterface = {|
  getSelectedEditor: () => ?EventsSheetInterface,
  getEditor: (name: SceneLifecycleFunctionName) => ?EventsSheetInterface,
  forEachEditor: (callback: (EventsSheetInterface) => void) => void,
  selectFunctionByName: (name: string) => boolean,
  isFunctionsListCollapsed: () => boolean,
  toggleFunctionsList: () => boolean,
|};

type LifecycleFunctionTreeItem = {|
  id: string,
  name: string | React.Node,
  searchText: string,
  thumbnail: ?string,
  lifecycleFunctionName: ?SceneLifecycleFunctionName,
  children: ?Array<LifecycleFunctionTreeItem>,
  isRoot?: boolean,
|};

const getLabel = (name: SceneLifecycleFunctionName): React.Node => {
  switch (name) {
    case 'sceneLoad':
      return <Trans>On scene load</Trans>;
    case 'sceneSignal':
      return <Trans>On scene signal</Trans>;
    case 'sceneUpdate':
      return <Trans>Scene update</Trans>;
    case 'sceneUnload':
      return <Trans>On scene unload</Trans>;
    default:
      return null;
  }
};

const getSearchText = (name: SceneLifecycleFunctionName): string => {
  switch (name) {
    case 'sceneLoad':
      return 'On scene load sceneLoad';
    case 'sceneSignal':
      return 'On scene signal sceneSignal';
    case 'sceneUpdate':
      return 'Scene update sceneUpdate';
    case 'sceneUnload':
      return 'On scene unload sceneUnload';
    default:
      return '';
  }
};

const getItemName = (item: LifecycleFunctionTreeItem) => item.name;
const getItemSearchText = (item: LifecycleFunctionTreeItem) => item.searchText;
const getItemThumbnail = (item: LifecycleFunctionTreeItem) => item.thumbnail;
const getItemChildren = (item: LifecycleFunctionTreeItem) => item.children;
const getItemId = (item: LifecycleFunctionTreeItem) => item.id;
const getItemHtmlId = (item: LifecycleFunctionTreeItem): string => item.id;

const getInitialMosaicEditorNodes = (): EditorMosaicNode => ({
  direction: 'row',
  first: 'functions-list',
  second: 'events-sheet',
  splitPercentage: 20,
});

const getMosaicPreferenceName = (
  ownerKind: 'scene' | 'external-events'
): EditorMosaicName =>
  ownerKind === 'scene'
    ? 'scene-lifecycle-functions-editor'
    : 'external-events-lifecycle-functions-editor';

const SceneContextLifecycleFunctionsEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<SceneContextLifecycleFunctionsEditorInterface>,
}> = React.forwardRef<Props, SceneContextLifecycleFunctionsEditorInterface>(
  (
    {
      ownerKind,
      ownerName,
      renderFunctionEditor,
      onSelectedFunctionChanged,
    }: Props,
    ref
  ): React.Node => {
    const [state, setState] = React.useState<State>({
      selectedLifecycleFunctionName: DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
      mountedLifecycleFunctionNames: [DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME],
    });
    const { selectedLifecycleFunctionName, mountedLifecycleFunctionNames } =
      state;
    const editorsByLifecycleFunctionName = React.useRef<{
      [string]: ?EventsSheetInterface,
    }>({});
    const treeViewRef =
      React.useRef<?TreeViewInterface<LifecycleFunctionTreeItem>>(null);
    const editorMosaicRef = React.useRef<?EditorMosaicInterface>(null);
    const {
      getDefaultEditorMosaicNode,
      setDefaultEditorMosaicNode,
    } = React.useContext(PreferencesContext);

    const lifecycleFunctionTreeItems = React.useMemo<
      Array<LifecycleFunctionTreeItem>,
    >(
      () =>
        sceneLifecycleFunctionDefinitions.map((definition) => ({
          id: `scene-lifecycle-function-${definition.name}`,
          name: getLabel(definition.name),
          searchText: getSearchText(definition.name),
          thumbnail: definition.icon,
          lifecycleFunctionName: definition.name,
          children: null,
        })),
      []
    );
    const rootTreeItem = React.useMemo<LifecycleFunctionTreeItem>(
      () => ({
        id: `scene-lifecycle-functions-${ownerKind}`,
        name: ownerName,
        searchText: ownerName,
        thumbnail:
          ownerKind === 'scene'
            ? 'res/icons_default/scene_black.svg'
            : 'res/icons_default/external_events_black.svg',
        lifecycleFunctionName: null,
        children: lifecycleFunctionTreeItems,
        // Match the focused Prefab/Behavior owner row rather than an
        // extension section header.
        isRoot: false,
      }),
      [lifecycleFunctionTreeItems, ownerKind, ownerName]
    );
    const selectedTreeItem = lifecycleFunctionTreeItems.find(
      (item) => item.lifecycleFunctionName === selectedLifecycleFunctionName
    );

    const selectFunctionByName = React.useCallback(
      (name: string): boolean => {
        if (!isSceneLifecycleFunctionName(name)) return false;
        const lifecycleFunctionName: SceneLifecycleFunctionName = (name: any);
        if (lifecycleFunctionName === selectedLifecycleFunctionName) {
          return true;
        }
        setState((state) => ({
          selectedLifecycleFunctionName: lifecycleFunctionName,
          mountedLifecycleFunctionNames:
            state.mountedLifecycleFunctionNames.includes(lifecycleFunctionName)
              ? state.mountedLifecycleFunctionNames
              : [...state.mountedLifecycleFunctionNames, lifecycleFunctionName],
        }));
        return true;
      },
      [selectedLifecycleFunctionName]
    );

    React.useEffect(() => {
      onSelectedFunctionChanged();
    }, [onSelectedFunctionChanged, selectedLifecycleFunctionName]);

    React.useImperativeHandle(
      ref,
      () => ({
        getSelectedEditor: () =>
          editorsByLifecycleFunctionName.current[selectedLifecycleFunctionName],
        getEditor: (name) => editorsByLifecycleFunctionName.current[name],
        forEachEditor: (callback) => {
          Object.keys(editorsByLifecycleFunctionName.current).forEach(
            (name) => {
              const editor = editorsByLifecycleFunctionName.current[name];
              if (editor) callback(editor);
            }
          );
        },
        selectFunctionByName,
        isFunctionsListCollapsed: () =>
          !!editorMosaicRef.current &&
          editorMosaicRef.current.isEditorCollapsed('functions-list'),
        toggleFunctionsList: () => {
          const editorMosaic = editorMosaicRef.current;
          if (!editorMosaic) return false;

          const isCollapsed = editorMosaic.isEditorCollapsed(
            'functions-list'
          );
          if (isCollapsed) {
            editorMosaic.uncollapseEditor('functions-list', 20);
          } else {
            editorMosaic.collapseEditor('functions-list');
          }
          return !isCollapsed;
        },
      }),
      [selectFunctionByName, selectedLifecycleFunctionName]
    );

    const editors = {
      'functions-list': {
        type: 'primary',
        noTitleBar: true,
        toolbarControls: [],
        renderEditor: () => (
          <EventsFunctionsTreeView
            listKey={rootTreeItem.id}
            treeViewRef={treeViewRef}
            items={[rootTreeItem]}
            selectedItems={selectedTreeItem ? [selectedTreeItem] : []}
            getItemName={getItemName}
            getItemSearchText={getItemSearchText}
            getItemThumbnail={getItemThumbnail}
            getItemChildren={getItemChildren}
            getItemId={getItemId}
            getItemHtmlId={getItemHtmlId}
            onSelectItems={(items) => {
              const item = items[0];
              if (item && item.lifecycleFunctionName) {
                selectFunctionByName(item.lifecycleFunctionName);
              }
            }}
            onClickItem={() => {}}
            onRenameItem={() => {}}
            buildMenuTemplate={() => []}
            onMoveSelectionToItem={() => {}}
            canMoveSelectionToItem={() => false}
            reactDndType="GD_SCENE_LIFECYCLE_FUNCTION_ITEM"
            initiallyOpenedNodeIds={[rootTreeItem.id]}
          />
        ),
      },
      'events-sheet': {
        type: 'primary',
        noTitleBar: true,
        toolbarControls: [],
        renderEditor: () => (
          <>
            {sceneLifecycleFunctionDefinitions
              .filter((definition) =>
                mountedLifecycleFunctionNames.includes(definition.name)
              )
              .map((definition) => {
                const isSelected =
                  definition.name === selectedLifecycleFunctionName;
                return (
                  <div
                    key={definition.name}
                    style={isSelected ? styles.editor : styles.hiddenEditor}
                  >
                    {renderFunctionEditor({
                      lifecycleFunctionName: definition.name,
                      isSelected,
                      editorRef: (editor) => {
                        editorsByLifecycleFunctionName.current[
                          definition.name
                        ] = editor;
                      },
                    })}
                  </div>
                );
              })}
          </>
        ),
      },
    };
    const mosaicPreferenceName = getMosaicPreferenceName(ownerKind);
    const savedMosaicNode = getDefaultEditorMosaicNode(mosaicPreferenceName);
    const initialMosaicNode =
      savedMosaicNode &&
      mosaicContainsNode(savedMosaicNode, 'functions-list') &&
      mosaicContainsNode(savedMosaicNode, 'events-sheet')
        ? savedMosaicNode
        : getInitialMosaicEditorNodes();

    return (
      <EditorMosaic
        ref={editorMosaicRef}
        // $FlowFixMe[incompatible-type]
        editors={editors}
        centralNodeId="events-sheet"
        initialNodes={initialMosaicNode}
        onPersistNodes={(node) =>
          setDefaultEditorMosaicNode(mosaicPreferenceName, node)
        }
      />
    );
  }
);

export default SceneContextLifecycleFunctionsEditor;
