// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  functionsRootFolderId,
  getProjectManagerShortcutExtensionGroupId,
} from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  canFunctionBeRenamed,
  getFunctionIconUrl,
} from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import { type ProjectItemUsageTarget } from './ProjectItemUsageFinder';

const gd: libGDevelop = global.gd;

export type FunctionShortcutTreeViewItemCallbacks = {|
  onOpenEventsFunctionsExtension: (
    string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
  ) => void,
|};

type ProjectItemUsageCallbacks = {|
  onFindUsage: ProjectItemUsageTarget => void,
|};

export type FunctionShortcutTreeViewItemProps = {|
  ...TreeItemProps,
  ...FunctionShortcutTreeViewItemCallbacks,
  ...ProjectItemUsageCallbacks,
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
      {
        label: i18n._(t`Find usage`),
        click: () =>
          this.props.onFindUsage({
            kind: 'events-function',
            eventsFunctionsExtension: this.eventsFunctionsExtension,
            eventsFunction: this.eventsFunction,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        enabled: this.canBeRenamed(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  rename(newName: string): void {
    if (!this.canBeRenamed()) return;

    const oldName = this.eventsFunction.getName();
    if (oldName === newName) return;

    const eventsFunctionsContainer = this.eventsFunctionsExtension.getEventsFunctions();
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName =>
        gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
          tentativeNewName
        ) || eventsFunctionsContainer.hasEventsFunctionNamed(tentativeNewName)
    );
    if (oldName === safeAndUniqueNewName) return;

    gd.WholeProjectRefactorer.renameEventsFunction(
      this.props.project,
      this.eventsFunctionsExtension,
      oldName,
      safeAndUniqueNewName
    );
    this.eventsFunction.setName(safeAndUniqueNewName);
    this._onProjectItemModified();
  }

  edit(): void {
    if (this.canBeRenamed()) {
      this.props.editName(this.getId());
    }
  }

  canBeRenamed(): boolean {
    return canFunctionBeRenamed(this.eventsFunction, 'extension');
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const answer = await this.props.showDeleteConfirmation({
      title: t`Remove function`,
      message: t`Are you sure you want to remove this function? This can't be undone.`,
    });
    if (!answer) return;

    this.eventsFunctionsExtension
      .getEventsFunctions()
      .removeEventsFunction(this.eventsFunction.getName());
    this._onProjectItemModified();
  }

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  _duplicate(): void {
    const eventsFunctionsContainer = this.eventsFunctionsExtension.getEventsFunctions();
    const newName = newNameGenerator(this.eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      this.eventsFunction,
      eventsFunctionsContainer.getEventsFunctionsCount()
    );
    newEventsFunction.setName(newName);

    this._onProjectItemModified();
    this.props.editName(
      getFunctionShortcutTreeViewItemId(
        this.eventsFunctionsExtension,
        newEventsFunction
      )
    );
  }

  _onProjectItemModified(): void {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    this.props.forceUpdate();
    this.props.forceUpdateList();
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return (
      itemContent.getId() === functionsRootFolderId ||
      itemContent.getId() ===
        getProjectManagerShortcutExtensionGroupId(
          functionsRootFolderId,
          this.eventsFunctionsExtension
        )
    );
  }
}
