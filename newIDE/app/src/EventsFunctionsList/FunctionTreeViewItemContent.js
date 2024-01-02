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
import {
  TreeViewItemContent,
  type TreeItemProps,
  extensionFunctionsRootFolderId,
  extensionBehaviorsRootFolderId,
  extensionObjectsRootFolderId,
} from '.';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import AsyncIcon from '@material-ui/icons/SyncAlt';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';

const gd: libGDevelop = global.gd;

const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type EventsFunctionCreationParameters = {|
  functionType: 0 | 1 | 2,
  name: ?string,
|};

export type EventFunctionCallbacks = {|
  onSelectEventsFunction: (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => void,
  onDeleteEventsFunction: (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => void,
  canRename: (eventsFunction: gdEventsFunction) => boolean,
  onRenameEventsFunction: (
    eventsFunction: gdEventsFunction,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onAddEventsFunction: (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    (parameters: ?EventsFunctionCreationParameters) => void
  ) => void,
  onEventsFunctionAdded: (eventsFunction: gdEventsFunction) => void,
|};

export type EventFunctionCommonProps = {|
  ...TreeItemProps,
  ...EventFunctionCallbacks,
|};

export type EventFunctionProps = {|
  ...EventFunctionCommonProps,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
|};

export const getFunctionTreeViewItemId = (
  eventFunction: gdEventsFunction
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `function-${eventFunction.ptr}`;
};

export class FunctionTreeViewItemContent implements TreeViewItemContent {
  eventFunction: gdEventsFunction;
  props: EventFunctionProps;

  constructor(eventFunction: gdEventsFunction, props: EventFunctionProps) {
    this.eventFunction = eventFunction;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.props.eventsFunctionsContainer;
  }

  getFunctionInsertionIndex(): number {
    return this.getIndex() + 1;
  }

  getEventsFunction(): ?gdEventsFunction {
    return this.eventFunction;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return this.props.eventsBasedBehavior;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return this.props.eventsBasedObject;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return (
      itemContent.getEventsFunction() === null &&
      (this.getEventsBasedBehavior() === itemContent.getEventsBasedBehavior() ||
        this.getEventsBasedObject() === itemContent.getEventsBasedObject() ||
        (this.getEventsBasedBehavior() &&
          itemContent.getId() === extensionBehaviorsRootFolderId) ||
        (this.getEventsBasedObject() &&
          itemContent.getId() === extensionObjectsRootFolderId) ||
        itemContent.getId() === extensionFunctionsRootFolderId)
    );
  }

  getName(): string | React.Node {
    return this.eventFunction.getName();
  }

  getId(): string {
    return getFunctionTreeViewItemId(this.eventFunction);
  }

  getHtmlId(index: number): ?string {
    return `function-item-${index}`;
  }

  getThumbnail(): ?string {
    switch (this.eventFunction.getFunctionType()) {
      default:
        return 'res/functions/function.svg';
      case gd.EventsFunction.Action:
      case gd.EventsFunction.ActionWithOperator:
        switch (this.eventFunction.getName()) {
          default:
            return 'res/functions/action.svg';

          case 'onSceneUnloading':
          case 'onDestroy':
            return 'res/functions/destroy.svg';

          case 'onSceneResumed':
          case 'onActivate':
            return 'res/functions/activate.svg';

          case 'onScenePaused':
          case 'onDeActivate':
            return 'res/functions/deactivate.svg';

          case 'onScenePreEvents':
          case 'onScenePostEvents':
          case 'doStepPreEvents':
          case 'doStepPostEvents':
            return 'res/functions/step.svg';

          case 'onSceneLoaded':
          case 'onFirstSceneLoaded':
          case 'onCreated':
            return 'res/functions/create.svg';

          case 'onHotReloading':
            return 'res/functions/reload.svg';
        }
      case gd.EventsFunction.Condition:
        return 'res/functions/condition.svg';
      case gd.EventsFunction.Expression:
      case gd.EventsFunction.ExpressionAndCondition:
        return 'res/functions/expression.svg';
    }
  }

  getDataset(): ?HTMLDataset {
    return null;
  }

  onSelect(): void {
    this.props.onSelectEventsFunction(
      this.eventFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
  }

  rename(newName: string): void {
    if (this.eventFunction.getName() === newName) return;

    this.props.onRenameEventsFunction(this.eventFunction, newName, doRename => {
      if (!doRename) return;
      this._onEventsFunctionModified();
    });
  }

  edit(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    const eventsFunction = this.eventFunction;
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        enabled: this.props.canRename(eventsFunction),
        accelerator: getShortcutDisplayName(
          this.props.preferences.values.userShortcutMap[
            'RENAME_SCENE_OBJECT'
          ] || defaultShortcuts.RENAME_SCENE_OBJECT
        ),
      },
      {
        label: eventsFunction.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(eventsFunction),
      },
      {
        label: eventsFunction.isAsync()
          ? i18n._(t`Make synchronous`)
          : i18n._(t`Make asynchronous`),
        click: () => this._toggleAsync(eventsFunction),
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
        click: () => this._copyEventsFunction(eventsFunction),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsFunction(eventsFunction),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND),
        click: () => this._pasteEventsFunction(),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicateEventsFunction(eventsFunction),
      },
    ];
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    const privateIcon = this.eventFunction.isPrivate() ? (
      <Tooltip
        title={
          <Trans>This function won't be visible in the events editor.</Trans>
        }
      >
        <VisibilityOff fontSize="small" style={styles.tooltip} />
      </Tooltip>
    ) : null;
    const asyncIcon = this.eventFunction.isAsync() ? (
      <Tooltip
        title={
          <Trans>
            This function is asynchronous - it will only allow subsequent events
            to run after calling the action "End asynchronous task" within the
            function.
          </Trans>
        }
      >
        <AsyncIcon fontSize="small" style={styles.tooltip} />
      </Tooltip>
    ) : null;
    return privateIcon && asyncIcon ? (
      <>
        {privateIcon}
        {asyncIcon}
      </>
    ) : (
      privateIcon || asyncIcon
    );
  }

  _togglePrivate = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setPrivate(!eventsFunction.isPrivate());
    this.props.forceUpdate();
  };

  _toggleAsync = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setAsync(!eventsFunction.isAsync());
    this.props.forceUpdateList();
  };

  delete(): void {
    this._deleteEventsFunction(this.eventFunction, {
      askForConfirmation: true,
    });
  }

  _deleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsFunctionsContainer } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this function? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsFunction(eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(eventsFunction.getName());
      this._onEventsFunctionModified();
    });
  };

  getIndex(): number {
    return this.props.eventsFunctionsContainer.getEventsFunctionPosition(
      this.eventFunction
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    this.props.eventsFunctionsContainer.moveEventsFunction(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
    this.props.forceUpdateList();
  }

  _copyEventsFunction = (eventsFunction: gdEventsFunction) => {
    Clipboard.set(EVENTS_FUNCTION_CLIPBOARD_KIND, {
      eventsFunction: serializeToJSObject(eventsFunction),
      name: eventsFunction.getName(),
    });
  };

  _cutEventsFunction = (eventsFunction: gdEventsFunction) => {
    this._copyEventsFunction(eventsFunction);
    this._deleteEventsFunction(eventsFunction, { askForConfirmation: false });
  };

  _pasteEventsFunction = () => {
    if (!Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EVENTS_FUNCTION_CLIPBOARD_KIND);
    const copiedEventsFunction = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsFunction'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsFunction) return;

    const { project, eventsFunctionsContainer } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );

    const newEventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsFunction,
      copiedEventsFunction,
      'unserializeFrom',
      project
    );
    newEventsFunction.setName(newName);
    this.props.onEventsFunctionAdded(newEventsFunction);

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
    this.props.editName(getFunctionTreeViewItemId(newEventsFunction));
  };

  _duplicateEventsFunction = (eventsFunction: gdEventsFunction) => {
    const { eventsFunctionsContainer } = this.props;
    const newName = newNameGenerator(eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      eventsFunction,
      this.getIndex() + 1
    );
    newEventsFunction.setName(newName);
    this.props.onEventsFunctionAdded(newEventsFunction);

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
    this.props.editName(getFunctionTreeViewItemId(newEventsFunction));
  };

  _onEventsFunctionModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton() {
    return null;
  }
}
