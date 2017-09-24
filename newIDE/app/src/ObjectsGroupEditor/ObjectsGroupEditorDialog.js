import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ObjectsGroupEditor from '.';
import Dialog from '../UI/Dialog';

export default class ObjectsGroupEditorDialog extends Component {
  _onApply = () => {
    if (this.props.onApply) this.props.onApply();
  };

  render() {
    const { group } = this.props;
    if (!group) return null;

    const actions = [
      <FlatButton
        label="Apply"
        primary
        keyboardFocused
        onTouchTap={this._onApply}
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
        <ObjectsGroupEditor
          group={group}
          project={this.props.project}
          layout={this.props.layout}
        />
      </Dialog>
    );
  }
}
