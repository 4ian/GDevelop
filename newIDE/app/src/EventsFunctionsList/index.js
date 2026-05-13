// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import CompactSearchBar from '../UI/CompactSearchBar';
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
  type EventsFunctionProps,
  type EventsFunctionCallbacks,
  type EventsFunctionCreationParameters,
} from './EventsFunctionTreeViewItemContent';
import {
  EventsFunctionFolderTreeViewItemContent,
  getEventsFunctionFolderTreeViewItemId,
  expandAllSubfolders,
  type EventFunctionFolderCommonProps,
  type EventsFunctionFolderProps,
} from './EventsFunctionFolderTreeViewItemContent';
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
  type EventsBasedObjectCreationParameters,
} from './EventsBasedObjectTreeViewItemContent';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import {
  getFoldersAscendanceWithoutRootFolder,
  enumerateFoldersInContainer,
} from './EnumerateFunctionFolderOrFunction';

const gd: libGDevelop = global.gd;

export const extensionConfigurationRootFolderId = 'extension-configuration';
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

const extensionPropertiesItemId = 'extension-properties';
const extensionGlobalVariablesItemId = 'extension-global-variables';
const extensionSceneVariablesItemId = 'extension-scene-variables';

export const getTreeViewItemIdFromFunctionFolderOrFunction = (
  functionFolderOrFunction: gdFunctionFolderOrFunction
): string => {
  return functionFolderOrFunction.isFolder()
    ? getEventsFunctionFolderTreeViewItemId(functionFolderOrFunction)
    : getEventsFunctionTreeViewItemId(functionFolderOrFunction.getFunction());
};

export const getRootId = (
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject
): string => {
  return eventsBasedBehavior
    ? extensionBehaviorsRootFolderId
    : eventsBasedObject
    ? extensionObjectsRootFolderId
    : extensionFunctionsRootFolderId;
};

export const getRootFunctionFolderId = (
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject
): string => {
  return eventsBasedBehavior
    ? getEventsBasedBehaviorTreeViewItemId(eventsBasedBehavior)
    : eventsBasedObject
    ? getObjectTreeViewItemId(eventsBasedObject)
    : extensionFunctionsRootFolderId;
};

export const getRootFunctionFolder = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject
): gdFunctionFolderOrFunction => {
  return (eventsBasedObject || eventsBasedBehavior || eventsFunctionsExtension)
    .getEventsFunctions()
    .getRootFolder();
};

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getThumbnail(): ?string;
  getDataset(): ?HTMLDataset;
  onSelect(): void;
  onClick(): void;
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
  moveAt(
    destinationItemContent: TreeViewItemContent,
    where: 'before' | 'inside' | 'after',
    animateFolder: (folder: gdFunctionFolderOrFunction) => void
  ): void;
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer;
  getFunctionFolderOrFunction(): gdFunctionFolderOrFunction | null;
  getEventsFunction(): ?gdEventsFunction;
  getEventsBasedBehavior(): ?gdEventsBasedBehavior;
  getEventsBasedObject(): ?gdEventsBasedObject;
}

interface TreeViewItem {
  isRoot: boolean;
  isPlaceholder: boolean;
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
|};

