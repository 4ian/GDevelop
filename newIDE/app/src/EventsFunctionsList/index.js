// @flow
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import Paper from 'material-ui/Paper';
import SearchBar from 'material-ui-search-bar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapVector } from '../Utils/MapFor';
const gd = global.gd;

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
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
  eventsFunctions: gdVectorEventsFunction,
  selectedEventsFunction: ?gdEventsFunction,
  onSelectEventsFunction: (resource: gdEventsFunction) => void,
  onDeleteEventsFunction: (resource: gdEventsFunction) => void,
  onRenameEventsFunction: (
    resource: gdEventsFunction,
    newName: string,
    cb: (boolean) => void
  ) => void,
|};

export default class EventsFunctionsList extends React.Component<Props, State> {
  static defaultProps = {
    onDeleteEventsFunction: (resource: gdEventsFunction, cb: boolean => void) =>
      cb(true),
    onRenameEventsFunction: (
      resource: gdEventsFunction,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: any;
  state: State = {
    renamedEventsFunction: null,
    searchText: '',
  };

  _deleteEventsFunction = (resource: gdEventsFunction) => {
    this.props.onDeleteEventsFunction(resource);
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
    this.setState({
      renamedEventsFunction: null,
    });

    if (eventsFunction.getName() === newName) return;

    if (this._hasEventsFunctionNamed(newName)) {
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
    const { project, eventsFunctions } = this.props;

    // TODO
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

  _hasEventsFunctionNamed = (name: string) => {
    const { eventsFunctions } = this.props;
    return (
      mapVector(eventsFunctions, eventsFunction =>
        eventsFunction.getName()
      ).indexOf(name) !== -1
    );
  };

  _addNewEventsFunction = () => {
    const { eventsFunctions } = this.props;

    const eventsFunction = new gd.EventsFunction();
    const name = newNameGenerator('Function', name =>
      this._hasEventsFunctionNamed(name)
    );
    eventsFunction.setName(name);
    eventsFunctions.push_back(eventsFunction);
    eventsFunction.delete();
    this.forceUpdate();
  };

  render() {
    const {
      project,
      eventsFunctions,
      selectedEventsFunction,
      onSelectEventsFunction,
    } = this.props;
    const { searchText } = this.state; //TODO - Search

    const list = [...mapVector(eventsFunctions, eventsFunction => eventsFunction), {
        key: 'add-item-row'
    }];

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsFunctions.ptr;

    return (
      <Paper style={styles.container}>
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
                addNewItemLabel="Add a new function"
                selectedItem={selectedEventsFunction}
                onItemSelected={onSelectEventsFunction}
                renamedItem={this.state.renamedEventsFunction}
                onRename={this._rename}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._move(oldIndex, newIndex)}
                buildMenuTemplate={this._renderEventsFunctionMenuTemplate}
                helperClass="sortable-helper"
                distance={20}
              />
            )}
          </AutoSizer>
        </div>
        {/* <SearchBar //TODO - Search
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })}
        /> */}
      </Paper>
    );
  }
}
