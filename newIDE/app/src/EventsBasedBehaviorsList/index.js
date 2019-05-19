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
  enumerateEventsBasedBehaviors,
  filterEventsBasedBehaviorsList,
} from './EnumerateEventsBasedBehaviors';

const styles = {
  listContainer: {
    flex: 1,
  },
};

type State = {|
  renamedEventsBasedBehavior: ?gdEventsBasedBehavior,
  searchText: string,
|};

type Props = {|
  project: gdProject,
  eventsBasedBehaviorsList: gdEventsBasedBehaviorsList,
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
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
  onEditProperties: (eventsBasedBehavior: gdEventsBasedBehavior) => void,
|};

export default class EventsBasedBehaviorsList extends React.Component<
  Props,
  State
> {
  static defaultProps = {
    onDeleteEventsBasedBehavior: (
      eventsBasedBehavior: gdEventsBasedBehavior,
      cb: boolean => void
    ) => cb(true),
    onRenameEventsBasedBehavior: (
      eventsBasedBehavior: gdEventsBasedBehavior,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: any;
  state: State = {
    renamedEventsBasedBehavior: null,
    searchText: '',
  };

  _deleteEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    const { eventsBasedBehaviorsList } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this behavior? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteEventsBasedBehavior(eventsBasedBehavior, doRemove => {
      if (!doRemove) return;

      eventsBasedBehaviorsList.remove(eventsBasedBehavior.getName());
      this.forceUpdate();
    });
  };

  _editName = (renamedEventsBasedBehavior: ?gdEventsBasedBehavior) => {
    this.setState(
      {
        renamedEventsBasedBehavior,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _rename = (eventsBasedBehavior: gdEventsBasedBehavior, newName: string) => {
    const { eventsBasedBehaviorsList } = this.props;
    this.setState({
      renamedEventsBasedBehavior: null,
    });

    if (eventsBasedBehavior.getName() === newName) return;

    if (eventsBasedBehaviorsList.has(newName)) {
      showWarningBox('Another behavior with this name already exists.');
      return;
    }

    this.props.onRenameEventsBasedBehavior(
      eventsBasedBehavior,
      newName,
      doRename => {
        if (!doRename) return;
        eventsBasedBehavior.setName(newName);
        this.forceUpdate();
      }
    );
  };

  _move = (oldIndex: number, newIndex: number) => {
    const { eventsBasedBehaviorsList } = this.props;
    eventsBasedBehaviorsList.move(oldIndex, newIndex);

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  _renderEventsBasedBehaviorMenuTemplate = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    _index: number
  ) => {
    return [
      {
        label: 'Properties',
        click: () => this.props.onEditProperties(eventsBasedBehavior),
      },
      {
        type: 'separator',
      },
      {
        label: 'Rename',
        click: () => this._editName(eventsBasedBehavior),
      },
      {
        label: 'Remove',
        click: () => this._deleteEventsBasedBehavior(eventsBasedBehavior),
      },
    ];
  };

  _addNewEventsBasedBehavior = () => {
    const { eventsBasedBehaviorsList } = this.props;

    const name = newNameGenerator('MyBehavior', name =>
      eventsBasedBehaviorsList.has(name)
    );
    eventsBasedBehaviorsList.insertNew(
      name,
      eventsBasedBehaviorsList.getCount()
    );
    this.forceUpdate();
  };

  render() {
    const {
      project,
      eventsBasedBehaviorsList,
      selectedEventsBasedBehavior,
      onSelectEventsBasedBehavior,
    } = this.props;
    const { searchText } = this.state;

    const list = [
      ...filterEventsBasedBehaviorsList(
        enumerateEventsBasedBehaviors(eventsBasedBehaviorsList),
        searchText
      ),
      {
        key: 'add-item-row',
      },
    ];

    // Force List component to be mounted again if project or eventsBasedBehaviorsList
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsBasedBehaviorsList.ptr;

    return (
      <Background>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <SortableVirtualizedItemList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={list}
                width={width}
                height={height}
                onAddNewItem={this._addNewEventsBasedBehavior}
                addNewItemLabel={<Trans>Add a new behavior</Trans>}
                selectedItem={selectedEventsBasedBehavior}
                onItemSelected={onSelectEventsBasedBehavior}
                renamedItem={this.state.renamedEventsBasedBehavior}
                onRename={this._rename}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._move(oldIndex, newIndex)
                }
                buildMenuTemplate={this._renderEventsBasedBehaviorMenuTemplate}
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
