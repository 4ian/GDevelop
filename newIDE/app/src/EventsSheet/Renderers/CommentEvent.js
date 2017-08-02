import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { largeSelectedArea, largeSelectableArea } from '../ClassNames';
const gd = global.gd;

const commentEventStyles = {
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
    flex: 1,
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
  },
};

export default class CommentEvent extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
    };
  }

  handleDoubleClick = () => {
    this.setState(
      {
        editing: true,
      },
      () => {
        const input = ReactDOM.findDOMNode(this._input);
        input.focus();
        input.value = gd.asCommentEvent(this.props.event).getComment();
      }
    );
  };

  handleBlur = () => {
    const commentEvent = gd.asCommentEvent(this.props.event);
    commentEvent.setComment(ReactDOM.findDOMNode(this._input).value);
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
    return (
      <div
        style={commentEventStyles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        {!this.state.editing
          ? <p
              onDoubleClick={this.handleDoubleClick}
              key="p"
              style={commentEventStyles.text}
              dangerouslySetInnerHTML={{
                __html: this._getCommentHTML(),
              }}
            />
          : <textarea
              key="textarea"
              type="text"
              style={commentEventStyles.textArea}
              onBlur={this.handleBlur}
              ref={input => this._input = input}
            />}
      </div>
    );
  }
}
