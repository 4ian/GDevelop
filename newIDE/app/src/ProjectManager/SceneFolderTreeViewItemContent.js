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
import { mapFor } from '../Utils/MapFor';
import { getSceneTreeViewItemId } from './SceneTreeViewItemContent';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import {
  buildMoveToFolderSubmenu,
  moveNewSceneToFolder,
} from './SceneTreeViewHelpers';

const SCENE_FOLDER_CLIPBOARD_KIND = 'SceneFolder';

export type SceneFolderTreeViewItemProps = {|
  project: gdProject,
  forceUpdateList: () => void,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  onProjectItemModified: () => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
  expandFolders: (folderIds: Array<string>) => void,
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
          this.folder,
          () => this._onFolderStructureModified(),
          () => this._addFolderIn(currentParent)
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
        click: () => this._addFolderIn(this.folder),
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
    const parent = this.folder.getParent();
    const childrenCount = this.folder.getChildrenCount();

    // Removing a folder never removes the scenes it contains: they are moved
    // back to the parent folder, so that a scene can only ever be deleted
    // explicitly, one by one.
    if (childrenCount === 0) {
      parent.removeFolderChild(this.folder);
      this._onFolderStructureModified();
      return;
    }

    showDeleteConfirmation({
      title: t`Remove folder`,
      message: t`The content of this folder will be moved out of it, in "${this._getParentName()}". Do you want to continue?`,
      confirmButtonLabel: t`Remove folder`,
    }).then(answer => {
      if (!answer) return;

      const positionInParent = this.getIndex();
      // The children are collected first, as moving them out changes the
      // indices while iterating.
      const childrenToMove = mapFor(0, this.folder.getChildrenCount(), i =>
        this.folder.getChildAt(i)
      );
      childrenToMove.forEach((child, i) => {
        this.folder.moveLayoutFolderOrLayoutToAnotherFolder(
          child,
          parent,
          positionInParent + i
        );
      });

      parent.removeFolderChild(this.folder);

      this._onFolderStructureModified();
    });
  }

  _getParentName(): string {
    const parent = this.folder.getParent();
    return parent.isRootFolder() ? 'Scenes' : parent.getFolderName();
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
      currentParent.moveChild(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
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

    const newFolder = this.folder.insertNewFolder(name, 0);
    unserializeFromJSObject(newFolder, copiedFolder);
    // Unserialization has overwritten the name.
    newFolder.setFolderName(name);

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

  _addFolderIn(parentFolder: gdLayoutFolderOrLayout): void {
    const { editName, expandFolders } = this.props;

    const newFolder = parentFolder.insertNewFolder('NewFolder', 0);

    this._onFolderStructureModified();
    expandFolders([
      parentFolder.isRootFolder()
        ? scenesRootFolderId
        : getSceneFolderTreeViewItemId(parentFolder),
    ]);
    // We focus it so the user can edit the name directly.
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
