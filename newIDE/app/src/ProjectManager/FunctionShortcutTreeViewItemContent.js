// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import { type TreeViewItemContent, functionsRootFolderId } from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { getFunctionIconUrl } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';

export type FunctionShortcutTreeViewItemCallbacks = {|
  onOpenEventsFunctionsExtension: (
    string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
  ) => void,
|};

export type FunctionShortcutTreeViewItemProps = {|
  ...FunctionShortcutTreeViewItemCallbacks,
|};

export const getFunctionShortcutTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction
): string => {
  // Pointers are used because they stay the same even when names are changed.
  return `function-shortcut-${eventsFunctionsExtension.ptr}-${
    eventsFunction.ptr
  }`;
};

export class FunctionShortcutTreeViewItemContent
  implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  eventsFunction: gdEventsFunction;
  props: FunctionShortcutTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsFunction: gdEventsFunction,
    props: FunctionShortcutTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.eventsFunction = eventsFunction;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.eventsFunction.getName();
  }

  getId(): string {
    return getFunctionShortcutTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsFunction
    );
  }

  getRootId(): string {
    return functionsRootFolderId;
  }

  getHtmlId(index: number): ?string {
    return `function-shortcut-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      extension: this.eventsFunctionsExtension.getName(),
      functionName: this.eventsFunction.getName(),
    };
  }

  getThumbnail(): ?string {
    return getFunctionIconUrl(
      this.eventsFunction.getFunctionType(),
      this.eventsFunction.getName()
    );
  }

  onClick(): void {
    this.props.onOpenEventsFunctionsExtension(
      this.eventsFunctionsExtension.getName(),
      this.eventsFunction.getName(),
      null,
      null
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return [
      {
        label: i18n._(t`Open function`),
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
    return itemContent.getId() === functionsRootFolderId;
  }
}
