// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import GroupRow from './GroupRow';
import { ListItem } from 'material-ui/List';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListCommonItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  filterGroupsList,
  enumerateGroups,
} from '../ObjectsList/EnumerateObjects';
import type {
  GroupWithContextList,
  GroupWithContext,
} from '../ObjectsList/EnumerateObjects';

const listItemHeight = 48;
const styles = {
  listContainer: {
    flex: 1,
  },
};

const AddGroupRow = makeAddItem(ListItem);

const SortableGroupRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return (
    <div style={style}>
      <GroupRow {...otherProps} />
    </div>
  );
});

const SortableAddGroupRow = SortableElement(props => {
  return <AddGroupRow {...props} />;
});

class GroupsList extends Component<*, *> {
  list: ?List;

  forceUpdateGrid() {
    if (this.list) this.list.forceUpdateGrid();
  }

  render() {
    const { height, width, fullList } = this.props;

    return (
      <List
        ref={list => (this.list = list)}
        height={height}
        rowCount={fullList.length}
        rowHeight={listItemHeight}
        rowRenderer={({ index, key, style }) => {
          const groupWithContext = fullList[index];
          if (groupWithContext.key === 'add-groups-row') {
            return (
              <SortableAddGroupRow
                index={fullList.length}
                key={key}
                style={style}
                disabled
                onClick={this.props.onAddGroup}
                primaryText={<Trans>Click to add a group</Trans>}
              />
            );
          }

          const nameBeingEdited =
            this.props.renamedGroupWithScope &&
            this.props.renamedGroupWithScope.group === groupWithContext.group &&
            this.props.renamedGroupWithScope.global === groupWithContext.global;

          return (
            <SortableGroupRow
              index={index}
              key={groupWithContext.group.ptr}
              group={groupWithContext.group}
              style={style}
              onEdit={
                this.props.onEditGroup
                  ? () => this.props.onEditGroup(groupWithContext.group)
                  : undefined
              }
              onEditName={() => this.props.onEditName(groupWithContext)}
              onDelete={() => this.props.onDelete(groupWithContext)}
              onRename={newName =>
                this.props.onRename(groupWithContext, newName)
              }
              editingName={nameBeingEdited}
              isGlobalGroup={groupWithContext.global}
              onSetAsGlobalGroup={
                groupWithContext.global
                  ? undefined
                  : () => this.props.onSetAsGlobalGroup(groupWithContext)
              }
            />
          );
        }}
        width={width}
      />
    );
  }
}

const SortableGroupsList = SortableContainer(GroupsList, { withRef: true });

type State = {|
  renamedGroupWithScope: ?GroupWithContext,
  searchText: string,
|};

type Props = {|
  globalObjectGroups: gdObjectGroupsContainer,
  objectGroups: gdObjectGroupsContainer,
  onDeleteGroup: (groupWithContext: GroupWithContext, cb: Function) => void,
  onEditGroup: gdObjectGroup => void,
  onRenameGroup: (
    groupWithContext: GroupWithContext,
    newName: string,
    cb: Function
  ) => void,
  onGroupAdded?: () => void,
  onGroupRemoved?: () => void,
  onGroupRenamed?: () => void,
|};

export default class GroupsListContainer extends React.Component<Props, State> {
  static defaultProps = {
    onDeleteGroup: (groupWithContext: GroupWithContext, cb: Function) =>
      cb(true),
    onRenameGroup: (
      groupWithContext: GroupWithContext,
      newName: string,
      cb: Function
    ) => cb(true),
  };

  sortableList: any;
  objectGroupsList: GroupWithContextList = [];
  globalObjectGroupsList: GroupWithContextList = [];
  state: State = {
    renamedGroupWithScope: null,
    searchText: '',
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to groups list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (
      this.state.renamedGroupWithScope !== nextState.renamedGroupWithScope ||
      this.state.searchText !== nextState.searchText
    )
      return true;

    if (
      this.props.globalObjectGroups !== nextProps.globalObjectGroups ||
      this.props.objectGroups !== nextProps.objectGroups
    ) {
      return true;
    }

    return false;
  }

