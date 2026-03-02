// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  // $FlowFixMe[import-type-as-value]
  TreeViewItemContent,
  type TreeItemProps,
} from '.';
import {
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumerateFunctionsInFolder,
} from './EnumerateFunctionFolderOrFunction';
import {
  getEventsFunctionTreeViewItemId,
  pasteEventsFunction,
  EVENTS_FUNCTION_CLIPBOARD_KIND,
} from './EventsFunctionTreeViewItemContent';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export const expandAllSubfolders = (
  functionFolder: gdFunctionFolderOrFunction,
  expandFolders: (
    functionFolderOrFunctionList: Array<gdFunctionFolderOrFunction>
  ) => void
) => {
  const subFolders = enumerateFoldersInFolder(functionFolder).map(
    folderAndPath => folderAndPath.folder
  );
  expandFolders([functionFolder, ...subFolders].map(folder => folder));
};

export type EventFunctionFolderCommonProps = {|
  ...TreeItemProps,
  expandFolders: (
    functionFolderOrFunctionList: Array<gdFunctionFolderOrFunction>
  ) => void,
  addFolder: (
    items: Array<gdFunctionFolderOrFunction>,
    eventsBasedBehavior?: ?gdEventsBasedBehavior,
    eventsBasedObject?: ?gdEventsBasedObject
  ) => void,
  addNewEventsFunction: ({|
    itemContent: ?TreeViewItemContent,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    parentFolder: gdFunctionFolderOrFunction,
    index: number,
  |}) => void,
  onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer: (
    functionFolderOrFunction: gdFunctionFolderOrFunction
  ) => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  setSelectedFunctionFolderOrFunction: (
    functionFolderOrFunction: gdFunctionFolderOrFunction | null,
    isSharedFunctions: boolean
  ) => void,
  onSelectEventsFunction: (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => void,
  onEventsFunctionAdded: (
    eventsFunction: gdEventsFunction,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject
  ) => void,
|};

export type EventsFunctionFolderProps = {|
  ...EventFunctionFolderCommonProps,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
|};

export const getEventsFunctionFolderTreeViewItemId = (
  functionFolder: gdFunctionFolderOrFunction
): string => {
  // Use the ptr as id since two folders can have the same name.
  // If using folder name, this would need for methods when renaming
  // the folder to keep it open.
  return `function-folder-${functionFolder.ptr}`;
};

export class EventsFunctionFolderTreeViewItemContent
  implements TreeViewItemContent {
  functionFolder: gdFunctionFolderOrFunction;
  props: EventsFunctionFolderProps;

  constructor(
    functionFolder: gdFunctionFolderOrFunction,
    props: EventsFunctionFolderProps
  ) {
    this.functionFolder = functionFolder;
    this.props = props;
  }

  getFunctionFolderOrFunction(): gdFunctionFolderOrFunction | null {
    return this.functionFolder;
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const functionFolderOrFunction = treeViewItemContent.getFunctionFolderOrFunction();
    return (
      !!functionFolderOrFunction &&
      this.functionFolder.isADescendantOf(functionFolderOrFunction)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const functionFolderOrFunction = treeViewItemContent.getFunctionFolderOrFunction();
    return (
      !!functionFolderOrFunction &&
      this.functionFolder.getParent() === functionFolderOrFunction.getParent()
    );
  }

  getIndex(): number {
    return this.functionFolder
      .getParent()
      .getChildPosition(this.functionFolder);
  }

  getName(): string | React.Node {
    return this.functionFolder.getFolderName();
  }

  getId(): string {
    return getEventsFunctionFolderTreeViewItemId(this.functionFolder);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataset(): ?HTMLDataset {
    return {
      folderName: this.functionFolder.getFolderName(),
    };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onSelect(): void {}

  onClick(): void {}

  rename(newName: string): void {
    if (this.getName() === newName) {
      return;
    }
    this.functionFolder.setFolderName(newName);
  }

  edit(): void {}

  _getPasteLabel(i18n: I18nType): any {
    let translation = t`Paste`;
    if (Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND)) {
      const clipboardContent = Clipboard.get(EVENTS_FUNCTION_CLIPBOARD_KIND);
      const clipboardObjectName =
        SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
      translation = t`Paste ${clipboardObjectName} inside folder`;
    }
    return i18n._(translation);
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    const {
      eventsFunctionsContainer,
      eventsBasedBehavior,
      eventsBasedObject,
      expandFolders,
      addFolder,
      addNewEventsFunction,
      onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
    } = this.props;

    const folderAndPathsInContainer = enumerateFoldersInContainer(
      eventsFunctionsContainer
    );
    folderAndPathsInContainer.unshift({
      path: i18n._(t`Root folder`),
      folder: eventsFunctionsContainer.getRootFolder(),
    });

    const filteredFolderAndPathsInContainer = folderAndPathsInContainer.filter(
      folderAndPath =>
        !folderAndPath.folder.isADescendantOf(this.functionFolder) &&
        folderAndPath.folder !== this.functionFolder
    );
    return [
      {
        label: this._getPasteLabel(i18n),
        enabled: Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND),
        click: () => this.paste(),
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
        label: i18n._('Move to folder'),
        submenu: [
          ...filteredFolderAndPathsInContainer.map(({ folder, path }) => ({
            label: path,
            enabled: folder !== this.functionFolder.getParent(),
            click: () => {
              if (folder === this.functionFolder.getParent()) return;
              this.functionFolder
                .getParent()
                .moveFunctionFolderOrFunctionToAnotherFolder(
                  this.functionFolder,
                  folder,
                  0
                );
              onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer(
                folder
              );
            },
          })),

          { type: 'separator' },
          {
            label: i18n._(t`Create new folder...`),
            click: () =>
              addFolder(
                [this.functionFolder.getParent()],
                eventsBasedBehavior,
                eventsBasedObject
              ),
          },
        ],
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add a new function`),
        click: () =>
          addNewEventsFunction({
            itemContent: this,
            eventsBasedBehavior,
            eventsBasedObject,
            parentFolder: this.functionFolder,
            index: 0,
          }),
      },
      {
        label: i18n._(t`Add a new folder`),
        click: () =>
          addFolder(
            [this.functionFolder],
            eventsBasedBehavior,
            eventsBasedObject
          ),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Expand all sub folders`),
        click: () => expandAllSubfolders(this.functionFolder, expandFolders),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const {
      eventsFunctionsContainer,
      forceUpdateList,
      showDeleteConfirmation,
      setSelectedFunctionFolderOrFunction,
    } = this.props;

    const functionsToDelete = enumerateFunctionsInFolder(this.functionFolder);
    if (functionsToDelete.length === 0) {
      // Folder is empty or contains only empty folders.
      setSelectedFunctionFolderOrFunction(null, false);
      this.functionFolder.getParent().removeFolderChild(this.functionFolder);
      forceUpdateList();
      return;
    }

    let message: MessageDescriptor;
    let title: MessageDescriptor;
    if (functionsToDelete.length === 1) {
      message = t`Are you sure you want to remove this folder and with it the function ${functionsToDelete[0].getName()}? This can't be undone.`;
      title = t`Remove folder and function`;
    } else {
      message = t`Are you sure you want to remove this folder and all its functions (${functionsToDelete
        .map(eventsFunction => eventsFunction.getName())
        .join(', ')})? This can't be undone.`;
      title = t`Remove folder and functions`;
    }

    const answer = await showDeleteConfirmation({ message, title });
    if (!answer) return;

    // TODO: Change selectedFunctionFolderOrFunctionWithContext so that it's easy
    // to remove an item using keyboard only and to navigate with the arrow
    // keys right after deleting it.
    setSelectedFunctionFolderOrFunction(null, false);

    for (const functionToDelete of functionsToDelete) {
      eventsFunctionsContainer.removeEventsFunction(functionToDelete.getName());
    }
    this.functionFolder.getParent().removeFolderChild(this.functionFolder);
    this._onProjectItemModified();
  }

  copy(): void {}

  cut(): void {}

  paste(): void {
    const newEventsFunction = pasteEventsFunction(
      this.props.eventsFunctionsContainer,
      this.functionFolder,
      this.getIndex() + 1
    );
    if (!newEventsFunction) {
      return;
    }
    this._onProjectItemModified();
    this.props.expandFolders([this.functionFolder]);
    this.props.onEventsFunctionAdded(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );

    this.props.onSelectEventsFunction(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
    this.props.editName(getEventsFunctionTreeViewItemId(newEventsFunction));
  }

  duplicate(): void {}

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
