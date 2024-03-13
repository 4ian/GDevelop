// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { TreeViewItemContent, type TreeItemProps, scenesRootFolderId } from '.';
import Tooltip from '@material-ui/core/Tooltip';
import Flag from '@material-ui/icons/Flag';

const SCENE_CLIPBOARD_KIND = 'Layout';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type SceneTreeViewItemCallbacks = {|
  onDeleteLayout: gdLayout => void,
  onRenameLayout: (string, string) => void,
  onOpenLayout: string => void,
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

  getDataSet(): { [string]: string } {
    return {
      scene: this.scene.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/scene_black.svg';
  }

  onClick(): void {
    this.props.onOpenLayout(this.scene.getName());
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

  getIndex(): number {
    return this.props.project.getLayoutPosition(this.scene.getName());
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.project.moveLayout(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
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
