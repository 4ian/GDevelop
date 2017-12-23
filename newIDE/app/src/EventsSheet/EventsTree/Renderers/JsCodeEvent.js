import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../InstructionEditor/ParameterFields/ObjectField';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
import { getHelpLink } from '../../../Utils/HelpLink';
import Window from '../../../Utils/Window';
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
  comment: {
    color: '#777',
  },
  commentLink: {
    cursor: 'pointer',
    color: '#777',
    textDecoration: 'underline',
  },
};

export default class JsCodeEvent extends Component {
  state = {
    editing: false,
    anchorEl: null,
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

  editObject = domEvent => {
    this.setState({
      editingObject: true,
      anchorEl: domEvent.currentTarget,
    });
  };

  endObjectEditing = () => {
    this.setState({
      editingObject: false,
      anchorEl: null,
    });
  };

  openHelp = () => {
    Window.openExternalURL(getHelpLink('/events/js-code'));
  };

  render() {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const parameterObjects = jsCodeEvent.getParameterObjects();
    const objects = (
      <span
        className={classNames({
          [selectableArea]: true,
        })}
        onClick={this.editObject}
      >
        {parameterObjects
          ? `, objects /*${parameterObjects}*/`
          : ' /* No objects selected, only pass the scene as argument */'}
      </span>
    );
    const functionStart = (
      <p style={styles.wrappingText}>
        <span>{'(function(runtimeScene'}</span>
        {objects}
        <span>{') {'}</span>
      </p>
    );
    const functionEnd = (
      <p style={styles.wrappingText}>
        <span>{'})(runtimeScene'}</span>
        {objects}
        <span>{');'}</span>
        <span style={styles.comment}>
          {' // '}
          <a onClick={this.openHelp} style={styles.commentLink}>
            Read the documentation and help
          </a>
        </span>
      </p>
    );

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
        ref={container => (this._container = container)}
      >
        {functionStart}
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
        {functionEnd}
        <InlinePopover
          open={this.state.editingObject}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endObjectEditing}
        >
          <ObjectField
            project={this.props.project}
            layout={this.props.layout}
            value={parameterObjects}
            onChange={text => {
              jsCodeEvent.setParameterObjects(text);
              this.props.onUpdate();
            }}
            isInline
          />
        </InlinePopover>
      </div>
    );
  }
}
