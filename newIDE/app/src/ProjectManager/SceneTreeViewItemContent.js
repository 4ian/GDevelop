// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
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
import { addFolderIn } from './ProjectItemFolderTreeViewItemContent';
import {
  type ProjectItemFoldersKind,
  buildMoveToFolderSubmenu,
  getFolderOrItemTreeViewItemId,
  isFolderOrItemDescendantOf,
  getFolderOrItemIndex,
  moveFolderOrItemAt,
  moveNewItemToFolder,
} from './ProjectItemFolders';
import {
  copyFolderOrItemToClipboard,
  pasteFolderOrItemsFromClipboard,
  hasFolderOrItemsInClipboard,
  getPasteMenuLabel,
} from './ProjectItemFoldersClipboard';

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

export const sceneFoldersKind: ProjectItemFoldersKind = {
  name: 'scene',
  getRootId: () => scenesRootFolderId,
  getRootFolder: project => project.getLayoutsRootFolder(),
  hasItemNamed: (project, name) => project.hasLayoutNamed(name),
  getItemTreeViewItemId: getSceneTreeViewItemId,
  insertItemFromSerializedContent: (project, name, serializedLayout) => {
    const newLayout = project.insertNewLayout(name, project.getLayoutsCount());
    unserializeFromJSObject(
      newLayout,
      serializedLayout,
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newLayout.setName(name);
    newLayout.updateBehaviorsSharedData(project);
    return newLayout;
  },
  legacyClipboard: { kind: 'Layout', itemProperty: 'layout' },
  addItemLabel: t`Add a scene`,
  removeFolderMessage: t`The scenes and folders it contains will be moved out of it, not removed. Do you want to continue?`,
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

  getFolderOrItem(): gdLayoutFolderOrLayout {
    return this.layoutFolderOrLayout;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return isFolderOrItemDescendantOf(
      sceneFoldersKind,
      this.layoutFolderOrLayout,
      itemContent
    );
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
          sceneFoldersKind,
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
        label: getPasteMenuLabel(i18n, sceneFoldersKind),
        enabled: hasFolderOrItemsInClipboard(sceneFoldersKind),
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
    return getFolderOrItemIndex(this.layoutFolderOrLayout);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdLayoutFolderOrLayout
  ): void {
    moveFolderOrItemAt(
      this.layoutFolderOrLayout,
      destinationIndex,
      targetFolder
    );
    this._onFolderStructureModified();
  }

  copy(): void {
    copyFolderOrItemToClipboard(sceneFoldersKind, this.layoutFolderOrLayout);
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    const pastedContent = pasteFolderOrItemsFromClipboard({
      kind: sceneFoldersKind,
      project: this.props.project,
      destinationFolder: this.layoutFolderOrLayout.getParent(),
      positionInFolder: this.getIndex() + 1,
    });
    if (!pastedContent) return;

    this._onFolderStructureModified();
    const firstPastedItem = pastedContent.topLevelFolderOrItems[0];
    if (firstPastedItem) {
      this.props.editName(
        getFolderOrItemTreeViewItemId(sceneFoldersKind, firstPastedItem)
      );
    }
    if (pastedContent.createdItems.length > 0) this.props.onSceneAdded();
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
    moveNewItemToFolder(
      sceneFoldersKind,
      project,
      newName,
      this.layoutFolderOrLayout.getParent(),
      this.getIndex() + 1
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

    this._onFolderStructureModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  _addFolderInParent(): void {
    addFolderIn(
      { ...this.props, kind: sceneFoldersKind },
      this.layoutFolderOrLayout.getParent()
    );
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
