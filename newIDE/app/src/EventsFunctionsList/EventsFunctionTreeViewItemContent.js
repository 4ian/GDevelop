// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  extensionFunctionsRootFolderId,
  extensionBehaviorsRootFolderId,
  extensionObjectsRootFolderId,
} from '.';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import AsyncIcon from '@material-ui/icons/SyncAlt';
import {
  moveFunctionFolderOrFunction,
  buildMoveToMenu,
} from './EventsFunctionFolderTreeViewItemContent';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';

const gd: libGDevelop = global.gd;

export const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

export const pasteEventsFunction = (
  project: gdProject,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  parentFolder: gdFunctionFolderOrFunction,
  insertionIndex: number
): gdEventsFunction | null => {
  if (!Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND)) return null;

  const clipboardContent = Clipboard.get(EVENTS_FUNCTION_CLIPBOARD_KIND);
  const copiedEventsFunction = SafeExtractor.extractObjectProperty(
    clipboardContent,
    'eventsFunction'
  );
  const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
  if (!name || !copiedEventsFunction) return null;

  const newName = newNameGenerator(name, name =>
    eventsFunctionsContainer.hasEventsFunctionNamed(name)
  );

  const newEventsFunction = eventsFunctionsContainer.insertNewEventsFunctionInFolder(
    newName,
    parentFolder,
    insertionIndex
  );
  const groupPath = newEventsFunction.getGroup();
  unserializeFromJSObject(
    newEventsFunction,
    copiedEventsFunction,
    'unserializeFrom',
    project
  );
  newEventsFunction.setName(newName);
  newEventsFunction.setGroup(groupPath);
  return newEventsFunction;
};

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
  onEventsFunctionAdded: (
    eventsFunction: gdEventsFunction,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject
  ) => void,
|};

