// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import TextField, { type TextFieldInterface } from '../../../UI/TextField';
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
  shouldSubmit,
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { dataObjectToProps } from '../../../Utils/HTMLDataset';
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
  commentTextField: { ...commentTextStyle, fontSize: 'inherit' },
  commentSpan: {
    ...commentTextStyle,
    alignItems: 'center',
    height: '100%',
    whiteSpace: 'pre-wrap',
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
  _textField: ?TextFieldInterface;

  edit = () => {
    if (this.state.editing) return;
    const commentEvent = gd.asCommentEvent(this.props.event);
    this.setState(
      {
        editing: true,
        editingPreviousValue: commentEvent.getComment(),
      },
      () => {
        if (this._textField) {
          this._textField.focus({ caretPosition: 'end' });
        }
      }
    );
  };

  onChange = (e: any, text: string) => {
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

    const backgroundColor = `#${rgbToHex(
      commentEvent.getBackgroundColorRed(),
      commentEvent.getBackgroundColorGreen(),
      commentEvent.getBackgroundColorBlue()
    )}`;

    const textColor = `#${rgbToHex(
      commentEvent.getTextColorRed(),
      commentEvent.getTextColorGreen(),
      commentEvent.getTextColorBlue()
    )}`;

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        style={{
          ...styles.container,
          backgroundColor,
        }}
        onClick={this.edit}
        onKeyUp={event => {
          if (!this.state.editing && shouldActivate(event)) {
            this.edit();
          }
        }}
        tabIndex={0}
        id={`${this.props.idPrefix}-comment`}
      >
        {this.state.editing ? (
          <TextField
            multiline
            margin="none"
            ref={textField => (this._textField = textField)}
            value={commentEvent.getComment()}
            translatableHintText={t`<Enter comment>`}
            onBlur={this.endEditing}
            onChange={this.onChange}
            style={styles.commentTextField}
            inputStyle={{
              color: textColor,
              padding: 0,
            }}
            fullWidth
            id="comment-title"
            onKeyDown={event => {
              if (shouldCloseOrCancel(event) || shouldSubmit(event)) {
                this.endEditing();
              }
            }}
            underlineShow={false}
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
              color: textColor,
            }}
            dangerouslySetInnerHTML={{
              __html: this._getCommentHTML(),
            }}
            {...dataObjectToProps({ editableText: 'true' })}
          />
        )}
      </div>
    );
  }
}
