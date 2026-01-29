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
import { TreeViewItemContent, scenesRootFolderId } from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import newNameGenerator from '../Utils/NewNameGenerator';
import { getSceneTreeViewItemId } from './SceneTreeViewItemContent';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import {
  buildMoveToFolderSubmenu,
  createNewFolderAndMoveItem,
  hasFolderNamed,
  collectFoldersAndPaths,
} from './SceneTreeViewHelpers';

const SCENE_FOLDER_CLIPBOARD_KIND = 'SceneFolder';

export type SceneFolderTreeViewItemProps = {|
  project: gdProject,
  forceUpdate: () => void,
  forceUpdateList: () => void,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  onProjectItemModified: () => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  expandFolders: (folderIds: string[]) => void,
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

  buildMenuTemplate(i18n: I18nType, index: number) {
    const { project } = this.props;
    const layoutsRootFolder = project.getLayoutsRootFolder();

    const foldersAndPaths = layoutsRootFolder
      ? this._collectFoldersAndPaths(layoutsRootFolder)
      : [];

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
            if (currentParent) {
              currentParent.moveObjectFolderOrObjectToAnotherFolder(
                this.folder,
                targetFolder,
                0
              );
              this.props.onProjectItemModified();
            }
          },
          () => this._createNewFolderAndMove(i18n)
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

  getRightButton(i18n: I18nType) {
    return null;
  }

  delete(): void {
    const { showDeleteConfirmation, onProjectItemModified } = this.props;

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

      this._deleteRecursively(this.folder, true);

      const parent = this.folder.getParent();
      if (parent) {
        parent.removeFolderChild(this.folder);
      }

      onProjectItemModified();
    });
  }

  _deleteRecursively(
    folder: gdLayoutFolderOrLayout,
    skipConfirmation: boolean = false
  ): void {
    const childrenToDelete = [];
    for (let i = 0; i < folder.getChildrenCount(); i++) {
      childrenToDelete.push(folder.getChildAt(i));
    }
    childrenToDelete.forEach(child => {
      if (child.isFolder()) {
        this._deleteRecursively(child, skipConfirmation);
        folder.removeFolderChild(child);
      } else {
        const layout = child.getItem();
        if (layout) {
          const layoutName = layout.getName();
          this.props.onDeleteLayout(layout, skipConfirmation);
          folder.removeRecursivelyObjectNamed(layoutName);
        }
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
        } else {
          const layout = child.getItem();
          if (layout && layout.getName() === firstLayout) {
            return true;
          }
        }
      }
      return false;
    };

    return checkRecursive(this.folder);
  }

  getIndex(): number {
    const parent = this.folder.getParent();
    if (!parent) return 0;
    return parent.getChildPosition(this.folder);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdLayoutFolderOrLayout
  ): void {
    const originIndex = this.getIndex();
    const currentParent = this.folder.getParent();
    if (!currentParent) return;

    const destinationFolder = targetFolder || currentParent;

    if (destinationFolder === currentParent) {
      if (destinationIndex !== originIndex) {
        currentParent.moveChild(originIndex, destinationIndex);
        this.props.onProjectItemModified();
      }
    } else {
      currentParent.moveObjectFolderOrObjectToAnotherFolder(
        this.folder,
        destinationFolder,
        destinationIndex
      );
      this.props.onProjectItemModified();
    }
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

    const newName = newNameGenerator(name, name => this._hasFolderNamed(name));

    const newFolder = this.folder.insertNewFolder(newName, 0);
    unserializeFromJSObject(newFolder, copiedFolder);
    newFolder.setFolderName(newName);

    this.props.onProjectItemModified();
    this.props.editName(getSceneFolderTreeViewItemId(newFolder));
  }

  _addScene(i18n: I18nType): void {
    const {
      project,
      onProjectItemModified,
      editName,
      scrollToItem,
    } = this.props;

    const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
      project.hasLayoutNamed(name)
    );

    const newScene = project.insertNewLayout(
      newName,
      project.getLayoutsCount()
    );
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);
    addDefaultLightToAllLayers(newScene);

    const layoutsRootFolder = project.getLayoutsRootFolder();
    if (layoutsRootFolder) {
      const sceneInRoot = layoutsRootFolder.getObjectNamed(newName);
      if (sceneInRoot) {
        layoutsRootFolder.moveObjectFolderOrObjectToAnotherFolder(
          sceneInRoot,
          this.folder,
          0
        );
      }
    }

    onProjectItemModified();

    this.props.expandFolders([this.getId()]);

    setTimeout(() => {
      scrollToItem(getSceneTreeViewItemId(newScene));
    }, 100);
  }

  _addFolder(): void {
    const { onProjectItemModified, editName, expandFolders } = this.props;

    const newFolderName = newNameGenerator('NewFolder', name =>
      this._hasFolderNamed(name)
    );

    const newFolder = this.folder.insertNewFolder(newFolderName, 0);

    onProjectItemModified();
    expandFolders([this.getId()]);
    editName(getSceneFolderTreeViewItemId(newFolder));
  }

  _hasFolderNamed(name: string): boolean {
    const childrenCount = this.folder.getChildrenCount
      ? this.folder.getChildrenCount()
      : 0;

    for (let i = 0; i < childrenCount; i++) {
      const child = this.folder.getChildAt(i);
      if (child && child.isFolder && child.isFolder()) {
        if (child.getFolderName && child.getFolderName() === name) {
          return true;
        }
      }
    }

    return false;
  }

  _createNewFolderAndMove(i18n: I18nType): void {
    createNewFolderAndMoveItem(
      this.props.project,
      this.folder,
      this.props.onProjectItemModified,
      this.props.expandFolders,
      this.props.editName
    );
  }
}
