// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import UnsavedChangesContext, {
  type UnsavedChanges,
} from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import ErrorBoundary from '../UI/ErrorBoundary';
import useForceUpdate from '../Utils/UseForceUpdate';

import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import PreferencesContext, {
  type Preferences,
} from '../MainFrame/Preferences/PreferencesContext';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  LayerTreeViewItemContent,
  getLayerTreeViewItemId,
  type LayerTreeViewItemProps,
} from './LayerTreeViewItemContent';
import {
  BackgroundColorTreeViewItemContent,
  backgroundColorId,
} from './BackgroundColorTreeViewItemContent';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import LightbulbIcon from '../UI/CustomSvgIcons/Lightbulb';
import { mapReverseFor } from '../Utils/MapFor';
import { addDefaultLightToLayer } from '../ProjectCreation/CreateProject';

const gd: libGDevelop = global.gd;

export const layersRootFolderId = 'layers';

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

const hasLightingLayer = (layersContainer: gdLayersContainer) => {
  const layersCount = layersContainer.getLayersCount();
  return (
    mapReverseFor(0, layersCount, i =>
      layersContainer.getLayerAt(i).isLightingLayer()
    ).filter(Boolean).length > 0
  );
};

export interface TreeViewItemContent {
  getName(i18n: I18nType): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): ?HTMLDataset;
  getThumbnail(): ?string;
  onClick(): void;
  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate>;
  getRightButton(i18n: I18nType): Array<MenuButton>;
  renderRightComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  delete(): void;
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
  project: gdProject,
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

