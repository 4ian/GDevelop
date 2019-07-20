// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from '../UI/SearchBar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import Background from '../UI/Background';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  enumerateEventsFunctions,
  filterEventFunctionsList,
} from './EnumerateEventsFunctions';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

const styles = {
  listContainer: {
    flex: 1,
  },
};

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
  onAddEventsFunction: ((doAdd: boolean, name: ?string) => void) => void,
  onEventsFunctionAdded: (eventsFunction: gdEventsFunction) => void,
  renderHeader?: () => React.Node,
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

  _deleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsFunctionsContainer } = this.props;

    if (askForConfirmation) {
      //eslint-disable-next-line
      const answer = confirm(
        "Are you sure you want to remove this function? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsFunction(eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(eventsFunction.getName());
      this.forceUpdate();
    });
  };

  _editName = (eventsFunction: ?gdEventsFunction) => {
    this.setState(
      {
        renamedEventsFunction: eventsFunction,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _rename = (eventsFunction: gdEventsFunction, newName: string) => {
    const { eventsFunctionsContainer } = this.props;
    this.setState({
      renamedEventsFunction: null,
    });

    if (eventsFunction.getName() === newName) return;

    if (eventsFunctionsContainer.hasEventsFunctionNamed(newName)) {
      showWarningBox('Another function with this name already exists.');
      return;
    }

    this.props.onRenameEventsFunction(eventsFunction, newName, doRename => {
      if (!doRename) return;
      eventsFunction.setName(newName);
      this.forceUpdate();
    });
  };

  _move = (oldIndex: number, newIndex: number) => {
    const { eventsFunctionsContainer } = this.props;
    eventsFunctionsContainer.moveEventsFunction(oldIndex, newIndex);

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
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

    const { eventsFunction: copiedEventsFunction, name } = Clipboard.get(
      EVENTS_FUNCTION_CLIPBOARD_KIND
    );
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

    this.forceUpdate();
  };

  _renderEventsFunctionMenuTemplate = (
    eventsFunction: gdEventsFunction,
    index: number
  ) => {
    return [
      {
        label: 'Rename',
        click: () => this._editName(eventsFunction),
        enabled: this.props.canRename(eventsFunction),
      },
      {
        label: 'Remove',
        click: () =>
          this._deleteEventsFunction(eventsFunction, {
            askForConfirmation: true,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: 'Copy',
        click: () => this._copyEventsFunction(eventsFunction),
      },
      {
        label: 'Cut',
        click: () => this._cutEventsFunction(eventsFunction),
      },
      {
        label: 'Paste',
        enabled: Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND),
        click: () => this._pasteEventsFunction(index),
      },
    ];
  };

  _addNewEventsFunction = () => {
    const { eventsFunctionsContainer } = this.props;

    this.props.onAddEventsFunction((doAdd: boolean, name: ?string) => {
      if (!doAdd) {
        return;
      }

      const eventsFunctionName =
        name ||
        newNameGenerator('Function', name =>
          eventsFunctionsContainer.hasEventsFunctionNamed(name)
        );

      const eventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
        eventsFunctionName,
        eventsFunctionsContainer.getEventsFunctionsCount()
      );
      this.props.onEventsFunctionAdded(eventsFunction);
      this.forceUpdate();
    });
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

    const list = [
      ...filterEventFunctionsList(
        enumerateEventsFunctions(eventsFunctionsContainer),
        searchText
      ),
      {
        key: 'add-item-row',
      },
    ];

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
              <SortableVirtualizedItemList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={list}
                width={width}
                height={height}
                onAddNewItem={this._addNewEventsFunction}
                addNewItemLabel={<Trans>Add a new function</Trans>}
                selectedItem={selectedEventsFunction}
                onItemSelected={onSelectEventsFunction}
                renamedItem={this.state.renamedEventsFunction}
                onRename={this._rename}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._move(oldIndex, newIndex)
                }
                buildMenuTemplate={this._renderEventsFunctionMenuTemplate}
                helperClass="sortable-helper"
                distance={20}
              />
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
        />
      </Background>
    );
  }
}
