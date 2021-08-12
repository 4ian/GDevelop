// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import Popper from '@material-ui/core/Popper';
import muiZIndex from '@material-ui/core/styles/zIndex';
import Functions from '@material-ui/icons/Functions';
import RaisedButton from '../../../UI/RaisedButton';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import { mapVector } from '../../../Utils/MapFor';
import ExpressionSelector from '../../InstructionEditor/InstructionOrExpressionSelector/ExpressionSelector';
import ExpressionParametersEditorDialog, {
  type ParameterValues,
} from './ExpressionParametersEditorDialog';
import { formatExpressionCall } from './FormatExpressionCall';
import { type EnumeratedExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { type ParameterFieldProps } from '../ParameterFieldCommons';
import BackgroundHighlighting, {
  type Highlight,
} from './BackgroundHighlighting';
import debounce from 'lodash/debounce';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import { TextFieldWithButtonLayout } from '../../../UI/Layout';
import {
  type ExpressionAutocompletion,
  insertAutocompletionInExpression,
  getAutocompletionsFromDescriptions,
} from '../../../ExpressionAutocompletion';
import {
  type AutocompletionsState,
  getAutocompletionsInitialState,
  setNewAutocompletions,
  handleAutocompletionsKeyDown,
  getVisibleAutocompletions,
  getRemainingCount,
} from './ExpressionAutocompletionsHandler';
import ExpressionAutocompletionsDisplayer from './ExpressionAutocompletionsDisplayer';
import { ResponsiveWindowMeasurer } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  shouldCloseOrCancel,
  shouldSubmit,
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  textFieldContainer: {
    flex: 1,
    minWidth: 300,
  },
  textFieldAndHightlightContainer: {
    position: 'relative',
  },
  expressionSelectorPopoverContentSmall: {
    display: 'flex',
    maxHeight: 250,
  },
  expressionSelectorPopoverContent: {
    display: 'flex',
    maxHeight: 350,
  },
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
    lineHeight: 1.4,
  },
  backgroundHighlightingWithFloatingLabel: {
    marginTop: 22, //Properly align with the text field
    paddingLeft: 12,
    paddingRight: 12,
  },
  backgroundHighlightingInline: {
    marginTop: 0, //Properly align with the text field
    paddingLeft: 0,
    paddingRight: 0,
  },
  backgroundHighlightingInlineWithFloatingLabel: {
    marginTop: 22, //Properly align with the text field
    paddingLeft: 0,
    paddingRight: 0,
  },
};

type State = {|
  popoverOpen: boolean,
  parametersDialogOpen: boolean,
  selectedExpressionInfo: ?EnumeratedExpressionMetadata,
  validatedValue: string,
  errorText: ?string,
  errorHighlights: Array<Highlight>,
  autocompletions: AutocompletionsState,
|};

type Props = {|
  expressionType: 'number' | 'string',
  /** An optional callback that can be used to provide additional autocompletions. */
  onGetAdditionalAutocompletions?: (
    currentExpression: string
  ) => Array<ExpressionAutocompletion>,
  /** An optional callback that can be used to show a custom error message. */
  onExtractAdditionalErrors?: (
    currentExpression: string,
    currentExpressionNode: gdExpressionNode
  ) => ?string,
  renderExtraButton?: ({|
    style: Object,
  |}) => React.Node,
  ...ParameterFieldProps,
|};

const MAX_ERRORS_COUNT = 10;

const extractErrors = (
  expressionNode: gdExpressionNode
): {|
  errorText: ?string,
  errorHighlights: Array<Highlight>,
|} => {
  const expressionValidator = new gd.ExpressionValidator();
  expressionNode.visit(expressionValidator);
  const errors = expressionValidator.getErrors();

  const errorHighlights: Array<Highlight> = mapVector(errors, error => ({
    begin: error.getStartPosition(),
    end: error.getEndPosition() + 1,
    message: error.getMessage(),
    type: 'error',
  }));
  const otherErrorsCount = Math.max(
    0,
    errorHighlights.length - MAX_ERRORS_COUNT
  );
  const hasMultipleErrors = errorHighlights.length > 1;

  const filteredErrorHighlights =
    otherErrorsCount > 0
      ? errorHighlights.slice(0, MAX_ERRORS_COUNT)
      : errorHighlights;

  const errorText = filteredErrorHighlights
    .map(
      (highlight, i) =>
        (hasMultipleErrors ? `[${i + 1}] ` : '') + highlight.message
    )
    .join(' ');

  expressionValidator.delete();

  return { errorText, errorHighlights };
};

