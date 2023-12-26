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

export const getObjectTreeViewItemId = (
  eventsBasedObject: gdEventsBasedObject
): string => {
  return 'objects.' + eventsBasedObject.getName();
};

export class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdEventsBasedObject;

  constructor(object: gdEventsBasedObject) {
    this.object = object;
  }

  getName(): string | React.Node {
    return this.object.getName();
  }
  getId(): string {
    return getObjectTreeViewItemId(this.object);
  }
  getHtmlId(index: number): ?string {
    return `object-item-${index}`;
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
