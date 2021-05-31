// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Button from '@material-ui/core/Button';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../ParameterFields/ObjectField';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
} from '../ClassNames';
import { getHelpLink } from '../../../Utils/HelpLink';
import { type EventRendererProps } from './EventRenderer';
import Measure from 'react-measure';
import { CodeEditor } from '../../../CodeEditor';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { Trans } from '@lingui/macro';
const gd: libGDevelop = global.gd;

const fontFamily = '"Lucida Console", Monaco, monospace';
const MINIMUM_EDITOR_HEIGHT = 200;
const EDITOR_PADDING = 100;

const styles = {
  container: {
    minHeight: 30,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
  },
  wrappingText: {
    fontFamily,
    fontSize: '13px',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
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
  expandIcon: {
    color: '#d4d4d4',
  },
};

type State = {|
  editing: boolean,
  editingObject: boolean,
  anchorEl: ?any,
|};

export default class JsCodeEvent extends React.Component<
  EventRendererProps,
  State
> {
  _objectField: ?ObjectField = null;
  state: State = {
    editing: false,
    editingObject: false,
    anchorEl: null,
  };

  _input: ?any;

  edit: () => void = () => {
    this.setState(
      {
        editing: true,
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

  endEditing: () => void = () => {
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

  onChange: (newValue: string) => void = (newValue: string) => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setInlineCode(newValue);
  };

  editObject: (domEvent: any) => void = (domEvent: any) => {
    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editingObject: true,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              if (this._objectField) this._objectField.focus();
            }, 10);
          }
        ),
      10
    );
  };

  endObjectEditing: () => void = () => {
    const { anchorEl } = this.state;

    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();

    this.setState({
      editingObject: false,
      anchorEl: null,
    });
  };

  toggleExpanded: () => void = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setEventsSheetExpanded(!jsCodeEvent.isEventsSheetExpanded());
  };

  _getCodeEditorHeight: () => number = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);

    // Always use the minimum height when collapsed.
    if (!jsCodeEvent.isEventsSheetExpanded()) {
      return MINIMUM_EDITOR_HEIGHT;
    }

    // Shrink the editor enough for the additional event elements to fit in the sheet space.
    const heightToFillSheet = this.props.eventsSheetHeight - EDITOR_PADDING;
    return Math.max(MINIMUM_EDITOR_HEIGHT, heightToFillSheet);
  };

  render(): React.Node {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const parameterObjects = jsCodeEvent.getParameterObjects();

    const textStyle = this.props.disabled ? styles.comment : undefined;

    const objects = (
      <span
        className={classNames({
          [selectableArea]: true,
        })}
        onClick={this.editObject}
        onKeyPress={event => {
          if (shouldActivate(event)) {
            this.editObject(event);
          }
        }}
        tabIndex={0}
        style={textStyle}
      >
        {parameterObjects ? (
          <Trans>, objects /*{parameterObjects}*/</Trans>
        ) : (
          <>
            {' '}
            <Trans>
              {'/* Click here to choose objects to pass to JavaScript */'}
            </Trans>
          </>
        )}
      </span>
    );

    const eventsFunctionContext = this.props.scope.eventsFunction ? (
      <span style={textStyle}>, eventsFunctionContext</span>
    ) : null;

    const functionStart = (
      <p style={styles.wrappingText}>
        <span style={textStyle}>
          {this.props.disabled ? '/*' : ''}
          {'(function(runtimeScene'}
        </span>
        {objects}
        {eventsFunctionContext}
        <span style={textStyle}>{') {'}</span>
      </p>
    );
    const functionEnd = (
      <p style={styles.wrappingText}>
        <span style={textStyle}>{'})(runtimeScene'}</span>
        {objects}
        {eventsFunctionContext}
        <span style={textStyle}>
          {');'}
          {this.props.disabled ? '*/' : ''}
        </span>
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

    const expandIcon = (
      <div style={styles.expandIcon}>
        {jsCodeEvent.isEventsSheetExpanded() ? (
          <ExpandLess fontSize="small" color="inherit" />
        ) : (
          <ExpandMore fontSize="small" color="inherit" />
        )}
      </div>
    );

    return (
      <Measure bounds>
        {({ measureRef, contentRect }) => (
          <div
            style={styles.container}
            className={classNames({
              [largeSelectableArea]: true,
              [largeSelectedArea]: this.props.selected,
            })}
            ref={measureRef}
          >
            {functionStart}
            <CodeEditor
              value={jsCodeEvent.getInlineCode()}
              onChange={this.onChange}
              width={contentRect.bounds.width - 5}
              height={this._getCodeEditorHeight()}
              onEditorMounted={() => this.props.onUpdate()}
            />
            {functionEnd}
            <Button onClick={this.toggleExpanded} fullWidth size="small">
              {expandIcon}
            </Button>
            <InlinePopover
              open={this.state.editingObject}
              anchorEl={this.state.anchorEl}
              onRequestClose={this.endObjectEditing}
            >
              <ObjectField
                project={this.props.project}
                scope={this.props.scope}
                globalObjectsContainer={this.props.globalObjectsContainer}
                objectsContainer={this.props.objectsContainer}
                value={parameterObjects}
                onChange={text => {
                  jsCodeEvent.setParameterObjects(text);
                  this.props.onUpdate();
                }}
                isInline
                onRequestClose={this.endObjectEditing}
                ref={objectField => (this._objectField = objectField)}
              />
            </InlinePopover>
          </div>
        )}
      </Measure>
    );
  }
}