  addGroup = () => {
    const { globalObjectGroups, objectGroups } = this.props;

    const name = newNameGenerator(
      'Group',
      name => objectGroups.has(name) || globalObjectGroups.has(name)
    );

    objectGroups.insertNew(name, objectGroups.count());
    this.forceUpdate();

    if (this.props.onGroupAdded) {
      this.props.onGroupAdded();
    }
  };

  _onDelete = (groupWithContext: GroupWithContext) => {
    const { group, global } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this group? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteGroup(groupWithContext, doRemove => {
      if (!doRemove) return;

      if (global) {
        globalObjectGroups.remove(group.getName());
      } else {
        objectGroups.remove(group.getName());
      }

      this.forceUpdate();
      if (this.props.onGroupRemoved) {
        this.props.onGroupRemoved();
      }
    });
  };

  _onEditName = (groupWithContext: GroupWithContext) => {
    this.setState(
      {
        renamedGroupWithScope: groupWithContext,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _onRename = (groupWithContext: GroupWithContext, newName: string) => {
    const { group } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    this.setState({
      renamedGroupWithScope: null,
    });

    if (group.getName() === newName) return;

    if (objectGroups.has(newName) || globalObjectGroups.has(newName)) {
      showWarningBox('Another object with this name already exists');
      return;
    }

    this.props.onRenameGroup(groupWithContext, newName, doRename => {
      if (!doRename) return;

      group.setName(newName);

      this.forceUpdate();
      if (this.props.onGroupRenamed) {
        this.props.onGroupRenamed();
      }
    });
  };

  _onMove = (oldIndex: number, newIndex: number) => {
    const { globalObjectGroups, objectGroups } = this.props;

    const isInGroupsList = oldIndex < this.objectGroupsList.length;
    if (isInGroupsList) {
      objectGroups.move(
        oldIndex,
        Math.min(newIndex, this.objectGroupsList.length - 1)
      );
    } else {
      const globalObjectGroupsOldIndex =
        oldIndex - this.objectGroupsList.length;
      const globalObjectGroupsNewIndex =
        newIndex - this.objectGroupsList.length;

      globalObjectGroups.move(
        globalObjectGroupsOldIndex,
        Math.min(
          globalObjectGroupsNewIndex,
          this.globalObjectGroupsList.length - 1
        )
      );
    }

    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  _setAsGlobalGroup = (groupWithContext: GroupWithContext) => {
    const { group } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    const groupName = group.getName();

    if (globalObjectGroups.has(groupName)) {
      showWarningBox(
        'A global object with this name already exists. Please change the object name before setting it as a global object'
      );
      return;
    }

    //eslint-disable-next-line
    const answer = confirm(
      "This group will be loaded and available in all the scenes. This is only recommended for groups that you reuse a lot and can't be undone. Make this group global?"
    );
    if (!answer) return;

    globalObjectGroups.insert(group, globalObjectGroups.count());
    objectGroups.remove(groupName);
    this.forceUpdate();
  };

  render() {
    const { globalObjectGroups, objectGroups } = this.props;
    const { searchText } = this.state;

    const objectGroupsList: GroupWithContextList = enumerateGroups(
      objectGroups
    ).map(group => ({ group, global: false }));
    const globalObjectGroupsList: GroupWithContextList = enumerateGroups(
      globalObjectGroups
    ).map(group => ({ group, global: true }));
    this.objectGroupsList = filterGroupsList(objectGroupsList, searchText);
    this.globalObjectGroupsList = filterGroupsList(
      globalObjectGroupsList,
      searchText
    );
    const allGroupsList = filterGroupsList(
      [...objectGroupsList, ...globalObjectGroupsList],
      searchText
    );
    const fullList = allGroupsList.concat({
      key: 'add-groups-row',
      object: null,
    });

    // Force List component to be mounted again if globalObjectGroups or objectGroups
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = objectGroups.ptr + ';' + globalObjectGroups.ptr;

    return (
      <Background>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <SortableGroupsList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={fullList}
                width={width}
                height={height}
                renamedGroupWithScope={this.state.renamedGroupWithScope}
                onEditGroup={this.props.onEditGroup}
                onAddGroup={this.addGroup}
                onEditName={this._onEditName}
                onDelete={this._onDelete}
                onRename={this._onRename}
                onSetAsGlobalGroup={this._setAsGlobalGroup}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._onMove(oldIndex, newIndex)
                }
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
