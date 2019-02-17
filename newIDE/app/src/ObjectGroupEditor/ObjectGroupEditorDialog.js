import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ObjectGroupEditor from '.';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
const gd = global.gd;

export class ObjectGroupEditorDialog extends Component {
  render() {
    const { group } = this.props;
    if (!group) return null;

    const actions = [
      <FlatButton
        label={<Trans>Cancel</Trans>}
        keyboardFocused
        onClick={this.props.onCancel}
      />,
      <FlatButton
        label={<Trans>Apply</Trans>}
        primary
        keyboardFocused
        onClick={this.props.onApply}
      />,
    ];

    return (
      <Dialog
        key={group.ptr}
        actions={actions}
        autoScrollBodyContent
        noMargin
        modal
        onRequestClose={this.props.onCancel}
        open={this.props.open}
        title={`Edit ${group.getName()} group`}
      >
        <ObjectGroupEditor
          group={group}
          project={this.props.project}
          layout={this.props.layout}
          onSizeUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
          }
        />
      </Dialog>
    );
  }
}

export default withSerializableObject(ObjectGroupEditorDialog, {
  newObjectCreator: () => new gd.ObjectGroup(),
  propName: 'group',
});
