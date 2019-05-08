// TODO: Flowtype

import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
import EventsBasedBehaviorEditor from './index';
const gd = global.gd;

// TODO: Function component?
export class EventsBasedBehaviorEditorDialog extends Component {
  render() {
    const { onCancel, onApply, eventsBasedBehavior, project } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Cancel</Trans>}
        onClick={onCancel}
        key={'Cancel'}
      />,
      <FlatButton
        label={<Trans>Apply</Trans>}
        primary
        keyboardFocused
        onClick={onApply}
        key={'Apply'}
      />,
    ];

    return (
      <Dialog
        noMargin
        actions={actions}
        modal
        open
        onRequestClose={onCancel}
        autoScrollBodyContent
        title={<Trans>Edit the behavior</Trans>}
      >
        <EventsBasedBehaviorEditor
          project={project}
          eventsBasedBehavior={eventsBasedBehavior}
        />
      </Dialog>
    );
  }
}

export default withSerializableObject(EventsBasedBehaviorEditorDialog, {
  newObjectCreator: () => new gd.EventsBasedBehavior(),
  propName: 'eventsBasedBehavior',
  useProjectToUnserialize: true,
});
