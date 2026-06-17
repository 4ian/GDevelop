// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import { type TreeViewItemContent, behaviorsRootFolderId } from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export type BehaviorShortcutTreeViewItemCallbacks = {|
  onOpenEventsFunctionsExtension: (
    string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
  ) => void,
|};

export type BehaviorShortcutTreeViewItemProps = {|
  ...BehaviorShortcutTreeViewItemCallbacks,
|};

export const getBehaviorShortcutTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior
): string => {
  // Pointers are used because they stay the same even when names are changed.
  return `behavior-shortcut-${eventsFunctionsExtension.ptr}-${
    eventsBasedBehavior.ptr
  }`;
};

export class BehaviorShortcutTreeViewItemContent
  implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  eventsBasedBehavior: gdEventsBasedBehavior;
  props: BehaviorShortcutTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedBehavior: gdEventsBasedBehavior,
    props: BehaviorShortcutTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.eventsBasedBehavior = eventsBasedBehavior;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.eventsBasedBehavior.getName();
  }

  getId(): string {
    return getBehaviorShortcutTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedBehavior
    );
  }

  getRootId(): string {
    return behaviorsRootFolderId;
  }

  getHtmlId(index: number): ?string {
    return `behavior-shortcut-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      extension: this.eventsFunctionsExtension.getName(),
      behaviorName: this.eventsBasedBehavior.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/functions/behavior_black.svg';
  }

  onClick(): void {
    this.props.onOpenEventsFunctionsExtension(
      this.eventsFunctionsExtension.getName(),
      null,
      this.eventsBasedBehavior.getName(),
      null
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return [
      {
        label: i18n._(t`Open behavior`),
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
    return itemContent.getId() === behaviorsRootFolderId;
  }
}
