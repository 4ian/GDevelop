// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import TextField from '../../../UI/TextField';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  disabledText,
} from '../ClassNames';
import { type EventRendererProps } from './EventRenderer';
import {
  shouldActivate,
  shouldCloseOrCancel,
  shouldValidate,
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { Trans } from '@lingui/macro';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    height: '2.5em',
    display: 'flex',
    alignItems: 'center',
    padding: 5,
    overflow: 'hidden',
  },
  title: {
    fontSize: '1.3em',
    width: '100%',
  },
};

export default class GroupEvent extends React.Component<EventRendererProps, *> {
  state = {
    editing: false,
    editingPreviousValue: null,
  };
  _textField: ?TextField = null;

  edit = () => {
    const groupEvent = gd.asGroupEvent(this.props.event);
    if (!this.state.editingPreviousValue) {
      this.setState({ editingPreviousValue: groupEvent.getName() });
    }
    this.setState(
      {
        editing: true,
      },
      () => {
        if (this._textField) this._textField.focus();
      }
    );
  };

  endEditing = () => {
    this.setState({
      editing: false,
    });
    const groupEvent = gd.asGroupEvent(this.props.event);
    if (groupEvent.getName() !== this.state.editingPreviousValue) {
      this.props.onEndEditingEvent();
      this.setState({ editingPreviousValue: null });
    }
  };

  render() {
    var groupEvent = gd.asGroupEvent(this.props.event);

    const r = groupEvent.getBackgroundColorR(),
      g = groupEvent.getBackgroundColorG(),
      b = groupEvent.getBackgroundColorB();

    const textColor = (r + g + b) / 3 > 200 ? 'black' : 'white';

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        style={{
          ...styles.container,
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
        }}
        onClick={this.edit}
        onKeyPress={event => {
          if (shouldActivate(event)) {
            this.edit();
          }
        }}
        tabIndex={0}
      >
        {this.state.editing ? (
          <TextField
            ref={textField => (this._textField = textField)}
            value={groupEvent.getName()}
            hintText={t`<Enter group name>`}
            onBlur={this.endEditing}
            onChange={(e, text) => {
              groupEvent.setName(text);
              this.forceUpdate();
            }}
            style={styles.title}
            inputStyle={{
              color: textColor,
              WebkitTextFillColor: textColor,
            }}
            underlineFocusStyle={{
              borderColor: textColor,
            }}
            fullWidth
            id="group-title"
            onKeyUp={event => {
              if (shouldCloseOrCancel(event)) {
                this.endEditing();
              }
            }}
            onKeyPress={event => {
              if (shouldValidate(event)) {
                this.endEditing();
              }
            }}
          />
        ) : (
          <span
            className={classNames({
              [selectableArea]: true,
              [disabledText]: this.props.disabled,
            })}
            style={{ ...styles.title, color: textColor }}
          >
            {groupEvent.getName() ? (
              groupEvent.getName()
            ) : (
              <Trans>{`<Enter group name>`}</Trans>
            )}
          </span>
        )}
      </div>
    );
  }
}
