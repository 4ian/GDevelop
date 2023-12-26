// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import NewObjectDialog from '../AssetStore/NewObjectDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import TreeView, { type TreeViewInterface } from '../UI/TreeView';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import IconButton from '../UI/IconButton';
import AddFolder from '../UI/CustomSvgIcons/AddFolder';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import { FunctionTreeViewItemContent } from './FunctionTreeViewItemContent';

const gd: libGDevelop = global.gd;

const extensionObjectsRootFolderId = 'extension-objects';
const extensionBehaviorsRootFolderId = 'extension-behaviors';
const extensionFunctionsRootFolderId = 'extension-functions';
const extensionObjectsEmptyPlaceholderId = 'extension-objects-placeholder';
const extensionBehaviorsEmptyPlaceholderId = 'extension-behaviors-placeholder';
const extensionFunctionsEmptyPlaceholderId = 'extension-functions-placeholder';

const globalObjectsWikiLink = getHelpLink(
  '/interface/scene-editor/global-objects/',
  ':~:text=Global%20objects%20are%20objects%20which,are%20usable%20by%20all%20Scenes'
);

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

type EventFunctionCallbacks = {|
  onSelectEventsFunction: (eventsFunction: ?gdEventsFunction) => void,
  onDeleteEventsFunction: (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => void,
  canRename: (eventsFunction: gdEventsFunction) => boolean,
  onRenameEventsFunction: (
    eventsFunction: gdEventsFunction,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onAddEventsFunction: (
    (parameters: ?EventsFunctionCreationParameters) => void
  ) => void,
  onEventsFunctionAdded: (eventsFunction: gdEventsFunction) => void,
|};

type TreeItemProps = {|
  forceUpdate: () => void,
  forceUpdateList: () => void,
|};

type EventFunctionProps = {|
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
|} & TreeItemProps &
  EventFunctionCallbacks;

type EventBehaviorCallbacks = {||};
type EventObjectCallbacks = {||};

type EventBehaviorProps = TreeItemProps & EventBehaviorCallbacks;
type EventObjectProps = TreeItemProps & EventObjectCallbacks;

interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getThumbnail(): ?string;
  getDataset(): ?HTMLDataset;
  onSelect(): void;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  content: TreeViewItemContent;
  getChildren(): ?Array<TreeViewItem>;
}

class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdEventsBasedObject;

  constructor(object: gdEventsBasedObject) {
    this.object = object;
  }

  getName(): string | React.Node {
    return this.object.getName();
  }
  getId(): string {
    return 'objects.' + this.object.getName();
  }
  getHtmlId(index: number): ?string {
    return `object-item-${index}`;
  }
  getThumbnail(): ?string {
    return null;
  }
  getDataset(): ?HTMLDataset {
    return null;
  }
  onSelect(): void {}
  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }
}

class BehaviorTreeViewItemContent implements TreeViewItemContent {
  behavior: gdEventsBasedBehavior;

  constructor(behavior: gdEventsBasedBehavior) {
    this.behavior = behavior;
  }

  getName(): string | React.Node {
    return this.behavior.getName();
  }
  getId(): string {
    return 'behaviors.' + this.behavior.getName();
  }
  getHtmlId(index: number): ?string {
    return `behavior-item-${index}`;
  }
  getThumbnail(): ?string {
    return null;
  }
  getDataset(): ?HTMLDataset {
    return null;
  }
  onSelect(): void {}
  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }
}

class ObjectTreeViewItem implements TreeViewItem {
  content: ObjectTreeViewItemContent;
  eventFunctionProps: EventFunctionProps;

  constructor(
    content: ObjectTreeViewItemContent,
    eventFunctionProps: EventFunctionProps
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(): ?Array<TreeViewItem> {
    const eventsBasedObject = this.content.object;
    const eventFunctionProps = {
      eventsBasedObject,
      eventsFunctionsContainer: eventsBasedObject,
      ...this.eventFunctionProps,
    };
    const functions = eventsBasedObject.getEventsFunctions();
    return mapFor(
      0,
      functions.getEventsFunctionsCount(),
      i =>
        new LeafTreeViewItem(
          new FunctionTreeViewItemContent(
            functions.getEventsFunctionAt(i),
            eventFunctionProps
          )
        )
    );
  }
}

class BehaviorTreeViewItem implements TreeViewItem {
  content: BehaviorTreeViewItemContent;
  eventFunctionProps: EventFunctionProps;

