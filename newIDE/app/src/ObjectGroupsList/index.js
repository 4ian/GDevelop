// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import {
  filterGroupsList,
  enumerateGroups,
  isSameGroupWithContext,
} from '../ObjectsList/EnumerateObjects';
import {
  type GroupWithContextList,
  type GroupWithContext,
} from '../ObjectsList/EnumerateObjects';
import Window from '../Utils/Window';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

export const groupWithContextReactDndType = 'GD_GROUP_WITH_CONTEXT';

const styles = {
  listContainer: {
    flex: 1,
  },
};

const getGroupWithContextName = (groupWithContext: GroupWithContext): string =>
  groupWithContext.group.getName();
const isGroupWithContextGlobal = (groupWithContext: GroupWithContext) =>
  groupWithContext.global;

type State = {|
  renamedGroupWithContext: ?GroupWithContext,
  selectedGroupWithContext: ?GroupWithContext,
  searchText: string,
|};

type Props = {|
  globalObjectGroups: gdObjectGroupsContainer,
  objectGroups: gdObjectGroupsContainer,
  onDeleteGroup: (groupWithContext: GroupWithContext, cb: Function) => void,
  onEditGroup: gdObjectGroup => void,
  canRenameGroup: (newName: string) => boolean,
  onRenameGroup: (
    groupWithContext: GroupWithContext,
    newName: string,
    cb: Function
  ) => void,
  onGroupAdded?: () => void,
  onGroupRemoved?: () => void,
  onGroupRenamed?: () => void,
  canSetAsGlobalGroup?: boolean,
  unsavedChanges?: ?UnsavedChanges,
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

  sortableList: ?SortableVirtualizedItemList<GroupWithContext>;
  objectGroupsList: GroupWithContextList = [];
  globalObjectGroupsList: GroupWithContextList = [];
  state: State = {
    renamedGroupWithContext: null,
    selectedGroupWithContext: null,
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
      this.state.renamedGroupWithContext !==
        nextState.renamedGroupWithContext ||
      this.state.selectedGroupWithContext !==
        nextState.selectedGroupWithContext ||
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
    this._onObjectGroupModified();

    if (this.props.onGroupAdded) {
      this.props.onGroupAdded();
    }
  };

  _onDelete = (groupWithContext: GroupWithContext) => {
    const { group, global } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    const answer = Window.showConfirmDialog(
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

      this._onObjectGroupModified();
      if (this.props.onGroupRemoved) {
        this.props.onGroupRemoved();
      }
    });
  };

  _onEditName = (groupWithContext: GroupWithContext) => {
    this.setState(
      {
        renamedGroupWithContext: groupWithContext,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _onDuplicate = (groupWithContext: GroupWithContext): ?GroupWithContext => {
    const { group, global } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    const container: gdObjectGroupsContainer = global
      ? globalObjectGroups
      : objectGroups;

    const newName = newNameGenerator(
      group.getName(),
      name => container.has(name),
      ''
    );

    const newGroup = container.insertNew(
      newName,
      container.getPosition(group.getName()) + 1
    );

    unserializeFromJSObject(
      newGroup,
      serializeToJSObject(group),
      'unserializeFrom'
    );
    newGroup.setName(newName); // Unserialization has overwritten the name.

    this._onObjectGroupModified();

    return { group: newGroup, global };
  };

  _onRename = (groupWithContext: GroupWithContext, newName: string) => {
    const { group } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    this.setState({
      renamedGroupWithContext: null,
    });

    if (group.getName() === newName) return;

    if (objectGroups.has(newName) || globalObjectGroups.has(newName)) {
      showWarningBox('Another object with this name already exists', {
        delayToNextTick: true,
      });
      return;
    }

    if (this.props.canRenameGroup(newName)) {
      this.props.onRenameGroup(groupWithContext, newName, doRename => {
        if (!doRename) return;

        group.setName(newName);

        this._onObjectGroupModified();
        if (this.props.onGroupRenamed) {
          this.props.onGroupRenamed();
        }
      });
    }
  };

  _setAsGlobalGroup = (groupWithContext: GroupWithContext) => {
    const { group } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    const groupName = group.getName();

    if (globalObjectGroups.has(groupName)) {
      showWarningBox(
        'A global object with this name already exists. Please change the object name before setting it as a global object',
        { delayToNextTick: true }
      );
      return;
    }

    const answer = Window.showConfirmDialog(
      "This group will be loaded and available in all the scenes. This is only recommended for groups that you reuse a lot and can't be undone. Make this group global?"
    );
    if (!answer) return;

    globalObjectGroups.insert(group, globalObjectGroups.count());
    objectGroups.remove(groupName);
    this._onObjectGroupModified();
  };

  _onObjectGroupModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  _canMoveSelectionTo = (targetGroupWithContext: GroupWithContext) => {
    if (!this.state.selectedGroupWithContext) return false;

    return (
      this.state.selectedGroupWithContext.global ===
      targetGroupWithContext.global
    );
  };

  _moveSelectionTo = (targetGroupWithContext: GroupWithContext) => {
    if (!this.state.selectedGroupWithContext) return;

    const { globalObjectGroups, objectGroups } = this.props;

    const container: gdObjectGroupsContainer = targetGroupWithContext.global
      ? globalObjectGroups
      : objectGroups;

    const fromIndex = container.getPosition(
      this.state.selectedGroupWithContext.group.getName()
    );
    let toIndex = container.getPosition(targetGroupWithContext.group.getName());
    if (toIndex > fromIndex) toIndex -= 1;

    container.move(fromIndex, toIndex);
    this._onObjectGroupModified();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

  _renderGroupMenuTemplate = (i18n: I18nType) => (
    groupWithContext: GroupWithContext,
    index: number
  ) => [
    {
      label: i18n._(t`Duplicate`),
      click: () => this._onDuplicate(groupWithContext),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Edit group`),
      click: () => this.props.onEditGroup(groupWithContext.group),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Rename`),
      click: () => this._onEditName(groupWithContext),
    },
    {
      label: i18n._(t`Set as Global group`),
      enabled: !isGroupWithContextGlobal(groupWithContext),
      click: () => this._setAsGlobalGroup(groupWithContext),
      visible: this.props.canSetAsGlobalGroup !== false,
    },
    {
      label: i18n._(t`Delete`),
      click: () => this._onDelete(groupWithContext),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Add a new group`),
      click: this.addGroup,
    },
  ];

  render() {
    const { globalObjectGroups, objectGroups } = this.props;
    const { searchText } = this.state;

    const objectGroupsList: GroupWithContextList = enumerateGroups(
      objectGroups
    ).map(group => ({ group, global: false }));
    const globalObjectGroupsList: GroupWithContextList = enumerateGroups(
      globalObjectGroups
    ).map(group => ({ group, global: true }));
    this.objectGroupsList = filterGroupsList(objectGroupsList, { searchText });
    this.globalObjectGroupsList = filterGroupsList(globalObjectGroupsList, {
      searchText,
    });
    const fullList = filterGroupsList(
      [...objectGroupsList, ...globalObjectGroupsList],
      { searchText }
    );

    // Force List component to be mounted again if globalObjectGroups or objectGroups
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = objectGroups.ptr + ';' + globalObjectGroups.ptr;

    const renamedGroupWithContext = fullList.find(
      isSameGroupWithContext(this.state.renamedGroupWithContext)
    );

    return (
      <Background>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <I18n>
                {({ i18n }) => (
                  <SortableVirtualizedItemList
                    key={listKey}
                    ref={sortableList => (this.sortableList = sortableList)}
                    fullList={fullList}
                    width={width}
                    height={height}
                    getItemName={getGroupWithContextName}
                    getItemId={(groupWithContext, index) => {
                      return 'group-item-' + index;
                    }}
                    isItemBold={isGroupWithContextGlobal}
                    onEditItem={groupWithContext =>
                      this.props.onEditGroup(groupWithContext.group)
                    }
                    onAddNewItem={this.addGroup}
                    addNewItemLabel={<Trans>Add a new group</Trans>}
                    addNewItemId="add-new-group-button"
                    selectedItems={[]}
                    onItemSelected={groupWithContext => {
                      this.setState({
                        selectedGroupWithContext: groupWithContext,
                      });
                    }}
                    renamedItem={renamedGroupWithContext}
                    onRename={this._onRename}
                    buildMenuTemplate={this._renderGroupMenuTemplate(i18n)}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    canMoveSelectionToItem={this._canMoveSelectionTo}
                    reactDndType={groupWithContextReactDndType}
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
        />
      </Background>
    );
  }
}
