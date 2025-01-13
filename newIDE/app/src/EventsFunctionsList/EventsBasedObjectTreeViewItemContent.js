// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

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
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import Add from '../UI/CustomSvgIcons/Add';

const EVENTS_BASED_OBJECT_CLIPBOARD_KIND = 'Events Based Object';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type EventsBasedObjectCreationParameters = {|
  isRenderedIn3D: boolean,
|};

export type EventsBasedObjectCallbacks = {|
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
  onAddEventsBasedObject: (
    (parameters: ?EventsBasedObjectCreationParameters) => void
  ) => void,
  onEventsBasedObjectRenamed: (eventsBasedObject: gdEventsBasedObject) => void,
  onEventsBasedObjectPasted: (
    eventsBasedObject: gdEventsBasedObject,
    sourceExtensionName: string,
    sourceEventsBasedObjectName: string
  ) => void,
  onOpenCustomObjectEditor: (eventsBasedObject: gdEventsBasedObject) => void,
|};

export type EventsBasedObjectProps = {|
  ...TreeItemProps,
  ...EventsBasedObjectCallbacks,
  addNewEventsFunction: ({|
    itemContent: ?TreeViewItemContent,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    index: number,
  |}) => void,
  eventsBasedObjectsList: gdEventsBasedObjectsList,
|};

export const getObjectTreeViewItemId = (
  eventsBasedObject: gdEventsBasedObject
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return 'object-' + eventsBasedObject.ptr;
};

export class EventsBasedObjectTreeViewItemContent
  implements TreeViewItemContent {
  eventsBasedObject: gdEventsBasedObject;
  props: EventsBasedObjectProps;

  constructor(
    eventsBasedObject: gdEventsBasedObject,
    props: EventsBasedObjectProps
  ) {
    this.eventsBasedObject = eventsBasedObject;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.eventsBasedObject.getEventsFunctions();
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return this.eventsBasedObject;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === extensionObjectsRootFolderId;
  }

  getName(): string | React.Node {
    return this.eventsBasedObject.getName();
  }

  getId(): string {
    return getObjectTreeViewItemId(this.eventsBasedObject);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getThumbnail(): ?string {
    return this.eventsBasedObject.isRenderedIn3D()
      ? 'res/functions/object3d_black.svg'
      : 'res/functions/object2d_black.svg';
  }

  getDataset(): ?HTMLDataset {
    return { objectName: this.eventsBasedObject.getName() };
  }

  onSelect(): void {
    this.props.onSelectEventsBasedObject(this.eventsBasedObject);
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.eventsBasedObject.getName() === newName) return;

    this.props.onRenameEventsBasedObject(
      this.eventsBasedObject,
      newName,
      doRename => {
        if (!doRename) return;

        this._onEventsBasedObjectModified();
        this.props.onEventsBasedObjectRenamed(this.eventsBasedObject);
      }
    );
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Open visual editor`),
        click: () =>
          this.props.onOpenCustomObjectEditor(this.eventsBasedObject),
      },
      {
        label: i18n._(t`Add a function`),
        click: () => this.addFunctionAtSelection(),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        label: this.eventsBasedObject.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(),
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
        enabled: Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
    ].filter(Boolean);
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return this.eventsBasedObject.isPrivate() ? (
      <Tooltip
        title={
          <Trans>
            This object won't be visible in the scene and events editors.
          </Trans>
        }
      >
        <VisibilityOff
          fontSize="small"
          style={{
            ...styles.tooltip,
            color: this.props.gdevelopTheme.text.color.disabled,
          }}
        />
      </Tooltip>
    ) : null;
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

    this.props.onDeleteEventsBasedObject(this.eventsBasedObject, doRemove => {
      if (!doRemove) return;

      eventsBasedObjectsList.remove(this.eventsBasedObject.getName());
      this._onEventsBasedObjectModified();
    });
  }

  _togglePrivate(): void {
    this.eventsBasedObject.setPrivate(!this.eventsBasedObject.isPrivate());
    this.props.forceUpdateEditor();
  }

  getIndex(): number {
    return this.props.eventsBasedObjectsList.getPosition(
      this.eventsBasedObject
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    this.props.eventsBasedObjectsList.move(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
  }

  copy(): void {
    Clipboard.set(EVENTS_BASED_OBJECT_CLIPBOARD_KIND, {
      eventsBasedObject: serializeToJSObject(this.eventsBasedObject),
      name: this.eventsBasedObject.getName(),
      extensionName: this.props.eventsFunctionsExtension.getName(),
    });
  }

  cut(): void {
    this.copy();
    this._deleteEventsBasedObject({
      askForConfirmation: false,
    });
  }

  paste(): void {
    if (!Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EVENTS_BASED_OBJECT_CLIPBOARD_KIND);
    const copiedEventsBasedObject = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsBasedObject'
    );
    const sourceEventsBasedObjectName = SafeExtractor.extractStringProperty(
      clipboardContent,
      'name'
    );
    if (!sourceEventsBasedObjectName || !copiedEventsBasedObject) return;

    const { project, eventsBasedObjectsList } = this.props;

    const newName = newNameGenerator(sourceEventsBasedObjectName, name =>
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

    const sourceExtensionName = SafeExtractor.extractStringProperty(
      clipboardContent,
      'extensionName'
    );
    if (sourceExtensionName) {
      this.props.onEventsBasedObjectPasted(
        newEventsBasedObject,
        sourceExtensionName,
        sourceEventsBasedObjectName
      );
    }

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

  getRightButton(i18n: I18nType) {
    return {
      icon: <Add />,
      label: i18n._(t`Add a function`),
      click: () => this.addFunctionAtSelection(),
    };
  }

  addFunctionAtSelection(): void {
    const { selectedEventsFunction, selectedEventsBasedObject } = this.props;
    const eventsFunctionsContainer = this.eventsBasedObject.getEventsFunctions();
    // When the selected item is inside the object, the new function is
    // added below it.
    const index =
      selectedEventsBasedObject === this.eventsBasedObject &&
      selectedEventsFunction
        ? eventsFunctionsContainer.getEventsFunctionPosition(
            selectedEventsFunction
          ) + 1
        : eventsFunctionsContainer.getEventsFunctionsCount();
    this.props.addNewEventsFunction({
      itemContent: this,
      eventsBasedBehavior: null,
      eventsBasedObject: this.eventsBasedObject,
      index,
    });
  }
}
