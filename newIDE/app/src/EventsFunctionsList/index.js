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
import { Column } from '../UI/Grid';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import {
  EventsFunctionTreeViewItemContent,
  getEventsFunctionTreeViewItemId,
  canFunctionBeRenamed,
  type EventFunctionCommonProps,
  type EventsFunctionCallbacks,
  type EventsFunctionCreationParameters,
} from './EventsFunctionTreeViewItemContent';
import {
  EventsBasedBehaviorTreeViewItemContent,
  getEventsBasedBehaviorTreeViewItemId,
  type EventsBasedBehaviorProps,
  type EventsBasedBehaviorCallbacks,
} from './EventsBasedBehaviorTreeViewItemContent';
import {
  EventsBasedObjectTreeViewItemContent,
  getObjectTreeViewItemId,
  type EventsBasedObjectProps,
  type EventsBasedObjectCallbacks,
} from './EventsBasedObjectTreeViewItemContent';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';

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
  getRightButton(i18n: I18nType): ?MenuButton;
  renderRightComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  delete(): void;
  copy(): void;
  paste(): void;
  cut(): void;
  getIndex(): number;
  moveAt(destinationIndex: number): void;
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer;
  getEventsFunction(): ?gdEventsFunction;
  getEventsBasedBehavior(): ?gdEventsBasedBehavior;
  getEventsBasedObject(): ?gdEventsBasedObject;
  addFunctionAtSelection(): void;
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
  forceUpdateEditor: () => void,
  preferences: Preferences,
  gdevelopTheme: GDevelopTheme,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  selectedEventsBasedObject: ?gdEventsBasedObject,
  selectedEventsFunction: ?gdEventsFunction,
|};

class EventsBasedObjectTreeViewItem implements TreeViewItem {
  content: EventsBasedObjectTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    object: gdEventsBasedObject,
    props: EventsBasedObjectProps,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = new EventsBasedObjectTreeViewItemContent(object, props);
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedObject = this.content.eventsBasedObject;
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
            'events-object-functions-placeholder.' +
              eventsBasedObject.getName(),
            i18n._(t`Start by adding a new function.`)
          ),
        ]
      : mapFor(
          0,
          functions.getEventsFunctionsCount(),
          i =>
            new LeafTreeViewItem(
              new EventsFunctionTreeViewItemContent(
                functions.getEventsFunctionAt(i),
                eventFunctionProps
              )
            )
        );
  }
}

