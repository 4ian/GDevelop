// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';

import { type EventsSheetInterface } from '../EventsSheet';
import { type TreeViewInterface } from '../UI/TreeView';
import EditorMosaic, {
  type EditorMosaicInterface,
  type EditorMosaicNode,
  mosaicContainsNode,
} from '../UI/EditorMosaic';
import EventsFunctionsTreeView from '../EventsFunctionsList/EventsFunctionsTreeView';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import Add from '../UI/CustomSvgIcons/Add';
import Tune from '../UI/CustomSvgIcons/Tune';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PreferencesContext, {
  type EditorMosaicName,
} from '../MainFrame/Preferences/PreferencesContext';
import SceneLifecycleFunctionSelectorDialog from './SceneLifecycleFunctionSelectorDialog';
import {
  DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
  hasSceneLifecycleEventsFunction,
  insertSceneLifecycleEventsFunction,
  isSceneLifecycleFunctionName,
  removeSceneLifecycleEventsFunction,
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
  emptyEditor: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
  },
};

type Props = {|
  ownerKind: 'scene' | 'external-events',
  ownerName: string,
  owner: gdLayout | gdExternalEvents,
  renderFunctionEditor: ({|
    lifecycleFunctionName: SceneLifecycleFunctionName,
    isSelected: boolean,
    editorRef: React.RefSetter<EventsSheetInterface>,
    onOpenParameters: ?() => void,
  |}) => React.Node,
  renderFunctionParameters: ({|
    lifecycleFunctionName: 'sceneSignal',
  |}) => React.Node,
  onSelectedFunctionChanged: () => void,
  onLifecycleFunctionsChanged: () => void,
|};

