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
const gd = global.gd;

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'hidden',
    backgroundColor: '#fbf3d9',
  },
  textField: {
    width: '100%',
    fontSize: 18,
  },
};

export default class CommentEvent extends React.Component<
  EventRendererProps,
  *
> {
  state = {
    editing: false,
    height: '100%',
  };

  _selectable: ?any;
  _textField: ?any;

  edit = () => {
    this.setState(
      {
        editing: true,
        height: '100%',
      },
      () => {
        if (this._textField) this._textField.focus();
        this.forceUpdate();
      }
    );
  };

  onEvent = (e: any, text: string) => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    commentEvent.setComment(text);

    this.setState(
      {
        height: '100%',
      },
      () => {
        this.props.onUpdate();
        this.forceUpdate();
      }
    );
  };

  endEditing = () => {
    if (!this._textField) return;

    this.setState(
      {
        editing: false,
        height: '100%',
      },
      () => this.props.onUpdate()
    );
  };

  _getCommentHTML = () => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    return commentEvent
      .getComment()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  };

  render() {
    var commentEvent = gd.asCommentEvent(this.props.event);

    const r = commentEvent.getBackgroundColorRed(),
      g = commentEvent.getBackgroundColorGreen(),
      b = commentEvent.getBackgroundColorBlue();

    const textColor = (r + g + b) / 3 > 200 ? 'black' : 'black';

    return (
      <div>
        <div
          className={classNames({
            [largeSelectableArea]: true,
            [largeSelectedArea]: this.props.selected,
          })}
          style={{
            ...styles.container,
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            height: this.state.height,
            minHeight: 35,
          }}
          onClick={this.edit}
        >
          {this.state.editing ? (
            <TextField
              multiLine={true}
              margin="none"
              ref={textField => (this._textField = textField)}
              value={commentEvent.getComment()}
              hintText={t`<Enter comment>`}
              onBlur={this.endEditing}
              onChange={this.onEvent}
              style={{ ...styles.textField, padding: 5 }}
              inputStyle={{
                color: textColor,
                WebkitTextFillColor: textColor,
                padding: 0,
              }}
              underlineFocusStyle={{
                borderColor: textColor,
              }}
              fullWidth
              id="group-title"
            />
          ) : (
            <span
              ref={selectable => (this._selectable = selectable)}
              className={classNames({
                [selectableArea]: true,
                [disabledText]: this.props.disabled,
              })}
              style={{
                ...styles.textField,
                color: textColor,
                boxSizing: 'border-box',
                alignItems: 'center',
                height: '100%',
                lineHeight: '1.1875em',
                padding: 0,
                whiteSpace: 'initial',
              }}
              dangerouslySetInnerHTML={{
                __html: this._getCommentHTML(),
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
