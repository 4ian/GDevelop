// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from '../UI/SearchBar';
import Background from '../UI/Background';
import newNameGenerator from '../Utils/NewNameGenerator';
import Tooltip from '@material-ui/core/Tooltip';
import {
  enumerateEventsFunctions,
  filterEventFunctionsList,
} from './EnumerateEventsFunctions';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import AsyncIcon from '@material-ui/icons/SyncAlt';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Text from '../UI/Text';
import Add from '../UI/CustomSvgIcons/Add';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';
const gd: libGDevelop = global.gd;

const styles = {
  listContainer: {
    flex: 1,
  },
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type EventsFunctionCreationParameters = {|
  functionType: 0 | 1 | 2,
  name: ?string,
|};

const renderEventsFunctionLabel = (eventsFunction: gdEventsFunction) => {
  const label = (
    <Text noMargin size="body-small">
      {eventsFunction.getName()}
    </Text>
  );

  return eventsFunction.isPrivate() ? (
    <>
      <Tooltip
        title={
          <Trans>This function won't be visible in the events editor.</Trans>
        }
      >
        <VisibilityOff fontSize="small" style={styles.tooltip} />
      </Tooltip>
      {label}
    </>
  ) : eventsFunction.isAsync() ? (
    <>
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
      {label}
    </>
  ) : (
    label
  );
};

const getEventsFunctionName = (eventsFunction: gdEventsFunction) =>
  eventsFunction.getName();

type State = {|
  renamedEventsFunction: ?gdEventsFunction,
  searchText: string,
|};

type Props = {|
  project: gdProject,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  selectedEventsFunction: ?gdEventsFunction,
  onSelectEventsFunction: (eventsFunction: ?gdEventsFunction) => void,
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
    (parameters: ?EventsFunctionCreationParameters) => void
  ) => void,
  onEventsFunctionAdded: (eventsFunction: gdEventsFunction) => void,
  unsavedChanges?: ?UnsavedChanges,
|};

export default class EventsFunctionsList extends React.Component<Props, State> {
  static defaultProps = {
    onDeleteEventsFunction: (
      eventsFunction: gdEventsFunction,
      cb: boolean => void
    ) => cb(true),
    onRenameEventsFunction: (
      eventsFunction: gdEventsFunction,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: any;
  state: State = {
    renamedEventsFunction: null,
    searchText: '',
  };

  _togglePrivate = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setPrivate(!eventsFunction.isPrivate());
    this.forceUpdate();
  };

  _toggleAsync = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setAsync(!eventsFunction.isAsync());
    this.forceUpdateList();
  };

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

