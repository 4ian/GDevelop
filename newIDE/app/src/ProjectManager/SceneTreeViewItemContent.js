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
import { ProjectItemInFolder } from './ProjectItemInFolder';
import {
  type ProjectItemFoldersKind,
  moveNewItemToFolder,
} from './ProjectItemFolders';

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
  folderOrItem: gdLayoutFolderOrLayout;
  inFolder: ProjectItemInFolder;
  props: SceneTreeViewItemProps;

  constructor(
    scene: gdLayout,
    folderOrItem: gdLayoutFolderOrLayout,
    props: SceneTreeViewItemProps
  ) {
    this.scene = scene;
    this.folderOrItem = folderOrItem;
    this.inFolder = new ProjectItemInFolder(
      sceneFoldersKind,
      folderOrItem,
      props,
      () => props.onSceneAdded()
    );
    this.props = props;
  }

  getFolderOrItem(): gdLayoutFolderOrLayout {
    return this.folderOrItem;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return this.inFolder.isDescendantOf(itemContent);
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
      this.inFolder.buildMoveToFolderMenuItem(i18n),
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
      this.inFolder.buildPasteMenuItem(i18n, () => this.paste()),
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
    return this.inFolder.getIndex();
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdLayoutFolderOrLayout
  ): void {
    this.inFolder.moveAt(destinationIndex, targetFolder);
  }

  copy(): void {
    this.inFolder.copy();
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    this.inFolder.paste();
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
      this.folderOrItem.getParent(),
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

    this.inFolder.onFolderStructureModified();
    this.props.editName(getSceneTreeViewItemId(newScene));
    this.props.onSceneAdded();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }

  _setProjectFirstScene(sceneName: string): void {
    this.props.project.setFirstLayout(sceneName);
    this.props.forceUpdate();
  }
}
