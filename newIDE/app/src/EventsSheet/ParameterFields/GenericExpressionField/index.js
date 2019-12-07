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
import { type EnumeratedInstructionOrExpressionMetadata } from '../../InstructionEditor/InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';
import { type ParameterFieldProps } from '../ParameterFieldCommons';
import BackgroundHighlighting, {
  type Highlight,
} from './BackgroundHighlighting';
import debounce from 'lodash/debounce';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import { TextFieldWithButtonLayout } from '../../../UI/Layout';
const gd = global.gd;

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
  expressionSelectorPopoverContent: {
    display: 'flex',
    maxHeight: 250,
  },
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
    lineHeight: 1.4,
  },
  backgroundHighlighting: {
    marginTop: 13, //Properly align with the text field
    paddingLeft: 12,
    paddingRight: 12,
  },
  backgroundHighlightingWithDescription: {
    marginTop: 29, //Properly align with the text field
    paddingLeft: 12,
    paddingRight: 12,
  },
};

type State = {|
  popoverOpen: boolean,
  parametersDialogOpen: boolean,
  selectedExpressionInfo: ?EnumeratedInstructionOrExpressionMetadata,
  validatedValue: string,
  errorText: ?string,
  errorHighlights: Array<Highlight>,
|};

type Props = {|
  expressionType: 'number' | 'string',
  renderExtraButton?: ({|
    style: Object,
  |}) => React.Node,
  ...ParameterFieldProps,
|};

export default class ExpressionField extends React.Component<Props, State> {
  _field: ?any = null;
  _fieldElement: ?any = null;
  _inputElement = null;

  state = {
    popoverOpen: false,
    parametersDialogOpen: false,
    selectedExpressionInfo: null,

    validatedValue: '',
    errorText: null,
    errorHighlights: [],
  };

  componentDidMount() {
    if (this._field) {
      this._fieldElement = ReactDOM.findDOMNode(this._field);
      this._inputElement = this._field ? this._field.getInputNode() : null;
    }
  }

  focus() {
    if (this._field) this._field.focus();
  }

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
    this.setState(
      {
        validatedValue: value,
      },
      () => {
        this._enqueueValidation.cancel();
        this._doValidation();
      }
    );
  };

  _handleMenuMouseDown = (event: any) => {
    // Keep the TextField focused
    event.preventDefault();
  };

  _handleExpressionChosen = (
    expressionInfo: EnumeratedInstructionOrExpressionMetadata
  ) => {
    this.setState({
      popoverOpen: false,
      parametersDialogOpen: true,
      selectedExpressionInfo: expressionInfo,
    });
  };

  insertExpression = (
    expressionInfo: EnumeratedInstructionOrExpressionMetadata,
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

  _enqueueValidation = debounce(() => {
    this._doValidation();
  }, 500);

  _doValidation = () => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      expressionType,
    } = this.props;
    if (!project) return null;

    // Validation can be time consuming (~1ms for simple expression,
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

    const expressionValidator = new gd.ExpressionValidator();
    expressionNode.visit(expressionValidator);
    const errors = expressionValidator.getErrors();

    const errorHighlights: Array<Highlight> = mapVector(errors, error => ({
      begin: error.getStartPosition(),
      end: error.getEndPosition() + 1,
      message: error.getMessage(),
      type: 'error',
    }));
    const hasMultipleErrors = errorHighlights.length > 1;
    const errorText = errorHighlights
      .map(
        (highlight, i) =>
          (hasMultipleErrors ? `[${i + 1}] ` : '') + highlight.message
      )
      .join(' ');

    expressionValidator.delete();
    parser.delete();

    this.setState({ errorText, errorHighlights });
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
      : undefined;

    const popoverStyle = {
      width: this._fieldElement ? this._fieldElement.clientWidth : 'auto',
      marginLeft: -5, // Remove the offset that the Popper has for some reason with disablePortal={true}
      // Ensure the popper is above everything (modal, dialog, snackbar, tooltips, etc).
      // There will be only one ExpressionSelector opened at a time, so it's fair to put the
      // highest z index. If this is breaking, check the z-index of material-ui.
      zIndex: muiZIndex.tooltip + 100,
    };

    const backgroundHighlightingStyle = description
      ? styles.backgroundHighlightingWithDescription
      : styles.backgroundHighlighting;

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
                  hintText={expressionType === 'string' ? '""' : undefined}
                  inputStyle={styles.input}
                  onChange={this._handleChange}
                  onBlur={this._handleBlur}
                  ref={field => (this._field = field)}
                  onFocus={this._handleFocus}
                  errorText={this.state.errorText}
                  multiLine
                  fullWidth
                />
              </div>
              {this._fieldElement && this.state.popoverOpen && (
                <ClickAwayListener onClickAway={this._handleRequestClose}>
                  <Popper
                    style={popoverStyle}
                    open={this.state.popoverOpen}
                    anchorEl={this._fieldElement}
                    placement="bottom"
                    disablePortal={
                      true /* Can't use portals as this would put the Popper outside of the Modal, which is keeping the focus in the modal (so the search bar and keyboard browsing won't not work) */
                    }
                  >
                    <Paper style={styles.expressionSelectorPopoverContent}>
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
                  </Popper>
                </ClickAwayListener>
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
            open={true}
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
