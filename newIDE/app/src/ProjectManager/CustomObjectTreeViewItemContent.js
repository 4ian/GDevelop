// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import { type TreeViewItemContent, customObjectsRootFolderId } from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export type CustomObjectTreeViewItemCallbacks = {|
  onOpenCustomObjectEditor: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject,
    string
  ) => void,
|};

export type CustomObjectTreeViewItemProps = {|
  ...CustomObjectTreeViewItemCallbacks,
|};

export const getCustomObjectTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject
): string => {
  // Pointers are used because they stay the same even when names are changed.
  return `custom-object-${eventsFunctionsExtension.ptr}-${
    eventsBasedObject.ptr
  }`;
};

export class CustomObjectTreeViewItemContent implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  eventsBasedObject: gdEventsBasedObject;
  props: CustomObjectTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    props: CustomObjectTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.eventsBasedObject = eventsBasedObject;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.eventsBasedObject.getName();
  }

  getId(): string {
    return getCustomObjectTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedObject
    );
  }

  getRootId(): string {
    return customObjectsRootFolderId;
  }

  getHtmlId(index: number): ?string {
    return `custom-object-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      extension: this.eventsFunctionsExtension.getName(),
      objectName: this.eventsBasedObject.getName(),
    };
  }

  getThumbnail(): ?string {
    return this.eventsBasedObject.isRenderedIn3D()
      ? 'res/functions/object3d_black.svg'
      : 'res/functions/object2d_black.svg';
  }

  onClick(): void {
    this.props.onOpenCustomObjectEditor(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      ''
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return [
      {
        label: i18n._(t`Open visual editor`),
        click: () => this.onClick(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const extensionName = this.eventsFunctionsExtension.getName();
    return (
      <Text
        size="body2"
        color="secondary"
        noMargin
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        tooltip={extensionName}
      >
        {extensionName}
      </Text>
    );
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === customObjectsRootFolderId;
  }
}