const createTreeViewItem = ({
  functionFolderOrFunction,
  functionFolderTreeViewItemProps,
  functionTreeViewItemProps,
}: {|
  functionFolderOrFunction: gdFunctionFolderOrFunction,
  functionFolderTreeViewItemProps: EventsFunctionFolderProps,
  functionTreeViewItemProps: EventsFunctionProps,
|}): TreeViewItem => {
  if (functionFolderOrFunction.isFolder()) {
    return new EventsFunctionFolderTreeViewItem({
      functionFolderOrFunction: functionFolderOrFunction,
      functionFolderTreeViewItemProps,
      functionTreeViewItemProps,
      content: new EventsFunctionFolderTreeViewItemContent(
        functionFolderOrFunction,
        functionFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new EventsFunctionTreeViewItemContent(
        functionFolderOrFunction,
        functionTreeViewItemProps
      )
    );
  }
};

class LeafTreeViewItem implements TreeViewItem {
  isRoot = false;
  isPlaceholder = false;
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItem implements TreeViewItem {
  isRoot = false;
  isPlaceholder = true;
  content: TreeViewItemContent;

  constructor(id: string, label: string | React.Node) {
    this.content = new LabelTreeViewItemContent(id, label);
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class EventsFunctionFolderTreeViewItem implements TreeViewItem {
  isRoot = false;
  isPlaceholder = false;
  content: TreeViewItemContent;
  functionFolderOrFunction: gdFunctionFolderOrFunction;
  placeholder: ?PlaceHolderTreeViewItem;
  functionFolderTreeViewItemProps: EventsFunctionFolderProps;
  functionTreeViewItemProps: EventsFunctionProps;

  constructor({
    functionFolderOrFunction,
    content,
    placeholder,
    functionFolderTreeViewItemProps,
    functionTreeViewItemProps,
  }: {|
    functionFolderOrFunction: gdFunctionFolderOrFunction,
    content: TreeViewItemContent,
    placeholder?: PlaceHolderTreeViewItem,
    functionFolderTreeViewItemProps: EventsFunctionFolderProps,
    functionTreeViewItemProps: EventsFunctionProps,
  |}) {
    this.content = content;
    this.functionFolderOrFunction = functionFolderOrFunction;
    this.placeholder = placeholder;
    this.functionFolderTreeViewItemProps = functionFolderTreeViewItemProps;
    this.functionTreeViewItemProps = functionTreeViewItemProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    if (this.functionFolderOrFunction.getChildrenCount() === 0) {
      return this.placeholder ? [this.placeholder] : [];
    }
    return mapFor(0, this.functionFolderOrFunction.getChildrenCount(), i => {
      const child = this.functionFolderOrFunction.getChildAt(i);
      return createTreeViewItem({
        functionFolderOrFunction: child,
        functionFolderTreeViewItemProps: this.functionFolderTreeViewItemProps,
        functionTreeViewItemProps: this.functionTreeViewItemProps,
      });
    });
  }
}

class EventsBasedObjectTreeViewItem implements TreeViewItem {
  isRoot = false;
  isPlaceholder = false;
  content: EventsBasedObjectTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;
  eventsFunctionFolderProps: EventFunctionFolderCommonProps;

  constructor(
    object: gdEventsBasedObject,
    props: EventsBasedObjectProps,
    eventFunctionProps: EventFunctionCommonProps,
    eventsFunctionFolderProps: EventFunctionFolderCommonProps
  ) {
    this.content = new EventsBasedObjectTreeViewItemContent(object, props);
    this.eventFunctionProps = eventFunctionProps;
    this.eventsFunctionFolderProps = eventsFunctionFolderProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedObject = this.content.eventsBasedObject;
    const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
    const eventFunctionProps: EventsFunctionProps = {
      eventsBasedObject,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    const eventFunctionFolderProps: EventsFunctionFolderProps = {
      eventsBasedObject,
      eventsFunctionsContainer,
      ...this.eventsFunctionFolderProps,
    };
    const rootFolder = eventsFunctionsContainer.getRootFolder();
    const childrenCount = rootFolder.getChildrenCount();
    return childrenCount === 0
      ? [
          new PlaceHolderTreeViewItem(
            'events-object-functions-placeholder.' +
              eventsBasedObject.getName(),
            i18n._(t`Start by adding a new function.`)
          ),
        ]
      : mapFor(0, childrenCount, i => {
          const child = rootFolder.getChildAt(i);
          return createTreeViewItem({
            functionFolderOrFunction: child,
            functionFolderTreeViewItemProps: eventFunctionFolderProps,
            functionTreeViewItemProps: eventFunctionProps,
          });
        });
  }
}

class BehaviorTreeViewItem implements TreeViewItem {
  isRoot = false;
  isPlaceholder = false;
  content: EventsBasedBehaviorTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;
  eventsFunctionFolderProps: EventFunctionFolderCommonProps;

  constructor(
    behavior: gdEventsBasedBehavior,
    props: EventsBasedBehaviorProps,
    eventFunctionProps: EventFunctionCommonProps,
    eventsFunctionFolderProps: EventFunctionFolderCommonProps
  ) {
    this.content = new EventsBasedBehaviorTreeViewItemContent(behavior, props);
    this.eventFunctionProps = eventFunctionProps;
    this.eventsFunctionFolderProps = eventsFunctionFolderProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    const eventsBasedBehavior = this.content.eventsBasedBehavior;
    const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
    const eventFunctionProps: EventsFunctionProps = {
      eventsBasedBehavior,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    const eventFunctionFolderProps: EventsFunctionFolderProps = {
      eventsBasedBehavior,
      eventsFunctionsContainer,
      ...this.eventsFunctionFolderProps,
    };
    const rootFolder = eventsFunctionsContainer.getRootFolder();
    const childrenCount = rootFolder.getChildrenCount();
    return childrenCount === 0
      ? [
          new PlaceHolderTreeViewItem(
            'events-behavior-functions-placeholder.' +
              eventsBasedBehavior.getName(),
            i18n._(t`Start by adding a new function.`)
          ),
        ]
      : mapFor(0, childrenCount, i => {
          const child = rootFolder.getChildAt(i);
          return createTreeViewItem({
            functionFolderOrFunction: child,
            functionFolderTreeViewItemProps: eventFunctionFolderProps,
            functionTreeViewItemProps: eventFunctionProps,
          });
        });
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
    rightButton?: MenuButton,
    menuItems?: Array<MenuItemTemplate>
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
            ...(menuItems ? menuItems : []),
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

  getFunctionFolderOrFunction(): gdFunctionFolderOrFunction | null {
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

  onClick(): void {}

  // $FlowFixMe[missing-local-annot]
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

  moveAt(
    destinationItemContent: TreeViewItemContent,
    where: 'before' | 'inside' | 'after',
    animateFolder: (folder: gdFunctionFolderOrFunction) => void
  ): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }
}

class ActionTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  thumbnail: ?string;
  onClickCallback: () => void;

  constructor(
    id: string,
    label: string | React.Node,
    onClickCallback: () => void,
    thumbnail?: string
  ) {
    this.id = id;
    this.label = label;
    this.onClickCallback = onClickCallback;
    this.thumbnail = thumbnail;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) => [];
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getFunctionFolderOrFunction(): gdFunctionFolderOrFunction | null {
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
    return this.id;
  }

  getDataset(): ?HTMLDataset {
    return {};
  }

  onSelect(): void {}

  getThumbnail(): ?string {
    return this.thumbnail;
  }

  onClick(): void {
    this.onClickCallback();
  }

  // $FlowFixMe[missing-local-annot]
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

  moveAt(
    destinationItemContent: TreeViewItemContent,
    where: 'before' | 'inside' | 'after',
    animateFolder: (folder: gdFunctionFolderOrFunction) => void
  ): void {}

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
): Array<MenuItemTemplate> => item.content.buildMenuTemplate(i18n, index);
const renderTreeViewItemRightComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderRightComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const onClickItem = (item: TreeViewItem) => {
  item.content.onClick();
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
  onSelectExtensionProperties: () => void,
  onSelectExtensionGlobalVariables: () => void,
  onSelectExtensionSceneVariables: () => void,
  onEventBasedObjectTypeChanged: () => void,
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
      onEventsBasedObjectPasted,
      onAddEventsBasedObject,
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
      forceUpdateEditor,
      onSelectExtensionProperties,
      onSelectExtensionGlobalVariables,
      onSelectExtensionSceneVariables,
      onOpenCustomObjectEditor,
      onEventBasedObjectTypeChanged,
    }: Props,
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);

    // gdFunctionFolderOrFunction instances are the same from one refresh to
    // another (contrary to TreeViewItem) so we can use it in functions without
    // making refresh loops.
    const selectedFunctionFolderOrFunction = React.useMemo<gdFunctionFolderOrFunction | null>(
      () =>
        selectedItems[0]
          ? selectedItems[0].content.getFunctionFolderOrFunction()
          : null,
      [selectedItems]
    );

    const setSelectedFunctionFolderOrFunction = React.useRef<
      (
        functionFolderOrFunction: gdFunctionFolderOrFunction | null,
        eventsBasedBehavior: ?gdEventsBasedBehavior,
        eventsBasedObject: ?gdEventsBasedObject
      ) => void
    >(() => {});

    const preferences = React.useContext(PreferencesContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
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
        parentFolder,
      }: {|
        itemContent: ?TreeViewItemContent,
        eventsBasedBehavior: ?gdEventsBasedBehavior,
        eventsBasedObject: ?gdEventsBasedObject,
        parentFolder: gdFunctionFolderOrFunction,
      |}) => {
        const eventBasedEntity = eventsBasedBehavior || eventsBasedObject;
        const eventsFunctionsContainer = eventBasedEntity
          ? eventBasedEntity.getEventsFunctions()
          : eventsFunctionsExtension.getEventsFunctions();

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

            let insertionParentFolder = parentFolder;
            let insertionIndex = parentFolder.getChildrenCount();
            if (
              selectedFunctionFolderOrFunction &&
              selectedFunctionFolderOrFunction.isADescendantOf(parentFolder)
            ) {
              if (selectedFunctionFolderOrFunction.isFolder()) {
                insertionParentFolder = selectedFunctionFolderOrFunction;
                insertionIndex = selectedFunctionFolderOrFunction.getChildrenCount();
              } else {
                insertionParentFolder = selectedFunctionFolderOrFunction.getParent();
                insertionIndex =
                  insertionParentFolder.getChildPosition(
                    selectedFunctionFolderOrFunction
                  ) + 1;
              }
            }
            const eventsFunction = eventsFunctionsContainer.insertNewEventsFunctionInFolder(
              eventsFunctionName,
              insertionParentFolder,
              insertionIndex
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

            onEventsFunctionAdded(
              eventsFunction,
              eventsBasedBehavior,
              eventsBasedObject
            );
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
        eventsFunctionsExtension,
        onAddEventsFunction,
        onSelectEventsBasedBehavior,
        onSelectEventsBasedObject,
        selectedFunctionFolderOrFunction,
        onEventsFunctionAdded,
        unsavedChanges,
        forceUpdate,
        onSelectEventsFunction,
        project,
        scrollToItem,
        editName,
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
        onAddEventsBasedObject(
          (parameters: ?EventsBasedObjectCreationParameters) => {
            if (!parameters) {
              return;
            }

            const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();

            const name = newNameGenerator('MyObject', name =>
              eventBasedObjects.has(name)
            );
            const newEventsBasedObject = eventBasedObjects.insertNew(
              name,
              eventBasedObjects.getCount()
            );
            newEventsBasedObject.markAsRenderedIn3D(parameters.isRenderedIn3D);
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
            onEventBasedObjectTypeChanged();
          }
        );
      },
      [
        onAddEventsBasedObject,
        eventsFunctionsExtension,
        unsavedChanges,
        forceUpdate,
        onSelectEventsBasedObject,
        editName,
        scrollToItem,
        onEventBasedObjectTypeChanged,
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

    const treeItemProps = React.useMemo<TreeItemProps>(
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
      ]
    );

    const getClosestVisibleParentId = (
      functionFolderOrFunction: gdFunctionFolderOrFunction
    ): ?string => {
      const treeView = treeViewRef.current;
      if (!treeView) return null;
      const topToBottomAscendanceId = getFoldersAscendanceWithoutRootFolder(
        functionFolderOrFunction
      )
        .reverse()
        .map(parent =>
          getEventsFunctionFolderTreeViewItemId(functionFolderOrFunction)
        );
      const topToBottomAscendanceOpenness = treeView.areItemsOpenFromId(
        topToBottomAscendanceId
      );
      const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(
        false
      );
      if (firstClosedFolderIndex === -1) {
        // If all parents are open, return the functionFolderOrFunction given as input.
        return getTreeViewItemIdFromFunctionFolderOrFunction(
          functionFolderOrFunction
        );
      }
      // $FlowFixMe[incompatible-type] - We are confident this TreeView item is in fact a FunctionFolderOrFunctionWithContext
      return topToBottomAscendanceId[firstClosedFolderIndex];
    };

    const addFolder = React.useCallback(
      (
        items: Array<gdFunctionFolderOrFunction>,
        eventsBasedBehavior?: ?gdEventsBasedBehavior,
        eventsBasedObject?: ?gdEventsBasedObject
      ) => {
        let newFunctionFolderOrFunction;
        if (items.length === 1) {
          const selectedFunctionFolderOrFunction = items[0];
          if (selectedFunctionFolderOrFunction.isFolder()) {
            const newFolder = selectedFunctionFolderOrFunction.insertNewFolder(
              'New folder',
              0
            );
            newFunctionFolderOrFunction = newFolder;
            if (treeViewRef.current) {
              treeViewRef.current.openItems([
                getEventsFunctionFolderTreeViewItemId(items[0]),
              ]);
            }
          } else {
            const parentFolder = selectedFunctionFolderOrFunction.getParent();
            const newFolder = parentFolder.insertNewFolder(
              'New folder',
              parentFolder.getChildPosition(selectedFunctionFolderOrFunction) +
                1
            );
            newFunctionFolderOrFunction = newFolder;
          }
        } else {
          const rootFolder = getRootFunctionFolder(
            eventsFunctionsExtension,
            eventsBasedBehavior,
            eventsBasedObject
          );
          const newFolder = rootFolder.insertNewFolder('New folder', 0);
          newFunctionFolderOrFunction = newFolder;
        }
        setSelectedFunctionFolderOrFunction.current(
          newFunctionFolderOrFunction
        );
        const itemsToOpen = getFoldersAscendanceWithoutRootFolder(
          newFunctionFolderOrFunction
        ).map(folder => getEventsFunctionFolderTreeViewItemId(folder));
        itemsToOpen.push(
          getRootFunctionFolderId(eventsBasedBehavior, eventsBasedObject)
        );
        if (treeViewRef.current) treeViewRef.current.openItems(itemsToOpen);

        editName(
          getEventsFunctionFolderTreeViewItemId(newFunctionFolderOrFunction)
        );
        forceUpdateList();
      },
      [editName, forceUpdateList, eventsFunctionsExtension]
    );

    const onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer = React.useCallback(
      (functionFolderOrFunction: gdFunctionFolderOrFunction) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          const closestVisibleParentId = getClosestVisibleParentId(
            functionFolderOrFunction
          );
          if (closestVisibleParentId) {
            treeView.animateItemFromId(closestVisibleParentId);
          }
        }
        onTreeModified(true);
      },
      [onTreeModified]
    );

    const expandFolders = React.useCallback(
      (functionFolderOrFunctionList: Array<gdFunctionFolderOrFunction>) => {
        if (treeViewRef.current) {
          treeViewRef.current.openItems(
            functionFolderOrFunctionList.map(functionFolderOrFunction =>
              getEventsFunctionFolderTreeViewItemId(functionFolderOrFunction)
            )
          );
        }
      },
      []
    );

    const eventFunctionCommonProps = React.useMemo<EventFunctionCommonProps>(
      () => ({
        ...treeItemProps,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
        addFolder,
        onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
      }),
      [
        treeItemProps,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
        addFolder,
        onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
      ]
    );

    const eventFunctionFolderCommonProps = React.useMemo<EventFunctionFolderCommonProps>(
      () => ({
        ...treeItemProps,
        showDeleteConfirmation,
        expandFolders,
        addFolder,
        addNewEventsFunction,
        onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
        setSelectedFunctionFolderOrFunction:
          setSelectedFunctionFolderOrFunction.current,
        onEventsFunctionAdded,
        onSelectEventsFunction,
      }),
      [
        treeItemProps,
        showDeleteConfirmation,
        expandFolders,
        addFolder,
        addNewEventsFunction,
        onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
        onEventsFunctionAdded,
        onSelectEventsFunction,
      ]
    );

    const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

    const eventBasedBehaviorProps = React.useMemo<EventsBasedBehaviorProps>(
      () => ({
        ...treeItemProps,
        eventsBasedBehaviorsList: eventBasedBehaviors,
        onSelectEventsBasedBehavior,
        onDeleteEventsBasedBehavior,
        onRenameEventsBasedBehavior,
        onEventsBasedBehaviorRenamed,
        onEventsBasedBehaviorPasted,
        addNewEventsFunction,
        addFolder,
        expandFolders,
      }),
      [
        treeItemProps,
        eventBasedBehaviors,
        onSelectEventsBasedBehavior,
        onDeleteEventsBasedBehavior,
        onRenameEventsBasedBehavior,
        onEventsBasedBehaviorRenamed,
        onEventsBasedBehaviorPasted,
        addNewEventsFunction,
        addFolder,
        expandFolders,
      ]
    );

    const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();

    const eventsBasedObjectProps = React.useMemo<EventsBasedObjectProps>(
      () => ({
        ...treeItemProps,
        eventsBasedObjectsList: eventBasedObjects,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        onEventsBasedObjectPasted,
        onAddEventsBasedObject,
        addNewEventsFunction,
        addFolder,
        expandFolders,
        onOpenCustomObjectEditor,
        onEventBasedObjectTypeChanged,
      }),
      [
        treeItemProps,
        eventBasedObjects,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        onEventsBasedObjectPasted,
        onAddEventsBasedObject,
        addNewEventsFunction,
        addFolder,
        expandFolders,
        onOpenCustomObjectEditor,
        onEventBasedObjectTypeChanged,
      ]
    );

    const objectTreeViewItems = mapFor(
      0,
      eventBasedObjects.size(),
      i =>
        new EventsBasedObjectTreeViewItem(
          eventBasedObjects.at(i),
          eventsBasedObjectProps,
          eventFunctionCommonProps,
          eventFunctionFolderCommonProps
        )
    );
    const behaviorTreeViewItems = mapFor(
      0,
      eventBasedBehaviors.size(),
      i =>
        new BehaviorTreeViewItem(
          eventBasedBehaviors.at(i),
          eventBasedBehaviorProps,
          eventFunctionCommonProps,
          eventFunctionFolderCommonProps
        )
    );
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        // $FlowFixMe[incompatible-type]
        return [
          {
            isRoot: true,
            content: new LabelTreeViewItemContent(
              extensionConfigurationRootFolderId,
              i18n._(t`Extension`)
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              return [
                new LeafTreeViewItem(
                  new ActionTreeViewItemContent(
                    extensionPropertiesItemId,
                    i18n._(t`Properties`),
                    onSelectExtensionProperties,
                    'res/icons_default/properties_black.svg'
                  )
                ),
                new LeafTreeViewItem(
                  new ActionTreeViewItemContent(
                    extensionGlobalVariablesItemId,
                    i18n._(t`Extension global variables`),
                    onSelectExtensionGlobalVariables,
                    'res/icons_default/global_variable24_black.svg'
                  )
                ),
                new LeafTreeViewItem(
                  new ActionTreeViewItemContent(
                    extensionSceneVariablesItemId,
                    i18n._(t`Extension scene variables`),
                    onSelectExtensionSceneVariables,
                    'res/icons_default/scene_variable24_black.svg'
                  )
                ),
              ];
            },
          },
          {
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
                : // $FlowFixMe[incompatible-type]
                  objectTreeViewItems;
            },
          },
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
                : // $FlowFixMe[incompatible-type]
                  behaviorTreeViewItems;
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
                  addNewEventsFunction({
                    itemContent: null,
                    eventsBasedBehavior: null,
                    eventsBasedObject: null,
                    parentFolder: eventsFunctionsExtension
                      .getEventsFunctions()
                      .getRootFolder(),
                  });
                },
              },
              [
                {
                  label: i18n._(t`Add a new folder`),
                  click: () =>
                    addFolder([
                      eventsFunctionsExtension
                        .getEventsFunctions()
                        .getRootFolder(),
                    ]),
                },
                { type: 'separator' },
                {
                  label: i18n._(t`Expand all sub folders`),
                  click: () =>
                    expandAllSubfolders(
                      eventsFunctionsExtension
                        .getEventsFunctions()
                        .getRootFolder(),
                      expandFolders
                    ),
                },
              ]
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              const freeEventsFunctions = eventsFunctionsExtension.getEventsFunctions();
              if (freeEventsFunctions.getEventsFunctionsCount() === 0) {
                return [
                  new PlaceHolderTreeViewItem(
                    extensionFunctionsEmptyPlaceholderId,
                    i18n._(t`Start by adding a new function.`)
                  ),
                ];
              }
              const freeFunctionProps: EventsFunctionProps = {
                eventsFunctionsContainer: freeEventsFunctions,
                ...eventFunctionCommonProps,
              };
              const freeFunctionFolderProps: EventsFunctionFolderProps = {
                eventsFunctionsContainer: freeEventsFunctions,
                ...eventFunctionFolderCommonProps,
              };
              const rootFolder = freeEventsFunctions.getRootFolder();
              const childrenCount = rootFolder.getChildrenCount();
              return mapFor(0, childrenCount, i => {
                const child = rootFolder.getChildAt(i);
                return createTreeViewItem({
                  functionFolderOrFunction: child,
                  functionFolderTreeViewItemProps: freeFunctionFolderProps,
                  functionTreeViewItemProps: freeFunctionProps,
                });
              });
            },
          },
        ].filter(Boolean);
      },
      [
        addNewEventsBasedObject,
        addNewEventsBehavior,
        onSelectExtensionProperties,
        onSelectExtensionGlobalVariables,
        onSelectExtensionSceneVariables,
        objectTreeViewItems,
        behaviorTreeViewItems,
        addNewEventsFunction,
        eventsFunctionsExtension,
        addFolder,
        expandFolders,
        eventFunctionCommonProps,
        eventFunctionFolderCommonProps,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem, where: 'before' | 'inside' | 'after') =>
        selectedItems.every(item => {
          if (item.content.getFunctionFolderOrFunction()) {
            // Functions from the same container
            return (
              destinationItem.content.getFunctionFolderOrFunction() &&
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
        if (destinationItem.isRoot || selectedItems.length !== 1) {
          return;
        }
        const selectedItem = selectedItems[0];

        const animateFolder = (folder: gdFunctionFolderOrFunction) => {
          const treeView = treeViewRef.current;
          if (!treeView) {
            return;
          }
          const closestVisibleParentId = getClosestVisibleParentId(folder);
          if (closestVisibleParentId) {
            treeView.animateItemFromId(closestVisibleParentId);
          }
        };
        selectedItem.content.moveAt(
          destinationItem.content,
          where,
          animateFolder
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
      extensionConfigurationRootFolderId,
      ...objectTreeViewItems.map(item => item.content.getId()),
      ...behaviorTreeViewItems.map(item => item.content.getId()),
      ...objectTreeViewItems
        .map(item =>
          enumerateFoldersInContainer(
            item.content.getEventsFunctionsContainer()
          ).map(({ folder }) => getEventsFunctionFolderTreeViewItemId(folder))
        )
        .flat(),
      ...behaviorTreeViewItems
        .map(item =>
          enumerateFoldersInContainer(
            item.content.getEventsFunctionsContainer()
          ).map(({ folder }) => getEventsFunctionFolderTreeViewItemId(folder))
        )
        .flat(),
      ...enumerateFoldersInContainer(
        eventsFunctionsExtension.getEventsFunctions()
      ).map(({ folder }) => getEventsFunctionFolderTreeViewItemId(folder)),
    ];

    // TODO Unify selection handling
    // - Add a function to set the selection in useImperativeHandle which
    //   handles both folders and behaviors or objects.
    // - Remove properties:
    //   - selectedEventsFunction
    //   - selectedEventsBasedBehavior
    //   - selectedEventsBasedObject

    // It would avoid a circular dependency with functionsTreeViewItemProps
    // if setSelectedFunctionFolderOrFunction where used in useImperativeHandle.
    React.useEffect(
      () => {
        setSelectedFunctionFolderOrFunction.current = (
          functionFolderOrFunction: gdFunctionFolderOrFunction | null,
          eventsBasedBehavior: ?gdEventsBasedBehavior,
          eventsBasedObject: ?gdEventsBasedObject
        ) => {
          if (!functionFolderOrFunction) {
            setSelectedItems([]);
            onSelectEventsFunction(null, null, null);
            return;
          }
          const functionItemId = getTreeViewItemIdFromFunctionFolderOrFunction(
            functionFolderOrFunction
          );
          setSelectedItems(selectedItems => {
            if (
              selectedItems.length === 1 &&
              selectedItems[0].content.getId() === functionItemId
            ) {
              return selectedItems;
            }
            const eventsBasedEntity =
              selectedEventsBasedBehavior || selectedEventsBasedObject;
            const eventsFunctionsContainer = eventsBasedEntity
              ? eventsBasedEntity.getEventsFunctions()
              : eventsFunctionsExtension.getEventsFunctions();
            const eventFunctionProps: EventsFunctionProps = {
              eventsBasedObject,
              eventsBasedBehavior,
              eventsFunctionsContainer,
              ...eventFunctionCommonProps,
            };
            const eventFunctionFolderProps: EventsFunctionFolderProps = {
              eventsBasedObject,
              eventsBasedBehavior,
              eventsFunctionsContainer,
              ...eventFunctionFolderCommonProps,
            };
            return [
              createTreeViewItem({
                functionFolderOrFunction,
                functionTreeViewItemProps: eventFunctionProps,
                functionFolderTreeViewItemProps: eventFunctionFolderProps,
              }),
            ].filter(Boolean);
          });
          scrollToItem(functionItemId);
        };
      },
      [
        scrollToItem,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
        eventsFunctionsExtension,
        eventFunctionCommonProps,
        eventFunctionFolderCommonProps,
        onSelectEventsFunction,
      ]
    );

    React.useEffect(
      () => {
        // TODO Use a map from itemId to item to avoid to rebuild the item.
        if (selectedEventsFunction) {
          const eventsBasedEntity =
            selectedEventsBasedBehavior || selectedEventsBasedObject;
          const eventsFunctionsContainer = eventsBasedEntity
            ? eventsBasedEntity.getEventsFunctions()
            : eventsFunctionsExtension.getEventsFunctions();
          const eventFunctionProps = {
            eventsBasedBehavior: selectedEventsBasedBehavior,
            eventsBasedObject: selectedEventsBasedObject,
            eventsFunctionsContainer,
            ...eventFunctionCommonProps,
          };
          const rootFunctionFolder = getRootFunctionFolder(
            eventsFunctionsExtension,
            selectedEventsBasedBehavior,
            selectedEventsBasedObject
          );

          setSelectedItems([
            new LeafTreeViewItem(
              new EventsFunctionTreeViewItemContent(
                rootFunctionFolder.getFunctionNamed(
                  selectedEventsFunction.getName()
                ),
                eventFunctionProps
              )
            ),
          ]);
        } else if (selectedEventsBasedBehavior) {
          setSelectedItems([
            new BehaviorTreeViewItem(
              selectedEventsBasedBehavior,
              eventBasedBehaviorProps,
              eventFunctionCommonProps,
              eventFunctionFolderCommonProps
            ),
          ]);
        } else if (selectedEventsBasedObject) {
          setSelectedItems([
            new EventsBasedObjectTreeViewItem(
              selectedEventsBasedObject,
              eventsBasedObjectProps,
              eventFunctionCommonProps,
              eventFunctionFolderCommonProps
            ),
          ]);
        } else {
          setSelectedItems([]);
        }
      },
      // We only update the tree selection when the displayed content is changed.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
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
              <CompactSearchBar
                value={searchText}
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
                    // $FlowFixMe[incompatible-type]
                    // $FlowFixMe[incompatible-exact]
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
                      onClickItem={onClickItem}
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

// $FlowFixMe[incompatible-type]
const MemoizedObjectsList = React.memo<Props, EventsFunctionsListInterface>(
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  EventsFunctionsList,
  arePropsEqual
);

const EventsFunctionsListWithErrorBoundary: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<EventsFunctionsListInterface>,
}> = React.forwardRef<Props, EventsFunctionsListInterface>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Objects list</Trans>}
    scope="scene-editor-objects-list"
  >
    {/* $FlowFixMe[incompatible-type] */}
    <MemoizedObjectsList ref={ref} {...props} />
  </ErrorBoundary>
));

export default EventsFunctionsListWithErrorBoundary;
