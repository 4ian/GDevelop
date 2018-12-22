// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { type EventRendererProps } from './EventRenderer.flow';
import { rgbToHex } from '../../../Utils/ColorTransformer';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
const gd = global.gd;

const styles = {
  container: {
    minHeight: 30,
    display: 'flex',
    backgroundColor: '#fbf3d9',
  },
  text: {
    flex: 1,
    whiteSpace: 'pre-line',
    margin: 0,
    padding: 5,
  },
  textArea: {
    padding: 5,
    flex: 1,
    boxSizing: 'border-box',
    width: '100%',
    fontSize: 14,
  },
};

type State = {|
  editing: boolean,
  height: number,
|};

export default class CommentEvent extends React.Component<
  EventRendererProps,
  State
> {
  state = {
    editing: false,
    height: 0,
  };

  _container: ?any;
  _input: ?any;

  edit = () => {
    if (!this._container) return;

    this.setState(
      {
        editing: true,
        height: this._container.offsetHeight,
      },
      () => {
        // $FlowFixMe
        const input: ?HTMLInputElement = ReactDOM.findDOMNode(this._input);
        if (input) {
          input.focus();
          input.value = gd.asCommentEvent(this.props.event).getComment();
        }
      }
    );
  };

  endEditing = () => {
    const commentEvent = gd.asCommentEvent(this.props.event);

    // $FlowFixMe
    const input: ?HTMLInputElement = ReactDOM.findDOMNode(this._input);
    if (input) commentEvent.setComment(input.value);

    this.setState(
      {
        editing: false,
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
    const color = rgbToHex(
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
        style={{ ...styles.container, backgroundColor: `#${color}` }}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        ref={container => (this._container = container)}
      >
        {!this.state.editing ? (
          <p
            className={classNames({
              [selectableArea]: true,
            })}
            onClick={this.edit}
            key="p"
            style={{ ...styles.text, color: `#${textColor}` }}
            dangerouslySetInnerHTML={{
              __html: this._getCommentHTML(),
            }}
          />
        ) : (
          <textarea
            key="textarea"
            type="text"
            style={{ ...styles.textArea, height: this.state.height }}
            onBlur={this.endEditing}
            ref={input => (this._input = input)}
          />
        )}
      </div>
    );
  }
}
