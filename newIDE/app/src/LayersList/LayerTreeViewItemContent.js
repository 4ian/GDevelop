// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { TreeViewItemContent, type TreeItemProps, layersRootFolderId } from '.';
import Tooltip from '@material-ui/core/Tooltip';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import VisibilityIcon from '../UI/CustomSvgIcons/Visibility';
import VisibilityOffIcon from '../UI/CustomSvgIcons/VisibilityOff';
import LockIcon from '../UI/CustomSvgIcons/Lock';
import LockOpenIcon from '../UI/CustomSvgIcons/LockOpen';
import Radio from '@material-ui/core/Radio';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type LayerTreeViewItemProps = {|
  ...TreeItemProps,
  layersContainer: gdLayersContainer,
  chosenLayer: string,
  onChooseLayer: (layerName: string) => void,
  onSelectLayer: (layer: gdLayer | null) => void,
  onEditLayer: (layer: ?gdLayer) => void,
  onDeleteLayer: (layer: gdLayer) => void,
  onLayersModified: () => void,
  onRenameLayer: (oldName: string, newName: string) => void,
  triggerOnLayersModified: () => void,
|};

export const getLayerTreeViewItemId = (layer: gdLayer): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `layer-${layer.ptr}`;
};

export class LayerTreeViewItemContent implements TreeViewItemContent {
  layer: gdLayer;
  props: LayerTreeViewItemProps;

  constructor(layer: gdLayer, props: LayerTreeViewItemProps) {
    this.layer = layer;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === layersRootFolderId;
  }

  getRootId(): string {
    return layersRootFolderId;
  }

  getName(i18n: I18nType): string | React.Node {
    return this._isBaseLayer() ? i18n._(t`Base layer`) : this.layer.getName();
  }

  _isBaseLayer() {
    return !this.layer.getName();
  }

  getId(): string {
    return getLayerTreeViewItemId(this.layer);
  }

  getHtmlId(index: number): ?string {
    return `layer-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      scene: this.layer.getName(),
    };
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {
    this.props.onSelectLayer(this.layer);
  }

  rename(newName: string): void {
    if (!newName) {
      return;
    }
    const oldName = this.layer.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameLayer(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  _isVisible(): boolean {
    return this.layer.getVisibility();
  }

  _isLocked(): boolean {
    return this.layer.isLocked();
  }

  _setVisibility(visible: boolean): void {
    this.layer.setVisibility(visible);
    this.props.triggerOnLayersModified();
  }

  _setLocked(isLocked: boolean): void {
    this.layer.setLocked(isLocked);
    this.props.triggerOnLayersModified();
  }

  getRightButton(i18n: I18nType) {
    return [
      {
        icon: this._isVisible() ? <VisibilityIcon /> : <VisibilityOffIcon />,
        label: i18n._(t`Visible`),
        click: () => this._setVisibility(!this._isVisible()),
        id: 'layer-visibility',
      },
      {
        icon:
          this._isLocked() || !this._isVisible() ? (
            <LockIcon />
          ) : (
            <LockOpenIcon />
          ),
        label: i18n._(t`Locked`),
        enabled: this._isVisible(),
        click: () => this._setLocked(!this._isLocked()),
        id: 'layer-lock',
      },
    ];
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
        enabled: !this._isBaseLayer(),
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
        label: i18n._(t`Open layer editor`),
        click: () => {
          this.props.onEditLayer(this.layer);
          this.props.onSelectLayer(null);
        },
      },
      {
        type: 'separator',
      },
      {
        type: 'checkbox',
        label: i18n._(t`Visible`),
        checked: this._isVisible(),
        click: () => this._setVisibility(!this._isVisible()),
      },
      {
        type: 'checkbox',
        label: i18n._(t`Locked`),
        enabled: this._isVisible(),
        checked: this._isLocked() || !this._isVisible(),
        click: () => this._setLocked(!this._isLocked()),
      },
    ];
  }

  _isChosenLayer(): boolean {
    return this.layer.getName() === this.props.chosenLayer;
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return (
      <Tooltip
        style={styles.tooltip}
        title={<Trans>Layer where instances are added by default</Trans>}
      >
        <Radio
          checked={this._isChosenLayer()}
          onChange={() => this.props.onChooseLayer(this.layer.getName())}
          size="small"
          id={`layer-selected-${
            this._isChosenLayer() ? 'checked' : 'unchecked'
          }`}
        />
      </Tooltip>
    );
  }

  delete(): void {
    this.props.onDeleteLayer(this.layer);
  }

  getIndex(): number {
    return this._getRevertedIndex(
      this.props.layersContainer.getLayerPosition(this.layer.getName())
    );
  }

  _getRevertedIndex(index: number): number {
    return this.props.layersContainer.getLayersCount() - 1 - index;
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.layersContainer.moveLayer(
        this._getRevertedIndex(originIndex),
        // When moving the item down, it must not be counted.
        this._getRevertedIndex(
          destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
        )
      );
      this._onProjectItemModified();
    }
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }
}
