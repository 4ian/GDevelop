// @flow
import * as React from 'react';
import classNames from 'classnames';
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
  fontSize: 'inherit',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  padding: 0,
  backgroundColor: 'transparent',
  outline: 0,
  border: 0,

  // Big enough to have an empty text be the same size as an empty textarea.
  lineHeight: '1.5em',
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'hidden',
    minHeight: '2.4em',
  },
  commentTextField: { ...commentTextStyle, minHeight: '0', resize: 'none' },
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

  _textField: ?HTMLTextAreaElement;

  edit = () => {
    if (this.state.editing) return;
    const commentEvent = gd.asCommentEvent(this.props.event);
    this.setState(
      {
        editing: true,
        editingPreviousValue: commentEvent.getComment(),
      },
      () => {
        const textField = this._textField;
        if (textField) {
          textField.focus();
          textField.selectionStart = textField.value.length;
          textField.selectionEnd = textField.value.length;
        }
        // Wait for the change to be applied on the DOM before calling onUpdate,
        // so that the height of the event is updated.
        this.props.onUpdate();
      }
    );
  };

  onChange = (e: any) => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    commentEvent.setComment(e.target.value);

    this._autoResizeTextArea();
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

  _autoResizeTextArea = () => {
    if (this._textField) {
      const previousHeight = this._textField.style.height;
      this._textField.style.height = 'auto';
      this._textField.style.height = this._textField.scrollHeight + 'px';

      if (previousHeight !== this._textField.style.height) {
        this.props.onUpdate(); // Notify the parent that the height has changed.
      }
    }
  };

  componentDidUpdate() {
    this._autoResizeTextArea();
  }

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
          <textarea
            ref={textField => (this._textField = textField)}
            value={commentEvent.getComment()}
            placeholder="..."
            onBlur={this.endEditing}
            onChange={this.onChange}
            style={{ ...styles.commentTextField, color: textColor }}
            id="comment-title"
            onKeyDown={event => {
              if (shouldCloseOrCancel(event) || shouldSubmit(event)) {
                this.endEditing();
              }
            }}
            rows={
              /* Ensure the textarea resize down to 1 line when no text or just a single line is entered. */
              1
            }
            spellCheck="false"
          />
        ) : (
          <span
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
