// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import Text from '../UI/Text';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  behaviorsRootFolderId,
} from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type ProjectItemUsageTarget } from './ProjectItemUsageFinder';

const gd: libGDevelop = global.gd;

export type BehaviorShortcutTreeViewItemCallbacks = {|
  onOpenEventsFunctionsExtension: (
    string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
  ) => void,
  onOpenBehaviorSettings: (
    gdEventsFunctionsExtension,
    gdEventsBasedBehavior
  ) => void,
|};

type ProjectItemUsageCallbacks = {|
  onFindUsage: ProjectItemUsageTarget => void,
|};

export type BehaviorShortcutTreeViewItemProps = {|
  ...TreeItemProps,
  ...BehaviorShortcutTreeViewItemCallbacks,
  ...ProjectItemUsageCallbacks,
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
      {
        label: i18n._(t`Open behavior settings`),
        click: () =>
          this.props.onOpenBehaviorSettings(
            this.eventsFunctionsExtension,
            this.eventsBasedBehavior
          ),
      },
      {
        label: i18n._(t`Find usage`),
        click: () =>
          this.props.onFindUsage({
            kind: 'events-based-behavior',
            eventsFunctionsExtension: this.eventsFunctionsExtension,
            eventsBasedBehavior: this.eventsBasedBehavior,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
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

  rename(newName: string): void {
    const oldName = this.eventsBasedBehavior.getName();
    if (oldName === newName) return;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName =>
        this.eventsFunctionsExtension
          .getEventsBasedBehaviors()
          .has(tentativeNewName)
    );
    if (oldName === safeAndUniqueNewName) return;

    gd.WholeProjectRefactorer.renameEventsBasedBehavior(
      this.props.project,
      this.eventsFunctionsExtension,
      oldName,
      safeAndUniqueNewName
    );
    this.eventsBasedBehavior.setName(safeAndUniqueNewName);
    this._onProjectItemModified();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const answer = await this.props.showDeleteConfirmation({
      title: t`Remove behavior`,
      message: t`Are you sure you want to remove this behavior? This can't be undone.`,
    });
    if (!answer) return;

    this.eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .remove(this.eventsBasedBehavior.getName());
    this._onProjectItemModified();
  }

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return this.eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .getPosition(this.eventsBasedBehavior);
  }

  moveAt(destinationIndex: number): void {}

  _duplicate(): void {
    const eventsBasedBehaviors = this.eventsFunctionsExtension.getEventsBasedBehaviors();
    const oldName = this.eventsBasedBehavior.getName();
    const newName = newNameGenerator(oldName, name =>
      eventsBasedBehaviors.has(name)
    );
    const newEventsBasedBehavior = eventsBasedBehaviors.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsBasedBehavior,
      serializeToJSObject(this.eventsBasedBehavior),
      'unserializeFrom',
      this.props.project
    );
    newEventsBasedBehavior.setName(newName);
    gd.WholeProjectRefactorer.updateBehaviorNameInEventsBasedBehavior(
      this.props.project,
      this.eventsFunctionsExtension,
      newEventsBasedBehavior,
      oldName
    );

    this._onProjectItemModified();
    this.props.editName(
      getBehaviorShortcutTreeViewItemId(
        this.eventsFunctionsExtension,
        newEventsBasedBehavior
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
    return itemContent.getId() === behaviorsRootFolderId;
  }
}
