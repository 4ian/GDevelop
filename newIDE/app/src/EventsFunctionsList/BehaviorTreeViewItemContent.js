// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type EventFunctionProps, TreeViewItemContent } from '.';

const gd: libGDevelop = global.gd;

const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

export const getBehaviorTreeViewItemId = (
  eventsBasedBehavior: gdEventsBasedBehavior
): string => {
  return 'behaviors.' + eventsBasedBehavior.getName();
};

export class BehaviorTreeViewItemContent implements TreeViewItemContent {
  behavior: gdEventsBasedBehavior;

  constructor(behavior: gdEventsBasedBehavior) {
    this.behavior = behavior;
  }

  getName(): string | React.Node {
    return this.behavior.getName();
  }
  getId(): string {
    return getBehaviorTreeViewItemId(this.behavior);
  }
  getHtmlId(index: number): ?string {
    return `behavior-item-${index}`;
  }
  getThumbnail(): ?string {
    return null;
  }
  getDataset(): ?HTMLDataset {
    return null;
  }
  onSelect(): void {}
  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }
}
