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
    console.log("ITEM CONTENT:");
    console.log(itemContent);
    if (itemContent.getId() === scenesRootFolderId) return true;
    
    let currentParent = this.folder.getParent();
    while (currentParent && !currentParent.isRootFolder()) {
      if (
        getSceneFolderTreeViewItemId(currentParent) ===
        itemContent.getId()
      ) {
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
    return this.folder; // oder wie auch immer du den Folder speicherst
  }

  getThumbnail(): ?string {
    return 'res/icons_default/folder_black.svg';
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
    return [
      {
        label: i18n._(t`Add scene`),
        click: () => this._addScene(i18n),
      },
      {
        label: i18n._(t`Add folder`),
        click: () => this._addFolder(),
      },
      {
        type: 'separator',
      },
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
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this.copy(),
        accelerator: 'CmdOrCtrl+C',
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
        accelerator: 'CmdOrCtrl+X',
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(SCENE_FOLDER_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
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
    
    showDeleteConfirmation({
      title: t`Remove folder`,
      message: t`Are you sure you want to remove this folder? Scenes inside will be moved to the parent folder.`,
    }).then(answer => {
      if (!answer) return;

      const parent = this.folder.getParent();
      if (!parent) return;

      parent.removeFolderChild(this.folder);
      onProjectItemModified();
    });
  }

  getIndex(): number {
    const parent = this.folder.getParent();
    if (!parent) return 0;
    return parent.getChildPosition(this.folder);
  }

  moveAt(destinationIndex: number, targetFolder?: gdLayoutFolderOrLayout): void {
    const originIndex = this.getIndex();
    const currentParent = this.folder.getParent();
    if (!currentParent) return;
    
    // ✅ Verwende targetFolder, wenn angegeben
    const destinationFolder = targetFolder || currentParent;
    
    console.log(`🎯 Moving folder from ${originIndex} to ${destinationIndex}`);
    console.log(`   From folder: ${currentParent.getFolderName()}`);
    console.log(`   To folder: ${destinationFolder.getFolderName()}`);
    
    if (destinationFolder === currentParent) {
      // Verschieben innerhalb desselben Folders
      if (destinationIndex !== originIndex) {
        currentParent.moveChild(originIndex, destinationIndex);
        this.props.onProjectItemModified();
      }
    } else {
      // ✅ Verschieben in einen anderen Folder
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

    const newName = newNameGenerator(name, name =>
      this._hasFolderNamed(name)
    );

    const newFolder = this.folder.insertNewFolder(newName, 0);
    unserializeFromJSObject(newFolder, copiedFolder);
    newFolder.setFolderName(newName);

    this.props.onProjectItemModified();
    this.props.editName(getSceneFolderTreeViewItemId(newFolder));
  }

  _addScene(i18n: I18nType): void {
    const { project, onProjectItemModified, editName, scrollToItem } = this.props;
    
    const newName = newNameGenerator(
      i18n._(t`Untitled scene`),
      name => project.hasLayoutNamed(name)
    );
    
    // Zuerst Scene im Project erstellen
    const newScene = project.insertNewLayout(
      newName, 
      project.getLayoutsCount()
    );
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);
    addDefaultLightToAllLayers(newScene);

    // Dann als Item in den Folder einfügen
    this.folder.insertObject(newScene, 0);

    onProjectItemModified();
    
    this.props.expandFolders([this.getId()]);
    
    setTimeout(() => {
      scrollToItem(getSceneTreeViewItemId(newScene));
    }, 100);
  }

  _addFolder(): void {
    const { onProjectItemModified, editName, expandFolders } = this.props;
    
    const newFolderName = newNameGenerator(
      'NewFolder',
      name => this._hasFolderNamed(name)
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
}