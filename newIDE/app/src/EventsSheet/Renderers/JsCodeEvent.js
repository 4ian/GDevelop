import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
const gd = global.gd;

const fontFamily = '"Lucida Console", Monaco, monospace';

const styles = {
  container: {
    minHeight: 30,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  wrappingText: {
    fontFamily,
    paddingLeft: 5,
    paddingRight: 5,
    margin: 0,
  },
  text: {
    flex: 1,
    whiteSpace: 'pre-line',
    margin: 0,
    paddingLeft: 4 * 5,
    paddingRight: 5,
    fontFamily,
  },
  textArea: {
    paddingLeft: 4 * 5,
    paddingRight: 5,
    flex: 1,
    boxSizing: 'border-box',
    width: '100%',
    fontSize: 14,
    fontFamily,
  },
};

export default class JsCodeEvent extends Component {
  state = {
    editing: false,
  };

  edit = () => {
    this.setState(
      {
        editing: true,
        height: this._container.offsetHeight,
      },
      () => {
        const input = ReactDOM.findDOMNode(this._input);
        input.focus();
        input.value = gd.asJsCodeEvent(this.props.event).getInlineCode();
      }
    );
  };

  endEditing = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setInlineCode(ReactDOM.findDOMNode(this._input).value);
    this.setState(
      {
        editing: false,
      },
      () => this.props.onUpdate()
    );
  };

  render() {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const functionStart = '(function(runtimeScene, objects) {';
    const functionEnd = '})(runtimeScene, objects);';

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        ref={container => (this._container = container)}
      >
        <p style={styles.wrappingText}>{functionStart}</p>
        {!this.state.editing ? (
          <p
            className={classNames({
              [selectableArea]: true,
            })}
            onClick={this.edit}
            key="p"
            style={styles.text}
          >
            {jsCodeEvent.getInlineCode()}
          </p>
        ) : (
          <textarea
            key="textarea"
            type="text"
            style={{ ...styles.textArea, height: this.state.height }}
            onBlur={this.endEditing}
            ref={input => (this._input = input)}
          />
        )}
        <p style={styles.wrappingText}>{functionEnd}</p>
      </div>
    );
  }
}
