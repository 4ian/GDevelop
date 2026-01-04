// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import newNameGenerator from '../../Utils/NewNameGenerator';
import UnsavedChangesContext, {
  type UnsavedChanges,
} from '../../MainFrame/UnsavedChangesContext';
import ErrorBoundary from '../../UI/ErrorBoundary';
import useForceUpdate from '../../Utils/UseForceUpdate';

import { AutoSizer } from 'react-virtualized';
import Background from '../../UI/Background';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../../UI/TreeView';
import PreferencesContext, {
  type Preferences,
} from '../../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../../UI/Grid';
import Add from '../../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../../Utils/MapFor';
import KeyboardShortcuts from '../../UI/KeyboardShortcuts';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  EventsBasedEntityPropertyTreeViewItemContent,
  getEventsBasedEntityPropertyTreeViewItemId,
  type EventsBasedEntityPropertyTreeViewItemProps,
} from './EventsBasedEntityPropertyTreeViewItemContent';
import {
  EventsBasedEntityPropertyFolderTreeViewItemContent,
  getEventsBasedEntityPropertyFolderTreeViewItemId,
  expandAllSubfolders,
  type EventsBasedEntityPropertyFolderTreeViewItemProps,
} from './EventsBasedEntityPropertyFolderTreeViewItemContent';
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../../UI/Alert/AlertContext';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../../UI/Theme';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import { ColumnStackLayout } from '../../UI/Layout';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import {
  getFoldersAscendanceWithoutRootFolder,
  enumerateFoldersInContainer,
} from './EnumeratePropertyFolderOrProperty';

const configurationItemId = 'events-based-entity-configuration';
export const propertiesRootFolderId = 'properties';
export const sharedPropertiesRootFolderId = 'shared-properties';

const propertiesEmptyPlaceholderId = 'properties-placeholder';
const sharedPropertiesEmptyPlaceholderId = 'shared-properties-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 8px 8px 8px',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

const extensionItemReactDndType = 'GD_EXTENSION_ITEM';

export const getTreeViewItemIdFromPropertyFolderOrProperty = (
  propertyFolderOrObject: gdPropertyFolderOrProperty,
  isSharedProperties: boolean
): string => {
  return propertyFolderOrObject.isFolder()
    ? getEventsBasedEntityPropertyFolderTreeViewItemId(propertyFolderOrObject)
    : getEventsBasedEntityPropertyTreeViewItemId(
        propertyFolderOrObject.getProperty(),
        isSharedProperties
      );
};

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): ?HTMLDataset;
  getThumbnail(): ?string;
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
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  isSibling(itemContent: TreeViewItemContent): boolean;
  getRootId(): string;
  getPropertyFolderOrProperty(): gdPropertyFolderOrProperty | null;
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
  gdevelopTheme: GDevelopTheme,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
|};

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

