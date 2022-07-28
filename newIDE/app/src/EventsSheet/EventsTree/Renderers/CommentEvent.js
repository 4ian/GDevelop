// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import TextField from '../../../UI/TextField';
import { rgbToHex } from '../../../Utils/ColorTransformer';
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
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
const gd: libGDevelop = global.gd;

const commentTextStyle = {
  width: '100%',
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'hidden',
    minHeight: '2.1em',
  },
  commentTextField: commentTextStyle,
  commentSpan: {
    ...commentTextStyle,
    boxSizing: 'border-box',
    alignItems: 'center',
    height: '100%',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
    border: 1,
  },
};

type State = {|
  editing: boolean,
  editingPreviousValue: ?string,
|};

export default class CommentEvent extends React.Component<
  EventRendererProps,
  State
> {
  state = {
    editing: false,
    editingPreviousValue: null,
  };

  _selectable: ?HTMLSpanElement;
  _textField: ?TextField;

  edit = () => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    this.setState(
      {
        editing: true,
        editingPreviousValue: commentEvent.getComment(),
      },
      () => {
        if (this._textField) this._textField.focus();
      }
    );
  };

  onEvent = (e: any, text: string) => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    commentEvent.setComment(text);

    this.props.onUpdate();
    this.forceUpdate();
  };

  endEditing = () => {
    if (!this._textField) return;
    const commentEvent = gd.asCommentEvent(this.props.event);
    if (this.state.editingPreviousValue !== commentEvent.getComment()) {
      this.props.onEndEditingEvent();
    }

    this.setState(
      {
        editing: false,
        editingPreviousValue: null,
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
    const commentEvent = gd.asCommentEvent(this.props.event);

    const backgroundColor = rgbToHex(
      commentEvent.getBackgroundColorRed(),
      commentEvent.getBackgroundColorGreen(),
      commentEvent.getBackgroundColorBlue()
    );

    const textColor = rgbToHex(
      commentEvent.getTextColorRed(),
      commentEvent.getTextColorGreen(),
      commentEvent.getTextColorBlue()
    );

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        style={{
          ...styles.container,
          backgroundColor: `#${backgroundColor}`,
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
            multiline
            margin="none"
            ref={textField => (this._textField = textField)}
            value={commentEvent.getComment()}
            translatableHintText={t`<Enter comment>`}
            onBlur={this.endEditing}
            onChange={this.onEvent}
            style={styles.commentTextField}
            inputStyle={{
              color: `#${textColor}`,
              padding: 0,
              lineHeight: 1.5,
              fontSize: '1em',
            }}
            underlineFocusStyle={{
              borderColor: `#${textColor}`,
            }}
            fullWidth
            id="comment-title"
            onKeyUp={event => {
              if (shouldCloseOrCancel(event)) {
                this.endEditing();
              }
            }}
          />
        ) : (
          <span
            ref={selectable => (this._selectable = selectable)}
            className={classNames({
              [selectableArea]: true,
              [disabledText]: this.props.disabled,
            })}
            style={{
              ...styles.commentSpan,
              color: `#${textColor}`,
            }}
            dangerouslySetInnerHTML={{
              __html: this._getCommentHTML(),
            }}
          />
        )}
      </div>
    );
  }
}