export default class ExpressionField extends React.Component<Props, State> {
  _field: ?SemiControlledTextField = null;
  _fieldElement: ?Element = null;
  _inputElement: ?HTMLInputElement = null;

  state = {
    popoverOpen: false,
    parametersDialogOpen: false,
    selectedExpressionInfo: null,

    validatedValue: this.props.value,
    errorText: null,
    errorHighlights: [],
    autocompletions: getAutocompletionsInitialState(),
  };

  componentDidMount() {
    if (this._field) {
      const node = ReactDOM.findDOMNode(this._field);
      if (node instanceof Element) {
        this._fieldElement = node;
      }
      this._inputElement = this._field ? this._field.getInputNode() : null;
    }
  }

  focus = () => {
    if (this._field) {
      this._field.focus();
      this._enqueueValidation();
    }
  };

  _openExpressionPopover = () => {
    this.setState({
      popoverOpen: true,
    });
  };

  _handleFocus = (event: { preventDefault: () => void }) => {
    // This prevents ghost click.
    event.preventDefault();
  };

  _handleRequestClose = () => {
    this.setState({
      popoverOpen: false,
    });
  };

  _handleChange = (value: string) => {
    this.setState(
      {
        validatedValue: value,
      },
      () => this._enqueueValidation()
    );
  };

  _handleBlur = (event: { currentTarget: { value: string } }) => {
    const value = event.currentTarget.value;
    if (this.props.onChange) this.props.onChange(value);
    this.setState({ validatedValue: value }, () => {
      this._enqueueValidation.cancel();
      this._doValidation();
      this.setState({
        autocompletions: getAutocompletionsInitialState(),
      });
    });
  };

  _handleExpressionChosen = (expressionInfo: EnumeratedExpressionMetadata) => {
    this.setState({
      popoverOpen: false,
      parametersDialogOpen: true,
      selectedExpressionInfo: expressionInfo,
    });
  };

  insertExpression = (
    expressionInfo: EnumeratedExpressionMetadata,
    parameterValues: ParameterValues
  ) => {
    if (!this._inputElement) return;
    const cursorPosition = this._inputElement.selectionStart;

    const functionCall = formatExpressionCall(expressionInfo, parameterValues);

    // Generate the expression with the function call
    const { value } = this.props;
    const newValue =
      value.substr(0, cursorPosition) +
      functionCall +
      value.substr(cursorPosition);

    // Apply changes
    if (this.props.onChange) this.props.onChange(newValue);
    this.setState(
      {
        validatedValue: newValue,
      },
      () => this._enqueueValidation()
    );

    // Focus again and select what was just added.
    setTimeout(() => {
      if (this._field) this._field.focus();

      setTimeout(() => {
        if (this._inputElement) {
          this._inputElement.setSelectionRange(
            cursorPosition,
            cursorPosition + functionCall.length
          );
        }
      }, 5);
    }, 5);
  };

  _insertAutocompletion = (
    expressionAutocompletion: ExpressionAutocompletion
  ) => {
    // If the completion is exact, it's not a completion but just
    // shown for informing the user.
    if (expressionAutocompletion.isExact) return;

    const caretLocation = this._inputElement
      ? this._inputElement.selectionStart
      : 0;
    const expression = this.state.validatedValue;

    const {
      expression: newExpression,
      caretLocation: newCaretLocation,
    } = insertAutocompletionInExpression(
      { expression, caretLocation },
      {
        completion: expressionAutocompletion.completion,
        replacementStartPosition:
          expressionAutocompletion.replacementStartPosition,
        replacementEndPosition: expressionAutocompletion.replacementEndPosition,
        addParenthesis: expressionAutocompletion.addParenthesis,
        addDot: expressionAutocompletion.addDot,
        addParameterSeparator: expressionAutocompletion.addParameterSeparator,
        addNamespaceSeparator: expressionAutocompletion.addNamespaceSeparator,
        addClosingParenthesis: expressionAutocompletion.addClosingParenthesis,
      }
    );

    if (this._field) {
      this._field.forceSetValue(newExpression);
    }
    if (this.props.onChange) this.props.onChange(newExpression);
    this.setState(
      {
        validatedValue: newExpression,
      },
      () => {
        this._enqueueValidation();
        if (this._field) {
          this._field.forceSetSelection(newCaretLocation, newCaretLocation);
        }
      }
    );
  };

