// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { AutoSizer } from 'react-virtualized';
import TreeView, { type TreeViewInterface, type MenuButton } from '../UI/TreeView';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import newNameGenerator from '../Utils/NewNameGenerator';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type Preferences } from '../MainFrame/Preferences/PreferencesContext';
import { type GDevelopTheme } from '../UI/Theme';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import Add from '../UI/CustomSvgIcons/Add';
import { mapFor } from '../Utils/MapFor';
import {
  SceneTreeViewItemContent,
  getSceneTreeViewItemId,
} from '../ProjectManager/SceneTreeViewItemContent';
import {
  SceneFolderTreeViewItemContent,
  getSceneFolderTreeViewItemId,
} from '../ProjectManager/SceneFolderTreeViewItemContent';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  getInsertionParentAndPosition,
  isFolder,
  getItem,
  getName,
  getChildrenCount,
  getChildAt,
  getParent,
  hasFolderNamed,
  insertNewFolder,
  forEachChild,
} from '../Utils/FolderHelpers';
import {
  type SceneFolderOrLayoutWithContext,
  getFoldersAscendanceWithoutRootFolder,
} from './EnumerateSceneFolderOrLayout';

export const scenesRootFolderId = 'scenes-root';
const scenesEmptyPlaceholderId = 'scenes-empty-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

// TreeView Item Interfaces (simplified)
interface TreeViewItemContent {
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

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class FolderTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;
  getChildrenFunc: (i18n: I18nType) => ?Array<TreeViewItem>;