const createTreeViewItem = ({
  propertyFolderOrProperty,
  propertyFolderTreeViewItemProps,
  propertyTreeViewItemProps,
}: {|
  propertyFolderOrProperty: gdPropertyFolderOrProperty,
  propertyFolderTreeViewItemProps: EventsBasedEntityPropertyFolderTreeViewItemProps,
  propertyTreeViewItemProps: EventsBasedEntityPropertyTreeViewItemProps,
|}): TreeViewItem => {
  if (propertyFolderOrProperty.isFolder()) {
    return new PropertyFolderTreeViewItem({
      propertyFolderOrProperty: propertyFolderOrProperty,
      isRoot: false,
      propertyFolderTreeViewItemProps,
      propertyTreeViewItemProps,
      content: new EventsBasedEntityPropertyFolderTreeViewItemContent(
        propertyFolderOrProperty,
        propertyFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new EventsBasedEntityPropertyTreeViewItemContent(
        propertyFolderOrProperty,
        propertyTreeViewItemProps
      )
    );
  }
};

class PropertyFolderTreeViewItem implements TreeViewItem {
  isRoot: boolean;
  isPlaceholder = false;
  content: TreeViewItemContent;
  propertyFolderOrProperty: gdPropertyFolderOrProperty;
  placeholder: ?PlaceHolderTreeViewItem;
  propertyFolderTreeViewItemProps: EventsBasedEntityPropertyFolderTreeViewItemProps;
  propertyTreeViewItemProps: EventsBasedEntityPropertyTreeViewItemProps;

  constructor({
    propertyFolderOrProperty,
    isRoot,
    content,
    placeholder,
    propertyFolderTreeViewItemProps,
    propertyTreeViewItemProps,
  }: {|
    propertyFolderOrProperty: gdPropertyFolderOrProperty,
    isRoot: boolean,
    content: TreeViewItemContent,
    placeholder?: PlaceHolderTreeViewItem,
    propertyFolderTreeViewItemProps: EventsBasedEntityPropertyFolderTreeViewItemProps,
    propertyTreeViewItemProps: EventsBasedEntityPropertyTreeViewItemProps,
  |}) {
    this.isRoot = isRoot;
    this.content = content;
    this.propertyFolderOrProperty = propertyFolderOrProperty;
    this.placeholder = placeholder;
    this.propertyFolderTreeViewItemProps = propertyFolderTreeViewItemProps;
    this.propertyTreeViewItemProps = propertyTreeViewItemProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    if (this.propertyFolderOrProperty.getChildrenCount() === 0) {
      return this.placeholder ? [this.placeholder] : [];
    }
    return mapFor(0, this.propertyFolderOrProperty.getChildrenCount(), i => {
      const child = this.propertyFolderOrProperty.getChildAt(i);
      return createTreeViewItem({
        propertyFolderOrProperty: child,
        propertyFolderTreeViewItemProps: this.propertyFolderTreeViewItemProps,
        propertyTreeViewItemProps: this.propertyTreeViewItemProps,
      });
    });
  }
}

class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  dataSet: { [string]: string };
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: ?MenuButton;

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton,
    buildMenuTemplateFunction?: () => Array<MenuItemTemplate>
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      [
        rightButton
          ? {
              id: rightButton.id,
              label: i18n._(rightButton.label),
              click: rightButton.click,
              enabled: rightButton.enabled,
            }
          : null,
        ...(buildMenuTemplateFunction ? buildMenuTemplateFunction() : []),
      ].filter(Boolean);
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

  getHtmlId(index: number): ?string {
    return this.id;
  }

  getDataSet(): ?HTMLDataset {
    return null;
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {}

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

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
  }

  getPropertyFolderOrProperty(): gdPropertyFolderOrProperty | null {
    return null;
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

  getHtmlId(index: number): ?string {
    return this.id;
  }

  getDataSet(): ?HTMLDataset {
    return null;
  }

  getThumbnail(): ?string {
    return this.thumbnail;
  }

  onClick(): void {
    this.onClickCallback();
  }

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

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
  }

  getPropertyFolderOrProperty(): gdPropertyFolderOrProperty | null {
    return null;
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
const getTreeViewItemDataSet = (item: TreeViewItem) =>
  item.content.getDataSet();
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

export const usePropertyOverridingAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (existingPropertyNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing properties`,
      message: t`These properties already exist:${'\n\n - ' +
        existingPropertyNames.join('\n\n - ') +
        '\n\n'}Do you want to replace them?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

export type PropertyListEditorInterface = {|
  forceUpdateList: () => void,
  focusSearchBar: () => void,
  setSelectedProperty: (
    propertyName: string,
    isSharedProperties: boolean
  ) => void,
  getSelectedProperty: () => {|
    propertyName: string,
    isSharedProperties: boolean,
  |} | null,
|};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  extension: gdEventsFunctionsExtension,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  onPropertiesUpdated: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onOpenConfiguration: () => void,
  onOpenProperty: (name: string, isSharedProperties: boolean) => void,
  onEventsFunctionsAdded: () => void,
|};

const PropertyListEditor = React.forwardRef<Props, PropertyListEditorInterface>(
  (
    {
      project,
      projectScopedContainersAccessor,
      extension,
      eventsBasedBehavior,
      eventsBasedObject,
      onPropertiesUpdated,
      onRenameProperty,
      onOpenConfiguration,
      onOpenProperty,
      onEventsFunctionsAdded,
    },
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);

    const setSelectedPropertyFolderOrProperty = React.useRef<
      (
        propertyFolderOrProperty: gdPropertyFolderOrProperty | null,
        isSharedProperties: boolean
      ) => void
    >((propertyFolderOrProperty, isSharedProperties) => {});

    const unsavedChanges = React.useContext(UnsavedChangesContext);
    const { triggerUnsavedChanges } = unsavedChanges;
    const preferences = React.useContext(PreferencesContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const { showDeleteConfirmation } = useAlertDialog();
    const showPropertyOverridingConfirmation = usePropertyOverridingAlertDialog();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [searchText, setSearchText] = React.useState('');

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const searchBarRef = React.useRef<?SearchBarInterface>(null);

    const onProjectItemModified = React.useCallback(
      () => {
        forceUpdate();
        triggerUnsavedChanges();
      },
      [forceUpdate, triggerUnsavedChanges]
    );

    const eventsBasedEntity = eventsBasedBehavior || eventsBasedObject;
    const properties = eventsBasedEntity
      ? eventsBasedEntity.getPropertyDescriptors()
      : null;
    const sharedProperties = eventsBasedBehavior
      ? eventsBasedBehavior.getSharedPropertyDescriptors()
      : null;

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

    const addProperty = React.useCallback(
      (
        properties: gdPropertiesContainer,
        isSharedProperties: boolean,
        parentFolder: gdPropertyFolderOrProperty,
        index: number
      ) => {
        if (!properties) return;

        const newName = newNameGenerator('Property', name =>
          properties.has(name)
        );
        const property = properties.insertNewPropertyInFolder(
          newName,
          parentFolder,
          index
        );
        property.setType('Number');

        onPropertiesUpdated();

        onProjectItemModified();
        setSearchText('');

        const propertyItemId = getEventsBasedEntityPropertyTreeViewItemId(
          property,
          isSharedProperties
        );
        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            propertyItemId,
            isSharedProperties
              ? sharedPropertiesRootFolderId
              : propertiesRootFolderId,
          ]);
        }
        // Scroll to the new property.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(propertyItemId);
          onOpenProperty(newName, isSharedProperties);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(propertyItemId);
      },
      [
        onPropertiesUpdated,
        onProjectItemModified,
        editName,
        scrollToItem,
        onOpenProperty,
      ]
    );

    const onTreeModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        triggerUnsavedChanges();
        onPropertiesUpdated();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, onPropertiesUpdated, triggerUnsavedChanges]
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

    const getClosestVisibleParentId = (
      propertyFolderOrProperty: gdPropertyFolderOrProperty,
      isSharedProperties: boolean
    ): ?string => {
      const treeView = treeViewRef.current;
      if (!treeView) return null;
      const topToBottomAscendanceId = getFoldersAscendanceWithoutRootFolder(
        propertyFolderOrProperty
      )
        .reverse()
        .map(parent =>
          getEventsBasedEntityPropertyFolderTreeViewItemId(
            propertyFolderOrProperty
          )
        );
      const topToBottomAscendanceOpenness = treeView.areItemsOpenFromId(
        topToBottomAscendanceId
      );
      const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(
        false
      );
      if (firstClosedFolderIndex === -1) {
        // If all parents are open, return the propertyFolderOrProperty given as input.
        return getTreeViewItemIdFromPropertyFolderOrProperty(
          propertyFolderOrProperty,
          isSharedProperties
        );
      }
      // $FlowFixMe - We are confident this TreeView item is in fact a PropertyFolderOrPropertyWithContext
      return topToBottomAscendanceId[firstClosedFolderIndex];
    };

    const addFolder = React.useCallback(
      (
        items: Array<gdPropertyFolderOrProperty>,
        isSharedProperties: boolean
      ) => {
        let newPropertyFolderOrProperty;
        if (items.length === 1) {
          const selectedPropertyFolderOrProperty = items[0];
          if (selectedPropertyFolderOrProperty.isFolder()) {
            const newFolder = selectedPropertyFolderOrProperty.insertNewFolder(
              'NewFolder',
              0
            );
            newPropertyFolderOrProperty = newFolder;
            if (treeViewRef.current) {
              treeViewRef.current.openItems([
                getEventsBasedEntityPropertyFolderTreeViewItemId(items[0]),
              ]);
            }
          } else {
            const parentFolder = selectedPropertyFolderOrProperty.getParent();
            const newFolder = parentFolder.insertNewFolder(
              'NewFolder',
              parentFolder.getChildPosition(selectedPropertyFolderOrProperty) +
                1
            );
            newPropertyFolderOrProperty = newFolder;
          }
        } else {
          const rootFolder = isSharedProperties
            ? sharedProperties && sharedProperties.getRootFolder()
            : properties && properties.getRootFolder();
          if (!rootFolder) {
            return;
          }
          const newFolder = rootFolder.insertNewFolder('NewFolder', 0);
          newPropertyFolderOrProperty = newFolder;
        }
        setSelectedPropertyFolderOrProperty.current(
          newPropertyFolderOrProperty,
          isSharedProperties
        );
        const itemsToOpen = getFoldersAscendanceWithoutRootFolder(
          newPropertyFolderOrProperty
        ).map(folder =>
          getEventsBasedEntityPropertyFolderTreeViewItemId(folder)
        );
        itemsToOpen.push(
          isSharedProperties
            ? sharedPropertiesRootFolderId
            : propertiesRootFolderId
        );
        if (treeViewRef.current) treeViewRef.current.openItems(itemsToOpen);

        editName(
          getEventsBasedEntityPropertyFolderTreeViewItemId(
            newPropertyFolderOrProperty
          )
        );
        forceUpdateList();
      },
      [
        setSelectedPropertyFolderOrProperty,
        editName,
        forceUpdateList,
        sharedProperties,
        properties,
      ]
    );

    const onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer = React.useCallback(
      (
        propertyFolderOrProperty: gdPropertyFolderOrProperty,
        isSharedProperties: boolean
      ) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          const closestVisibleParentId = getClosestVisibleParentId(
            propertyFolderOrProperty,
            isSharedProperties
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
      (propertyFolderOrPropertyList: Array<gdPropertyFolderOrProperty>) => {
        if (treeViewRef.current) {
          treeViewRef.current.openItems(
            propertyFolderOrPropertyList.map(propertyFolderOrProperty =>
              getEventsBasedEntityPropertyFolderTreeViewItemId(
                propertyFolderOrProperty
              )
            )
          );
        }
      },
      []
    );

    const propertiesTreeViewItemProps = React.useMemo<?EventsBasedEntityPropertyTreeViewItemProps>(
      () =>
        properties && eventsBasedEntity
          ? {
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              showPropertyOverridingConfirmation,
              editName,
              scrollToItem,
              project,
              projectScopedContainersAccessor,
              extension,
              eventsBasedEntity,
              eventsBasedBehavior,
              eventsBasedObject,
              properties,
              isSharedProperties: false,
              onOpenProperty,
              onPropertiesUpdated,
              onRenameProperty,
              onEventsFunctionsAdded,
            }
          : null,
      [
        properties,
        eventsBasedEntity,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        showPropertyOverridingConfirmation,
        editName,
        scrollToItem,
        project,
        projectScopedContainersAccessor,
        extension,
        eventsBasedBehavior,
        eventsBasedObject,
        onOpenProperty,
        onPropertiesUpdated,
        onRenameProperty,
        onEventsFunctionsAdded,
      ]
    );

    const sharedPropertiesTreeViewItemProps = React.useMemo<?EventsBasedEntityPropertyTreeViewItemProps>(
      () =>
        sharedProperties && propertiesTreeViewItemProps
          ? {
              ...propertiesTreeViewItemProps,
              properties: sharedProperties,
              isSharedProperties: true,
            }
          : null,
      [propertiesTreeViewItemProps, sharedProperties]
    );

    const propertyFolderTreeViewItemProps = React.useMemo<?EventsBasedEntityPropertyFolderTreeViewItemProps>(
      () =>
        properties
          ? {
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              showPropertyOverridingConfirmation,
              editName,
              scrollToItem,
              project,
              properties,
              isSharedProperties: false,
              onPropertiesUpdated,
              expandFolders,
              addFolder,
              addProperty,
              onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer,
              setSelectedPropertyFolderOrProperty: (
                propertyFolderOrProperty,
                isSharedProperties
              ) =>
                setSelectedPropertyFolderOrProperty.current(
                  propertyFolderOrProperty,
                  isSharedProperties
                ),
            }
          : null,
      [
        properties,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        showPropertyOverridingConfirmation,
        editName,
        scrollToItem,
        project,
        onPropertiesUpdated,
        expandFolders,
        addFolder,
        addProperty,
        onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer,
      ]
    );

    const sharedPropertyFolderTreeViewItemProps = React.useMemo<?EventsBasedEntityPropertyFolderTreeViewItemProps>(
      () =>
        sharedProperties && propertyFolderTreeViewItemProps
          ? {
              ...propertyFolderTreeViewItemProps,
              properties: sharedProperties,
              isSharedProperties: true,
            }
          : null,
      [propertyFolderTreeViewItemProps, sharedProperties]
    );

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return !properties ||
          !propertiesTreeViewItemProps ||
          !propertyFolderTreeViewItemProps
          ? []
          : [
              new LeafTreeViewItem(
                new ActionTreeViewItemContent(
                  configurationItemId,
                  i18n._(t`Configuration`),
                  onOpenConfiguration,
                  'res/icons_default/properties_black.svg'
                )
              ),
              new PropertyFolderTreeViewItem({
                propertyFolderOrProperty: properties.getRootFolder(),
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  propertiesRootFolderId,
                  eventsBasedObject
                    ? i18n._(t`Object properties`)
                    : i18n._(t`Behavior properties`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add a property`),
                    click: () => {
                      addProperty(
                        properties,
                        false,
                        properties.getRootFolder(),
                        0
                      );
                    },
                    id: 'add-property',
                  },
                  () => [
                    {
                      label: i18n._(t`Add a folder`),
                      click: () =>
                        addFolder([properties.getRootFolder()], false),
                    },
                    { type: 'separator' },
                    {
                      label: i18n._(t`Expand all sub folders`),
                      click: () =>
                        expandAllSubfolders(
                          properties.getRootFolder(),
                          expandFolders
                        ),
                    },
                  ]
                ),
                placeholder: new PlaceHolderTreeViewItem(
                  propertiesEmptyPlaceholderId,
                  i18n._(t`Start by adding a new property.`)
                ),
                propertyTreeViewItemProps: propertiesTreeViewItemProps,
                propertyFolderTreeViewItemProps,
              }),
              sharedProperties &&
              sharedPropertiesTreeViewItemProps &&
              sharedPropertyFolderTreeViewItemProps
                ? new PropertyFolderTreeViewItem({
                    propertyFolderOrProperty: sharedProperties.getRootFolder(),
                    isRoot: true,
                    content: new LabelTreeViewItemContent(
                      sharedPropertiesRootFolderId,
                      i18n._(t`Scene properties`),
                      {
                        icon: <Add />,
                        label: i18n._(t`Add a property`),
                        click: () => {
                          addProperty(
                            sharedProperties,
                            true,
                            sharedProperties.getRootFolder(),
                            0
                          );
                        },
                        id: 'add-shared-property',
                      },
                      () => [
                        {
                          label: i18n._(t`Add a folder`),
                          click: () =>
                            addFolder([sharedProperties.getRootFolder()], true),
                        },
                        { type: 'separator' },
                        {
                          label: i18n._(t`Expand all sub folders`),
                          click: () =>
                            expandAllSubfolders(
                              sharedProperties.getRootFolder(),
                              expandFolders
                            ),
                        },
                      ]
                    ),
                    placeholder: new PlaceHolderTreeViewItem(
                      sharedPropertiesEmptyPlaceholderId,
                      i18n._(t`Start by adding a new property.`)
                    ),
                    propertyTreeViewItemProps: sharedPropertiesTreeViewItemProps,
                    propertyFolderTreeViewItemProps: sharedPropertyFolderTreeViewItemProps,
                  })
                : null,
            ].filter(Boolean);
      },
      [
        addFolder,
        addProperty,
        eventsBasedObject,
        expandFolders,
        onOpenConfiguration,
        properties,
        propertiesTreeViewItemProps,
        propertyFolderTreeViewItemProps,
        sharedProperties,
        sharedPropertiesTreeViewItemProps,
        sharedPropertyFolderTreeViewItemProps,
      ]
    );

    // Avoid a circular dependency with propertiesTreeViewItemProps
    React.useEffect(
      () => {
        setSelectedPropertyFolderOrProperty.current = (
          propertyFolderOrProperty: gdPropertyFolderOrProperty | null,
          isSharedProperties: boolean
        ) => {
          if (!propertyFolderOrProperty) {
            setSelectedItems([]);
            return;
          }
          const propertyItemId = getTreeViewItemIdFromPropertyFolderOrProperty(
            propertyFolderOrProperty,
            isSharedProperties
          );
          setSelectedItems(selectedItems => {
            if (
              selectedItems.length === 1 &&
              selectedItems[0].content.getId() === propertyItemId
            ) {
              return selectedItems;
            }
            const treeViewItemProps = isSharedProperties
              ? sharedPropertiesTreeViewItemProps
              : propertiesTreeViewItemProps;
            if (!treeViewItemProps || !propertyFolderTreeViewItemProps) {
              return [];
            }
            return [
              createTreeViewItem({
                propertyFolderOrProperty,
                propertyFolderTreeViewItemProps,
                propertyTreeViewItemProps: treeViewItemProps,
              }),
            ].filter(Boolean);
          });
          scrollToItem(propertyItemId);
        };
      },
      [
        propertiesTreeViewItemProps,
        propertyFolderTreeViewItemProps,
        scrollToItem,
        sharedPropertiesTreeViewItemProps,
      ]
    );

    const setSelectedProperty = React.useCallback(
      (propertyName: string, isSharedProperties: boolean) => {
        const propertiesContainer = isSharedProperties
          ? sharedProperties
          : properties;
        if (!propertiesContainer || !propertiesContainer.has(propertyName)) {
          return;
        }
        const property = propertiesContainer.get(propertyName);
        setSelectedPropertyFolderOrProperty.current(
          propertiesContainer
            .getRootFolder()
            .getPropertyNamed(property.getName()),
          isSharedProperties
        );
      },
      [properties, sharedProperties]
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      focusSearchBar: () => {
        if (searchBarRef.current) searchBarRef.current.focus();
      },
      setSelectedProperty,
      getSelectedProperty: () => {
        const selectedItem = selectedItems[0];
        if (!selectedItem) {
          return null;
        }
        const dataset = selectedItem.content.getDataSet();
        if (!dataset || !dataset.propertyName || !dataset.isSharedProperties) {
          return null;
        }
        return {
          propertyName: dataset.propertyName,
          isSharedProperties: dataset.isSharedProperties === 'true',
        };
      },
    }));

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem, where: 'before' | 'inside' | 'after') =>
        selectedItems.every(item => {
          return (
            // Project and game settings children `getRootId` return an empty string.
            item.content.getRootId().length > 0 &&
            item.content.getRootId() === destinationItem.content.getRootId()
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
        const selectedPropertyFolderOrProperty = selectedItem.content.getPropertyFolderOrProperty();

        if (
          !selectedPropertyFolderOrProperty ||
          destinationItem.content.getId() === selectedItem.content.getId()
        ) {
          return;
        }

        if (destinationItem.isPlaceholder) {
          return;
        }

        const destinationPropertyFolderOrProperty = destinationItem.content.getPropertyFolderOrProperty();
        if (!destinationPropertyFolderOrProperty) {
          return;
        }
        if (
          selectedItem.content.getRootId() !==
          destinationItem.content.getRootId()
        ) {
          return;
        }
        // At this point, the move is done from within the same container.
        let parent;
        if (
          where === 'inside' &&
          destinationPropertyFolderOrProperty.isFolder()
        ) {
          parent = destinationPropertyFolderOrProperty;
        } else {
          parent = destinationPropertyFolderOrProperty.getParent();
        }
        const selectedPropertyFolderOrPropertyParent = selectedPropertyFolderOrProperty.getParent();
        if (parent === selectedPropertyFolderOrPropertyParent) {
          const fromIndex = selectedItem.content.getIndex();
          let toIndex = destinationItem.content.getIndex();
          if (toIndex > fromIndex) toIndex -= 1;
          if (where === 'after') toIndex += 1;
          selectedPropertyFolderOrPropertyParent.moveChild(fromIndex, toIndex);
        } else {
          if (destinationItem.content.isDescendantOf(selectedItem.content)) {
            return;
          }
          const position =
            where === 'inside'
              ? 0
              : destinationItem.content.getIndex() +
                (where === 'after' ? 1 : 0);
          selectedPropertyFolderOrPropertyParent.movePropertyFolderOrPropertyToAnotherFolder(
            selectedPropertyFolderOrProperty,
            parent,
            position
          );
          const treeView = treeViewRef.current;
          if (treeView) {
            const closestVisibleParentId = getClosestVisibleParentId(
              parent,
              destinationItem.content.getRootId() ===
                sharedPropertiesRootFolderId
            );
            if (closestVisibleParentId) {
              treeView.animateItemFromId(closestVisibleParentId);
            }
          }
        }
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
        }
      },
      [selectedItems]
    );

    // Force List component to be mounted again if project
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = eventsBasedEntity
      ? eventsBasedEntity.ptr
      : 'no-eventsBasedEntity';
    const initiallyOpenedNodeIds = [
      propertiesRootFolderId,
      sharedPropertiesRootFolderId,
      ...(properties
        ? enumerateFoldersInContainer(properties).map(({ folder }) =>
            getEventsBasedEntityPropertyFolderTreeViewItemId(folder)
          )
        : []),
      ...(sharedProperties
        ? enumerateFoldersInContainer(sharedProperties).map(({ folder }) =>
            getEventsBasedEntityPropertyFolderTreeViewItemId(folder)
          )
        : []),
    ];

    return (
      <Background maxWidth>
        <Line expand>
          <ColumnStackLayout noMargin expand>
            <Line noMargin>
              <Column expand>
                <SearchBar
                  ref={searchBarRef}
                  value={searchText}
                  onRequestSearch={() => {}}
                  onChange={setSearchText}
                  placeholder={t`Search in properties`}
                />
              </Column>
            </Line>
            <I18n>
              {({ i18n }) => (
                <div
                  id="property-list"
                  style={{
                    ...styles.listContainer,
                    ...styles.autoSizerContainer,
                  }}
                  onKeyDown={keyboardShortcutsRef.current.onKeyDown}
                  onKeyUp={keyboardShortcutsRef.current.onKeyUp}
                >
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
                        getItemDataset={getTreeViewItemDataSet}
                        onEditItem={editItem}
                        onCollapseItem={onCollapseItem}
                        selectedItems={selectedItems}
                        onSelectItems={items => {
                          const itemToSelect = items[0];
                          if (!itemToSelect) return;
                          if (itemToSelect.isRoot) return;
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
                        shouldHideMenuIcon={item => !item.content.getRootId()}
                      />
                    )}
                  </AutoSizer>
                </div>
              )}
            </I18n>
          </ColumnStackLayout>
        </Line>
      </Background>
    );
  }
);

const PropertyListEditorWithErrorBoundary = React.forwardRef<
  Props,
  PropertyListEditorInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Property list editor</Trans>}
    scope="property-list-editor"
  >
    <PropertyListEditor ref={ref} {...props} />
  </ErrorBoundary>
));

export default PropertyListEditorWithErrorBoundary;