  _enqueueValidation = debounce(() => {
    this._doValidation();
  }, 250);

  _doValidation = () => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      expressionType,
      scope,
      onGetAdditionalAutocompletions,
      onExtractAdditionalErrors,
    } = this.props;
    if (!project) return null;

    // Parsing can be time consuming (~1ms for simple expression,
    // a few milliseconds for complex ones).

    const parser = new gd.ExpressionParser2(
      gd.JsPlatform.get(),
      globalObjectsContainer,
      objectsContainer
    );
    const expression = this.state.validatedValue;
    const expressionNode = parser
      .parseExpression(expressionType, expression)
      .get();

    const { errorText, errorHighlights } = extractErrors(expressionNode);
    const extraErrorText = onExtractAdditionalErrors
      ? onExtractAdditionalErrors(expression, expressionNode)
      : null;

    const cursorPosition = this._inputElement
      ? this._inputElement.selectionStart
      : 0;
    const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
      expressionNode,
      cursorPosition - 1
    );
    const newAutocompletions = getAutocompletionsFromDescriptions(
      {
        gd,
        project,
        globalObjectsContainer,
        objectsContainer,
        scope,
      },
      completionDescriptions
    );
    const allNewAutocompletions = onGetAdditionalAutocompletions
      ? onGetAdditionalAutocompletions(expression).concat(newAutocompletions)
      : newAutocompletions;

    parser.delete();

    this.setState(state => ({
      errorText: [extraErrorText, errorText].filter(Boolean).join(' - '),
      errorHighlights,
      autocompletions: setNewAutocompletions(
        state.autocompletions,
        allNewAutocompletions
      ),
    }));
  };

  render() {
    const {
      value,
      expressionType,
      parameterMetadata,
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      parameterRenderingService,
    } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : this.props.isInline
      ? undefined
      : '-'; // We're using multiline TextField, which does not support having no label.
    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    const popoverStyle = {
      width: this._fieldElement ? this._fieldElement.clientWidth : 'auto',
      marginLeft: -5, // Remove the offset that the Popper has for some reason with disablePortal={true}
      // Ensure the popper is above everything (modal, dialog, snackbar, tooltips, etc).
      // There will be only one ExpressionSelector opened at a time, so it's fair to put the
      // highest z index. If this is breaking, check the z-index of material-ui.
      zIndex: muiZIndex.tooltip + 100,
    };

    const backgroundHighlightingStyle = this.props.isInline
      ? // An inline GenericExpressionField is shown with a TextField
        // with variant "standard", and no margins. The label is shown
        // only if provided (description), so we need to adapt the margins
        // of the background
        description
        ? styles.backgroundHighlightingInlineWithFloatingLabel
        : styles.backgroundHighlightingInline
      : // A non-inline GenericExpressionField is shown with a TextField
        // with variant "filled". As we're using a *multiline* field, it
        // always put space for the label, even if not provided.
        styles.backgroundHighlightingWithFloatingLabel;

    return (
      <React.Fragment>
        <TextFieldWithButtonLayout
          margin={this.props.isInline ? 'none' : 'dense'}
          renderTextField={() => (
            <div style={styles.textFieldContainer}>
              <div style={styles.textFieldAndHightlightContainer}>
                <BackgroundHighlighting
                  value={this.state.validatedValue}
                  style={{ ...styles.input, ...backgroundHighlightingStyle }}
                  highlights={this.state.errorHighlights}
                />
                <SemiControlledTextField
                  margin={this.props.isInline ? 'none' : 'dense'}
                  value={value}
                  floatingLabelText={description}
                  helperMarkdownText={longDescription}
                  hintText={expressionType === 'string' ? '""' : undefined}
                  inputStyle={styles.input}
                  onChange={this._handleChange}
                  onBlur={this._handleBlur}
                  ref={field => (this._field = field)}
                  onFocus={this._handleFocus}
                  errorText={this.state.errorText}
                  onClick={() => this._enqueueValidation()}
                  onKeyDown={event => {
                    const autocompletions = handleAutocompletionsKeyDown(
                      this.state.autocompletions,
                      {
                        event,
                        onUpdateAutocompletions: this._enqueueValidation,
                        onInsertAutocompletion: this._insertAutocompletion,
                      }
                    );
                    this.setState({ autocompletions });

                    // If the user pressed the key to close (or to submit),
                    // there is a chance that this will trigger the closing
                    // of the dialog/popover containing the expression field.
                    // Apply the changes now as otherwise the onBlur handler
                    // has a risk not to be called (as the component will be
                    // unmounted).
                    if (shouldCloseOrCancel(event) || shouldSubmit(event)) {
                      const value = event.currentTarget.value;
                      if (this.props.onChange) this.props.onChange(value);
                    }
                  }}
                  multiline
                  fullWidth
                />
              </div>
              {this._inputElement && this.state.popoverOpen && (
                <ClickAwayListener onClickAway={this._handleRequestClose}>
                  <Popper
                    style={popoverStyle}
                    open={this.state.popoverOpen}
                    anchorEl={this._inputElement}
                    placement="bottom"
                    disablePortal={
                      true /* Can't use portals as this would put the Popper outside of the Modal, which is keeping the focus in the modal (so the search bar and keyboard browsing won't not work) */
                    }
                  >
                    <ResponsiveWindowMeasurer>
                      {screenSize => (
                        <Paper
                          style={
                            screenSize === 'small'
                              ? styles.expressionSelectorPopoverContentSmall
                              : styles.expressionSelectorPopoverContent
                          }
                        >
                          <ExpressionSelector
                            selectedType=""
                            onChoose={(type, expression) => {
                              this._handleExpressionChosen(expression);
                            }}
                            expressionType={expressionType}
                            focusOnMount
                            scope={scope}
                          />
                        </Paper>
                      )}
                    </ResponsiveWindowMeasurer>
                  </Popper>
                </ClickAwayListener>
              )}
              {this._inputElement &&
                !this.state.popoverOpen &&
                parameterRenderingService && (
                  <ExpressionAutocompletionsDisplayer
                    project={project}
                    anchorEl={this._inputElement}
                    expressionAutocompletions={getVisibleAutocompletions(
                      this.state.autocompletions
                    )}
                    remainingCount={getRemainingCount(
                      this.state.autocompletions
                    )}
                    selectedCompletionIndex={
                      this.state.autocompletions.selectedCompletionIndex
                    }
                    onChoose={expressionAutocompletion => {
                      this._insertAutocompletion(expressionAutocompletion);

                      setTimeout(
                        this.focus,
                        50 /* Give back the focus to the field after a completion is inserted */
                      );
                    }}
                    parameterRenderingService={parameterRenderingService}
                  />
                )}
            </div>
          )}
          renderButton={style => (
            <React.Fragment>
              {!this.props.isInline &&
                this.props.renderExtraButton &&
                this.props.renderExtraButton({
                  style,
                })}
              {!this.props.isInline && (
                <RaisedButton
                  icon={<Functions />}
                  label={
                    expressionType === 'string'
                      ? '"ABC"'
                      : expressionType === 'number'
                      ? '123'
                      : ''
                  }
                  primary
                  style={style}
                  onClick={this._openExpressionPopover}
                />
              )}
            </React.Fragment>
          )}
        />

        {this.state.parametersDialogOpen && this.state.selectedExpressionInfo && (
          <ExpressionParametersEditorDialog
            project={project}
            scope={scope}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            expressionMetadata={this.state.selectedExpressionInfo.metadata}
            onDone={parameterValues => {
              if (!this.state.selectedExpressionInfo) return;

              this.insertExpression(
                this.state.selectedExpressionInfo,
                parameterValues
              );
              this.setState({
                parametersDialogOpen: false,
                selectedExpressionInfo: null,
              });
            }}
            onRequestClose={() => {
              this.setState({
                parametersDialogOpen: false,
                selectedExpressionInfo: null,
              });
            }}
            parameterRenderingService={parameterRenderingService}
          />
        )}
      </React.Fragment>
    );
  }
}
