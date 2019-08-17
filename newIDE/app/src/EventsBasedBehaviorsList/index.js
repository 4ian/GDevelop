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
  enumerateEventsBasedBehaviors,
  filterEventsBasedBehaviorsList,
} from './EnumerateEventsBasedBehaviors';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND = 'Events Based Behavior';

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
  onEventsBasedBehaviorRenamed: (
    eventsBasedBehavior: gdEventsBasedBehavior
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

  _deleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsBasedBehaviorsList } = this.props;

    if (askForConfirmation) {
      //eslint-disable-next-line
      const answer = confirm(
        "Are you sure you want to remove this behavior? This can't be undone."
      );
      if (!answer) return;
    }

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
        this.props.onEventsBasedBehaviorRenamed(eventsBasedBehavior);
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

  _copyEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    Clipboard.set(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND, {
      eventsBasedBehavior: serializeToJSObject(eventsBasedBehavior),
      name: eventsBasedBehavior.getName(),
    });
  };

  _cutEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    this._copyEventsBasedBehavior(eventsBasedBehavior);
    this._deleteEventsBasedBehavior(eventsBasedBehavior, {
      askForConfirmation: false,
    });
  };

  _pasteEventsBasedBehavior = (index: number) => {
    if (!Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND)) return;

    const {
      eventsBasedBehavior: copiedEventsBasedBehavior,
      name,
    } = Clipboard.get(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND);
    const { project, eventsBasedBehaviorsList } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsBasedBehaviorsList.has(name)
    );

    const newEventsBasedBehavior = eventsBasedBehaviorsList.insertNew(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsBasedBehavior,
      copiedEventsBasedBehavior,
      'unserializeFrom',
      project
    );
    newEventsBasedBehavior.setName(newName);

    this.forceUpdate();
  };

  _renderEventsBasedBehaviorMenuTemplate = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    index: number
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
        click: () =>
          this._deleteEventsBasedBehavior(eventsBasedBehavior, {
            askForConfirmation: true,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: 'Copy',
        click: () => this._copyEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: 'Cut',
        click: () => this._cutEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: 'Paste',
        enabled: Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedBehavior(index),
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
