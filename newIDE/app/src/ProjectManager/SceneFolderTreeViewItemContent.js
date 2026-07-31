// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import * as React from 'react';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type TreeViewItemContent, scenesRootFolderId } from '.';
import { type MenuButton } from '../UI/TreeView';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import newNameGenerator from '../Utils/NewNameGenerator';
import { getSceneTreeViewItemId } from './SceneTreeViewItemContent';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import {
  buildMoveToFolderSubmenu,
  createNewFolderAndMoveItem,
  hasFolderNamed,
  moveNewSceneToFolder,
} from './SceneTreeViewHelpers';

const SCENE_FOLDER_CLIPBOARD_KIND = 'SceneFolder';

export type SceneFolderTreeViewItemProps = {|
  project: gdProject,
  forceUpdate: () => void,
  forceUpdateList: () => void,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  onProjectItemModified: () => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
  expandFolders: (folderIds: Array<string>) => void,
  onDeleteLayout: (layout: gdLayout, skipConfirmation?: boolean) => void,
|};

export const getSceneFolderTreeViewItemId = (
  folder: gdLayoutFolderOrLayout
): string => {
  return `scene-folder-${folder.ptr}`;
};

export class SceneFolderTreeViewItemContent implements TreeViewItemContent {
  folder: gdLayoutFolderOrLayout;
  props: SceneFolderTreeViewItemProps;

  constructor(
    folder: gdLayoutFolderOrLayout,
    props: SceneFolderTreeViewItemProps
  ) {
    this.folder = folder;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    if (itemContent.getId() === scenesRootFolderId) return true;

    let currentParent = this.folder.getParent();
    while (currentParent && !currentParent.isRootFolder()) {
      if (getSceneFolderTreeViewItemId(currentParent) === itemContent.getId()) {
        return true;
      }
      currentParent = currentParent.getParent();
    }
    return false;
  }

  getRootId(): string {
    return scenesRootFolderId;
  }

  getName(): string | React.Node {
    return this.folder.getFolderName();
  }

  getId(): string {
    return getSceneFolderTreeViewItemId(this.folder);
  }