class BehaviorTreeViewItem implements TreeViewItem {
  content: EventsBasedBehaviorTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    behavior: gdEventsBasedBehavior,
    props: EventsBasedBehaviorProps,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = new EventsBasedBehaviorTreeViewItemContent(behavior, props);
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedBehavior = this.content.eventsBasedBehavior;
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
            'events-behavior-functions-placeholder.' +
              eventsBasedBehavior.getName(),
            i18n._(t`Start by adding a new function.`)
          ),
        ]
      : mapFor(
          0,
          eventsFunctionsContainer.getEventsFunctionsCount(),
          i =>
            new LeafTreeViewItem(
              new EventsFunctionTreeViewItemContent(
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

  constructor(id: string, label: string | React.Node) {
    this.content = new LabelTreeViewItemContent(id, label);
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: ?MenuButton;

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      rightButton
        ? [
            {
              label: rightButton.label,
              click: rightButton.click,
            },
          ]
        : [];
    this.rightButton = rightButton;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return this.rightButton;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
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

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  addFunctionAtSelection(
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject,
    selectedEventsFunction: ?gdEventsFunction
  ): void {}
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
const renderTreeViewItemRightComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderRightComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const deleteItem = (item: TreeViewItem) => {
  item.content.delete();
};
const getTreeViewItemRightButton = (i18n: I18nType) => (item: TreeViewItem) =>
  item.content.getRightButton(i18n);

export type EventsFunctionsListInterface = {|
  forceUpdateList: () => void,
|};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  unsavedChanges?: ?UnsavedChanges,
  forceUpdateEditor: () => void,
  // Objects
  selectedEventsBasedObject: ?gdEventsBasedObject,
  ...EventsBasedObjectCallbacks,
  // Behaviors
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  ...EventsBasedBehaviorCallbacks,
  // Free functions
  selectedEventsFunction: ?gdEventsFunction,
  ...EventsFunctionCallbacks,
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
      forceUpdateEditor,
    }: Props,
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);

    const preferences = React.useContext(PreferencesContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { getShowEventBasedObjectsEditor } = preferences;
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
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
          if (isMobile) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItemFromId(itemId, 'start');
          }
          treeView.renameItemFromId(itemId);
        }
      },
      [isMobile]
    );

    const addNewEventsFunction = React.useCallback(
      ({
        itemContent,
        eventsBasedBehavior,
        eventsBasedObject,
        index,
      }: {|
        itemContent: ?TreeViewItemContent,
        eventsBasedBehavior: ?gdEventsBasedBehavior,
        eventsBasedObject: ?gdEventsBasedObject,
        index: number,
      |}) => {
        const eventBasedEntity = eventsBasedBehavior || eventsBasedObject;
        const eventsFunctionsContainer = eventBasedEntity
          ? eventBasedEntity.getEventsFunctions()
          : eventsFunctionsExtension;

        // Let EventsFunctionsExtensionEditor know if the function is:
        // a free function, a behavior one or an object one.
        // It shows a different dialog according to this.
        if (eventsBasedBehavior) {
          onSelectEventsBasedBehavior(eventsBasedBehavior);
        }
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

            const functionItemId = getEventsFunctionTreeViewItemId(
              eventsFunction
            );

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
            onSelectEventsFunction(
              eventsFunction,
              eventsBasedBehavior,
              eventsBasedObject
            );
            if (
              canFunctionBeRenamed(
                eventsFunction,
                eventsBasedBehavior
                  ? 'behavior'
                  : eventsBasedObject
                  ? 'object'
                  : 'extension'
              )
            ) {
              editName(functionItemId);
            }
          }
        );
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        onAddEventsFunction,
        onEventsFunctionAdded,
        onSelectEventsBasedBehavior,
        onSelectEventsBasedObject,
        project,
        onSelectEventsFunction,
        scrollToItem,
        unsavedChanges,
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

        const behaviorItemId = getEventsBasedBehaviorTreeViewItemId(
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
        onSelectEventsBasedBehavior(newEventsBasedBehavior);
        editName(behaviorItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        scrollToItem,
        onSelectEventsBasedBehavior,
        unsavedChanges,
      ]
    );

    const addNewEventsBasedObject = React.useCallback(
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
        onSelectEventsBasedObject(newEventsBasedObject);
        editName(objectItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        scrollToItem,
        onSelectEventsBasedObject,
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
    // instance does not update with selectedItems changes.
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
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            if (selectedItems.length > 0) {
              editName(selectedItems[0].content.getId());
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onCopy', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.copy();
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onPaste', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.paste();
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onCut', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.cut();
            }
          });
        }
      },
      [editName, selectedItems]
    );

    const eventFunctionCommonProps = React.useMemo<EventFunctionCommonProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        unsavedChanges,
        preferences,
        forceUpdateEditor,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      }),
      [
        project,
        eventsFunctionsExtension,
        unsavedChanges,
        preferences,
        forceUpdateEditor,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      ]
    );

    const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

    const eventBasedBehaviorProps = React.useMemo<EventsBasedBehaviorProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedBehaviorsList: eventBasedBehaviors,
        unsavedChanges,
        forceUpdateEditor,
        preferences,
        gdevelopTheme,
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
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      }),
      [
        project,
        eventsFunctionsExtension,
        eventBasedBehaviors,
        unsavedChanges,
        forceUpdateEditor,
        preferences,
        gdevelopTheme,
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
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      ]
    );

    const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();

    const eventsBasedObjectProps = React.useMemo<EventsBasedObjectProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedObjectsList: eventBasedObjects,
        unsavedChanges,
        preferences,
        forceUpdateEditor,
        gdevelopTheme,
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
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      }),
      [
        project,
        eventsFunctionsExtension,
        eventBasedObjects,
        unsavedChanges,
        preferences,
        forceUpdateEditor,
        gdevelopTheme,
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
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      ]
    );

    const objectTreeViewItems = mapFor(
      0,
      eventBasedObjects.size(),
      i =>
        new EventsBasedObjectTreeViewItem(
          eventBasedObjects.at(i),
          eventsBasedObjectProps,
          eventFunctionCommonProps
        )
    );
    const behaviorTreeViewItems = mapFor(
      0,
      eventBasedBehaviors.size(),
      i =>
        new BehaviorTreeViewItem(
          eventBasedBehaviors.at(i),
          eventBasedBehaviorProps,
          eventFunctionCommonProps
        )
    );
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return [
          getShowEventBasedObjectsEditor()
            ? {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  extensionObjectsRootFolderId,
                  i18n._(t`Objects`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add an object`),
                    click: addNewEventsBasedObject,
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  return objectTreeViewItems.length === 0
                    ? [
                        new PlaceHolderTreeViewItem(
                          extensionObjectsEmptyPlaceholderId,
                          i18n._(t`Start by adding a new object.`)
                        ),
                      ]
                    : objectTreeViewItems;
                },
              }
            : null,
          {
            isRoot: true,
            content: new LabelTreeViewItemContent(
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
                      extensionBehaviorsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new behavior.`)
                    ),
                  ]
                : behaviorTreeViewItems;
            },
          },
          {
            isRoot: true,
            content: new LabelTreeViewItemContent(
              extensionFunctionsRootFolderId,
              i18n._(t`Functions`),
              {
                icon: <Add />,
                label: i18n._(t`Add a function`),
                click: () => {
                  const index =
                    !selectedEventsBasedBehavior &&
                    !selectedEventsBasedObject &&
                    selectedEventsFunction
                      ? eventsFunctionsExtension.getEventsFunctionPosition(
                          selectedEventsFunction
                        ) + 1
                      : eventsFunctionsExtension.getEventsFunctionsCount();
                  addNewEventsFunction({
                    itemContent: null,
                    eventsBasedBehavior: null,
                    eventsBasedObject: null,
                    index,
                  });
                },
              }
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              if (eventsFunctionsExtension.getEventsFunctionsCount() === 0) {
                return [
                  new PlaceHolderTreeViewItem(
                    extensionFunctionsEmptyPlaceholderId,
                    i18n._(t`Start by adding a new function.`)
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
                    new EventsFunctionTreeViewItemContent(
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
        getShowEventBasedObjectsEditor,
        addNewEventsBasedObject,
        addNewEventsBehavior,
        objectTreeViewItems,
        behaviorTreeViewItems,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
        eventsFunctionsExtension,
        addNewEventsFunction,
        eventFunctionCommonProps,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem, where: 'before' | 'inside' | 'after') =>
        selectedItems.every(item => {
          if (item.content.getEventsFunction()) {
            // Functions from the same container
            return (
              destinationItem.content.getEventsFunction() &&
              item.content.getEventsFunctionsContainer() ===
                destinationItem.content.getEventsFunctionsContainer()
            );
          }
          // Behaviors or Objects
          return (
            !destinationItem.content.getEventsFunction() &&
            where !== 'inside' &&
            ((item.content.getEventsBasedBehavior() &&
              destinationItem.content.getEventsBasedBehavior()) ||
              (item.content.getEventsBasedObject() &&
                destinationItem.content.getEventsBasedObject()))
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

    React.useEffect(
      () => {
        // TODO Use a map from itemId to item to avoid to rebuild the item.
        if (selectedEventsFunction) {
          const eventsBasedEntity =
            selectedEventsBasedBehavior || selectedEventsBasedObject;
          const eventsFunctionsContainer = eventsBasedEntity
            ? eventsBasedEntity.getEventsFunctions()
            : eventsFunctionsExtension;
          const eventFunctionProps = {
            eventsBasedBehavior: selectedEventsBasedBehavior,
            eventsBasedObject: selectedEventsBasedObject,
            eventsFunctionsContainer,
            ...eventFunctionCommonProps,
          };
          setSelectedItems([
            new LeafTreeViewItem(
              new EventsFunctionTreeViewItemContent(
                selectedEventsFunction,
                eventFunctionProps
              )
            ),
          ]);
        } else if (selectedEventsBasedBehavior) {
          setSelectedItems([
            new BehaviorTreeViewItem(
              selectedEventsBasedBehavior,
              eventBasedBehaviorProps,
              eventFunctionCommonProps
            ),
          ]);
        } else if (selectedEventsBasedObject) {
          setSelectedItems([
            new EventsBasedObjectTreeViewItem(
              selectedEventsBasedObject,
              eventsBasedObjectProps,
              eventFunctionCommonProps
            ),
          ]);
        } else {
          setSelectedItems([]);
        }
      },
      [
        eventBasedBehaviorProps,
        eventFunctionCommonProps,
        eventsBasedObjectProps,
        eventsFunctionsExtension,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        selectedEventsFunction,
      ]
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
                      getItemRightButton={getTreeViewItemRightButton(i18n)}
                      renderRightComponent={renderTreeViewItemRightComponent(
                        i18n
                      )}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={extensionItemReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      forceDefaultDraggingPreview
                      shouldHideMenuIcon={() => true}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to the tree is made outside
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