  constructor(
    content: BehaviorTreeViewItemContent,
    eventFunctionProps: EventFunctionCallbacks
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(): ?Array<TreeViewItem> {
    const eventsBasedBehavior = this.content.behavior;
    const eventFunctionProps = {
      eventsBasedBehavior,
      eventsFunctionsContainer: eventsBasedBehavior,
      ...this.eventFunctionProps,
    };
    const functions = eventsBasedBehavior.getEventsFunctions();
    return mapFor(
      0,
      functions.getEventsFunctionsCount(),
      i =>
        new LeafTreeViewItem(
          new FunctionTreeViewItemContent(
            functions.getEventsFunctionAt(i),
            eventFunctionProps
          )
        )
    );
  }
}

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: ObjectTreeViewItem) {
    this.content = content;
  }

  getChildren(): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItemContent implements TreeViewItemContent {
  isPlaceholder = true;
  id: string;
  label: string | React.Node;

  constructor(id: string, label: string | React.Node) {
    this.id = id;
    this.label = label;
  }

  getName(): string | React.Node {
    return this.label;
  }
  getId(): string {
    return this.id;
  }
  getHtmlId(index: number): ?string {
    return null;
  }
  getThumbnail(): ?string {
    return null;
  }
  getDataset(): ?HTMLDataset {
    return null;
  }
}

const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId();
const getTreeViewItemChildren = (item: TreeViewItem) => item.getChildren();
const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemData = (item: TreeViewItem) => item.content.getDataset();
const buildMenuTemplate = (i18n: I18nType) => (
  item: TreeViewItem,
  index: number
) => item.content.buildMenuTemplate(i18n, index);

const CLIPBOARD_KIND = 'Object';

const getPasteLabel = (
  i18n: I18nType,
  { isGlobalObject, isFolder }: {| isGlobalObject: boolean, isFolder: boolean |}
) => {
  let translation = t`Paste`;
  if (Clipboard.has(CLIPBOARD_KIND)) {
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    const clipboardObjectName =
      SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
    translation = isGlobalObject
      ? isFolder
        ? t`Paste ${clipboardObjectName} as a Global Object inside folder`
        : t`Paste ${clipboardObjectName} as a Global Object`
      : isFolder
      ? t`Paste ${clipboardObjectName} inside folder`
      : t`Paste ${clipboardObjectName}`;
  }
  return i18n._(translation);
};

export type EventsFunctionsListInterface = {|
  forceUpdateList: () => void,
  openNewObjectDialog: () => void,
  closeNewObjectDialog: () => void,
  renameObjectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext => void,
|};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  unsavedChanges?: ?UnsavedChanges,
  onSelectEventsFunction: (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => void,

  // Objects
  selectedEventsBasedObject: ?gdEventsBasedObject,
  onSelectEventsBasedObject: (eventsBasedObject: ?gdEventsBasedObject) => void,
  onDeleteEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedObjectRenamed: (eventsBasedObject: gdEventsBasedObject) => void,
  onEditEventsBasedObjectProperties: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,

  // Behaviors
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  onSelectEventsBasedBehavior: (
    eventsBasedBehavior: ?gdEventsBasedBehavior
  ) => void,
  onDeleteEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedBehaviorRenamed: (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => void,
  onEventsBasedBehaviorPasted: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    sourceExtensionName: string
  ) => void,
  onEditEventsBasedBehaviorProperties: (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => void,

  // Free functions
  selectedEventsFunction: ?gdEventsFunction,
  onDeleteEventsFunction: (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => void,
  canRename: (eventsFunction: gdEventsFunction) => boolean,
  onRenameEventsFunction: (
    eventsFunction: gdEventsFunction,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onAddEventsFunction: (
    (parameters: ?EventsFunctionCreationParameters) => void
  ) => void,
  onEventsFunctionAdded: (eventsFunction: gdEventsFunction) => void,
|};

const EventsFunctionsList = React.forwardRef<
  Props,
  EventsFunctionsListInterface
>(
  (
    {
      project,
      eventsFunctionsExtension,
      unsavedChanges,
      onSelectEventsFunction,
      onDeleteEventsFunction,
      canRename,
      onRenameEventsFunction,
      onAddEventsFunction,
      onEventsFunctionAdded,

      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
    }: Props,
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);

    const preferences = React.useContext(PreferencesContext);
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const { showDeleteConfirmation } = useAlertDialog();
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const windowWidth = useResponsiveWindowWidth();
    const isMobileScreen = windowWidth === 'small';

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const eventFunctionProps = React.useMemo<EventFunctionProps>(
      () => ({
        forceUpdate,
        forceUpdateList,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        canRename,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
      }),
      [
        canRename,
        forceUpdate,
        forceUpdateList,
        onAddEventsFunction,
        onDeleteEventsFunction,
        onEventsFunctionAdded,
        onRenameEventsFunction,
        onSelectEventsFunction,
      ]
    );

    const [newObjectDialogOpen, setNewObjectDialogOpen] = React.useState<{
      from: ObjectFolderOrObjectWithContext | null,
    } | null>(null);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      openNewObjectDialog: () => {
        setNewObjectDialogOpen({ from: null });
      },
      closeNewObjectDialog: () => {
        setNewObjectDialogOpen(null);
      },
      renameObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext => {
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectFolderOrObjectWithContext);
      },
    }));

