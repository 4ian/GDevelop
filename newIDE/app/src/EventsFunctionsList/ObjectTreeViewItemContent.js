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
import { TreeViewItemContent, type TreeItemProps } from '.';
import { getFunctionTreeViewItemId } from './FunctionTreeViewItemContent';

const gd: libGDevelop = global.gd;

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
  onEditEventsBasedObjectProperties: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
|};

export type EventObjectProps = {|
  ...TreeItemProps,
  ...EventObjectCallbacks,
  eventsBasedObjectsList: gdEventsBasedObjectsList,
|};

export const getObjectTreeViewItemId = (
  eventsBasedObject: gdEventsBasedObject
): string => {
  return 'objects.' + eventsBasedObject.getName();
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

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return this.object;
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

  rename(newName: string): void {
    if (this.object.getName() === newName) return;

    this.props.onRenameEventsBasedObject(this.object, newName, doRename => {
      if (!doRename) return;

      this._onEventsBasedObjectModified();
      this.props.onEventsBasedObjectRenamed(this.object);
    });
  }

  edit(): void {
    this.props.onEditEventsBasedObjectProperties(this.object);
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    const eventsBasedObject = this.object;
    return [
      {
        label: i18n._(t`Properties`),
        click: () =>
          this.props.onEditEventsBasedObjectProperties(eventsBasedObject),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
      },
      {
        label: i18n._(t`Delete`),
        click: () =>
          this._deleteEventsBasedObject(eventsBasedObject, {
            askForConfirmation: true,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this._copyEventsBasedObject(eventsBasedObject),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsBasedObject(eventsBasedObject),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedObject(index + 1),
      },
    ];
  }

  _deleteEventsBasedObject = (
    eventsBasedObject: gdEventsBasedObject,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsBasedObjectsList } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this object? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsBasedObject(eventsBasedObject, doRemove => {
      if (!doRemove) return;

      eventsBasedObjectsList.remove(eventsBasedObject.getName());
      this._onEventsBasedObjectModified();
    });
  };

  _copyEventsBasedObject = (eventsBasedObject: gdEventsBasedObject) => {
    Clipboard.set(EVENTS_BASED_OBJECT_CLIPBOARD_KIND, {
      eventsBasedObject: serializeToJSObject(eventsBasedObject),
      name: eventsBasedObject.getName(),
    });
  };

  _cutEventsBasedObject = (eventsBasedObject: gdEventsBasedObject) => {
    this._copyEventsBasedObject(eventsBasedObject);
    this._deleteEventsBasedObject(eventsBasedObject, {
      askForConfirmation: false,
    });
  };

  _pasteEventsBasedObject = (index: number) => {
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
      index
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
  };

  _addNewEventsBasedObject = () => {
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
  };

  _onEventsBasedObjectModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }
}
