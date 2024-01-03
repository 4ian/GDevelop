// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import newNameGenerator from '../Utils/NewNameGenerator';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import PreferencesContext, {
  type Preferences,
} from '../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import {
  FunctionTreeViewItemContent,
  getFunctionTreeViewItemId,
  type EventFunctionCommonProps,
  type EventFunctionCallbacks,
  type EventsFunctionCreationParameters,
} from './FunctionTreeViewItemContent';
import {
  BehaviorTreeViewItemContent,
  getBehaviorTreeViewItemId,
  type EventBehaviorProps,
  type EventBehaviorCallbacks,
} from './BehaviorTreeViewItemContent';
import {
  ObjectTreeViewItemContent,
  getObjectTreeViewItemId,
  type EventObjectProps,
  type EventObjectCallbacks,
} from './ObjectTreeViewItemContent';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';

const gd: libGDevelop = global.gd;

export const extensionObjectsRootFolderId = 'extension-objects';
export const extensionBehaviorsRootFolderId = 'extension-behaviors';
export const extensionFunctionsRootFolderId = 'extension-functions';
const extensionObjectsEmptyPlaceholderId = 'extension-objects-placeholder';
const extensionBehaviorsEmptyPlaceholderId = 'extension-behaviors-placeholder';
const extensionFunctionsEmptyPlaceholderId = 'extension-functions-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

const extensionItemReactDndType = 'GD_EXTENSION_ITEM';

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getThumbnail(): ?string;
  getDataset(): ?HTMLDataset;
  onSelect(): void;
  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate>;
  getRightButton(): ?MenuButton;
  renderLeftComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  delete(): void;
  getIndex(): number;
  moveAt(destinationIndex: number): void;
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer;
  getFunctionInsertionIndex(): number;
  getEventsFunction(): ?gdEventsFunction;
  getEventsBasedBehavior(): ?gdEventsBasedBehavior;
  getEventsBasedObject(): ?gdEventsBasedObject;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: TreeViewItemContent;
  getChildren(i18n: I18nType): ?Array<TreeViewItem>;
}

export type TreeItemProps = {|
  forceUpdate: () => void,
  forceUpdateList: () => void,
  unsavedChanges?: ?UnsavedChanges,
  preferences: Preferences,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
|};