class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  dataSet: { [string]: string };
  rightButtons: Array<MenuButton>;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;

  constructor(
    id: string,
    label: string | React.Node,
    rightButtons: Array<MenuButton>,
    buildMenuTemplateFunction: (
      i18n: I18nType,
      index: number
    ) => Array<MenuItemTemplate>
  ) {
    this.id = id;
    this.label = label;
    this.rightButtons = rightButtons;
    this.buildMenuTemplateFunction = buildMenuTemplateFunction;
  }

  getName(i18n: I18nType): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): Array<MenuButton> {
    return this.rightButtons;
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

const getTreeViewItemName = (i18n: I18nType) => (item: TreeViewItem) =>
  item.content.getName(i18n);
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

export type ProjectManagerInterface = {|
  forceUpdateList: () => void,
  focusSearchBar: () => void,
|};

type Props = {|
  project: gdProject,
  selectedLayer: string,
  onSelectLayer: string => void,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  layersContainer: gdLayersContainer,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEditLayer: (layer: ?gdLayer) => void,
  onLayersModified: () => void,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onLayerRenamed: () => void,
  onCreateLayer: () => void,
  onLayersVisibilityInEditorChanged: () => void,
  onBackgroundColorChanged: () => void,
  gameEditorMode: 'embedded-game' | 'instances-editor',

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

export type LayersListInterface = {|
  forceUpdateList: () => void,
|};

const LayersList = React.forwardRef<Props, LayersListInterface>(
  (
    {
      project,
      selectedLayer,
      onSelectLayer,
      layout,
      eventsFunctionsExtension,
      eventsBasedObject,
      layersContainer,
      onEditLayerEffects,
      onEditLayer,
      onLayersModified,
      onRemoveLayer,
      onLayerRenamed,
      onCreateLayer,
      onLayersVisibilityInEditorChanged,
      onBackgroundColorChanged,
      gameEditorMode,
      hotReloadPreviewButtonProps,
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

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
    }));

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
        }
      },
      [editName, selectedItems]
    );

    const triggerOnLayersModified = React.useCallback(
      () => {
        onLayersModified();
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
        forceUpdate();
      },
      [forceUpdate, onLayersModified, unsavedChanges]
    );

    const triggerOnBackgroundColorChanged = React.useCallback(
      () => {
        onBackgroundColorChanged();
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
        forceUpdate();
      },
      [forceUpdate, onBackgroundColorChanged, unsavedChanges]
    );

    const onRenameLayer = React.useCallback(
      (oldName: string, newName: string) => {
        const uniqueNewName = newNameGenerator(
          newName || 'Unnamed',
          tentativeNewName => {
            return layersContainer.hasLayerNamed(newName);
          }
        );

        layersContainer.getLayer(oldName).setName(uniqueNewName);
        if (layout) {
          gd.WholeProjectRefactorer.renameLayerInScene(
            project,
            layout,
            oldName,
            uniqueNewName
          );
        } else if (eventsFunctionsExtension && eventsBasedObject) {
          gd.WholeProjectRefactorer.renameLayerInEventsBasedObject(
            project,
            eventsFunctionsExtension,
            eventsBasedObject,
            oldName,
            uniqueNewName
          );
        }
        onLayerRenamed();
        triggerOnLayersModified();
      },
      [
        eventsBasedObject,
        eventsFunctionsExtension,
        layersContainer,
        layout,
        onLayerRenamed,
        project,
        triggerOnLayersModified,
      ]
    );

    const layerTreeViewItemProps = React.useMemo<?LayerTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              layersContainer,
              selectedLayer,
              onSelectLayer,
              onDeleteLayer: layer => {
                const layerName = layer.getName();
                onRemoveLayer(layerName, doRemove => {
                  if (!doRemove) return;

                  layersContainer.removeLayer(layerName);
                  triggerOnLayersModified();
                });
              },
              // TODO
              onOpenLayer: onEditLayer,
              onEditLayer,
              onLayersModified,
              editName,
              onRenameLayer,
              forceUpdate,
              forceUpdateList,
              gdevelopTheme,
              preferences,
              scrollToItem,
              showDeleteConfirmation,
              triggerOnLayersModified,
            }
          : null,
      [
        project,
        layersContainer,
        selectedLayer,
        onSelectLayer,
        onEditLayer,
        onLayersModified,
        editName,
        onRenameLayer,
        forceUpdate,
        forceUpdateList,
        gdevelopTheme,
        preferences,
        scrollToItem,
        showDeleteConfirmation,
        onRemoveLayer,
        triggerOnLayersModified,
      ]
    );

    const onLayerModified = React.useCallback(
      () => {
        triggerUnsavedChanges();
        onLayersModified();
        forceUpdate();
      },
      [forceUpdate, onLayersModified, triggerUnsavedChanges]
    );

    const addLayer = React.useCallback(
      () => {
        const name = newNameGenerator('Layer', name =>
          layersContainer.hasLayerNamed(name)
        );
        layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
        const newLayer = layersContainer.getLayer(name);
        addDefaultLightToLayer(newLayer);
        onCreateLayer();
        onLayerModified();

        const layerItemId = getLayerTreeViewItemId(newLayer);
        if (treeViewRef.current) {
          treeViewRef.current.openItems([layerItemId, layersRootFolderId]);
        }
        // We focus it so the user can edit the name directly.
        editName(layerItemId);

        forceUpdateList();
      },
      [
        editName,
        forceUpdateList,
        layersContainer,
        onCreateLayer,
        onLayerModified,
      ]
    );

    const addLightingLayer = React.useCallback(
      () => {
        const name = newNameGenerator('Lighting', name =>
          layersContainer.hasLayerNamed(name)
        );
        layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
        const layer = layersContainer.getLayer(name);
        layer.setLightingLayer(true);
        layer.setFollowBaseLayerCamera(true);
        layer.setAmbientLightColor(200, 200, 200);
        onCreateLayer();
        onLayerModified();
        forceUpdateList();
      },
      [forceUpdateList, layersContainer, onCreateLayer, onLayerModified]
    );

    const isLightingLayerPresent = hasLightingLayer(layersContainer);

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        if (!project || !layerTreeViewItemProps) {
          return [];
        }
        const items = [
          {
            isRoot: true,
            content: new LabelTreeViewItemContent(
              layersRootFolderId,
              i18n._(t`Layers`),
              [
                {
                  icon: <LightbulbIcon />,
                  label: !project.areEffectsHiddenInEditor()
                    ? i18n._(t`Disable effects/lighting in the editor`)
                    : i18n._(t`Display effects/lighting in the editor`),
                  click: () => {
                    project.setEffectsHiddenInEditor(
                      !project.areEffectsHiddenInEditor()
                    );
                    onLayersVisibilityInEditorChanged();
                    forceUpdate();
                  },
                  id: 'show-effects-button',
                },
                {
                  icon: <Add />,
                  label: i18n._(t`Add a layer`),
                  click: addLayer,
                  id: 'add-layer-button',
                },
              ],
              () => [
                {
                  label: !project.areEffectsHiddenInEditor()
                    ? i18n._(t`Disable effects/lighting in the editor`)
                    : i18n._(t`Display effects/lighting in the editor`),
                  click: () => {
                    project.setEffectsHiddenInEditor(
                      !project.areEffectsHiddenInEditor()
                    );
                    onLayersVisibilityInEditorChanged();
                    forceUpdate();
                  },
                },
                {
                  label: i18n._(t`Add a layer`),
                  click: addLayer,
                },
                {
                  label: i18n._(t`Add 2D lighting layer`),
                  enabled: !isLightingLayerPresent,
                  click: addLightingLayer,
                },
              ]
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              return mapReverseFor(
                0,
                layersContainer.getLayersCount(),
                i =>
                  new LeafTreeViewItem(
                    new LayerTreeViewItemContent(
                      layersContainer.getLayerAt(i),
                      layerTreeViewItemProps
                    )
                  )
              );
            },
          },
        ];
        if (layout) {
          items.push({
            isRoot: true,
            content: new BackgroundColorTreeViewItemContent(
              layout,
              triggerOnBackgroundColorChanged
            ),
            getChildren(i18n: I18nType): ?Array<TreeViewItem> {
              return [];
            },
          });
        }
        return items;
      },
      [
        addLayer,
        addLightingLayer,
        forceUpdate,
        isLightingLayerPresent,
        layerTreeViewItemProps,
        layersContainer,
        layout,
        triggerOnBackgroundColorChanged,
        onLayersVisibilityInEditorChanged,
        project,
      ]
    );

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
    const listKey = project ? project.ptr : 'no-project';
    const initiallyOpenedNodeIds = [layersRootFolderId];

    return (
      <Background maxWidth>
        <I18n>
          {({ i18n }) => (
            <div
              id="layers-list"
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
                    getItemName={getTreeViewItemName(i18n)}
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
                    shouldHideMenuIcon={item =>
                      item.content.getId() === backgroundColorId
                    }
                  />
                )}
              </AutoSizer>
            </div>
          )}
        </I18n>
      </Background>
    );
  }
);

const LayersListWithErrorBoundary = React.forwardRef<
  Props,
  LayersListInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Layers list</Trans>}
    scope="scene-editor-layers-list"
  >
    <LayersList ref={ref} {...props} />
  </ErrorBoundary>
));

export default LayersListWithErrorBoundary;
