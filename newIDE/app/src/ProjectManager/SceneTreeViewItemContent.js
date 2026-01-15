// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { TreeViewItemContent, type TreeItemProps, scenesRootFolderId } from '.';
import Tooltip from '@material-ui/core/Tooltip';
import Flag from '@material-ui/icons/Flag';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const SCENE_CLIPBOARD_KIND = 'Layout';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type SceneTreeViewItemCallbacks = {|
  onSceneAdded: () => void,
  onDeleteLayout: gdLayout => void,
  onRenameLayout: (string, string) => void,
  onOpenLayout: (
    name: string,
    options?: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
|};

export type SceneTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...SceneTreeViewItemCallbacks,
|};

export type SceneTreeViewItemProps = {|
  ...SceneTreeViewItemCommonProps,
  project: gdProject,
  onOpenLayoutProperties: (layout: ?gdLayout) => void,
  onOpenLayoutVariables: (layout: ?gdLayout) => void,
|};

export const getSceneTreeViewItemId = (scene: gdLayout): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `scene-${scene.ptr}`;
};

export class SceneTreeViewItemContent implements TreeViewItemContent {
  scene: gdLayout;
  props: SceneTreeViewItemProps;

  constructor(scene: gdLayout, props: SceneTreeViewItemProps) {
    this.scene = scene;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === scenesRootFolderId;
  }

  getRootId(): string {
    return scenesRootFolderId;
  }

  getName(): string | React.Node {
    return this.scene.getName();
  }

  getId(): string {
    return getSceneTreeViewItemId(this.scene);
  }

