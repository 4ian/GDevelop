// @flow
import * as React from 'react';
import OpenInNew from 'material-ui/svg-icons/action/open-in-new';
import IconButton from 'material-ui/IconButton';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import ExternalEventsField from '../../InstructionEditor/ParameterFields/ExternalEventsField';
import { showWarningBox } from '../../../UI/Messages/MessageBox';
import { type EventRendererProps } from './EventRenderer.flow';
const gd = global.gd;

const styles = {
  container: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
  title: {
    fontSize: 18,
  },
};

export default class LinkEvent extends React.Component<EventRendererProps, *> {
  _externalEventsField = null;

  state = {
    editing: false,
    anchorEl: null,
  };

  edit = (domEvent: any) => {
    this.setState(
      {
        editing: true,
        anchorEl: domEvent.currentTarget,
      },
      () => {
        if (this._externalEventsField) this._externalEventsField.focus();
      }
    );
  };

  openTarget = () => {
    const { project, event, onOpenLayout, onOpenExternalEvents } = this.props;
    const linkEvent = gd.asLinkEvent(event);
    const target = linkEvent.getTarget();

    if (project.hasExternalEventsNamed(target)) {
      onOpenExternalEvents(target);
    } else if (project.hasLayoutNamed(target)) {
      onOpenLayout(target);
    } else {
      showWarningBox(
        'The specified external events do not exist in the game. Be sure that the name is correctly spelled or create them using the project manager.'
      );
    }
  };

  endEditing = () => {
    this.setState({
      editing: false,
      anchorEl: null,
    });
  };

  render() {
    const linkEvent = gd.asLinkEvent(this.props.event);
    const target = linkEvent.getTarget();

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        style={styles.container}
      >
        <span style={styles.title}>
          Include events from {' '}
          <i
            className={classNames({
              [selectableArea]: true,
            })}
            onClick={this.edit}
          >
            {target || '< Enter the name of external events >'}
          </i>
        </span>
        <IconButton onClick={this.openTarget} disabled={!target}>
          <OpenInNew />
        </IconButton>
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <ExternalEventsField
            project={this.props.project}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={target}
            onChange={text => {
              linkEvent.setTarget(text);
              this.props.onUpdate();
            }}
            isInline
            ref={externalEventsField =>
              (this._externalEventsField = externalEventsField)}
          />
        </InlinePopover>
      </div>
    );
  }
}
