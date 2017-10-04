import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import Paper from 'material-ui/Paper';
import GroupRow from './GroupRow';
import { ListItem } from 'material-ui/List';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListAddItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { enumerateObjectsAndGroups } from '../ObjectsList/EnumerateObjects';

const listItemHeight = 48;
const styles = {
  container: { flex: 1, display: 'flex', height: '100%' },
};

const AddGroupRow = makeAddItem(ListItem);

const SortableGroupRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return <div style={style}><GroupRow {...otherProps} /></div>;
});

const SortableAddGroupRow = SortableElement(props => {
  return <AddGroupRow {...props} />;
});

class GroupsList extends Component {
  forceUpdateGrid() {
    if (this.list) this.list.forceUpdateGrid();
  }

  render() {
    let { height, width, fullList, project } = this.props;

    return (
      <List
        ref={list => this.list = list}
        height={height}
        rowCount={fullList.length}
        rowHeight={listItemHeight}
        rowRenderer={({ index, key, style }) => {
          const groupWithScope = fullList[index];
          if (groupWithScope.key === 'add-groups-row') {
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

          const nameBeingEdited = this.props.renamedGroupWithScope &&
            this.props.renamedGroupWithScope.group === groupWithScope.group &&
            this.props.renamedGroupWithScope.global === groupWithScope.global;

          return (
            <SortableGroupRow
              index={index}
              key={groupWithScope.group.ptr}
              project={project}
              group={groupWithScope.group}
              style={style}
              onEdit={
                this.props.onEditGroup
                  ? () => this.props.onEditGroup(groupWithScope.group)
                  : undefined
              }
              onEditName={() => this.props.onEditName(groupWithScope)}
              onDelete={() => this.props.onDelete(groupWithScope)}
              onRename={newName => this.props.onRename(groupWithScope, newName)}
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

export default class GroupsListContainer extends React.Component {
  static defaultProps = {
    onDeleteGroup: (groupWithScope, cb) => cb(true),
    onRenameGroup: (groupWithScope, newName, cb) => cb(true),
  };

  constructor(props) {
    super(props);

    this.containerGroupsList = [];
    this.projectGroupsList = [];
    this.state = {
      renamedGroupWithScope: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to groups list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (this.state.renamedGroupWithScope !== nextState.renamedGroupWithScope)
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

  _onDelete = groupWithScope => {
    const { group, global } = groupWithScope;
    const { project, objectsContainer } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this group? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteGroup(groupWithScope, doRemove => {
      if (!doRemove) return;

      if (global) {
        project.getObjectGroups().remove(group.getName());
      } else {
        objectsContainer.getObjectGroups().remove(group.getName());
      }

      this.forceUpdate();
    });
  };

  _onEditName = groupWithScope => {
    this.setState(
      {
        renamedGroupWithScope: groupWithScope,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _onRename = (groupWithScope, newName) => {
    const { group } = groupWithScope;
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

    this.props.onRenameGroup(groupWithScope, newName, doRename => {
      if (!doRename) return;

      group.setName(newName);
      this.forceUpdate();
    });
  };

  _onMove = (oldIndex, newIndex) => {
    const { project, objectsContainer } = this.props;

    const isInGroupsList = oldIndex < this.containerGroupsList.length;
    if (isInGroupsList) {
      objectsContainer.getObjectGroups().move(
        oldIndex,
        Math.min(newIndex, this.containerGroupsList.length - 1)
      );
    } else {
      const projectOldIndex = oldIndex - this.containerGroupsList.length;
      const projectNewIndex = newIndex - this.containerGroupsList.length;

      project.getObjectGroups().move(
        projectOldIndex,
        Math.min(projectNewIndex, this.projectGroupsList.length - 1)
      );
    }

    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  render() {
    const { project, objectsContainer } = this.props;

    const lists = enumerateObjectsAndGroups(project, objectsContainer);
    this.containerGroupsList = lists.containerGroupsList;
    this.projectGroupsList = lists.projectGroupsList;
    const allGroupsList = lists.allGroupsList;
    const fullList = allGroupsList.concat({
      key: 'add-groups-row',
      object: null,
    });

    // Force List component to be mounted again if project or groups
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;
    console.log('Render');

    return (
      <Paper style={styles.container}>
        <AutoSizer>
          {({ height, width }) => (
            <SortableGroupsList
              key={listKey}
              ref={sortableList => this.sortableList = sortableList}
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
      </Paper>
    );
  }
}