  _editName = (eventsFunction: ?gdEventsFunction) => {
    this.setState(
      {
        renamedEventsFunction: eventsFunction,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _getFunctionThumbnail = (eventsFunction: gdEventsFunction) => {
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
  };
  _rename = (eventsFunction: gdEventsFunction, newName: string) => {
    this.setState({
      renamedEventsFunction: null,
    });

    if (eventsFunction.getName() === newName) return;

    this.props.onRenameEventsFunction(eventsFunction, newName, doRename => {
      if (!doRename) return;
      this._onEventsFunctionModified();
    });
  };

  _moveSelectionTo = (destinationEventsFunction: gdEventsFunction) => {
    const { eventsFunctionsContainer, selectedEventsFunction } = this.props;
    if (!selectedEventsFunction) return;

    const originIndex = eventsFunctionsContainer.getEventsFunctionPosition(
      selectedEventsFunction
    );
    const destinationIndex = eventsFunctionsContainer.getEventsFunctionPosition(
      destinationEventsFunction
    );
    eventsFunctionsContainer.moveEventsFunction(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this._onEventsFunctionModified();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

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

  _pasteEventsFunction = (index: number) => {
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
      index
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
    this.props.onSelectEventsFunction(newEventsFunction);
    this._editName(newEventsFunction);
  };

  _duplicateEventsFunction = (
    eventsFunction: gdEventsFunction,
    newFunctionIndex: number
  ) => {
    const { eventsFunctionsContainer } = this.props;
    const newName = newNameGenerator(eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      eventsFunction,
      newFunctionIndex
    );
    newEventsFunction.setName(newName);
    this.props.onEventsFunctionAdded(newEventsFunction);

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(newEventsFunction);
    this._editName(newEventsFunction);
  };

  _onEventsFunctionModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  }

  _renderEventsFunctionMenuTemplate = (i18n: I18nType) => (
    eventsFunction: gdEventsFunction,
    index: number
  ) => {
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(eventsFunction),
        enabled: this.props.canRename(eventsFunction),
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
        click: () =>
          this._deleteEventsFunction(eventsFunction, {
            askForConfirmation: true,
          }),
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
        click: () => this._pasteEventsFunction(index + 1),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicateEventsFunction(eventsFunction, index + 1),
      },
    ];
  };

  _addNewEventsFunction = () => {
    const { eventsFunctionsContainer, project } = this.props;

    this.props.onAddEventsFunction(
      (parameters: ?EventsFunctionCreationParameters) => {
        if (!parameters) {
          return;
        }

        const eventsFunctionName =
          parameters.name ||
          newNameGenerator('Function', name =>
            eventsFunctionsContainer.hasEventsFunctionNamed(name)
          );

        const eventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
          eventsFunctionName,
          eventsFunctionsContainer.getEventsFunctionsCount()
        );
        eventsFunction.setFunctionType(parameters.functionType);

        if (eventsFunction.isCondition() && !eventsFunction.isExpression()) {
          gd.PropertyFunctionGenerator.generateConditionSkeleton(
            project,
            eventsFunction
          );
        }

        // Scroll to the new function.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          this.scrollToItem(eventsFunction);
        }, 100); // A few ms is enough for a new render to be done.

        this.props.onEventsFunctionAdded(eventsFunction);
        this._onEventsFunctionModified();

        // We focus it so the user can edit the name directly.
        this.props.onSelectEventsFunction(eventsFunction);
        if (this.props.canRename(eventsFunction)) {
          this._editName(eventsFunction);
        }
      }
    );
  };

  scrollToItem = (eventsFunction: gdEventsFunction) => {
    if (this.sortableList) {
      this.sortableList.scrollToItem(eventsFunction);
    }
  };

  render() {
    const {
      project,
      eventsFunctionsContainer,
      selectedEventsFunction,
      onSelectEventsFunction,
    } = this.props;
    const { searchText } = this.state;

    const list = filterEventFunctionsList(
      enumerateEventsFunctions(eventsFunctionsContainer),
      searchText
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsFunctionsContainer.ptr;

    return (
      <Background>
        <Line>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={text =>
                this.setState({
                  searchText: text,
                })
              }
              placeholder={t`Search functions`}
            />
          </Column>
        </Line>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <I18n>
                {({ i18n }) => (
                  <SortableVirtualizedItemList
                    key={listKey}
                    ref={sortableList => (this.sortableList = sortableList)}
                    fullList={list}
                    width={width}
                    height={height}
                    renderItemLabel={renderEventsFunctionLabel}
                    getItemName={getEventsFunctionName}
                    getItemThumbnail={this._getFunctionThumbnail}
                    selectedItems={
                      selectedEventsFunction ? [selectedEventsFunction] : []
                    }
                    onItemSelected={onSelectEventsFunction}
                    renamedItem={this.state.renamedEventsFunction}
                    onRename={this._rename}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    buildMenuTemplate={this._renderEventsFunctionMenuTemplate(
                      i18n
                    )}
                    reactDndType="GD_EVENTS_FUNCTION"
                  />
                )}
              </I18n>
            )}
          </AutoSizer>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new function</Trans>}
              primary
              onClick={this._addNewEventsFunction}
              icon={<Add />}
            />
          </Column>
        </Line>
      </Background>
    );
  }
}
