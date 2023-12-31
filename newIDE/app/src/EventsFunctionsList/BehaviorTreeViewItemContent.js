// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

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
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';

const gd: libGDevelop = global.gd;

const EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND = 'Events Based Behavior';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export const getBehaviorTreeViewItemId = (
  eventsBasedBehavior: gdEventsBasedBehavior
): string => {
  return 'behaviors.' + eventsBasedBehavior.getName();
};

export type EventBehaviorCallbacks = {|
  onSelectEventsBasedBehavior: (
    eventsBasedBehavior: ?gdEventsBasedBehavior
  ) => void,
  onDeleteEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedBehaviorRenamed: (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => void,
  onEventsBasedBehaviorPasted: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    sourceExtensionName: string
  ) => void,
|};

export type EventBehaviorProps = {|
  ...TreeItemProps,
  ...EventBehaviorCallbacks,
  addNewEventsFunction: (itemContent: TreeViewItemContent) => void,
  eventsBasedBehaviorsList: gdEventsBasedBehaviorsList,
|};

export class BehaviorTreeViewItemContent implements TreeViewItemContent {
  behavior: gdEventsBasedBehavior;
  props: EventBehaviorProps;

  constructor(behavior: gdEventsBasedBehavior, props: EventBehaviorProps) {
    this.behavior = behavior;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.behavior.getEventsFunctions();
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return this.behavior;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return null;
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

  onSelect(): void {
    this.props.onSelectEventsBasedBehavior(this.behavior);
  }

  rename(newName: string): void {
    if (this.behavior.getName() === newName) return;

    this.props.onRenameEventsBasedBehavior(this.behavior, newName, doRename => {
      if (!doRename) return;

      this._onEventsBasedBehaviorModified();
      this.props.onEventsBasedBehaviorRenamed(this.behavior);
    });
  }

  edit(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    const eventsBasedBehavior = this.behavior;
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
      },
      {
        label: i18n._(t`Delete`),
        click: () =>
          this._deleteEventsBasedBehavior(eventsBasedBehavior, {
            askForConfirmation: true,
          }),
      },
      {
        label: eventsBasedBehavior.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(eventsBasedBehavior),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this._copyEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedBehavior(),
      },
    ];
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return this.behavior.isPrivate() ? (
      <Tooltip
        title={
          <Trans>This behavior won't be visible in the events editor.</Trans>
        }
      >
        <VisibilityOff fontSize="small" style={styles.tooltip} />
      </Tooltip>
    ) : null;
  }

  _deleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsBasedBehaviorsList } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this behavior? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsBasedBehavior(eventsBasedBehavior, doRemove => {
      if (!doRemove) return;

      eventsBasedBehaviorsList.remove(eventsBasedBehavior.getName());
      this._onEventsBasedBehaviorModified();
    });
  };

  _togglePrivate = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    eventsBasedBehavior.setPrivate(!eventsBasedBehavior.isPrivate());
    this.props.forceUpdate();
  };

  getIndex(): number {
    return this.props.eventsBasedBehaviorsList.getPosition(this.behavior);
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    this.props.eventsBasedBehaviorsList.move(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
    this.props.forceUpdateList();
  }

  _copyEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    Clipboard.set(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND, {
      eventsBasedBehavior: serializeToJSObject(eventsBasedBehavior),
      name: eventsBasedBehavior.getName(),
      extensionName: this.props.eventsFunctionsExtension.getName(),
    });
  };

  _cutEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    this._copyEventsBasedBehavior(eventsBasedBehavior);
    this._deleteEventsBasedBehavior(eventsBasedBehavior, {
      askForConfirmation: false,
    });
  };

  _pasteEventsBasedBehavior = () => {
    if (!Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(
      EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND
    );
    const copiedEventsBasedBehavior = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsBasedBehavior'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsBasedBehavior) return;

    const { project, eventsBasedBehaviorsList } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsBasedBehaviorsList.has(name)
    );

    const newEventsBasedBehavior = eventsBasedBehaviorsList.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsBasedBehavior,
      copiedEventsBasedBehavior,
      'unserializeFrom',
      project
    );
    newEventsBasedBehavior.setName(newName);

    const sourceExtensionName = SafeExtractor.extractStringProperty(
      clipboardContent,
      'extensionName'
    );
    if (sourceExtensionName) {
      this.props.onEventsBasedBehaviorPasted(
        newEventsBasedBehavior,
        sourceExtensionName
      );
    }

    this._onEventsBasedBehaviorModified();
    this.props.onSelectEventsBasedBehavior(newEventsBasedBehavior);
    this.props.editName(getBehaviorTreeViewItemId(newEventsBasedBehavior));
  };

  _addNewEventsBasedBehavior = () => {
    const { eventsBasedBehaviorsList } = this.props;

    const name = newNameGenerator('MyBehavior', name =>
      eventsBasedBehaviorsList.has(name)
    );
    const newEventsBasedBehavior = eventsBasedBehaviorsList.insertNew(
      name,
      eventsBasedBehaviorsList.getCount()
    );
    this._onEventsBasedBehaviorModified();

    const newEventsBasedBehaviorId = getBehaviorTreeViewItemId(
      newEventsBasedBehavior
    );
    // Scroll to the new behavior.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      this.props.scrollToItem(newEventsBasedBehaviorId);
    }, 100); // A few ms is enough for a new render to be done.

    // We focus it so the user can edit the name directly.
    this.props.onSelectEventsBasedBehavior(newEventsBasedBehavior);
    this.props.editName(newEventsBasedBehaviorId);
  };

  _onEventsBasedBehaviorModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton() {
    return null;
  }
}
