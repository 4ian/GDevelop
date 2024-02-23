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
  extensionFunctionsRootFolderId,
  extensionBehaviorsRootFolderId,
  extensionObjectsRootFolderId,
} from '.';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import AsyncIcon from '@material-ui/icons/SyncAlt';

const gd: libGDevelop = global.gd;

const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type EventsFunctionCreationParameters = {|
  functionType: 0 | 1 | 2,
  name: ?string,
|};

export type EventsFunctionCallbacks = {|
  onSelectEventsFunction: (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => void,
  onDeleteEventsFunction: (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => void,
  onRenameEventsFunction: (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
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
  ...EventsFunctionCallbacks,
|};

export type EventsFunctionProps = {|
  ...EventFunctionCommonProps,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
|};

export const getEventsFunctionTreeViewItemId = (
  eventFunction: gdEventsFunction
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `function-${eventFunction.ptr}`;
};

export const canFunctionBeRenamed = (
  eventsFunction: gdEventsFunction,
  containerType: 'extension' | 'behavior' | 'object'
) => {
  const name = eventsFunction.getName();
  if (containerType === 'behavior') {
    return !gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
      name
    );
  }
  if (containerType === 'object') {
    return !gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(name);
  }
  return !gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(name);
};

export class EventsFunctionTreeViewItemContent implements TreeViewItemContent {
  eventsFunction: gdEventsFunction;
  props: EventsFunctionProps;

  constructor(eventsFunction: gdEventsFunction, props: EventsFunctionProps) {
    this.eventsFunction = eventsFunction;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.props.eventsFunctionsContainer;
  }

  getEventsFunction(): ?gdEventsFunction {
    return this.eventsFunction;
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
    return this.eventsFunction.getName();
  }

  getId(): string {
    return getEventsFunctionTreeViewItemId(this.eventsFunction);
  }

  getHtmlId(index: number): ?string {
    return `function-item-${index}`;
  }

  getThumbnail(): ?string {
    switch (this.eventsFunction.getFunctionType()) {
      default:
        return 'res/functions/function.svg';
      case gd.EventsFunction.Action:
      case gd.EventsFunction.ActionWithOperator:
        switch (this.eventsFunction.getName()) {
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
      this.eventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
  }

  rename(newName: string): void {
    if (this.eventsFunction.getName() === newName) return;

    this.props.onRenameEventsFunction(
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject,
      this.eventsFunction,
      newName,
      doRename => {
        if (!doRename) return;
        this._onEventsFunctionModified();
      }
    );
  }

  edit(): void {
    if (this.canBeRenamed()) {
      this.props.editName(this.getId());
    }
  }

  canBeRenamed() {
    return canFunctionBeRenamed(
      this.eventsFunction,
      this.getEventsBasedBehavior()
        ? 'behavior'
        : this.getEventsBasedObject()
        ? 'object'
        : 'extension'
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        enabled: this.canBeRenamed(),
        accelerator: 'F2',
      },
      {
        label: this.eventsFunction.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(),
      },
      {
        label: this.eventsFunction.isAsync()
          ? i18n._(t`Make synchronous`)
          : i18n._(t`Make asynchronous`),
        click: () => this._toggleAsync(),
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
        enabled: Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicateEventsFunction(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const icons = [];
    if (this.eventsFunction.isPrivate()) {
      icons.push(
        <Tooltip
          key="visibility"
          title={
            <Trans>This function won't be visible in the events editor.</Trans>
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
      );
    }
    if (this.eventsFunction.isAsync()) {
      icons.push(
        <Tooltip
          key="async"
          title={
            <Trans>
              This function is asynchronous - it will only allow subsequent
              events to run after calling the action "End asynchronous task"
              within the function.
            </Trans>
          }
        >
          <AsyncIcon
            fontSize="small"
            style={{
              ...styles.tooltip,
              color: this.props.gdevelopTheme.text.color.disabled,
            }}
          />
        </Tooltip>
      );
    }
    return icons.length > 0 ? icons : null;
  }

  _togglePrivate(): void {
    this.eventsFunction.setPrivate(!this.eventsFunction.isPrivate());
    this.props.forceUpdateEditor();
  }

  _toggleAsync(): void {
    this.eventsFunction.setAsync(!this.eventsFunction.isAsync());
    this.props.forceUpdateEditor();
  }

  delete(): void {
    this._deleteEventsFunction({
      askForConfirmation: true,
    });
  }

  async _deleteEventsFunction({
    askForConfirmation,
  }: {|
    askForConfirmation: boolean,
  |}): Promise<void> {
    const { eventsFunctionsContainer } = this.props;

    if (askForConfirmation) {
      const answer = await this.props.showDeleteConfirmation({
        title: t`Remove function`,
        message: t`Are you sure you want to remove this function? This can't be undone.`,
      });
      if (!answer) return;
    }

    this.props.onDeleteEventsFunction(this.eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(
        this.eventsFunction.getName()
      );
      this._onEventsFunctionModified();
    });
  }

  getIndex(): number {
    return this.props.eventsFunctionsContainer.getEventsFunctionPosition(
      this.eventsFunction
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    this.props.eventsFunctionsContainer.moveEventsFunction(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
  }

  copy(): void {
    Clipboard.set(EVENTS_FUNCTION_CLIPBOARD_KIND, {
      eventsFunction: serializeToJSObject(this.eventsFunction),
      name: this.eventsFunction.getName(),
    });
  }

  cut(): void {
    this.copy();
    this._deleteEventsFunction({ askForConfirmation: false });
  }

  paste(): void {
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
    this.props.editName(getEventsFunctionTreeViewItemId(newEventsFunction));
  }

  _duplicateEventsFunction(): void {
    const { eventsFunctionsContainer } = this.props;
    const newName = newNameGenerator(this.eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      this.eventsFunction,
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
    this.props.editName(getEventsFunctionTreeViewItemId(newEventsFunction));
  }

  _onEventsFunctionModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton(i18n: I18nType) {
    return null;
  }

  addFunctionAtSelection(): void {}
}