export type EventFunctionCommonProps = {|
  ...TreeItemProps,
  ...EventsFunctionCallbacks,
  addFolder: (
    items: Array<gdFunctionFolderOrFunction>,
    eventsBasedBehavior?: ?gdEventsBasedBehavior,
    eventsBasedObject?: ?gdEventsBasedObject
  ) => void,
  onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer: (
    functionFolderOrFunction: gdFunctionFolderOrFunction
  ) => void,
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
): boolean => {
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
  functionFolderOrFunction: gdFunctionFolderOrFunction;
  props: EventsFunctionProps;

  constructor(
    functionFolderOrFunction: gdFunctionFolderOrFunction,
    props: EventsFunctionProps
  ) {
    this.functionFolderOrFunction = functionFolderOrFunction;
    this.props = props;
  }

  getEventsFunctionsContainer(): gdEventsFunctionsContainer {
    return this.props.eventsFunctionsContainer;
  }

  getFunctionFolderOrFunction(): gdFunctionFolderOrFunction | null {
    return this.functionFolderOrFunction;
  }

  getEventsFunction(): ?gdEventsFunction {
    return this.functionFolderOrFunction.getFunction();
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return this.props.eventsBasedBehavior;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return this.props.eventsBasedObject;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    const otherFunctionFolderOrFunction = itemContent.getFunctionFolderOrFunction();
    return otherFunctionFolderOrFunction
      ? otherFunctionFolderOrFunction.isADescendantOf(
          this.functionFolderOrFunction
        )
      : this.getEventsBasedBehavior() ===
          itemContent.getEventsBasedBehavior() ||
          this.getEventsBasedObject() === itemContent.getEventsBasedObject() ||
          (this.getEventsBasedBehavior() &&
            itemContent.getId() === extensionBehaviorsRootFolderId) ||
          (this.getEventsBasedObject() &&
            itemContent.getId() === extensionObjectsRootFolderId) ||
          itemContent.getId() === extensionFunctionsRootFolderId;
  }

  getName(): string | React.Node {
    return this.functionFolderOrFunction.getFunction().getName();
  }

  getId(): string {
    return getEventsFunctionTreeViewItemId(
      this.functionFolderOrFunction.getFunction()
    );
  }

  getHtmlId(index: number): ?string {
    return `function-item-${index}`;
  }

  getThumbnail(): ?string {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    switch (eventsFunction.getFunctionType()) {
      default:
        return 'res/functions/function.svg';
      case gd.EventsFunction.Action:
      case gd.EventsFunction.ActionWithOperator:
        switch (eventsFunction.getName()) {
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
      this.functionFolderOrFunction.getFunction(),
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
  }

  onClick(): void {}

  rename(newName: string): void {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    if (eventsFunction.getName() === newName) return;

    this.props.onRenameEventsFunction(
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject,
      eventsFunction,
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

  canBeRenamed(): any {
    return canFunctionBeRenamed(
      this.functionFolderOrFunction.getFunction(),
      this.getEventsBasedBehavior()
        ? 'behavior'
        : this.getEventsBasedObject()
        ? 'object'
        : 'extension'
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    const {
      eventsFunctionsContainer,
      eventsBasedBehavior,
      eventsBasedObject,
      addFolder,
      onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
    } = this.props;

    return [
      {
        label: eventsFunction.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(),
      },
      {
        label: eventsFunction.isAsync()
          ? i18n._(t`Make synchronous`)
          : i18n._(t`Make asynchronous`),
        click: () => this._toggleAsync(),
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
      buildMoveToMenu({
        functionFolderOrFunction: this.functionFolderOrFunction,
        i18n,
        eventsFunctionsContainer,
        eventsBasedBehavior,
        eventsBasedObject,
        addFolder,
        onMovedFunctionFolderOrFunctionToAnotherFolderInSameContainer,
      }),
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
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    const icons = [];
    if (eventsFunction.isPrivate()) {
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
    if (eventsFunction.isAsync()) {
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
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    eventsFunction.setPrivate(!eventsFunction.isPrivate());
    this.props.forceUpdateEditor();
  }

  _toggleAsync(): void {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    eventsFunction.setAsync(!eventsFunction.isAsync());
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
    const eventsFunction = this.functionFolderOrFunction.getFunction();

    if (askForConfirmation) {
      const answer = await this.props.showDeleteConfirmation({
        title: t`Remove function`,
        message: t`Are you sure you want to remove this function? This can't be undone.`,
      });
      if (!answer) return;
    }

    this.props.onDeleteEventsFunction(eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(eventsFunction.getName());
      this._onEventsFunctionModified();
    });
  }

  getIndex(): number {
    return this.functionFolderOrFunction
      .getParent()
      .getChildPosition(this.functionFolderOrFunction);
  }

  moveAt(
    destinationItemContent: TreeViewItemContent,
    where: 'before' | 'inside' | 'after',
    animateFolder: (folder: gdFunctionFolderOrFunction) => void
  ): void {
    moveFunctionFolderOrFunction(
      this,
      destinationItemContent,
      where,
      animateFolder
    );
  }

  copy(): void {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    Clipboard.set(EVENTS_FUNCTION_CLIPBOARD_KIND, {
      eventsFunction: serializeToJSObject(eventsFunction),
      name: eventsFunction.getName(),
    });
  }

  cut(): void {
    this.copy();
    this._deleteEventsFunction({ askForConfirmation: false });
  }

  paste(): void {
    const newEventsFunction = pasteEventsFunction(
      this.props.project,
      this.props.eventsFunctionsContainer,
      this.functionFolderOrFunction.getParent(),
      this.getIndex() + 1
    );
    if (!newEventsFunction) {
      return;
    }
    this.props.onEventsFunctionAdded(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(
      newEventsFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
    this.props.editName(getEventsFunctionTreeViewItemId(newEventsFunction));
  }

  _duplicateEventsFunction(): void {
    const eventsFunction = this.functionFolderOrFunction.getFunction();
    const { eventsFunctionsContainer } = this.props;
    const newName = newNameGenerator(eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      eventsFunction,
      eventsFunctionsContainer.getEventsFunctionsCount()
    );
    newEventsFunction.setName(newName);
    const newFunctionFolderOrFunction = eventsFunctionsContainer
      .getRootFolder()
      .getFunctionNamed(newName);
    eventsFunctionsContainer
      .getRootFolder()
      .moveFunctionFolderOrFunctionToAnotherFolder(
        newFunctionFolderOrFunction,
        this.functionFolderOrFunction.getParent(),
        this.getIndex() + 1
      );
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

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