class ObjectTreeViewItem implements TreeViewItem {
  content: ObjectTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    content: ObjectTreeViewItemContent,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedObject = this.content.object;
    const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
    const eventFunctionProps = {
      eventsBasedObject,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    const functions = eventsBasedObject.getEventsFunctions();
    const functionsCount = functions.getEventsFunctionsCount();
    return functionsCount === 0
      ? [
          new PlaceHolderTreeViewItem(
            new PlaceHolderTreeViewItemContent(
              'events-object-functions-placeholder.' +
                eventsBasedObject.getName(),
              i18n._(t`Start by adding a new function.`)
            )
          ),
        ]
      : mapFor(
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
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    content: BehaviorTreeViewItemContent,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedBehavior = this.content.behavior;
    const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
    const eventFunctionProps = {
      eventsBasedBehavior,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    const functionsCount = eventsFunctionsContainer.getEventsFunctionsCount();
    return functionsCount === 0
      ? [
          new PlaceHolderTreeViewItem(
            new PlaceHolderTreeViewItemContent(
              'events-behavior-functions-placeholder.' +
                eventsBasedBehavior.getName(),
              i18n._(t`Start by adding a new function.`)
            )
          ),
        ]
      : mapFor(
          0,
          eventsFunctionsContainer.getEventsFunctionsCount(),
          i =>
            new LeafTreeViewItem(
              new FunctionTreeViewItemContent(
                eventsFunctionsContainer.getEventsFunctionAt(i),
                eventFunctionProps
              )
            )
        );
  }
}

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItem implements TreeViewItem {
  isPlaceholder = true;
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;

  constructor(id: string, label: string | React.Node) {
    this.id = id;
    this.label = label;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getFunctionInsertionIndex(): number {
    // It's never used;
    return 0;
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return null;
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

  onSelect(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }

  getRightButton(): ?MenuButton {
    return null;
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    // It's not actually used.
    return false;
  }
}

class RootTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: MenuButton;

  constructor(id: string, label: string | React.Node, rightButton: MenuButton) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) => [
      {
        label: rightButton.label,
        click: rightButton.click,
      },
    ];
    this.rightButton = rightButton;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(): ?MenuButton {
    return this.rightButton;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getFunctionInsertionIndex(): number {
    // It's never used;
    return 0;
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return null;
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

  onSelect(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return this.buildMenuTemplateFunction(i18n, index);
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }
}

const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId(index);
const getTreeViewItemChildren = (i18n: I18nType) => (item: TreeViewItem) =>
  item.getChildren(i18n);
const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemData = (item: TreeViewItem) => item.content.getDataset();
const buildMenuTemplate = (i18n: I18nType) => (
  item: TreeViewItem,
  index: number
) => item.content.buildMenuTemplate(i18n, index);
const renderTreeViewItemLeftComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderLeftComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const deleteItem = (item: TreeViewItem) => {
  item.content.delete();
};
const getTreeViewItemRightButton = (item: TreeViewItem) =>
  item.content.getRightButton();

export type EventsFunctionsListInterface = {|
  forceUpdateList: () => void,
  renameObjectFolderOrObjectWithContext: TreeViewItem => void,
|};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  unsavedChanges?: ?UnsavedChanges,
  // Objects
  selectedEventsBasedObject: ?gdEventsBasedObject,
  ...EventObjectCallbacks,
  // Behaviors
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  ...EventBehaviorCallbacks,
  // Free functions
  selectedEventsFunction: ?gdEventsFunction,
  ...EventFunctionCallbacks,
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
      onSelectEventsBasedBehavior,
      onDeleteEventsBasedBehavior,
      onRenameEventsBasedBehavior,
      onEventsBasedBehaviorRenamed,
      onEventsBasedBehaviorPasted,
      onSelectEventsBasedObject,
      onDeleteEventsBasedObject,
      onRenameEventsBasedObject,
      onEventsBasedObjectRenamed,
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
    const { getShowEventBasedObjectsEditor } = preferences;
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const windowWidth = useResponsiveWindowWidth();
    const isMobileScreen = windowWidth === 'small';
    const { showDeleteConfirmation } = useAlertDialog();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      renameObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext => {
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectFolderOrObjectWithContext);
      },
    }));

    const [searchText, setSearchText] = React.useState('');

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const editName = React.useCallback(
      (itemId: string) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobileScreen) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItemFromId(itemId, 'start');
          }
          treeView.renameItemFromId(itemId);
        }
      },
      [isMobileScreen]
    );

    const eventFunctionCommonProps = React.useMemo<EventFunctionCommonProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        unsavedChanges,
        preferences,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        canRename,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
      }),
      [
        canRename,
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        forceUpdateList,
        onAddEventsFunction,
        onDeleteEventsFunction,
        onEventsFunctionAdded,
        onRenameEventsFunction,
        onSelectEventsFunction,
        preferences,
        project,
        scrollToItem,
        showDeleteConfirmation,
        unsavedChanges,
      ]
    );

    const setSelectionToFunction = React.useCallback(
      (
        eventsFunction: gdEventsFunction,
        eventsBasedBehavior: ?gdEventsBasedBehavior,
        eventsBasedObject: ?gdEventsBasedObject
      ) => {
        const eventsBasedEntity = eventsBasedBehavior || eventsBasedObject;
        const eventsFunctionsContainer = eventsBasedEntity
          ? eventsBasedEntity.getEventsFunctions()
          : eventsFunctionsExtension;
        const eventFunctionProps = {
          eventsBasedObject,
          eventsFunctionsContainer,
          ...eventFunctionCommonProps,
        };
        setSelectedItems([
          new LeafTreeViewItem(
            new FunctionTreeViewItemContent(eventsFunction, eventFunctionProps)
          ),
        ]);
        onSelectEventsFunction(
          eventsFunction,
          eventsBasedBehavior,
          eventsBasedObject
        );
      },
      [
        eventFunctionCommonProps,
        eventsFunctionsExtension,
        onSelectEventsFunction,
      ]
    );

    const addNewEventsFunction = React.useCallback(
      (itemContent: ?TreeViewItemContent) => {
        const eventsFunctionsContainer = itemContent
          ? itemContent.getEventsFunctionsContainer() ||
            eventsFunctionsExtension
          : eventsFunctionsExtension;

        const index = itemContent && itemContent.getFunctionInsertionIndex();

        // Let EventsFunctionsExtensionEditor knows if the function is:
        // a free function, a behavior one or an object one.
        // It shows a different dialog according to this.
        const eventsBasedBehavior = itemContent
          ? itemContent.getEventsBasedBehavior()
          : null;
        if (eventsBasedBehavior) {
          onSelectEventsBasedBehavior(eventsBasedBehavior);
        }
        const eventsBasedObject = itemContent
          ? itemContent.getEventsBasedObject()
          : null;
        if (eventsBasedObject) {
          onSelectEventsBasedObject(eventsBasedObject);
        }

        onAddEventsFunction(
          eventsBasedBehavior,
          eventsBasedObject,
          (parameters: ?EventsFunctionCreationParameters) => {
            if (!parameters) {
              return;
            }

            const eventsFunctionName =
              parameters.name ||
              newNameGenerator('Function', name =>
                eventsFunctionsContainer.hasEventsFunctionNamed(name)
              );

            const eventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
              eventsFunctionName,
              index || eventsFunctionsContainer.getEventsFunctionsCount()
            );
            eventsFunction.setFunctionType(parameters.functionType);

            if (
              eventsFunction.isCondition() &&
              !eventsFunction.isExpression()
            ) {
              gd.PropertyFunctionGenerator.generateConditionSkeleton(
                project,
                eventsFunction
              );
            }

            const functionItemId = getFunctionTreeViewItemId(eventsFunction);

            if (treeViewRef.current) {
              treeViewRef.current.openItems([
                itemContent
                  ? itemContent.getId()
                  : extensionFunctionsRootFolderId,
              ]);
            }
            // Scroll to the new function.
            // Ideally, we'd wait for the list to be updated to scroll, but
            // to simplify the code, we just wait a few ms for a new render
            // to be done.
            setTimeout(() => {
              scrollToItem(functionItemId);
            }, 100); // A few ms is enough for a new render to be done.

            onEventsFunctionAdded(eventsFunction);
            if (unsavedChanges) {
              unsavedChanges.triggerUnsavedChanges();
            }
            forceUpdate();

            // We focus it so the user can edit the name directly.
            setSelectionToFunction(
              eventsFunction,
              eventsBasedBehavior,
              eventsBasedObject
            );
            if (canRename(eventsFunction)) {
              editName(functionItemId);
            }
          }
        );
      },
      [
        canRename,
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        onAddEventsFunction,
        onEventsFunctionAdded,
        onSelectEventsBasedBehavior,
        onSelectEventsBasedObject,
        project,
        setSelectionToFunction,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

    const eventBehaviorProps = React.useMemo<EventBehaviorProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedBehaviorsList: eventBasedBehaviors,
        unsavedChanges,
        preferences,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsBasedBehavior,
        onDeleteEventsBasedBehavior,
        onRenameEventsBasedBehavior,
        onEventsBasedBehaviorRenamed,
        onEventsBasedBehaviorPasted,
        addNewEventsFunction,
      }),
      [
        addNewEventsFunction,
        editName,
        eventBasedBehaviors,
        eventsFunctionsExtension,
        forceUpdate,
        forceUpdateList,
        onDeleteEventsBasedBehavior,
        onEventsBasedBehaviorPasted,
        onEventsBasedBehaviorRenamed,
        onRenameEventsBasedBehavior,
        onSelectEventsBasedBehavior,
        preferences,
        project,
        scrollToItem,
        showDeleteConfirmation,
        unsavedChanges,
      ]
    );

    const eventObjectProps = React.useMemo<EventObjectProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedObjectsList: eventBasedObjects,
        unsavedChanges,
        preferences,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        addNewEventsFunction,
      }),
      [
        project,
        eventsFunctionsExtension,
        eventBasedObjects,
        unsavedChanges,
        preferences,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        addNewEventsFunction,
      ]
    );

    const setSelectionToBehavior = React.useCallback(
      (eventsBasedBehavior: gdEventsBasedBehavior) => {
        setSelectedItems([
          new BehaviorTreeViewItem(
            new BehaviorTreeViewItemContent(
              eventsBasedBehavior,
              eventBehaviorProps
            ),
            eventFunctionCommonProps
          ),
        ]);
        onSelectEventsBasedBehavior(eventsBasedBehavior);
      },
      [
        eventBehaviorProps,
        eventFunctionCommonProps,
        onSelectEventsBasedBehavior,
      ]
    );

    const addNewEventsBehavior = React.useCallback(
      () => {
        const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

        const name = newNameGenerator('MyBehavior', name =>
          eventBasedBehaviors.has(name)
        );
        const newEventsBasedBehavior = eventBasedBehaviors.insertNew(
          name,
          eventBasedBehaviors.getCount()
        );
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }
        forceUpdate();

        const behaviorItemId = getBehaviorTreeViewItemId(
          newEventsBasedBehavior
        );

        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            behaviorItemId,
            extensionBehaviorsRootFolderId,
          ]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(behaviorItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        setSelectionToBehavior(newEventsBasedBehavior);
        editName(behaviorItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        scrollToItem,
        setSelectionToBehavior,
        unsavedChanges,
      ]
    );

    const setSelectionToObject = React.useCallback(
      (eventsBasedObject: gdEventsBasedObject) => {
        setSelectedItems([
          new ObjectTreeViewItem(
            new ObjectTreeViewItemContent(eventsBasedObject, eventObjectProps),
            eventFunctionCommonProps
          ),
        ]);
        onSelectEventsBasedObject(eventsBasedObject);
      },
      [eventFunctionCommonProps, eventObjectProps, onSelectEventsBasedObject]
    );

    const addNewEventsObject = React.useCallback(
      () => {
        const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();

        const name = newNameGenerator('MyObject', name =>
          eventBasedObjects.has(name)
        );
        const newEventsBasedObject = eventBasedObjects.insertNew(
          name,
          eventBasedObjects.getCount()
        );
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }
        forceUpdate();

        const objectItemId = getObjectTreeViewItemId(newEventsBasedObject);

        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            objectItemId,
            extensionObjectsRootFolderId,
          ]);
        }
        // Scroll to the new function.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        setSelectionToObject(newEventsBasedObject);
        editName(objectItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        scrollToItem,
        setSelectionToObject,
        unsavedChanges,
      ]
    );

    const onTreeModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
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
            if (selectedItems.length > 0) {
              deleteItem(selectedItems[0]);
            }
          });
        }
      },
      [selectedItems]
    );

    const objectTreeViewItems = mapFor(
      0,
      eventBasedObjects.size(),
      i =>
        new ObjectTreeViewItem(
          new ObjectTreeViewItemContent(
            eventBasedObjects.at(i),
            eventObjectProps
          ),
          eventFunctionCommonProps
        )
    );
    const behaviorTreeViewItems = mapFor(
      0,
      eventBasedBehaviors.size(),
      i =>
        new BehaviorTreeViewItem(
          new BehaviorTreeViewItemContent(
            eventBasedBehaviors.at(i),
            eventBehaviorProps
          ),
          eventFunctionCommonProps
        )
    );
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return [
          getShowEventBasedObjectsEditor()
            ? {
                isRoot: true,
                content: new RootTreeViewItemContent(
                  extensionObjectsRootFolderId,
                  i18n._(t`Objects`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add an object`),
                    click: addNewEventsObject,
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  return objectTreeViewItems.length === 0
                    ? [
                        new PlaceHolderTreeViewItem(
                          new PlaceHolderTreeViewItemContent(
                            extensionObjectsEmptyPlaceholderId,
                            i18n._(t`Start by adding a new object.`)
                          )
                        ),
                      ]
                    : objectTreeViewItems;
                },
              }
            : null,
          {
            isRoot: true,
            content: new RootTreeViewItemContent(
              extensionBehaviorsRootFolderId,
              i18n._(t`Behaviors`),
              {
                icon: <Add />,
                label: i18n._(t`Add a behavior`),
                click: addNewEventsBehavior,
              }
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              return behaviorTreeViewItems.length === 0
                ? [
                    new PlaceHolderTreeViewItem(
                      new PlaceHolderTreeViewItemContent(
                        extensionBehaviorsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new behavior.`)
                      )
                    ),
                  ]
                : behaviorTreeViewItems;
            },
          },
          {
            isRoot: true,
            content: new RootTreeViewItemContent(
              extensionFunctionsRootFolderId,
              i18n._(t`Functions`),
              {
                icon: <Add />,
                label: i18n._(t`Add a function`),
                click: () => addNewEventsFunction(null),
              }
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              if (eventsFunctionsExtension.getEventsFunctionsCount() === 0) {
                return [
                  new PlaceHolderTreeViewItem(
                    new PlaceHolderTreeViewItemContent(
                      extensionFunctionsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new function.`)
                    )
                  ),
                ];
              }
              const freeFunctionProps = {
                eventsFunctionsContainer: eventsFunctionsExtension,
                ...eventFunctionCommonProps,
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
        ].filter(Boolean);
      },
      [
        addNewEventsBehavior,
        addNewEventsFunction,
        addNewEventsObject,
        behaviorTreeViewItems,
        eventFunctionCommonProps,
        eventsFunctionsExtension,
        objectTreeViewItems,
        getShowEventBasedObjectsEditor,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) =>
        selectedItems.every(item => {
          if (
            item.content.getEventsFunction() &&
            destinationItem.content.getEventsFunction()
          ) {
            // Functions from the same container
            return (
              item.content.getEventsFunctionsContainer() ===
              destinationItem.content.getEventsFunctionsContainer()
            );
          }
          // Behaviors or Objects
          return (
            (item.content.getEventsBasedBehavior() &&
              destinationItem.content.getEventsBasedBehavior()) ||
            (item.content.getEventsBasedObject() &&
              destinationItem.content.getEventsBasedObject())
          );
        }),
      [selectedItems]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (selectedItems.length === 0) {
          return;
        }
        const selectedItem = selectedItems[0];
        selectedItem.content.moveAt(
          destinationItem.content.getIndex() + (where === 'after' ? 1 : 0)
        );
        onTreeModified(true);
      },
      [onTreeModified, selectedItems]
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback(
      (item: TreeViewItem) => {
        if (selectedItems.length !== 1 || item.isPlaceholder) {
          return;
        }
        if (selectedItems[0].content.isDescendantOf(item.content)) {
          setSelectedItems([]);
          onSelectEventsFunction(null, null, null);
        }
      },
      [selectedItems, onSelectEventsFunction]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsFunctionsExtension.ptr;
    const initiallyOpenedNodeIds = [
      extensionObjectsRootFolderId,
      extensionBehaviorsRootFolderId,
      extensionFunctionsRootFolderId,
      ...objectTreeViewItems.map(item => item.content.getId()),
      ...behaviorTreeViewItems.map(item => item.content.getId()),
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
                placeholder={t`Search functions`}
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
                      getItemChildren={getTreeViewItemChildren(i18n)}
                      multiSelect={false}
                      getItemId={getTreeViewItemId}
                      getItemHtmlId={getTreeViewItemHtmlId}
                      getItemDataset={getTreeViewItemData}
                      onEditItem={editItem}
                      onCollapseItem={onCollapseItem}
                      selectedItems={selectedItems}
                      onSelectItems={items => {
                        const itemToSelect = items[0];
                        if (!itemToSelect) return;
                        if (itemToSelect.isRoot) return;
                        itemToSelect.content.onSelect();
                        setSelectedItems(items);
                      }}
                      onRenameItem={renameItem}
                      buildMenuTemplate={buildMenuTemplate(i18n)}
                      getItemRightButton={getTreeViewItemRightButton}
                      renderLeftComponent={renderTreeViewItemLeftComponent(
                        i18n
                      )}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={extensionItemReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      arrowKeyNavigationProps={arrowKeyNavigationProps}
                      forceDefaultDraggingPreview
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
              onClick={() =>
                addNewEventsFunction(
                  selectedItems.length === 0 ? null : selectedItems[0].content
                )
              }
              id="add-new-function-button"
              icon={<Add />}
            />
          </Column>
        </Line>
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
  prevProps.selectedEventsFunction === nextProps.selectedEventsFunction &&
  prevProps.project === nextProps.project &&
  prevProps.eventsFunctionsExtension === nextProps.eventsFunctionsExtension;

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
