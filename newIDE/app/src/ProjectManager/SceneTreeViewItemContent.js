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
import {
  type TreeViewItemContent,
  type TreeItemProps,
  scenesRootFolderId,
} from '.';
import Tooltip from '@material-ui/core/Tooltip';
import Flag from '@material-ui/icons/Flag';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { getSceneFolderTreeViewItemId } from './SceneFolderTreeViewItemContent';
import {
  buildMoveToFolderSubmenu,
  moveNewSceneToFolder,
} from './SceneTreeViewHelpers';

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
  openSceneVariables: (layout: ?gdLayout) => void,
  onProjectItemModified: () => void,
  expandFolders: (folderIds: Array<string>) => void,
|};

export const getSceneTreeViewItemId = (scene: gdLayout): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `scene-${scene.ptr}`;
};

export class SceneTreeViewItemContent implements TreeViewItemContent {
  scene: gdLayout;
  // The node of the scenes folder structure holding this scene. Keeping it
  // avoids searching the whole tree every time the position of the scene or
  // its parent folder is needed.
  layoutFolderOrLayout: gdLayoutFolderOrLayout;
  props: SceneTreeViewItemProps;

  constructor(
    scene: gdLayout,
    layoutFolderOrLayout: gdLayoutFolderOrLayout,
    props: SceneTreeViewItemProps
  ) {
    this.scene = scene;
    this.layoutFolderOrLayout = layoutFolderOrLayout;
    this.props = props;
  }

  getLayoutFolderOrLayout(): gdLayoutFolderOrLayout {
    return this.layoutFolderOrLayout;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    if (itemContent.getId() === scenesRootFolderId) return true;

    let currentParent = this.layoutFolderOrLayout.getParent();
    while (!currentParent.isRootFolder()) {
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
    this.props.forceUpdateList();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    const { project } = this.props;
    const layoutFolderOrLayout = this.layoutFolderOrLayout;

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
        click: () => this.props.openSceneVariables(this.scene),
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
        label: i18n._(t`Move to folder`),
        submenu: buildMoveToFolderSubmenu(
          i18n,
          project,
          layoutFolderOrLayout,
          () => this._onFolderStructureModified(),
          () => this._addFolderInParent()
        ),
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
    // Removing the layout from the project also removes it from the scenes
    // folder structure, so nothing else has to be done here.
    this.props.onDeleteLayout(this.scene);
  }

  getIndex(): number {
    return this.layoutFolderOrLayout
      .getParent()
      .getChildPosition(this.layoutFolderOrLayout);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdLayoutFolderOrLayout
  ): void {
    const currentParentFolder = this.layoutFolderOrLayout.getParent();
    const destinationFolder = targetFolder || currentParentFolder;

    if (destinationFolder === currentParentFolder) {
      const originIndex = this.getIndex();
      if (destinationIndex === originIndex) return;
      currentParentFolder.moveChild(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
    } else {
      currentParentFolder.moveLayoutFolderOrLayoutToAnotherFolder(
        this.layoutFolderOrLayout,
        destinationFolder,
        destinationIndex
      );
    }

    this._onFolderStructureModified();
  }

  /**
   * A scene added to the project is put at the root of the folder structure:
   * move it right after this scene, so that a copy or a duplicate stays next
   * to the scene it was made from.
   */
  _placeNewSceneNextToThisOne(newSceneName: string): void {
    moveNewSceneToFolder(
      this.props.project,
      newSceneName,
      this.layoutFolderOrLayout.getParent(),
      this.getIndex() + 1
    );
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

    const newScene = project.insertNewLayout(
      newName,
      project.getLayoutsCount()
    );

    unserializeFromJSObject(newScene, copiedScene, 'unserializeFrom', project);
    // Unserialization has overwritten the name.
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);

    this._placeNewSceneNextToThisOne(newName);

    this._onFolderStructureModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  _duplicate(): void {
    const { project } = this.props;
    const newName = newNameGenerator(this.scene.getName(), name =>
      project.hasLayoutNamed(name)
    );

    const newScene = project.insertNewLayout(
      newName,
      project.getLayoutsCount()
    );

    unserializeFromJSObject(
      newScene,
      serializeToJSObject(this.scene),
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newScene.setName(newName);
    newScene.updateBehaviorsSharedData(project);

    this._placeNewSceneNextToThisOne(newName);

    this._onFolderStructureModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  /**
   * Add a new folder next to this scene and start editing its name, like the
   * objects list does.
   */
  _addFolderInParent(): void {
    const parentFolder = this.layoutFolderOrLayout.getParent();
    const newFolder = parentFolder.insertNewFolder('NewFolder', 0);

    this._onFolderStructureModified();
    this.props.expandFolders([
      parentFolder.isRootFolder()
        ? scenesRootFolderId
        : getSceneFolderTreeViewItemId(parentFolder),
    ]);
    // We focus it so the user can edit the name directly.
    this.props.editName(getSceneFolderTreeViewItemId(newFolder));
  }

  /**
   * The tree view caches the children of each item, so it must also be told to
   * rebuild them when the folder structure itself changed.
   */
  _onFolderStructureModified() {
    this._onProjectItemModified();
    this.props.forceUpdateList();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }

  _setProjectFirstScene(sceneName: string): void {
    this.props.project.setFirstLayout(sceneName);
    this.props.forceUpdate();
  }
}