  constructor(
    content: TreeViewItemContent,
    getChildrenFunc: (i18n: I18nType) => ?Array<TreeViewItem>
  ) {
    this.content = content;
    this.getChildrenFunc = getChildrenFunc;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return this.getChildrenFunc(i18n);
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
  rightButton: ?MenuButton;
  buildMenuTemplateFunction: (i18n: I18nType, index: number) => Array<MenuItemTemplate>;
  onAddSceneCallback: ?(() => void);
  onAddFolderCallback: ?(() => void);

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton,
    onAddScene?: () => void,
    onAddFolder?: () => void
  ) {
    this.id = id;
    this.label = label;
    this.rightButton = rightButton;
    this.onAddSceneCallback = onAddScene;
    this.onAddFolderCallback = onAddFolder;
    
    // Build menu template function
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) => {
      const menuItems = [];
      
      // Add "Add" button action if present
      if (rightButton) {
        menuItems.push({
          id: rightButton.id,
          label: rightButton.label,
          click: rightButton.click,
        });
      }
      
      // Add "Add a scene" and "Add a folder" for Scenes root
      if (this.id === scenesRootFolderId) {
        if (this.onAddSceneCallback) {
          menuItems.push({
            label: i18n._(t`Add a scene`),
            click: this.onAddSceneCallback,
          });
        }
        if (this.onAddFolderCallback) {
          menuItems.push({
            label: i18n._(t`Add a folder`),
            click: this.onAddFolderCallback,
          });
        }
      }
      
      return menuItems;
    };
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

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
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

// Helper: Build folder tree recursively
const buildSceneFolderTree = (
  folder: gdLayoutFolderOrLayout,
  props: any
): TreeViewItem => {
  return new FolderTreeViewItem(
    new SceneFolderTreeViewItemContent(folder, props),
    (i18n: I18nType) => {
      const children = [];
      
      // Verwende FolderHelpers statt manuelle Implementierung
      forEachChild(folder, (child) => {
        if (isFolder(child)) {
          // Rekursiv für Folder
          children.push(buildSceneFolderTree(child, props));
        } else {
          // Leaf für Scene
          const layout = getItem(child);
          if (layout) {
            children.push(
              new LeafTreeViewItem(new SceneTreeViewItemContent(layout, props))
            );
          }
        }
      });

      return children;
    }
  );
};

export type ScenesListProps = {|
  project: gdProject,
  i18n: I18nType,

  // Callbacks
  onSceneClick: (scene: gdLayout) => void,
  onSceneEdit: (scene: gdLayout) => void,
  onSceneDelete: (scene: gdLayout) => void,
  onSceneRename: (scene: gdLayout, newName: string) => void,
  onSceneDuplicate?: (scene: gdLayout) => void,
  onSceneAdded: () => void,

  onOpenLayoutProperties: (scene: gdLayout) => void,
  onOpenLayoutVariables: (scene: gdLayout) => void,

  // UI
  searchText?: string,
  selectedScenes?: Array<gdLayout>,
  onSelectionChange?: (scenes: Array<gdLayout>) => void,

  // State management
  unsavedChanges?: ?UnsavedChanges,
  preferences: Preferences,
  gdevelopTheme: GDevelopTheme,
  showDeleteConfirmation: (options: ShowConfirmDeleteDialogOptions) => Promise<boolean>,

  // Internal callbacks
  forceUpdate: () => void,
  forceUpdateList: () => void,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  onProjectItemModified: () => void,
  expandFolders: (folderIds: string[]) => void,
|};

/**
 * ScenesList - Hierarchische Liste von Scenes mit Folder-Support
 */
export function ScenesList(props: ScenesListProps) {
    React.useEffect(() => {
  console.log('🔄 ScenesList rendered! renderKey:', renderKey);
  console.log('📊 Current layouts count:', project.getLayoutsCount());
}, [renderKey, project]);
  const {
    project,
    i18n,
    onSceneClick,
    onSceneEdit,
    onSceneDelete,
    onSceneRename,
    onSceneDuplicate,
    onSceneAdded,
    onOpenLayoutProperties,
    onOpenLayoutVariables,
    searchText,
    selectedScenes,
    onSelectionChange,
    unsavedChanges,
    preferences,
    gdevelopTheme,
    showDeleteConfirmation,
    forceUpdate,
    forceUpdateList,
    editName,
    scrollToItem,
    onProjectItemModified,
    expandFolders,
  } = props;

  const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
  const [renderKey, setRenderKey] = React.useState(0);

  const sceneTreeViewItemProps = React.useMemo(
    () => ({
      project,
      unsavedChanges,
      preferences,
      gdevelopTheme,
      forceUpdate,
      forceUpdateList,
      showDeleteConfirmation,
      editName,
      scrollToItem,
      onSceneAdded,
      onDeleteLayout: onSceneDelete,
      onRenameLayout: onSceneRename,
      onOpenLayout: (name) => {
        const layout = project.getLayout(name);
        if (layout) onSceneEdit(layout);
      },
      onOpenLayoutProperties,
      onOpenLayoutVariables,
    }),
    [
      project,
      unsavedChanges,
      preferences,
      gdevelopTheme,
      forceUpdate,
      forceUpdateList,
      showDeleteConfirmation,
      editName,
      scrollToItem,
      onSceneAdded,
      onSceneDelete,
      onSceneRename,
      onSceneEdit,
      onOpenLayoutProperties,
      onOpenLayoutVariables,
    ]
  );

  const sceneFolderTreeViewItemProps = React.useMemo(
    () => ({
      project,
      forceUpdate,
      forceUpdateList,
      editName,
      scrollToItem,
      onProjectItemModified,
      showDeleteConfirmation,
      expandFolders,
    }),
    [
      project,
      forceUpdate,
      forceUpdateList,
      editName,
      scrollToItem,
      onProjectItemModified,
      showDeleteConfirmation,
      expandFolders,
    ]
  );

  const combinedProps = React.useMemo(
    () => ({
      ...sceneTreeViewItemProps,
      ...sceneFolderTreeViewItemProps,
    }),
    [sceneTreeViewItemProps, sceneFolderTreeViewItemProps]
  );

  console.log('🎯 ScenesList Component rendered');

  const addNewScene = React.useCallback(
  () => {
    console.log('🎬 addNewScene called');
    
    const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
      project.hasLayoutNamed(name)
    );
    console.log('📝 Generated name:', newName);
    
    const newScene = project.insertNewLayout(newName, project.getLayoutsCount());
    console.log('✅ Scene created:', newScene);
    
    if (!newScene) {
      console.error('❌ Failed to create scene!');
      return;
    }
    
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);
    addDefaultLightToAllLayers(newScene);
    console.log('⚙️ Scene configured');

    console.log('📢 Calling callbacks...');
    onSceneAdded();
    console.log('  - onSceneAdded ✓');
    onProjectItemModified();
    console.log('  - onProjectItemModified ✓');
    forceUpdateList();
    console.log('  - forceUpdateList ✓');
    
    // ⭐ NEU: Trigger Re-Render
    setRenderKey(prev => prev + 1);
    console.log('  - setRenderKey ✓');

    const sceneItemId = getSceneTreeViewItemId(newScene);
    console.log('🆔 Scene ID:', sceneItemId);
    
    if (treeViewRef.current) {
      console.log('🌳 Opening tree root...');
      treeViewRef.current.openItems([scenesRootFolderId]);
    } else {
      console.warn('⚠️ treeViewRef.current is null!');
    }

    setTimeout(() => {
      console.log('📍 Scrolling to item and editing...');
      scrollToItem(sceneItemId);
      editName(sceneItemId);
    }, 100);
  },
  [project, i18n, onSceneAdded, onProjectItemModified, forceUpdateList, scrollToItem, editName] // ⭐ setRenderKey nicht nötig in deps
);

  const addNewFolder = React.useCallback(
    () => {
        const layoutsRootFolder = project.getLayoutsRootFolder();
        if (!layoutsRootFolder) return;

        const newFolderName = newNameGenerator('NewFolder', name =>
        hasFolderNamed(layoutsRootFolder, name)
        );

        const newFolder = insertNewFolder(
        layoutsRootFolder,
        newFolderName,
        getChildrenCount(layoutsRootFolder)
        );

        if (!newFolder) return;

        onProjectItemModified();
        
        // ⭐ NEU: Trigger Re-Render
        setRenderKey(prev => prev + 1);

        const folderItemId = getSceneFolderTreeViewItemId(newFolder);
        scrollToItem(folderItemId);
        editName(folderItemId);
    },
    [project, onProjectItemModified, editName, scrollToItem]
    );

  // Build tree data - Mit Root-Item für Rechtsklick-Menü
  const getTreeViewData = React.useCallback(
  (i18n: I18nType): Array<TreeViewItem> => {
    console.log('🔄 getTreeViewData called - rebuilding tree, renderKey:', renderKey);
    const layoutsRootFolder = project.getLayoutsRootFolder();
    console.log('📁 layoutsRootFolder:', layoutsRootFolder);
    console.log('📊 Layouts count:', project.getLayoutsCount());
    
    if (!layoutsRootFolder) {
      return [
        {
          isRoot: true,
          content: new LabelTreeViewItemContent(
            scenesRootFolderId,
            i18n._(t`Scenessss`),
            {
              icon: <Add />,
              label: i18n._(t`Add`),
              click: addNewScene,
              id: 'add-new-scene-button',
            },
            addNewScene,
            addNewFolder
          ),
          getChildren: () => [
            new PlaceHolderTreeViewItem(
              scenesEmptyPlaceholderId,
              i18n._(t`Start by adding a new scene.`)
            ),
          ],
        },
      ];
    }

    const childrenCount = layoutsRootFolder.getChildrenCount
      ? layoutsRootFolder.getChildrenCount()
      : 0;

    console.log('👶 Children count:', childrenCount);

    // Root Item mit Rechtsklick-Menü
    return [
      {
        isRoot: true,
        content: new LabelTreeViewItemContent(
          scenesRootFolderId,
          i18n._(t`Scenes`),
          {
            icon: <Add />,
            label: i18n._(t`Add`),
            click: addNewScene,
            id: 'add-new-scene-button',
          },
          addNewScene,
          addNewFolder
        ),
        getChildren: (i18n: I18nType) => {
    console.log('🔍 getChildren CALLED in buildScenesTreeItems!');
    console.log('📊 Project layouts count:', project.getLayoutsCount());
    
    if (project.getLayoutsCount() === 0) {
        return [
        new PlaceHolderTreeViewItem(
            scenesEmptyPlaceholderId,
            i18n._(t`Start by adding a new scene.`)
        ),
        ];
    }

    const children = [];
    
    // ⭐⭐⭐ Iteriere durch ALLE Layouts im Projekt!
    for (let i = 0; i < project.getLayoutsCount(); i++) {
        const layout = project.getLayout(i);
        console.log(`  - Layout ${i}:`, layout.getName());
        if (layout) {
        children.push(
            new LeafTreeViewItem(new SceneTreeViewItemContent(layout, props))
        );
        }
    }
    
    console.log('✅ Built children:', children.length);
    return children;
},
      },
    ];
  },
  [project, sceneTreeViewItemProps, combinedProps, addNewScene, addNewFolder, renderKey] // ⭐⭐⭐ renderKey MUSS hier sein!
);

  // TreeView adapters
  const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
  const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
  const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
    item.content.getHtmlId(index);
  const getTreeViewItemChildren = (item: TreeViewItem) => item.getChildren(i18n);
  const getTreeViewItemThumbnail = (item: TreeViewItem) =>
    item.content.getThumbnail();
  const getTreeViewItemDataSet = (item: TreeViewItem) => item.content.getDataSet();
  const buildMenuTemplate = (item: TreeViewItem, index: number) =>
    item.content.buildMenuTemplate(i18n, index);
  const renderTreeViewItemRightComponent = (item: TreeViewItem) =>
    item.content.renderRightComponent(i18n);
  const renameItem = (item: TreeViewItem, newName: string) => {
    item.content.rename(newName);
  };
  const onClickItem = (item: TreeViewItem) => {
    item.content.onClick();
  };
  const editItem = (item: TreeViewItem) => {
    item.content.edit();
  };
  const getTreeViewItemRightButton = (item: TreeViewItem) =>
    item.content.getRightButton(i18n);

  return (
    <div style={styles.listContainer}>
      {/* Tree View - Scenes root ist jetzt ein normales Tree-Item mit Rechtsklick-Menü */}
      <div style={styles.autoSizerContainer}>
        <AutoSizer style={styles.autoSizer} disableWidth>
          {({ height }) => (
            <TreeView
              ref={treeViewRef}
              items={getTreeViewData(i18n)}
              height={height}
              searchText={searchText}
              getItemName={getTreeViewItemName}
              getItemThumbnail={getTreeViewItemThumbnail}
              getItemChildren={getTreeViewItemChildren}
              multiSelect={false}
              getItemId={getTreeViewItemId}
              getItemHtmlId={getTreeViewItemHtmlId}
              getItemDataset={getTreeViewItemDataSet}
              onEditItem={editItem}
              selectedItems={[]} // TODO: Implement selection
              onSelectItems={() => {}} // TODO: Implement selection
              onClickItem={onClickItem}
              onRenameItem={renameItem}
              buildMenuTemplate={buildMenuTemplate}
              getItemRightButton={getTreeViewItemRightButton}
              renderRightComponent={renderTreeViewItemRightComponent}
              initiallyOpenedNodeIds={[scenesRootFolderId]} // ← FIX: Scenes root automatisch öffnen
              reactDndType="GD_SCENE"
              forceAllOpened={false} // ← Damit nur Scenes root offen ist
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export function buildScenesTreeItems(
  project: gdProject,
  i18n: I18nType,
  props: {
    project: gdProject,
    unsavedChanges: any,
    preferences: any,
    gdevelopTheme: any,
    forceUpdate: () => void,
    forceUpdateList: () => void,
    showDeleteConfirmation: any,
    editName: (itemId: string) => void,
    scrollToItem: (itemId: string) => void,
    onSceneAdded: () => void,
    onDeleteLayout: any,
    onRenameLayout: any,
    onOpenLayout: (name: string) => void,
    onOpenLayoutProperties: any,
    onOpenLayoutVariables: any,
    onProjectItemModified: () => void,
    expandFolders: (folderIds: string[]) => void,
    addNewScene: () => void,  // ⭐ NEU: Callback als Prop
    addNewFolder: () => void,  // ⭐ NEU: Callback als Prop
  },
  rootId?: string 
): Array<TreeViewItem> {
    console.log('📦 buildScenesTreeItems called!');
  const layoutsRootFolder = project.getLayoutsRootFolder();
   console.log('📁 Root folder:', layoutsRootFolder);
  console.log('📊 Layouts in project:', project.getLayoutsCount());
  
  // ⭐ Verwende die übergebenen Callbacks direkt
  const { addNewScene, addNewFolder } = props;
  const usedRootId = rootId || scenesRootFolderId;

  // Falls kein Root Folder vorhanden
  if (!layoutsRootFolder) {
    return [
        {
            isRoot: true,
            content: new LabelTreeViewItemContent(
            usedRootId,
            i18n._(t`Scenes`),
            {
                icon: <Add />,
                label: i18n._(t`Add`),
                click: addNewScene,
                id: 'add-new-scene-button',
            },
            addNewScene,
            addNewFolder
            ),
            getChildren: (i18n: I18nType) => {
            if (project.getLayoutsCount() === 0) {
                return [
                new PlaceHolderTreeViewItem(
                    scenesEmptyPlaceholderId,
                    i18n._(t`Start by adding a new scene.`)
                ),
                ];
            }

            const children = [];
            forEachChild(layoutsRootFolder, (child) => {
                if (isFolder(child)) {
                children.push(buildSceneFolderTree(child, props));
                } else {
                const layout = getItem(child);
                if (layout) {
                    children.push(
                    new LeafTreeViewItem(new SceneTreeViewItemContent(layout, props))
                    );
                }
                }
            });

            return children;
            },
        },
        ];
  }

  // Build children
  const children = [];
return [
  {
    isRoot: true,
    content: new LabelTreeViewItemContent(
      usedRootId,
      i18n._(t`Scenes`),
      {
        icon: <Add />,
        label: i18n._(t`Add`),
        click: addNewScene,
        id: 'add-new-scene-button',
      },
      addNewScene,
      addNewFolder
    ),
    getChildren: (i18n: I18nType) => {
      console.log('🔍 getChildren CALLED in buildScenesTreeItems!');
      
      // ⭐⭐⭐ BAUE KINDER HIER - JEDES MAL NEU!
      if (!layoutsRootFolder || project.getLayoutsCount() === 0) {
        return [
          new PlaceHolderTreeViewItem(
            scenesEmptyPlaceholderId,
            i18n._(t`Start by adding a new scene.`)
          ),
        ];
      }
      console.log("XXX");
      console.log(layoutsRootFolder);

      const children = [];
      forEachChild(layoutsRootFolder, (child) => {
        console.log("Child: ");
        console.log((isFolder(child)));
        if (isFolder(child)) {
          children.push(buildSceneFolderTree(child, props));
        } else {
          const layout = getItem(child);
          if (layout) {
            children.push(
              new LeafTreeViewItem(new SceneTreeViewItemContent(layout, props))
            );
          }
        }
      });
      
      console.log('✅ Built children:', children.length);
      return children;
    },
  },
];
}

export default ScenesList;