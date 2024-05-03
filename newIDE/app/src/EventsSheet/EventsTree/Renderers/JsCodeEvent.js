// @flow
import * as React from 'react';
import classNames from 'classnames';
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
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
import { Trans } from '@lingui/macro';
import ChevronArrowTop from '../../../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowBottom from '../../../UI/CustomSvgIcons/ChevronArrowBottom';
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
    fontSize: '0.95em',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    margin: 0,
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    overflowX: 'hidden',
    maxWidth: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
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
  editingObject: boolean,
  editingPreviousValue: ?string,
  anchorEl: ?any,
|};

export default class JsCodeEvent extends React.Component<
  EventRendererProps,
  State
> {
  _objectField: ?ParameterFieldInterface = null;
  state = {
    editingObject: false,
    editingPreviousValue: null,
    anchorEl: null,
  };

  _input: ?any;
  _inlineCodeBeforeChanges: ?string;

  onFocus = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    this._inlineCodeBeforeChanges = jsCodeEvent.getInlineCode();
  };

  onBlur = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const inlineCodeAfterChanges = jsCodeEvent.getInlineCode();
    if (this._inlineCodeBeforeChanges !== inlineCodeAfterChanges)
      this.props.onEndEditingEvent();
  };

  onChange = (newValue: string) => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setInlineCode(newValue);
  };

  editObject = (domEvent: any) => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const parameterObjects = jsCodeEvent.getParameterObjects();

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
            editingPreviousValue: parameterObjects,
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

  cancelObjectEditing = () => {
    this.endObjectEditing();

    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue != null) {
      jsCodeEvent.setParameterObjects(editingPreviousValue);
      this.forceUpdate();
    }
  };

  endObjectEditing = () => {
    const { anchorEl } = this.state;

    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue !== jsCodeEvent.getParameterObjects()) {
      this.props.onEndEditingEvent();
    }
    this.setState({
      editingObject: false,
      editingPreviousValue: null,
      anchorEl: null,
    });
  };

  toggleExpanded = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);
    jsCodeEvent.setEventsSheetExpanded(!jsCodeEvent.isEventsSheetExpanded());
  };

  _getCodeEditorHeight = () => {
    const jsCodeEvent = gd.asJsCodeEvent(this.props.event);

    // Always use the minimum height when collapsed.
    if (!jsCodeEvent.isEventsSheetExpanded()) {
      return MINIMUM_EDITOR_HEIGHT;
    }

    // Shrink the editor enough for the additional event elements to fit in the sheet space.
    const heightToFillSheet = this.props.eventsSheetHeight - EDITOR_PADDING;
    return Math.max(MINIMUM_EDITOR_HEIGHT, heightToFillSheet);
  };

  render() {
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
          <ChevronArrowTop fontSize="small" color="inherit" />
        ) : (
          <ChevronArrowBottom fontSize="small" color="inherit" />
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
            id={`${this.props.idPrefix}-js-code`}
          >
            {functionStart}
            <CodeEditor
              value={jsCodeEvent.getInlineCode()}
              onChange={this.onChange}
              width={contentRect.bounds.width - 5}
              height={this._getCodeEditorHeight()}
              onEditorMounted={() => {
                this.props.onUpdate();
              }}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            />
            {functionEnd}
            <Button onClick={this.toggleExpanded} fullWidth size="small">
              {expandIcon}
            </Button>
            <InlinePopover
              open={this.state.editingObject}
              anchorEl={this.state.anchorEl}
              onRequestClose={this.cancelObjectEditing}
              onApply={this.endObjectEditing}
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
                onRequestClose={this.cancelObjectEditing}
                onApply={this.endObjectEditing}
                ref={objectField => (this._objectField = objectField)}
              />
            </InlinePopover>
          </div>
        )}
      </Measure>
    );
  }
}
