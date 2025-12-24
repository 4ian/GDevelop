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
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../../UI/Alert/AlertContext';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../../UI/Theme';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import EmptyMessage from '../../UI/EmptyMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import { useShouldAutofocusInput } from '../../UI/Responsive/ScreenTypeMeasurer';

export const getProjectManagerItemId = (identifier: string) =>
  `project-manager-tab-${identifier}`;

const gameSettingsRootFolderId = getProjectManagerItemId('game-settings');
const gamePropertiesItemId = getProjectManagerItemId('game-properties');
export const scenesRootFolderId = getProjectManagerItemId('scenes');
export const extensionsRootFolderId = getProjectManagerItemId('extensions');
export const externalEventsRootFolderId = getProjectManagerItemId(
  'external-events'
);
export const externalLayoutsRootFolderId = getProjectManagerItemId(
  'external-layout'
);

const scenesEmptyPlaceholderId = 'scenes-placeholder';

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
  moveAt(destinationIndex: number): void;
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  getRootId(): string;
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
    rightButton?: MenuButton
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      rightButton
        ? [
            {
              id: rightButton.id,
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

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
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

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
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
  setSelectedProperty: (propertyName: string) => void,
|};

type Props = {|
  project: gdProject,
  extension: gdEventsFunctionsExtension,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  onPropertiesUpdated: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onOpenProperty: (name: string) => void,
  onEventsFunctionsAdded: () => void,
|};

const PropertyListEditor = React.forwardRef<Props, PropertyListEditorInterface>(
  (
    {
      project,
      extension,
      eventsBasedBehavior,
      eventsBasedObject,
      onPropertiesUpdated,
      onRenameProperty,
      onOpenProperty,
      onEventsFunctionsAdded,
    },
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);
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
      (index: number, i18n: I18nType) => {
        if (!properties) return;

        const newName = newNameGenerator(i18n._(t`Property`), name =>
          properties.has(name)
        );
        const property = properties.insertNew(newName, index);
        property.setType('Number');

        onPropertiesUpdated();

        onProjectItemModified();
        setSearchText('');

        const sceneItemId = getEventsBasedEntityPropertyTreeViewItemId(
          property
        );
        if (treeViewRef.current) {
          treeViewRef.current.openItems([sceneItemId, scenesRootFolderId]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(sceneItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(sceneItemId);
      },
      [
        properties,
        onPropertiesUpdated,
        onProjectItemModified,
        editName,
        scrollToItem,
      ]
    );

    const onTreeModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, triggerUnsavedChanges]
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
              extension,
              eventsBasedEntity,
              eventsBasedBehavior,
              eventsBasedObject,
              properties,
              isSceneProperties: false,
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
        extension,
        eventsBasedBehavior,
        eventsBasedObject,
        onOpenProperty,
        onPropertiesUpdated,
        onRenameProperty,
        onEventsFunctionsAdded,
      ]
    );

    const createPropertyItem = React.useCallback(
      (property: gdNamedPropertyDescriptor) => {
        if (!propertiesTreeViewItemProps) {
          return null;
        }
        return new LeafTreeViewItem(
          new EventsBasedEntityPropertyTreeViewItemContent(
            property,
            propertiesTreeViewItemProps
          )
        );
      },
      [propertiesTreeViewItemProps]
    );

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return !properties || !propertiesTreeViewItemProps
          ? []
          : [
              new LeafTreeViewItem(
                new ActionTreeViewItemContent(
                  gamePropertiesItemId,
                  i18n._(t`Configuration`),
                  // TODO Scroll to the configuration
                  () => {},
                  'res/icons_default/properties_black.svg'
                )
              ),
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  scenesRootFolderId,
                  i18n._(t`Behavior properties`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add a property`),
                    click: () => {
                      addProperty(0, i18n);
                    },
                    id: 'add-property',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  if (properties.getCount() === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        scenesEmptyPlaceholderId,
                        i18n._(t`Start by adding a new property.`)
                      ),
                    ];
                  }
                  return mapFor(0, properties.getCount(), i =>
                    createPropertyItem(properties.getAt(i))
                  ).filter(Boolean);
                },
              },
            ];
      },
      [addProperty, createPropertyItem, properties, propertiesTreeViewItemProps]
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      focusSearchBar: () => {
        if (searchBarRef.current) searchBarRef.current.focus();
      },
      setSelectedProperty: (propertyName: string) => {
        if (!properties || !properties.has(propertyName)) {
          return;
        }
        const property = properties.get(propertyName);
        const propertyItemId = getEventsBasedEntityPropertyTreeViewItemId(
          property
        );
        setSelectedItems(selectedItems => {
          if (
            selectedItems.length === 1 &&
            selectedItems[0].content.getId() === propertyItemId
          ) {
            return selectedItems;
          }
          return [createPropertyItem(property)].filter(Boolean);
        });
        scrollToItem(propertyItemId);
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
      gameSettingsRootFolderId,
      scenesRootFolderId,
      extensionsRootFolderId,
      externalEventsRootFolderId,
      externalLayoutsRootFolderId,
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
