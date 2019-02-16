// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from 'material-ui-search-bar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import Background from '../UI/Background';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  enumerateEventsFunctions,
  filterEventFunctionsList,
} from './EnumerateEventsFunctions';
import FlatButton from 'material-ui/FlatButton';
import { Line } from '../UI/Grid';
import Divider from 'material-ui/Divider';

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
  eventsFunctionsContainer: gdEventsFunctionsExtension,
  selectedEventsFunction: ?gdEventsFunction,
  onSelectEventsFunction: (eventsFunction: ?gdEventsFunction) => void,
  onDeleteEventsFunction: (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => void,
  onRenameEventsFunction: (
    eventsFunction: gdEventsFunction,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEditOptions: () => void,
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

  _deleteEventsFunction = (eventsFunction: gdEventsFunction) => {
    const { eventsFunctionsContainer } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this function? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteEventsFunction(eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(eventsFunction.getName());
      this.forceUpdate();
    });
  };

  _editName = (resource: ?gdEventsFunction) => {
    this.setState(
      {
        renamedEventsFunction: resource,
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

  _renderEventsFunctionMenuTemplate = (resource: gdEventsFunction) => {
    return [
      {
        label: 'Rename',
        click: () => this._editName(resource),
      },
      {
        label: 'Remove',
        click: () => this._deleteEventsFunction(resource),
      },
    ];
  };

  _addNewEventsFunction = () => {
    const { eventsFunctionsContainer } = this.props;

    const name = newNameGenerator('Function', name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    eventsFunctionsContainer.insertNewEventsFunction(
      name,
      eventsFunctionsContainer.getEventsFunctionsCount()
    );
    this.forceUpdate();
  };

  render() {
    const {
      project,
      eventsFunctionsContainer,
      selectedEventsFunction,
      onSelectEventsFunction,
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
        <Line justifyContent="center">
          <FlatButton
            label={<Trans>Edit extension options</Trans>}
            primary
            onClick={() => this.props.onEditOptions()}
          />
        </Line>
        <Divider />
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