    const [searchText, setSearchText] = React.useState('');

    const addObject = React.useCallback((objectType: string) => {
      // TODO
    }, []);

    const onAddNewObject = React.useCallback(
      (item: ObjectFolderOrObjectWithContext | null) => {
        setNewObjectDialogOpen({ from: item });
      },
      []
    );

    const onObjectModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
    );

    const selectObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        // TODO
      },
      []
    );

    const deleteObjectFolderOrObjectWithContext = React.useCallback(
      async (
        objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext
      ) => {
        // TODO
      },
      []
    );

    // Initialize keyboard shortcuts as empty.
    // onDelete callback is set outside because it deletes the selected
    // item (that is a props). As it is stored in a ref, the keyboard shortcut
    // instance does not update with selectedObjectFolderOrObjectsWithContext changes.
    const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
      new KeyboardShortcuts({
        shortcutCallbacks: {},
      })
    );
    React.useEffect(
      () => {
        if (keyboardShortcutsRef.current) {
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            deleteObjectFolderOrObjectWithContext(
              // TODO
              null
            );
          });
        }
      },
      [deleteObjectFolderOrObjectWithContext]
    );

    const copyObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        const { objectFolderOrObject } = objectFolderOrObjectWithContext;
        if (objectFolderOrObject.isFolder()) return;
        const object = objectFolderOrObject.getObject();
        Clipboard.set(CLIPBOARD_KIND, {
          type: object.getType(),
          name: object.getName(),
          object: serializeToJSObject(object),
        });
      },
      []
    );

    const cutObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        copyObjectFolderOrObjectWithContext(objectFolderOrObjectWithContext);
        deleteObjectFolderOrObjectWithContext(objectFolderOrObjectWithContext);
      },
      [
        copyObjectFolderOrObjectWithContext,
        deleteObjectFolderOrObjectWithContext,
      ]
    );

    const addSerializedObjectToObjectsContainer = React.useCallback(
      ({
        objectName,
        positionObjectFolderOrObjectWithContext,
        objectType,
        serializedObject,
        addInsideFolder,
      }: {|
        objectName: string,
        positionObjectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        objectType: string,
        serializedObject: Object,
        addInsideFolder?: boolean,
      |}): ObjectWithContext => {
        // TODO
      },
      []
    );

    const paste = React.useCallback(
      (
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        addInsideFolder?: boolean
      ) => {
        // TODO
      },
      []
    );

    const editName = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        if (!objectFolderOrObjectWithContext) return;
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobileScreen) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItem(objectFolderOrObjectWithContext, 'start');
          }
          treeView.renameItem(objectFolderOrObjectWithContext);
        }
      },
      [isMobileScreen]
    );

    const duplicateObject = React.useCallback(
      (
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        duplicateInScene?: boolean
      ) => {
        const {
          objectFolderOrObject,
          global,
        } = objectFolderOrObjectWithContext;
        if (objectFolderOrObject.isFolder()) return;

        const object = objectFolderOrObject.getObject();
        const type = object.getType();
        const name = object.getName();
        const serializedObject = serializeToJSObject(object);

        const newObjectWithContext = addSerializedObjectToObjectsContainer({
          objectName: name,
          positionObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext,
          objectType: type,
          serializedObject,
        });

        const newObjectFolderOrObjectWithContext = {
          objectFolderOrObject: objectFolderOrObject
            .getParent()
            .getObjectChild(newObjectWithContext.object.getName()),
          global,
        };

        forceUpdateList();
        editName(newObjectFolderOrObjectWithContext);
        selectObjectFolderOrObjectWithContext(
          newObjectFolderOrObjectWithContext
        );
      },
      [
        addSerializedObjectToObjectsContainer,
        editName,
        forceUpdateList,
        selectObjectFolderOrObjectWithContext,
      ]
    );

    const rename = React.useCallback((item: TreeViewItem, newName: string) => {
      // TODO
    }, []);

    const editItem = React.useCallback((item: TreeViewItem) => {
      // TODO
    }, []);

    const scrollToItem = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItem(objectFolderOrObjectWithContext);
      }
    };

    const getClosestVisibleParent = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ): ?ObjectFolderOrObjectWithContext => {
      // TODO
      return null;
    };

    const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        const treeViewItems = [
          {
            isRoot: true,
            content: {
              getName(): string | React.Node {
                return i18n._(t`Objects`);
              },
              getId(): string {
                return extensionObjectsRootFolderId;
              },
              getHtmlId(index: number): ?string {
                return null;
              },
              getThumbnail(): ?string {
                return null;
              },
              getDataset(): ?HTMLDataset {
                return null;
              },
            },
            getChildren(): ?Array<TreeViewItem> {
              if (eventBasedObjects.size() === 0) {
                return [
                  new LeafTreeViewItem(
                    new PlaceHolderTreeViewItemContent(
                      extensionObjectsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new object.`)
                    )
                  ),
                ];
              }
              return mapFor(
                0,
                eventBasedObjects.size(),
                i =>
                  new ObjectTreeViewItem(
                    new ObjectTreeViewItemContent(eventBasedObjects.at(i)),
                    eventFunctionProps
                  )
              );
            },
          },
          {
            isRoot: true,
            content: {
              getName(): string | React.Node {
                return i18n._(t`Behaviors`);
              },
              getId(): string {
                return extensionBehaviorsRootFolderId;
              },
              getHtmlId(index: number): ?string {
                return null;
              },
              getThumbnail(): ?string {
                return null;
              },
              getDataset(): ?HTMLDataset {
                return null;
              },
            },
            getChildren(): ?Array<TreeViewItem> {
              if (eventBasedBehaviors.size() === 0) {
                return [
                  new LeafTreeViewItem(
                    new PlaceHolderTreeViewItemContent(
                      extensionBehaviorsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new behavior.`)
                    )
                  ),
                ];
              }
              return mapFor(
                0,
                eventBasedBehaviors.size(),
                i =>
                  new BehaviorTreeViewItem(
                    new BehaviorTreeViewItemContent(eventBasedBehaviors.at(i)),
                    eventFunctionProps
                  )
              );
            },
          },
          {
            isRoot: true,
            content: {
              getName(): string | React.Node {
                return i18n._(t`Functions`);
              },
              getId(): string {
                return extensionFunctionsRootFolderId;
              },
              getHtmlId(index: number): ?string {
                return null;
              },
              getThumbnail(): ?string {
                return null;
              },
              getDataset(): ?HTMLDataset {
                return null;
              },
            },
            getChildren(): ?Array<TreeViewItem> {
              if (eventsFunctionsExtension.getEventsFunctionsCount() === 0) {
                return [
                  new LeafTreeViewItem(
                    new PlaceHolderTreeViewItemContent(
                      extensionFunctionsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new function.`)
                    )
                  ),
                ];
              }
              const freeFunctionProps = {
                eventsFunctionsContainer: eventsFunctionsExtension,
                ...eventFunctionProps,
              };
              return mapFor(
                0,
                eventsFunctionsExtension.getEventsFunctionsCount(),
                i =>
                  new LeafTreeViewItem(
                    new FunctionTreeViewItemContent(
                      eventsFunctionsExtension.getEventsFunctionAt(i),
                      freeFunctionProps
                    )
                  )
              );
            },
          },
        ];
        // $FlowFixMe
        return treeViewItems;
      },
      [
        eventBasedBehaviors,
        eventBasedObjects,
        eventFunctionProps,
        eventsFunctionsExtension,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) => {
        // TODO
        return false;
      },
      []
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        // TODO
      },
      []
    );

    const addFolder = React.useCallback(
      (items: Array<ObjectFolderOrObjectWithContext>) => {},
      []
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback((item: TreeViewItem) => {
      // TODO
    }, []);

    const moveObjectFolderOrObjectToAnotherFolderInSameContainer = React.useCallback(
      (
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        folder: gdObjectFolderOrObject
      ) => {
        const {
          objectFolderOrObject,
          global,
        } = objectFolderOrObjectWithContext;
        if (folder === objectFolderOrObject.getParent()) return;
        objectFolderOrObject
          .getParent()
          .moveObjectFolderOrObjectToAnotherFolder(
            objectFolderOrObject,
            folder,
            0
          );
        const treeView = treeViewRef.current;
        if (treeView) {
          const closestVisibleParent = getClosestVisibleParent({
            objectFolderOrObject: folder,
            global,
          });
          if (closestVisibleParent) {
            treeView.animateItem(closestVisibleParent);
          }
        }
        onObjectModified(true);
      },
      [onObjectModified]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsFunctionsExtension.ptr;
    const initiallyOpenedNodeIds = [
      extensionObjectsRootFolderId,
      extensionBehaviorsRootFolderId,
      extensionFunctionsRootFolderId,
    ];

    const arrowKeyNavigationProps = React.useMemo(
      () => ({
        onGetItemInside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          if (!item.objectFolderOrObject.isFolder()) return null;
          else {
            if (item.objectFolderOrObject.getChildrenCount() === 0) return null;
            return {
              objectFolderOrObject: item.objectFolderOrObject.getChildAt(0),
              global: item.global,
            };
          }
        },
        onGetItemOutside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          const parent = item.objectFolderOrObject.getParent();
          if (parent.isRootFolder()) return null;
          return {
            objectFolderOrObject: parent,
            global: item.global,
          };
        },
      }),
      []
    );

    return (
      <Background maxWidth>
        <Column>
          <LineStackLayout>
            <Column expand noMargin>
              <SearchBar
                value={searchText}
                onRequestSearch={() => {}}
                onChange={text => setSearchText(text)}
                placeholder={t`Search objects`}
              />
            </Column>
          </LineStackLayout>
        </Column>
        <div
          style={styles.listContainer}
          onKeyDown={keyboardShortcutsRef.current.onKeyDown}
          onKeyUp={keyboardShortcutsRef.current.onKeyUp}
          id="events-function-list"
        >
          <I18n>
            {({ i18n }) => (
              <div style={styles.autoSizerContainer}>
                <AutoSizer style={styles.autoSizer} disableWidth>
                  {({ height }) => (
                    <TreeView
                      key={listKey}
                      ref={treeViewRef}
                      items={getTreeViewData(i18n)}
                      height={height}
                      forceAllOpened={!!currentlyRunningInAppTutorial}
                      searchText={searchText}
                      getItemName={getTreeViewItemName}
                      getItemThumbnail={getTreeViewItemThumbnail}
                      getItemChildren={getTreeViewItemChildren}
                      multiSelect={false}
                      getItemId={getTreeViewItemId}
                      getItemHtmlId={getTreeViewItemHtmlId}
                      getItemDataset={getTreeViewItemData}
                      onEditItem={editItem}
                      onCollapseItem={onCollapseItem}
                      selectedItems={selectedItems}
                      onSelectItems={items => {
                        if (!items) selectObjectFolderOrObjectWithContext(null);
                        const itemToSelect = items[0];
                        if (itemToSelect.isRoot) return;
                        if (!itemToSelect) return;
                        itemToSelect.content.onSelect();
                        setSelectedItems(items);
                      }}
                      onRenameItem={rename}
                      buildMenuTemplate={buildMenuTemplate(i18n)}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      arrowKeyNavigationProps={arrowKeyNavigationProps}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new function</Trans>}
              primary
              onClick={() => {
                // TODO
              }}
              id="add-new-function-button"
              icon={<Add />}
            />
          </Column>
        </Line>
        {newObjectDialogOpen &&
          // TODO
          false}
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to objects list is made outside
  // from the component.
  // If a change is made, the component won't notice it: you have to manually
  // call forceUpdate.
  prevProps.selectedObjectFolderOrObjectsWithContext ===
    nextProps.selectedObjectFolderOrObjectsWithContext &&
  prevProps.project === nextProps.project &&
  prevProps.objectsContainer === nextProps.objectsContainer;

const MemoizedObjectsList = React.memo<Props, EventsFunctionsListInterface>(
  EventsFunctionsList,
  arePropsEqual
);

const EventsFunctionsListWithErrorBoundary = React.forwardRef<
  Props,
  EventsFunctionsListInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Objects list</Trans>}
    scope="scene-editor-objects-list"
  >
    <MemoizedObjectsList ref={ref} {...props} />
  </ErrorBoundary>
));

export default EventsFunctionsListWithErrorBoundary;
