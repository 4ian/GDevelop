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
import { enumerateGroups } from '../ObjectsList/EnumerateObjects';
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
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import { type TopLevelFolder } from '../ObjectsList';
import TreeView, { type TreeViewInterface } from '../UI/TreeView';

export const groupWithContextReactDndType = 'GD_GROUP_WITH_CONTEXT';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

type TreeViewItem = GroupWithContext | TopLevelFolder;

const getGroupWithContextName = (groupWithContext: GroupWithContext): string =>
  groupWithContext.group.getName();

const getGroupWithContextOrFolderName = (
  groupWithContextOrFolder: TreeViewItem
) =>
  groupWithContextOrFolder.isRoot
    ? groupWithContextOrFolder.label
    : groupWithContextOrFolder.group.getName();

const getGroupWithContextOfFolderChildren = (
  groupWithContextOrFolder: TreeViewItem
) =>
  groupWithContextOrFolder.isRoot ? groupWithContextOrFolder.children : null;

const getGroupContextOrFolderId = (groupWithContextOrFolder: TreeViewItem) =>
  groupWithContextOrFolder.isRoot
    ? groupWithContextOrFolder.id
    : `group-item-${getGroupWithContextName(groupWithContextOrFolder)}`;

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
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
  onRenameGroup: (
    groupWithContext: GroupWithContext,
    newName: string,
    cb: Function
  ) => void,
  beforeSetAsGlobalGroup?: (groupName: string) => boolean,
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

  treeView: ?TreeViewInterface<TreeViewItem>;
  displayedObjectGroupsList: GroupWithContextList = [];
  displayedGlobalObjectGroupsList: GroupWithContextList = [];
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

    const newObjectGroup = objectGroups.insertNew(name, objectGroups.count());
    this._onObjectGroupModified();

    if (this.props.onGroupAdded) {
      this.props.onGroupAdded();
    }

    const groupWithContext: GroupWithContext = {
      group: newObjectGroup,
      global: false, // A new group is not global by default.
    };

    // Scroll to the new group.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      this.scrollToItem(groupWithContext);
    }, 100); // A few ms is enough for a new render to be done.

    // We focus it so the user can edit the name directly.
    this._onEditName(groupWithContext);
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
        if (this.treeView) this.treeView.forceUpdateList();
      }
    );
  };

  _onDuplicate = (groupWithContext: GroupWithContext): ?GroupWithContext => {
    const { group, global } = groupWithContext;
    const { globalObjectGroups, objectGroups } = this.props;

    const newName = newNameGenerator(
      group.getName(),
      name => objectGroups.has(name) || globalObjectGroups.has(name),
      ''
    );

    const container: gdObjectGroupsContainer = global
      ? globalObjectGroups
      : objectGroups;

    const serializedDuplicatedGroup = serializeToJSObject(group);
    const newGroup = container.insertNew(
      newName,
      container.getPosition(group.getName()) + 1
    );

    unserializeFromJSObject(
      newGroup,
      serializedDuplicatedGroup,
      'unserializeFrom'
    );
    newGroup.setName(newName); // Unserialization has overwritten the name.

    this._onObjectGroupModified();
  };

  _onRename = (groupWithContext: GroupWithContext, newName: string) => {
    const { group, global } = groupWithContext;

    this.setState({
      renamedGroupWithContext: null,
    });

    if (group.getName() === newName) return;

    const validatedNewName = this.props.getValidatedObjectOrGroupName(
      newName,
      global
    );
    this.props.onRenameGroup(groupWithContext, validatedNewName, doRename => {
      if (!doRename) return;

      group.setName(validatedNewName);

      this._onObjectGroupModified();
      if (this.props.onGroupRenamed) {
        this.props.onGroupRenamed();
      }
    });
  };

  _setAsGlobalGroup = (i18n: I18nType, groupWithContext: GroupWithContext) => {
    const { group } = groupWithContext;
    const {
      globalObjectGroups,
      objectGroups,
      beforeSetAsGlobalGroup,
    } = this.props;

    const groupName = group.getName();

    if (globalObjectGroups.has(groupName)) {
      showWarningBox(
        i18n._(
          t`A global object with this name already exists. Please change the object name before setting it as a global object`
        ),
        { delayToNextTick: true }
      );
      return;
    }

    if (beforeSetAsGlobalGroup && !beforeSetAsGlobalGroup(groupName)) {
      return;
    }

    const answer = Window.showConfirmDialog(
      i18n._(
        t`This group will be loaded and available in all the scenes. This is only recommended for groups that you reuse a lot and can't be undone. Make this group global?`
      )
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

    if (
      this.state.selectedGroupWithContext.global ===
      targetGroupWithContext.global
    ) {
      return true;
    }

    if (
      !this.state.selectedGroupWithContext.global &&
      targetGroupWithContext.global &&
      this.displayedGlobalObjectGroupsList.indexOf(targetGroupWithContext) === 0
    ) {
      // Allow drop on first element of global items to put local item at the end of its list
      return true;
    }

    return false;
  };

  _selectGroup = (groupWithContext: ?GroupWithContext) => {
    this.setState({
      selectedGroupWithContext: groupWithContext,
    });
  };

  _moveSelectionTo = (targetGroupWithContext: GroupWithContext) => {
    const { selectedGroupWithContext } = this.state;
    if (!selectedGroupWithContext) return;

    const { globalObjectGroups, objectGroups } = this.props;
    let container: gdObjectGroupsContainer;
    let fromIndex: number;
    let toIndex: number;

    const areSelectedAndTargetItemsFromSameContext =
      selectedGroupWithContext.global === targetGroupWithContext.global;

    const isDroppingLocalItemOnFirstGlobalItemOfDisplayedList =
      !selectedGroupWithContext.global &&
      targetGroupWithContext.global &&
      globalObjectGroups.getPosition(targetGroupWithContext.group.getName()) ===
        0;

    if (areSelectedAndTargetItemsFromSameContext) {
      container = selectedGroupWithContext.global
        ? globalObjectGroups
        : objectGroups;

      fromIndex = container.getPosition(
        selectedGroupWithContext.group.getName()
      );
      toIndex = container.getPosition(targetGroupWithContext.group.getName());
    } else if (isDroppingLocalItemOnFirstGlobalItemOfDisplayedList) {
      container = objectGroups;
      fromIndex = container.getPosition(
        selectedGroupWithContext.group.getName()
      );
      toIndex = !this.state.searchText
        ? container.count()
        : container.getPosition(
            this.displayedObjectGroupsList[
              this.displayedObjectGroupsList.length - 1
            ].group.getName()
          ) + 1;
    } else {
      return;
    }
    if (toIndex > fromIndex) toIndex -= 1;

    container.move(fromIndex, toIndex);
    this._onObjectGroupModified();
    if (this.treeView) this.treeView.forceUpdateList();
  };

  _editItem = (groupWithContextOrFolder: TreeViewItem) => {
    if (groupWithContextOrFolder.isRoot) return;
    this.props.onEditGroup(groupWithContextOrFolder.group);
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
      label: i18n._(t`Set as global group`),
      enabled: !isGroupWithContextGlobal(groupWithContext),
      click: () => this._setAsGlobalGroup(i18n, groupWithContext),
      visible: this.props.canSetAsGlobalGroup !== false,
    },
    {
      label: i18n._(t`Delete`),
      click: () => this._onDelete(groupWithContext),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Add a new group...`),
      click: this.addGroup,
    },
  ];

  scrollToItem = (groupWithContext: GroupWithContext) => {
    if (this.treeView) {
      this.treeView.scrollToItem(groupWithContext);
    }
  };

  _getTreeViewData = (i18n: I18nType): Array<TreeViewItem> => {
    const { globalObjectGroups, objectGroups } = this.props;
    const objectGroupsList: GroupWithContextList = enumerateGroups(
      objectGroups
    ).map(group => ({ group, global: false }));
    const globalObjectGroupsList: GroupWithContextList = enumerateGroups(
      globalObjectGroups
    ).map(group => ({ group, global: true }));

    const treeViewItems = [
      {
        label: i18n._(t`Global Groups`),
        children: globalObjectGroupsList,
        isRoot: true,
        id: 'global-groups',
      },
      {
        label: i18n._(t`Scene Groups`),
        children: objectGroupsList,
        isRoot: true,
        id: 'scene-groups',
      },
    ];
    // $FlowFixMe
    return treeViewItems;
  };

  render() {
    const { searchText, selectedGroupWithContext } = this.state;
    const { globalObjectGroups, objectGroups } = this.props;

    // Force List component to be mounted again if globalObjectGroups or objectGroups
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = objectGroups.ptr + ';' + globalObjectGroups.ptr;

    return (
      <Background>
        <Line>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={text =>
                this.setState({
                  searchText: text,
                })
              }
              placeholder={t`Search object groups`}
            />
          </Column>
        </Line>
        <div style={styles.listContainer}>
          <I18n>
            {({ i18n }) => (
              <div style={{ flex: 1 }}>
                <AutoSizer style={{ width: '100%' }} disableWidth>
                  {({ height }) => (
                    <TreeView
                      key={listKey}
                      ref={treeView => (this.treeView = treeView)}
                      items={this._getTreeViewData(i18n)}
                      height={height}
                      searchText={searchText}
                      getItemName={getGroupWithContextOrFolderName}
                      getItemChildren={getGroupWithContextOfFolderChildren}
                      multiSelect={false}
                      getItemId={getGroupContextOrFolderId}
                      onEditItem={this._editItem}
                      // $FlowFixMe
                      selectedItems={
                        selectedGroupWithContext
                          ? [selectedGroupWithContext]
                          : []
                      }
                      onSelectItems={items => {
                        if (!items) this._selectGroup(null);
                        const itemToSelect = items[0];
                        if ('isRoot' in itemToSelect) return;
                        this._selectGroup(itemToSelect || null);
                      }}
                      onRenameItem={this._onRename}
                      buildMenuTemplate={this._renderGroupMenuTemplate(i18n)}
                      onMoveSelectionToItem={this._moveSelectionTo}
                      canMoveSelectionToItem={this._canMoveSelectionTo}
                      reactDndType={groupWithContextReactDndType}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new group</Trans>}
              primary
              onClick={this.addGroup}
              id="add-new-group-button"
              icon={<Add />}
            />
          </Column>
        </Line>
      </Background>
    );
  }
}