  getHtmlId(index: number): ?string {
    return `scene-folder-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'scene-folder': this.folder.getFolderName(),
    };
  }

  getFolder(): gdLayoutFolderOrLayout {
    return this.folder;
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.folder.getFolderName() === newName) return;
    this.folder.setFolderName(newName);
    this.props.onProjectItemModified();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    const { project } = this.props;
    const currentParent = this.folder.getParent();

    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        label: i18n._(t`Move to folder`),
        submenu: buildMoveToFolderSubmenu(
          i18n,
          project,
          currentParent,
          this.folder,
          targetFolder => {
            currentParent.moveLayoutFolderOrLayoutToAnotherFolder(
              this.folder,
              targetFolder,
              0
            );
            this._onFolderStructureModified();
          },
          () =>
            createNewFolderAndMoveItem(
              project,
              this.folder,
              this.props.forceUpdateList,
              this.props.expandFolders,
              this.props.editName
            )
        ),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Add a scene`),
        click: () => this._addScene(i18n),
      },
      {
        label: i18n._(t`Add a folder`),
        click: () => this._addFolder(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  delete(): void {
    const { showDeleteConfirmation } = this.props;

    const contentCount = this._countFolderContents();
    const hasStartScene = this._containsStartScene();

    let message;
    let confirmLabel = t`Delete`;

    if (contentCount.scenes === 0 && contentCount.folders === 0) {
      message = t`Are you sure you want to remove this empty folder?`;
    } else {
      message = t`⚠️ This will permanently delete:
  - ${contentCount.scenes} scene(s)
  - ${contentCount.folders} subfolder(s)

  This action cannot be undone.`;
      confirmLabel = t`Delete permanently`;

      if (hasStartScene) {
        message += t`

  ⚠️ Warning: This includes your start scene. Another scene will be set as the new start scene.`;
      }
    }

    showDeleteConfirmation({
      title: t`Remove folder`,
      message: message,
      confirmButtonLabel: confirmLabel,
    }).then(answer => {
      if (!answer) return;

      this._deleteRecursively(this.folder);

      this.folder.getParent().removeFolderChild(this.folder);

      this._onFolderStructureModified();
    });
  }

  _deleteRecursively(folder: gdLayoutFolderOrLayout): void {
    // The children are collected first because deleting a layout removes it
    // from the folder structure, which would shift the indices while iterating.
    const childrenToDelete = [];
    for (let i = 0; i < folder.getChildrenCount(); i++) {
      childrenToDelete.push(folder.getChildAt(i));
    }
    childrenToDelete.forEach(child => {
      if (child.isFolder()) {
        this._deleteRecursively(child);
        folder.removeFolderChild(child);
      } else {
        // The confirmation was already asked for the whole folder.
        this.props.onDeleteLayout(child.getLayout(), true);
      }
    });
  }

  _countFolderContents(): { scenes: number, folders: number } {
    let scenes = 0;
    let folders = 0;

    const countRecursive = (folder: gdLayoutFolderOrLayout) => {
      for (let i = 0; i < folder.getChildrenCount(); i++) {
        const child = folder.getChildAt(i);
        if (child.isFolder()) {
          folders++;
          countRecursive(child);
        } else {
          scenes++;
        }
      }
    };

    countRecursive(this.folder);
    return { scenes, folders };
  }

  _containsStartScene(): boolean {
    const { project } = this.props;
    const firstLayout = project.getFirstLayout();

    const checkRecursive = (folder: gdLayoutFolderOrLayout): boolean => {
      for (let i = 0; i < folder.getChildrenCount(); i++) {
        const child = folder.getChildAt(i);
        if (child.isFolder()) {
          if (checkRecursive(child)) return true;
        } else if (child.getLayout().getName() === firstLayout) {
          return true;
        }
      }
      return false;
    };

    return checkRecursive(this.folder);
  }

  getIndex(): number {
    return this.folder.getParent().getChildPosition(this.folder);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdLayoutFolderOrLayout
  ): void {
    const currentParent = this.folder.getParent();
    const destinationFolder = targetFolder || currentParent;

    if (destinationFolder === currentParent) {
      const originIndex = this.getIndex();
      if (destinationIndex === originIndex) return;
      currentParent.moveChild(originIndex, destinationIndex);
    } else {
      currentParent.moveLayoutFolderOrLayoutToAnotherFolder(
        this.folder,
        destinationFolder,
        destinationIndex
      );
    }

    this._onFolderStructureModified();
  }

  copy(): void {
    Clipboard.set(SCENE_FOLDER_CLIPBOARD_KIND, {
      folder: serializeToJSObject(this.folder),
      name: this.folder.getFolderName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(SCENE_FOLDER_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(SCENE_FOLDER_CLIPBOARD_KIND);
    const copiedFolder = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'folder'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedFolder) return;

    const newName = newNameGenerator(name, name =>
      hasFolderNamed(this.folder, name)
    );

    const newFolder = this.folder.insertNewFolder(newName, 0);
    unserializeFromJSObject(newFolder, copiedFolder);
    newFolder.setFolderName(newName);

    this._onFolderStructureModified();
    this.props.editName(getSceneFolderTreeViewItemId(newFolder));
  }

  _addScene(i18n: I18nType): void {
    const { project, expandFolders, scrollToItem } = this.props;

    const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
      project.hasLayoutNamed(name)
    );

    const newScene = project.insertNewLayout(
      newName,
      project.getLayoutsCount()
    );
    newScene.updateBehaviorsSharedData(project);
    addDefaultLightToAllLayers(newScene);

    moveNewSceneToFolder(project, newName, this.folder, 0);

    this._onFolderStructureModified();
    expandFolders([this.getId()]);

    // The scene is only rendered after the tree view is refreshed, so wait for
    // the next render before scrolling to it.
    setTimeout(() => {
      scrollToItem(getSceneTreeViewItemId(newScene));
    }, 100);
  }

  _addFolder(): void {
    const { editName, expandFolders } = this.props;

    const newFolderName = newNameGenerator('NewFolder', name =>
      hasFolderNamed(this.folder, name)
    );

    const newFolder = this.folder.insertNewFolder(newFolderName, 0);

    this._onFolderStructureModified();
    expandFolders([this.getId()]);
    editName(getSceneFolderTreeViewItemId(newFolder));
  }

  /**
   * The tree view caches the children of each item, so it must be told to
   * rebuild them when the folder structure itself changed.
   */
  _onFolderStructureModified(): void {
    this.props.onProjectItemModified();
    this.props.forceUpdateList();
  }
}
