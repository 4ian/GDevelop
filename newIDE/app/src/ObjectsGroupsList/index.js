// @flow
import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import Paper from 'material-ui/Paper';
import SearchBar from 'material-ui-search-bar';
import GroupRow from './GroupRow';
import { ListItem } from 'material-ui/List';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListAddItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  enumerateObjectsAndGroups,
  filterGroupsList,
} from '../ObjectsList/EnumerateObjects';
import type {
  GroupWithContextList,
  GroupWithContext,
} from '../ObjectsList/EnumerateObjects';

const listItemHeight = 48;
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
  list: any;

  forceUpdateGrid() {
    if (this.list) this.list.forceUpdateGrid();
  }

  render() {
    let { height, width, fullList, project } = this.props;

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
                primaryText="Click to add a group"
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
              project={project}
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
                this.props.onRename(groupWithContext, newName)}
              editingName={nameBeingEdited}
            />
          );
        }}
        width={width}
      />
    );
  }
}

const SortableGroupsList = SortableContainer(GroupsList, { withRef: true });

type StateType = {|
  renamedGroupWithScope: ?GroupWithContext,
  searchText: string,
|};

export default class GroupsListContainer extends React.Component<*, StateType> {
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
  containerGroupsList: GroupWithContextList = [];
  projectGroupsList: GroupWithContextList = [];
  state: StateType = {
    renamedGroupWithScope: null,
    searchText: '',
  };

  shouldComponentUpdate(nextProps: *, nextState: StateType) {
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
      this.props.project !== nextProps.project ||
      this.props.groups !== nextProps.groups
    )
      return true;

    return false;
  }

  addGroup = () => {
    const { project, objectsContainer } = this.props;

    const objectsContainerGroups = objectsContainer.getObjectGroups();
    const name = newNameGenerator(
      'Group',
      name =>
        objectsContainerGroups.has(name) || project.getObjectGroups().has(name)
    );

    objectsContainerGroups.insertNew(name, objectsContainerGroups.count());
    this.forceUpdate();
  };

  _onDelete = (groupWithContext: GroupWithContext) => {
    const { group, global } = groupWithContext;
    const { project, objectsContainer } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this group? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteGroup(groupWithContext, doRemove => {
      if (!doRemove) return;

      if (global) {
        project.getObjectGroups().remove(group.getName());
      } else {
        objectsContainer.getObjectGroups().remove(group.getName());
      }

      this.forceUpdate();
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
    const { project, objectsContainer } = this.props;

    this.setState({
      renamedGroupWithScope: null,
    });

    if (group.getName() === newName) return;

    if (
      objectsContainer.getObjectGroups().has(newName) ||
      project.getObjectGroups().has(newName)
    ) {
      showWarningBox('Another object with this name already exists');
      return;
    }

    this.props.onRenameGroup(groupWithContext, newName, doRename => {
      if (!doRename) return;

      group.setName(newName);
      this.forceUpdate();
    });
  };

  _onMove = (oldIndex: number, newIndex: number) => {
    const { project, objectsContainer } = this.props;

    const isInGroupsList = oldIndex < this.containerGroupsList.length;
    if (isInGroupsList) {
      objectsContainer
        .getObjectGroups()
        .move(
          oldIndex,
          Math.min(newIndex, this.containerGroupsList.length - 1)
        );
    } else {
      const projectOldIndex = oldIndex - this.containerGroupsList.length;
      const projectNewIndex = newIndex - this.containerGroupsList.length;

      project
        .getObjectGroups()
        .move(
          projectOldIndex,
          Math.min(projectNewIndex, this.projectGroupsList.length - 1)
        );
    }

    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  render() {
    const { project, objectsContainer } = this.props;
    const { searchText } = this.state;

    const lists = enumerateObjectsAndGroups(project, objectsContainer);
    this.containerGroupsList = filterGroupsList(
      lists.containerGroupsList,
      searchText
    );
    this.projectGroupsList = filterGroupsList(
      lists.projectGroupsList,
      searchText
    );
    const allGroupsList = filterGroupsList(lists.allGroupsList, searchText);
    const fullList = allGroupsList.concat({
      key: 'add-groups-row',
      object: null,
    });

    // Force List component to be mounted again if project or groups
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    return (
      <Paper style={styles.container}>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <SortableGroupsList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={fullList}
                project={project}
                width={width}
                height={height}
                renamedGroupWithScope={this.state.renamedGroupWithScope}
                onEditGroup={this.props.onEditGroup}
                onAddGroup={this.addGroup}
                onEditName={this._onEditName}
                onDelete={this._onDelete}
                onRename={this._onRename}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._onMove(oldIndex, newIndex)}
                helperClass="sortable-helper"
                distance={30}
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
            })}
        />
      </Paper>
    );
  }
}
