// @flow
import * as React from 'react';
import ObjectGroupsList from '.';
import { ObjectGroupEditorDialog } from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';

type Props = {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  globalObjectGroups: gdObjectGroupsContainer,
  objectGroups: gdObjectGroupsContainer,
  onGroupsUpdated?: () => void,
|};

type State = {|
  editedGroup: ?gdObjectGroup,
|};

/**
 * Helper showing the list of groups and embedding the editor to edit a group.
 */
export default class ObjectGroupsListWithObjectGroupEditor extends React.Component<
  Props,
  State
> {
  state = {
    editedGroup: null,
  };

  _onDeleteGroup = (
    groupWithScope: GroupWithContext,
    done: boolean => void
  ) => {
    //TODO: implement and launch refactoring (using gd.WholeProjectRefactorer)
    done(true);
  };

  _onRenameGroup = (
    groupWithScope: GroupWithContext,
    newName: string,
    done: boolean => void
  ) => {
    //TODO: implement and launch refactoring (using gd.WholeProjectRefactorer)
    done(true);
  };

  editGroup = (editedGroup: ?gdObjectGroup) => this.setState({ editedGroup });

  render() {
    const {
      project,
      objectsContainer,
      globalObjectsContainer,
      objectGroups,
      globalObjectGroups,
    } = this.props;

    return (
      <React.Fragment>
        <ObjectGroupsList
          globalObjectGroups={globalObjectGroups}
          objectGroups={objectGroups}
          onEditGroup={this.editGroup}
          onDeleteGroup={this._onDeleteGroup}
          onRenameGroup={this._onRenameGroup}
          onGroupAdded={this.props.onGroupsUpdated}
          onGroupRemoved={this.props.onGroupsUpdated}
          onGroupRenamed={this.props.onGroupsUpdated}
        />
        <ObjectGroupEditorDialog
          project={project}
          key={globalObjectsContainer.ptr + ';' + objectsContainer.ptr}
          open={!!this.state.editedGroup}
          group={this.state.editedGroup}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          onCancel={() => this.editGroup(null)}
          onApply={() => {
            if (this.props.onGroupsUpdated) this.props.onGroupsUpdated();
            this.editGroup(null);
          }}
        />
      </React.Fragment>
    );
  }
}
