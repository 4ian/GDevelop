// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  // $FlowFixMe[import-type-as-value]
  TreeViewItemContent,
  type TreeItemProps,
  extensionsRootFolderId,
} from '.';
import { isExtensionNameTaken } from './EventFunctionExtensionNameVerifier';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND = 'Events Functions Extension';

export type ExtensionTreeViewItemCallbacks = {|
  onDeleteEventsFunctionsExtension: gdEventsFunctionsExtension => Promise<void>,
  onRenameEventsFunctionsExtension: (string, string) => void,
  onOpenEventsFunctionsExtension: string => void,
  onReloadEventsFunctionsExtensions: () => void,
|};

export type ExtensionTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...ExtensionTreeViewItemCallbacks,
|};

export type ExtensionTreeViewItemProps = {|
  ...ExtensionTreeViewItemCommonProps,
  project: gdProject,
  onEditEventsFunctionExtensionOrSeeDetails: (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => void,
|};

export const getExtensionTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `extension-${eventsFunctionsExtension.ptr}`;
};

export class ExtensionTreeViewItemContent implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  props: ExtensionTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    props: ExtensionTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.props = props;
  }

  /**
   * Returns true if the underlying C++ object is still valid and accessible.
   * The object may have been freed if the project was closed/reloaded or if
   * the extension was removed.
   */
  _isValid(): boolean {
    try {
      this.eventsFunctionsExtension.getName();
      return true;
    } catch (e) {
      return false;
    }
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === extensionsRootFolderId;
  }

  getRootId(): string {
    return extensionsRootFolderId;
  }

  getName(): string | React.Node {
    try {
      return this.eventsFunctionsExtension.getName();
    } catch (e) {
      console.warn(
        'Could not read the name of an extension - it was probably removed or the project was closed.',
        e
      );
      return '';
    }
  }

  getId(): string {
    return getExtensionTreeViewItemId(this.eventsFunctionsExtension);
  }

  getHtmlId(index: number): ?string {
    return `extension-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    try {
      return {
        extension: this.eventsFunctionsExtension.getName(),
      };
    } catch (e) {
      return null;
    }
  }

  getThumbnail(): ?string {
    try {
      return (
        this.eventsFunctionsExtension.getIconUrl() ||
        'res/functions/extension_black.svg'
      );
    } catch (e) {
      return 'res/functions/extension_black.svg';
    }
  }

  onClick(): void {
    this.props.onEditEventsFunctionExtensionOrSeeDetails(
      this.eventsFunctionsExtension
    );
  }

  rename(newName: string): void {
    if (!this._isValid()) return;
    const oldName = this.eventsFunctionsExtension.getName();
    if (oldName === newName) {
      return;
    }
    this.eventsFunctionsExtension.setOrigin('', '');
    this.props.onRenameEventsFunctionsExtension(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
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
        enabled: Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this.props.onDeleteEventsFunctionsExtension(this.eventsFunctionsExtension);
  }

  getIndex(): number {
    if (!this._isValid()) return 0;
    return this.props.project.getEventsFunctionsExtensionPosition(
      this.eventsFunctionsExtension.getName()
    );
  }

  moveAt(destinationIndex: number): void {
    if (!this._isValid()) return;
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.project.moveEventsFunctionsExtension(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
  }

  copy(): void {
    if (!this._isValid()) return;
    Clipboard.set(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND, {
      eventsFunctionsExtension: serializeToJSObject(
        this.eventsFunctionsExtension
      ),
      name: this.eventsFunctionsExtension.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(
      EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND
    );
    const copiedEventsFunctionsExtension = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsFunctionsExtension'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsFunctionsExtension) return;

    const project = this.props.project;
    const newName = newNameGenerator(name, name =>
      isExtensionNameTaken(name, project)
    );

    const newEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsFunctionsExtension,
      copiedEventsFunctionsExtension,
      'unserializeFrom',
      project
    );
    newEventsFunctionsExtension.setName(newName); // Unserialization has overwritten the name.
    if (newName !== name) {
      newEventsFunctionsExtension.setOrigin('', '');
    }

    this._onProjectItemModified();
    this.props.onReloadEventsFunctionsExtensions();
    this.props.editName(
      getExtensionTreeViewItemId(newEventsFunctionsExtension)
    );
  }

  _duplicate(): void {
    this.copy();
    this.paste();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
