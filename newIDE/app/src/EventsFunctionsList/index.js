// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from '../UI/SearchBar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import Background from '../UI/Background';
import newNameGenerator from '../Utils/NewNameGenerator';
import Tooltip from '@material-ui/core/Tooltip';
import {
  enumerateEventsFunctions,
  filterEventFunctionsList,
} from './EnumerateEventsFunctions';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';
const gd: libGDevelop = global.gd;

const styles = {
  listContainer: {
    flex: 1,
  },
};

export type EventsFunctionCreationParameters = {|
  functionType: 0 | 1 | 2,
  name: ?string,
|};

const renderEventsFunctionLabel = (eventsFunction: gdEventsFunction) =>
  eventsFunction.isPrivate() ? (
    <>
      <Tooltip title="This function won't be visible in the events editor">
        <VisibilityOffIcon
          fontSize="small"
          style={{ marginRight: 5, verticalAlign: 'bottom' }}
        />
      </Tooltip>
      <span title={eventsFunction.getName()}>{eventsFunction.getName()}</span>
    </>
  ) : (
    eventsFunction.getName()
  );

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
  renderHeader?: () => React.Node,
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
        return 'res/functions/expression.svg';
      case gd.EventsFunction.StringExpression:
        return 'res/functions/expression.svg';
    }
  };
  _rename = (eventsFunction: gdEventsFunction, newName: string) => {
    const { eventsFunctionsContainer } = this.props;
    this.setState({
      renamedEventsFunction: null,
    });

    if (eventsFunction.getName() === newName) return;

    if (eventsFunctionsContainer.hasEventsFunctionNamed(newName)) {
      showWarningBox('Another function with this name already exists.', {
        delayToNextTick: true,
      });
      return;
    }

    this.props.onRenameEventsFunction(eventsFunction, newName, doRename => {
      if (!doRename) return;
      eventsFunction.setName(newName);
      this._onEventsFunctionModified();
    });
  };

  _moveSelectionTo = (destinationEventsFunction: gdEventsFunction) => {
    const { eventsFunctionsContainer, selectedEventsFunction } = this.props;
    if (!selectedEventsFunction) return;

    eventsFunctionsContainer.moveEventsFunction(
      eventsFunctionsContainer.getEventsFunctionPosition(
        selectedEventsFunction
      ),
      eventsFunctionsContainer.getEventsFunctionPosition(
        destinationEventsFunction
      )
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
        enabled: this.props.canRename(eventsFunction),
        click: () => this._togglePrivate(eventsFunction),
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
    const { eventsFunctionsContainer } = this.props;

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
        this.props.onEventsFunctionAdded(eventsFunction);
        this._onEventsFunctionModified();

        this.props.onSelectEventsFunction(eventsFunction);
        if (this.props.canRename(eventsFunction)) {
          this._editName(eventsFunction);
        }
      }
    );
  };

  render() {
    const {
      project,
      eventsFunctionsContainer,
      selectedEventsFunction,
      onSelectEventsFunction,
      renderHeader,
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
        {renderHeader ? renderHeader() : null}
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
                    onAddNewItem={this._addNewEventsFunction}
                    addNewItemLabel={<Trans>Add a new function</Trans>}
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
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })
          }
          aspect="integrated-search-bar"
          placeholder={t`Search functions`}
        />
      </Background>
    );
  }
}