  getHtmlId(index: number): ?string {
    return `scene-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      scene: this.scene.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/scene_black.svg';
  }

  onClick(): void {
    this.props.onOpenLayout(this.scene.getName(), {
      openEventsEditor: true,
      openSceneEditor: true,
      focusWhenOpened: 'scene',
    });
  }

  rename(newName: string): void {
    const oldName = this.scene.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameLayout(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Open scene editor`),
        enabled: true,
        click: () =>
          this.props.onOpenLayout(this.scene.getName(), {
            openSceneEditor: true,
            openEventsEditor: false,
            focusWhenOpened: 'scene',
          }),
      },
      {
        label: i18n._(t`Open events sheet`),
        enabled: true,
        click: () =>
          this.props.onOpenLayout(this.scene.getName(), {
            openSceneEditor: false,
            openEventsEditor: true,
            focusWhenOpened: 'events',
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Edit scene properties`),
        enabled: true,
        click: () => this.props.onOpenLayoutProperties(this.scene),
      },
      {
        label: i18n._(t`Edit scene variables`),
        enabled: true,
        click: () => this.props.onOpenLayoutVariables(this.scene),
      },
      {
        label: i18n._(t`Set as start scene`),
        enabled: !this._isFirstScene(),
        click: () => this._setProjectFirstScene(this.scene.getName()),
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
        enabled: Clipboard.has(SCENE_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
    ];
  }

  _isFirstScene(): boolean {
    return this.scene.getName() === this.props.project.getFirstLayout();
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const icons = [];

    if (this._isFirstScene()) {
      icons.push(
        <Tooltip
          key="first-scene"
          title={i18n._(t`This scene will be used as the start scene.`)}
        >
          <Flag
            fontSize="small"
            style={{
              ...styles.tooltip,
              color: this.props.gdevelopTheme.text.color.disabled,
            }}
          />
        </Tooltip>
      );
    }
    return icons.length > 0 ? icons : null;
  }

  delete(): void {
    this.props.onDeleteLayout(this.scene);
  }

  _findParentFolder(folder: any, scenePtr: number): ?any {
    for (let i = 0; i < folder.getChildrenCount(); i++) {
      const child = folder.getChildAt(i);
      
      if (child.isFolder()) {
        // Rekursiv in Unterordner suchen
        const found = this._findParentFolder(child, scenePtr);
        if (found) return found;
      } else {
        const layout = child.getItem();
        if (layout && layout.ptr === scenePtr) {
          return folder; // ✅ Parent gefunden!
        }
      }
    }
    return null;
  }

  // Neue Hilfsmethode: Finde Index innerhalb des Parent-Folders
  _getIndexInParent(parentFolder: any, scenePtr: number): number {
    for (let i = 0; i < parentFolder.getChildrenCount(); i++) {
      const child = parentFolder.getChildAt(i);
      if (!child.isFolder()) {
        const layout = child.getItem();
        if (layout && layout.ptr === scenePtr) {
          return i;
        }
      }
    }
    return 0;
  }

  getIndex(): number {
    const { project } = this.props;
    const layoutsRootFolder = project.getLayoutsRootFolder();
    if (!layoutsRootFolder) return 0;
    
    const parentFolder = this._findParentFolder(layoutsRootFolder, this.scene.ptr);
    if (!parentFolder) return 0;
    
    return this._getIndexInParent(parentFolder, this.scene.ptr);
  }

  _findLayoutFolderOrLayoutForScene(folder: any, scenePtr: number): ?any {
    for (let i = 0; i < folder.getChildrenCount(); i++) {
      const child = folder.getChildAt(i);
      
      if (child.isFolder()) {
        // Rekursiv in Unterordner suchen
        const found = this._findLayoutFolderOrLayoutForScene(child, scenePtr);
        if (found) return found;
      } else {
        // Es ist ein LayoutFolderOrLayout Item
        const layout = child.getItem();
        if (layout && layout.ptr === scenePtr) {
          return child; // ✅ Das LayoutFolderOrLayout-Objekt gefunden!
        }
      }
    }
    return null;
  }

  getLayoutFolderOrLayout(): gdLayoutFolderOrLayout | null {
    const { project } = this.props;
    const layoutsRootFolder = project.getLayoutsRootFolder();
    if (!layoutsRootFolder) return null;
    
    return this._findLayoutFolderOrLayoutForScene(layoutsRootFolder, this.scene.ptr);
  }

  moveAt(destinationIndex: number, targetFolder?: gdLayoutFolderOrLayout): void {
    console.log("MOveatcalled!");
    const { project } = this.props;
    const layoutsRootFolder = project.getLayoutsRootFolder();
    if (!layoutsRootFolder) return;
    
    // ✅ Finde das LayoutFolderOrLayout für diese Scene
    const sceneLayoutFolderOrLayout = this._findLayoutFolderOrLayoutForScene(
      layoutsRootFolder, 
      this.scene.ptr
    );
    if (!sceneLayoutFolderOrLayout) return;
    
    // ✅ Finde den aktuellen Parent-Folder
    const currentParentFolder = sceneLayoutFolderOrLayout.getParent();
    if (!currentParentFolder) return;
    
    const originIndex = this._getIndexInParent(currentParentFolder, this.scene.ptr);
    
    // ✅ Verwende targetFolder, wenn angegeben, sonst aktuellen Parent
    const destinationFolder = targetFolder || currentParentFolder;
    
    console.log(`🎯 Moving scene from ${originIndex} to ${destinationIndex}`);
    console.log(`   From folder: ${currentParentFolder.getFolderName()}`);
    console.log(`   To folder: ${destinationFolder.getFolderName()}`);
    
    if (destinationFolder === currentParentFolder) {
      // Verschieben innerhalb desselben Folders
      if (destinationIndex === originIndex) return;
      currentParentFolder.moveChild(originIndex, destinationIndex);
    } else {
      // ✅ Verschieben in einen anderen Folder
      currentParentFolder.moveObjectFolderOrObjectToAnotherFolder(
        sceneLayoutFolderOrLayout,
        destinationFolder,
        destinationIndex
      );
    }
    
    this._onProjectItemModified();
  }

  copy(): void {
    Clipboard.set(SCENE_CLIPBOARD_KIND, {
      layout: serializeToJSObject(this.scene),
      name: this.scene.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(SCENE_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(SCENE_CLIPBOARD_KIND);
    const copiedScene = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'layout'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedScene) return;

    const project = this.props.project;
    const newName = newNameGenerator(name, name =>
      project.hasLayoutNamed(name)
    );

    const newScene = project.insertNewLayout(newName, this.getIndex() + 1);

    unserializeFromJSObject(newScene, copiedScene, 'unserializeFrom', project);
    // Unserialization has overwritten the name.
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  _duplicate(): void {
    const { project } = this.props;
    const newName = newNameGenerator(this.scene.getName(), name =>
      project.hasLayoutNamed(name)
    );

    const newScene = project.insertNewLayout(newName, this.getIndex() + 1);

    unserializeFromJSObject(
      newScene,
      serializeToJSObject(this.scene),
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton(i18n: I18nType) {
    return null;
  }

  _setProjectFirstScene(sceneName: string): void {
    this.props.project.setFirstLayout(sceneName);
    this.props.forceUpdate();
  }
}
