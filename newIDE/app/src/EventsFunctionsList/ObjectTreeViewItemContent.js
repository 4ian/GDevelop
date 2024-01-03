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
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  TreeViewItemContent,
  type TreeItemProps,
  extensionObjectsRootFolderId,
} from '.';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';

const EVENTS_BASED_OBJECT_CLIPBOARD_KIND = 'Events Based Object';

export type EventObjectCallbacks = {|
  onSelectEventsBasedObject: (eventsBasedObject: ?gdEventsBasedObject) => void,
  onDeleteEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedObjectRenamed: (eventsBasedObject: gdEventsBasedObject) => void,
|};

export type EventObjectProps = {|
  ...TreeItemProps,
  ...EventObjectCallbacks,
  addNewEventsFunction: (itemContent: TreeViewItemContent) => void,
  eventsBasedObjectsList: gdEventsBasedObjectsList,
|};

export const getObjectTreeViewItemId = (
  eventsBasedObject: gdEventsBasedObject
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return 'object-' + eventsBasedObject.ptr;
};

export class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdEventsBasedObject;
  props: EventObjectProps;

  constructor(object: gdEventsBasedObject, props: EventObjectProps) {
    this.object = object;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.object.getEventsFunctions();
  }

  getFunctionInsertionIndex(): number {
    return this.object.getEventsFunctions().getEventsFunctionsCount();
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return this.object;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === extensionObjectsRootFolderId;
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

  onSelect(): void {
    this.props.onSelectEventsBasedObject(this.object);
  }

  rename(newName: string): void {
    if (this.object.getName() === newName) return;

    this.props.onRenameEventsBasedObject(this.object, newName, doRename => {
      if (!doRename) return;

      this._onEventsBasedObjectModified();
      this.props.onEventsBasedObjectRenamed(this.object);
    });
  }

  edit(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Add a function`),
        click: () => this.props.addNewEventsFunction(this),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        accelerator: getShortcutDisplayName(
          this.props.preferences.values.userShortcutMap[
            'RENAME_SCENE_OBJECT'
          ] || defaultShortcuts.RENAME_SCENE_OBJECT
        ),
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
        click: () => this._copyEventsBasedObject(),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsBasedObject(),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedObject(),
      },
    ];
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this._deleteEventsBasedObject({
      askForConfirmation: true,
    });
  }

  async _deleteEventsBasedObject({
    askForConfirmation,
  }: {|
    askForConfirmation: boolean,
  |}): Promise<void> {
    const { eventsBasedObjectsList } = this.props;

    if (askForConfirmation) {
      const answer = await this.props.showDeleteConfirmation({
        title: t`Remove object`,
        message: t`Are you sure you want to remove this object? This can't be undone.`,
      });
      if (!answer) return;
    }

    this.props.onDeleteEventsBasedObject(this.object, doRemove => {
      if (!doRemove) return;

      eventsBasedObjectsList.remove(this.object.getName());
      this._onEventsBasedObjectModified();
    });
  }

  getIndex(): number {
    return this.props.eventsBasedObjectsList.getPosition(this.object);
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    this.props.eventsBasedObjectsList.move(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
  }

  _copyEventsBasedObject(): void {
    Clipboard.set(EVENTS_BASED_OBJECT_CLIPBOARD_KIND, {
      eventsBasedObject: serializeToJSObject(this.object),
      name: this.object.getName(),
    });
  }

  _cutEventsBasedObject(): void {
    this._copyEventsBasedObject();
    this._deleteEventsBasedObject({
      askForConfirmation: false,
    });
  }

  _pasteEventsBasedObject(): void {
    if (!Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EVENTS_BASED_OBJECT_CLIPBOARD_KIND);
    const copiedEventsBasedObject = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsBasedObject'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsBasedObject) return;

    const { project, eventsBasedObjectsList } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsBasedObjectsList.has(name)
    );

    const newEventsBasedObject = eventsBasedObjectsList.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsBasedObject,
      copiedEventsBasedObject,
      'unserializeFrom',
      project
    );
    newEventsBasedObject.setName(newName);

    this._onEventsBasedObjectModified();
    this.props.onSelectEventsBasedObject(newEventsBasedObject);
    this.props.editName(getObjectTreeViewItemId(newEventsBasedObject));
  }

  _addNewEventsBasedObject(): void {
    const { eventsBasedObjectsList } = this.props;

    const name = newNameGenerator('MyObject', name =>
      eventsBasedObjectsList.has(name)
    );
    const newEventsBasedObject = eventsBasedObjectsList.insertNew(
      name,
      eventsBasedObjectsList.getCount()
    );
    this._onEventsBasedObjectModified();

    const newEventsBasedObjectId = getObjectTreeViewItemId(
      newEventsBasedObject
    );
    // Scroll to the new function.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      this.props.scrollToItem(newEventsBasedObjectId);
    }, 100); // A few ms is enough for a new render to be done.

    // We focus it so the user can edit the name directly.
    this.props.onSelectEventsBasedObject(newEventsBasedObject);
    this.props.editName(newEventsBasedObjectId);
  }

  _onEventsBasedObjectModified(): void {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton() {
    return null;
  }
}
