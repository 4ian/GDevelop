// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
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
  shouldSubmit,
  shouldValidate,
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { Trans } from '@lingui/macro';
import { dataObjectToProps } from '../../../Utils/HTMLDataset';
const gd: libGDevelop = global.gd;

const titleTextStyle = {
  width: '100%',
  fontSize: '1.3em',
  fontFamily: 'inherit',
  padding: '0px 0 0px 0px',
  margin: 0,
  backgroundColor: 'transparent',
  outline: 0,
  border: '1px solid transparent',
  boxSizing: 'border-box',
  lineHeight: '1.5em',
};

const styles = {
  container: {
    height: '2.5em',
    display: 'flex',
    alignItems: 'center',
    padding: 5,
    overflow: 'hidden',
  },
  titleInput: titleTextStyle,
  titleSpan: {
    ...titleTextStyle,
    display: 'flex',
    alignItems: 'center',
  },
};

export default class GroupEvent extends React.Component<EventRendererProps, *> {
  state = {
    editing: false,
    editingPreviousValue: null,
  };
  _inputField: ?HTMLInputElement = null;

  edit = () => {
    if (this.state.editing) return;
    const groupEvent = gd.asGroupEvent(this.props.event);
    this.setState(
      {
        editing: true,
        editingPreviousValue: groupEvent.getName(),
      },
      () => {
        const inputField = this._inputField;
        if (inputField) {
          inputField.focus();
          inputField.selectionStart = inputField.value.length;
          inputField.selectionEnd = inputField.value.length;
        }
      }
    );
  };

  endEditing = () => {
    const groupEvent = gd.asGroupEvent(this.props.event);
    if (groupEvent.getName() !== this.state.editingPreviousValue) {
      this.props.onEndEditingEvent();
    }
    this.setState({
      editing: false,
      editingPreviousValue: null,
    });
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
        onKeyUp={event => {
          if (shouldActivate(event)) {
            this.edit();
          }
        }}
        tabIndex={0}
        id={`${this.props.idPrefix}-group-${
          groupEvent.isFolded() ? 'folded' : 'unfolded'
        }`}
      >
        {this.state.editing ? (
          <input
            ref={inputField => (this._inputField = inputField)}
            type="text"
            value={groupEvent.getName()}
            placeholder="..."
            onBlur={this.endEditing}
            onChange={e => {
              groupEvent.setName(e.target.value);
              this.forceUpdate();
            }}
            style={{
              ...styles.titleInput,
              color: textColor,
            }}
            onKeyDown={event => {
              if (
                shouldCloseOrCancel(event) ||
                shouldValidate(event) ||
                shouldSubmit(event)
              ) {
                this.endEditing();
              }
            }}
            spellCheck="false"
          />
        ) : (
          <span
            className={classNames({
              [selectableArea]: true,
              [disabledText]: this.props.disabled,
            })}
            style={{ ...styles.titleSpan, color: textColor }}
            {...dataObjectToProps({ editableText: 'true' })}
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