type State = {|
  selectedLifecycleFunctionName: ?SceneLifecycleFunctionName,
  mountedLifecycleFunctionNames: Array<SceneLifecycleFunctionName>,
  parametersDialogOpen: boolean,
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
  isPlaceholder?: boolean,
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

const getPresentLifecycleFunctionDefinitions = (
  owner: gdLayout | gdExternalEvents
) =>
  sceneLifecycleFunctionDefinitions.filter(definition =>
    hasSceneLifecycleEventsFunction(owner, definition.name)
  );

const getPreferredLifecycleFunctionName = (
  owner: gdLayout | gdExternalEvents
): ?SceneLifecycleFunctionName => {
  if (
    hasSceneLifecycleEventsFunction(
      owner,
      DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME
    )
  ) {
    return DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
  }

  const firstDefinition = getPresentLifecycleFunctionDefinitions(owner)[0];
  return firstDefinition ? firstDefinition.name : null;
};

const getFallbackLifecycleFunctionNameAfterDeletion = (
  owner: gdLayout | gdExternalEvents,
  deletedName: SceneLifecycleFunctionName
): ?SceneLifecycleFunctionName => {
  if (
    hasSceneLifecycleEventsFunction(
      owner,
      DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME
    )
  ) {
    return DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
  }

  const deletedIndex = sceneLifecycleFunctionDefinitions.findIndex(
    definition => definition.name === deletedName
  );
  const nextDefinition = sceneLifecycleFunctionDefinitions.find(
    (definition, index) =>
      index > deletedIndex &&
      hasSceneLifecycleEventsFunction(owner, definition.name)
  );
  if (nextDefinition) return nextDefinition.name;

  for (let index = deletedIndex - 1; index >= 0; index--) {
    const definition = sceneLifecycleFunctionDefinitions[index];
    if (hasSceneLifecycleEventsFunction(owner, definition.name)) {
      return definition.name;
    }
  }

  return null;
};

const SceneContextLifecycleFunctionsEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<SceneContextLifecycleFunctionsEditorInterface>,
}> = React.forwardRef<Props, SceneContextLifecycleFunctionsEditorInterface>(
  (
    {
      ownerKind,
      ownerName,
      owner,
      renderFunctionEditor,
      renderFunctionParameters,
      onSelectedFunctionChanged,
      onLifecycleFunctionsChanged,
    }: Props,
    ref
  ): React.Node => {
    const [state, setState] = React.useState<State>(() => {
      const initialLifecycleFunctionName = getPreferredLifecycleFunctionName(
        owner
      );
      return {
        selectedLifecycleFunctionName: initialLifecycleFunctionName,
        mountedLifecycleFunctionNames: initialLifecycleFunctionName
          ? [initialLifecycleFunctionName]
          : [],
        parametersDialogOpen: false,
      };
    });
    const [
      lifecycleFunctionSelectorDialogOpen,
      setLifecycleFunctionSelectorDialogOpen,
    ] = React.useState(false);
    const {
      selectedLifecycleFunctionName,
      mountedLifecycleFunctionNames,
      parametersDialogOpen,
    } = state;
    const editorsByLifecycleFunctionName = React.useRef<{
      [string]: ?EventsSheetInterface,
    }>({});
    const treeViewRef = React.useRef<?TreeViewInterface<LifecycleFunctionTreeItem>>(
      null
    );
    const editorMosaicRef = React.useRef<?EditorMosaicInterface>(null);
    const {
      getDefaultEditorMosaicNode,
      setDefaultEditorMosaicNode,
    } = React.useContext(PreferencesContext);
    const { showDeleteConfirmation } = useAlertDialog();

    const presentLifecycleFunctionDefinitions = getPresentLifecycleFunctionDefinitions(
      owner
    );
    const missingLifecycleFunctionDefinitions = sceneLifecycleFunctionDefinitions.filter(
      definition => !hasSceneLifecycleEventsFunction(owner, definition.name)
    );
    const presenceKey = presentLifecycleFunctionDefinitions
      .map(definition => definition.name)
      .join('|');

    const lifecycleFunctionTreeItems = React.useMemo<
      Array<LifecycleFunctionTreeItem>
    >(
      () =>
        presentLifecycleFunctionDefinitions.map(definition => ({
          id: `scene-lifecycle-function-${definition.name}`,
          name: getLabel(definition.name),
          searchText: getSearchText(definition.name),
          thumbnail: definition.icon,
          lifecycleFunctionName: definition.name,
          children: null,
        })),
      // `presenceKey` is the model-derived identity of the visible list.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [presenceKey]
    );
    const displayedLifecycleFunctionTreeItems = React.useMemo<
      Array<LifecycleFunctionTreeItem>
    >(
      () =>
        lifecycleFunctionTreeItems.length > 0
          ? lifecycleFunctionTreeItems
          : [
              {
                id: `scene-lifecycle-functions-empty-${ownerKind}`,
                name: <Trans>No lifecycle functions attached.</Trans>,
                searchText: '',
                thumbnail: null,
                lifecycleFunctionName: null,
                children: null,
                isPlaceholder: true,
              },
            ],
      [lifecycleFunctionTreeItems, ownerKind]
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
        children: displayedLifecycleFunctionTreeItems,
        // Match the focused Prefab/Behavior owner row rather than an
        // extension section header.
        isRoot: false,
      }),
      [displayedLifecycleFunctionTreeItems, ownerKind, ownerName]
    );
    const selectedTreeItem = lifecycleFunctionTreeItems.find(
      item => item.lifecycleFunctionName === selectedLifecycleFunctionName
    );

    const selectFunctionByName = React.useCallback(
      (name: string): boolean => {
        if (!isSceneLifecycleFunctionName(name)) return false;
        const lifecycleFunctionName: SceneLifecycleFunctionName = (name: any);
        if (!hasSceneLifecycleEventsFunction(owner, lifecycleFunctionName)) {
          return false;
        }
        if (lifecycleFunctionName === selectedLifecycleFunctionName) {
          return true;
        }
        setState(state => ({
          selectedLifecycleFunctionName: lifecycleFunctionName,
          mountedLifecycleFunctionNames: state.mountedLifecycleFunctionNames.includes(
            lifecycleFunctionName
          )
            ? state.mountedLifecycleFunctionNames
            : [...state.mountedLifecycleFunctionNames, lifecycleFunctionName],
          parametersDialogOpen: false,
        }));
        return true;
      },
      [owner, selectedLifecycleFunctionName]
    );

    const addLifecycleFunction = React.useCallback(
      (lifecycleFunctionName: SceneLifecycleFunctionName) => {
        if (hasSceneLifecycleEventsFunction(owner, lifecycleFunctionName)) {
          selectFunctionByName(lifecycleFunctionName);
          return;
        }

        insertSceneLifecycleEventsFunction(owner, lifecycleFunctionName);
        onLifecycleFunctionsChanged();
        setState(state => ({
          selectedLifecycleFunctionName: lifecycleFunctionName,
          mountedLifecycleFunctionNames: state.mountedLifecycleFunctionNames.includes(
            lifecycleFunctionName
          )
            ? state.mountedLifecycleFunctionNames
            : [...state.mountedLifecycleFunctionNames, lifecycleFunctionName],
          parametersDialogOpen: false,
        }));

        // Let React publish the new row before asking the virtualized tree to
        // reveal it.
        setTimeout(() => {
          if (treeViewRef.current) {
            treeViewRef.current.scrollToItemFromId(
              `scene-lifecycle-function-${lifecycleFunctionName}`
            );
          }
        }, 0);
      },
      [onLifecycleFunctionsChanged, owner, selectFunctionByName]
    );

    const deleteLifecycleFunction = React.useCallback(
      async (lifecycleFunctionName: SceneLifecycleFunctionName) => {
        if (!hasSceneLifecycleEventsFunction(owner, lifecycleFunctionName)) {
          return;
        }

        const eventsCount = owner
          .getLifecycleEventsFunctions()
          .getByName(lifecycleFunctionName)
          .getEvents()
          .getEventsCount();
        if (eventsCount > 0) {
          const shouldDelete = await showDeleteConfirmation({
            title: t`Delete lifecycle function?`,
            message: t`The lifecycle function and all of its events will be deleted. This can't be undone.`,
          });
          if (!shouldDelete) return;
        }

        // The confirmation can stay open while another surface changes the
        // same owner. Treat an already removed role as a harmless no-op.
        if (!hasSceneLifecycleEventsFunction(owner, lifecycleFunctionName)) {
          return;
        }
        if (!removeSceneLifecycleEventsFunction(owner, lifecycleFunctionName)) {
          return;
        }

        editorsByLifecycleFunctionName.current[lifecycleFunctionName] = null;
        const fallbackLifecycleFunctionName = getFallbackLifecycleFunctionNameAfterDeletion(
          owner,
          lifecycleFunctionName
        );
        onLifecycleFunctionsChanged();
        setState(state => ({
          selectedLifecycleFunctionName:
            state.selectedLifecycleFunctionName === lifecycleFunctionName
              ? fallbackLifecycleFunctionName
              : state.selectedLifecycleFunctionName,
          mountedLifecycleFunctionNames: state.mountedLifecycleFunctionNames.filter(
            name => name !== lifecycleFunctionName
          ),
          parametersDialogOpen:
            lifecycleFunctionName === 'sceneSignal'
              ? false
              : state.parametersDialogOpen,
        }));
      },
      [onLifecycleFunctionsChanged, owner, showDeleteConfirmation]
    );

    const openParametersDialog = React.useCallback(
      () =>
        setState(state => ({
          ...state,
          parametersDialogOpen: true,
        })),
      []
    );

    const openLifecycleFunctionSelectorDialog = React.useCallback(
      () => setLifecycleFunctionSelectorDialogOpen(true),
      []
    );

    React.useEffect(
      () => {
        onSelectedFunctionChanged();
      },
      [onSelectedFunctionChanged, selectedLifecycleFunctionName]
    );

    React.useEffect(
      () => {
        const selectedFunctionStillExists =
          selectedLifecycleFunctionName &&
          hasSceneLifecycleEventsFunction(owner, selectedLifecycleFunctionName);
        if (selectedFunctionStillExists) return;

        const nextSelectedLifecycleFunctionName = getPreferredLifecycleFunctionName(
          owner
        );
        setState(state => ({
          selectedLifecycleFunctionName: nextSelectedLifecycleFunctionName,
          mountedLifecycleFunctionNames: nextSelectedLifecycleFunctionName
            ? state.mountedLifecycleFunctionNames.includes(
                nextSelectedLifecycleFunctionName
              )
              ? state.mountedLifecycleFunctionNames.filter(name =>
                  hasSceneLifecycleEventsFunction(owner, name)
                )
              : [
                  ...state.mountedLifecycleFunctionNames.filter(name =>
                    hasSceneLifecycleEventsFunction(owner, name)
                  ),
                  nextSelectedLifecycleFunctionName,
                ]
            : [],
          parametersDialogOpen: false,
        }));
      },
      [owner, presenceKey, selectedLifecycleFunctionName]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        getSelectedEditor: () =>
          selectedLifecycleFunctionName
            ? editorsByLifecycleFunctionName.current[
                selectedLifecycleFunctionName
              ]
            : null,
        getEditor: name => editorsByLifecycleFunctionName.current[name],
        forEachEditor: callback => {
          Object.keys(editorsByLifecycleFunctionName.current).forEach(name => {
            const editor = editorsByLifecycleFunctionName.current[name];
            if (editor) callback(editor);
          });
        },
        selectFunctionByName,
        isFunctionsListCollapsed: () =>
          !!editorMosaicRef.current &&
          editorMosaicRef.current.isEditorCollapsed('functions-list'),
        toggleFunctionsList: () => {
          const editorMosaic = editorMosaicRef.current;
          if (!editorMosaic) return false;

          const isCollapsed = editorMosaic.isEditorCollapsed('functions-list');
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
          <I18n>
            {({ i18n }) => {
              return (
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
                  onSelectItems={items => {
                    const item = items[0];
                    if (item && item.lifecycleFunctionName) {
                      selectFunctionByName(item.lifecycleFunctionName);
                    }
                  }}
                  onClickItem={() => {}}
                  onRenameItem={() => {}}
                  buildMenuTemplate={item => {
                    const lifecycleFunctionName = item.lifecycleFunctionName;
                    if (lifecycleFunctionName) {
                      const functionMenuItems: Array<MenuItemTemplate> = [];
                      if (lifecycleFunctionName === 'sceneSignal') {
                        functionMenuItems.push(
                          {
                            label: i18n._(t`Function settings`),
                            click: openParametersDialog,
                          },
                          { type: 'separator' }
                        );
                      }
                      functionMenuItems.push({
                        label: i18n._(t`Delete`),
                        click: () =>
                          deleteLifecycleFunction(lifecycleFunctionName),
                        accelerator: 'Backspace',
                      });
                      return functionMenuItems;
                    }

                    if (item.isPlaceholder) return [];
                    return missingLifecycleFunctionDefinitions.length > 0
                      ? [
                          {
                            label: i18n._(t`Add lifecycle function`),
                            click: openLifecycleFunctionSelectorDialog,
                          },
                        ]
                      : [
                          {
                            label: i18n._(t`Add lifecycle function`),
                            enabled: false,
                          },
                        ];
                  }}
                  renderRightComponent={item =>
                    item === rootTreeItem ? (
                      missingLifecycleFunctionDefinitions.length > 0 ? (
                        <IconButton
                          id="add-scene-lifecycle-function-button"
                          size="small"
                          tooltip={t`Add lifecycle function`}
                          onClick={openLifecycleFunctionSelectorDialog}
                        >
                          <Add />
                        </IconButton>
                      ) : (
                        <IconButton
                          id="add-scene-lifecycle-function-button"
                          size="small"
                          disabled
                          tooltip={t`All lifecycle functions are attached`}
                        >
                          <Add />
                        </IconButton>
                      )
                    ) : null
                  }
                  onMoveSelectionToItem={() => {}}
                  canMoveSelectionToItem={() => false}
                  reactDndType="GD_SCENE_LIFECYCLE_FUNCTION_ITEM"
                  initiallyOpenedNodeIds={[rootTreeItem.id]}
                  onKeyDown={event => {
                    if (
                      selectedLifecycleFunctionName &&
                      (event.key === 'Backspace' || event.key === 'Delete')
                    ) {
                      event.preventDefault();
                      deleteLifecycleFunction(selectedLifecycleFunctionName);
                    }
                  }}
                  headerControls={
                    selectedLifecycleFunctionName === 'sceneSignal' ? (
                      <FlatButton
                        fullWidth
                        label={<Trans>Function settings</Trans>}
                        leftIcon={<Tune />}
                        onClick={openParametersDialog}
                        id="function-settings-button"
                      />
                    ) : null
                  }
                />
              );
            }}
          </I18n>
        ),
      },
      'events-sheet': {
        type: 'primary',
        noTitleBar: true,
        toolbarControls: [],
        renderEditor: () => (
          <>
            {!selectedLifecycleFunctionName && (
              <div style={styles.emptyEditor} id="empty-lifecycle-editor">
                <span>
                  <Trans>No lifecycle functions attached.</Trans>
                  <br />
                  <Trans>Use + to add one.</Trans>
                </span>
              </div>
            )}
            {sceneLifecycleFunctionDefinitions
              .filter(
                definition =>
                  mountedLifecycleFunctionNames.includes(definition.name) &&
                  hasSceneLifecycleEventsFunction(owner, definition.name)
              )
              .map(definition => {
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
                      editorRef: editor => {
                        editorsByLifecycleFunctionName.current[
                          definition.name
                        ] = editor;
                      },
                      onOpenParameters:
                        definition.name === 'sceneSignal'
                          ? openParametersDialog
                          : null,
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
      <React.Fragment>
        <EditorMosaic
          ref={editorMosaicRef}
          // $FlowFixMe[incompatible-type]
          editors={editors}
          centralNodeId="events-sheet"
          initialNodes={initialMosaicNode}
          onPersistNodes={node =>
            setDefaultEditorMosaicNode(mosaicPreferenceName, node)
          }
        />
        {lifecycleFunctionSelectorDialogOpen && (
          <SceneLifecycleFunctionSelectorDialog
            owner={owner}
            onCancel={() => setLifecycleFunctionSelectorDialogOpen(false)}
            onChoose={lifecycleFunctionName => {
              setLifecycleFunctionSelectorDialogOpen(false);
              addLifecycleFunction(lifecycleFunctionName);
            }}
          />
        )}
        {parametersDialogOpen &&
          selectedLifecycleFunctionName === 'sceneSignal' && (
            <Dialog
              title={<Trans>Function parameters</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  keyboardFocused
                  onClick={() =>
                    setState(state => ({
                      ...state,
                      parametersDialogOpen: false,
                    }))
                  }
                />,
              ]}
              open
              onRequestClose={() =>
                setState(state => ({
                  ...state,
                  parametersDialogOpen: false,
                }))
              }
              maxWidth="md"
              fullHeight
              flexColumnBody
              disableContentScroll
            >
              {renderFunctionParameters({
                lifecycleFunctionName: 'sceneSignal',
              })}
            </Dialog>
          )}
      </React.Fragment>
    );
  }
);

export default SceneContextLifecycleFunctionsEditor;
