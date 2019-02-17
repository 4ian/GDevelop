// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../ParameterFields/ObjectField';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
import { getHelpLink } from '../../../Utils/HelpLink';
import { type EventRendererProps } from './EventRenderer.flow';
import Measure from 'react-measure';
import { CodeEditor } from '../../../CodeEditor';
const gd = global.gd;

const fontFamily = '"Lucida Console", Monaco, monospace';

const styles = {
  container: {
    minHeight: 30,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
  },
  wrappingText: {
    fontFamily,
    fontSize: '12px',
    paddingLeft: 5,
    paddingRight: 5,
    margin: 0,
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    overflowX: 'hidden',
    maxWidth: '100%',
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

export default class JsCodeEvent extends React.Component<
  EventRendererProps,
  *
> {
  state = {
    width: 0,
    editing: false,
    editingObject: false,
    anchorEl: null,
  };

  _input: ?any;
  _container: ?any;

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
          input.value = gd.asJsCodeEvent(this.props.event).getInlineCode();
        }
      }
    );
  };

  endEditing = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);

    // $FlowFixMe
    const input: ?HTMLInputElement = ReactDOM.findDOMNode(this._input);
    if (input) jsCodeEvent.setInlineCode(input.value);

    this.setState(
      {
        editing: false,
      },
      () => this.props.onUpdate()
    );
  };

  onChange = (newValue: string) => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setInlineCode(newValue);
  };

  editObject = (domEvent: any) => {
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
          : ' /* Click here to choose objects to pass to JavaScript */'}
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
          <a
            href={getHelpLink('/events/js-code')}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.commentLink}
          >
            Read the documentation and help
          </a>
        </span>
      </p>
    );

    return (
      <Measure onMeasure={({ width }) => this.setState({ width })}>
        <div
          style={styles.container}
          className={classNames({
            [largeSelectableArea]: true,
            [largeSelectedArea]: this.props.selected,
          })}
          ref={container => (this._container = container)}
        >
          {functionStart}
          <CodeEditor
            value={jsCodeEvent.getInlineCode()}
            onChange={this.onChange}
            width={this.state.width}
            onEditorMounted={() => this.props.onUpdate()}
          />
          {functionEnd}
          <InlinePopover
            open={this.state.editingObject}
            anchorEl={this.state.anchorEl}
            onRequestClose={this.endObjectEditing}
          >
            <ObjectField
              project={this.props.project}
              layout={this.props.layout}
              globalObjectsContainer={this.props.globalObjectsContainer}
              objectsContainer={this.props.objectsContainer}
              value={parameterObjects}
              onChange={text => {
                jsCodeEvent.setParameterObjects(text);
                this.props.onUpdate();
              }}
              isInline
            />
          </InlinePopover>
        </div>
      </Measure>
    );
  }
}
