// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Functions from 'material-ui/svg-icons/editor/functions';
import RaisedButton from 'material-ui/RaisedButton';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import ExpressionSelector from '../../InstructionOrExpressionSelector/ExpressionSelector';
import ExpressionParametersEditorDialog, {
  type ParameterValues,
} from './ExpressionParametersEditorDialog';
import { formatExpressionCall } from './FormatExpressionCall';
import { type InstructionOrExpressionInformation } from '../../InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import { type ParameterFieldProps } from '../ParameterFieldProps.flow';
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
  expressionSelector: {
    maxHeight: 350,
    overflowY: 'scroll',
  },
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
  functionsButton: {
    marginTop: 7, //Properly align with the text field
    marginLeft: 10,
  },
  functionsButtonWithDescription: {
    marginTop: 33, //Properly align with the text field
    marginLeft: 10,
  },
};

type State = {|
  popoverOpen: boolean,
  parametersDialogOpen: boolean,
  selectedExpressionInfo: ?InstructionOrExpressionInformation,
  errorText: ?string,
|};

type Props = {|
  expressionType: 'number' | 'string',
  ...ParameterFieldProps,
|};

export default class ExpressionField extends Component<Props, State> {
  _field: ?any = null;
  _fieldElement: ?any = null;
  _inputElement = null;

  state = {
    popoverOpen: false,
    parametersDialogOpen: false,
    selectedExpressionInfo: null,
    errorText: null,
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

  _handleFocus = (event: any) => {
    // This prevents ghost click.
    event.preventDefault();
  };

  _handleRequestClose = () => {
    this.setState({
      popoverOpen: false,
    });
  };

  _handleChange = (value: string) => {
    if (this.props.onChange) this.props.onChange(value);

    this._doValidation(value);
    this.setState({
      popoverOpen: false,
    });
  };

  _handleMenuMouseDown = (event: any) => {
    // Keep the TextField focused
    event.preventDefault();
  };

  _handleExpressionChosen = (
    expressionInfo: InstructionOrExpressionInformation
  ) => {
    this.setState({
      popoverOpen: false,
      parametersDialogOpen: true,
      selectedExpressionInfo: expressionInfo,
    });
  };

  insertExpression = (
    expressionInfo: InstructionOrExpressionInformation,
    parameterValues: ParameterValues
  ) => {
    if (!this._inputElement) return;
    const cursorPosition = this._inputElement.selectionStart;

    const functionCall = formatExpressionCall(expressionInfo, parameterValues);

    const { value } = this.props;
    const newValue =
      value.substr(0, cursorPosition) +
      functionCall +
      value.substr(cursorPosition);

    if (this.props.onChange) this.props.onChange(newValue);
    setTimeout(() => {
      if (this._field) this._field.focus();

      setTimeout(() => {
        if (this._inputElement)
          this._inputElement.setSelectionRange(
            cursorPosition,
            cursorPosition + functionCall.length
          );
      }, 5);
    }, 5);
  };

  _getError = (value?: string) => {
    const { project, globalObjectsContainer, objectsContainer, expressionType } = this.props;
    if (!project) return null;

    const callbacks = new gd.CallbacksForExpressionCorrectnessTesting(
      globalObjectsContainer,
      objectsContainer
    );
    const parser = new gd.ExpressionParser(
      value === undefined ? this.props.value : value
    );

    const parseFunction =
      expressionType === 'string'
        ? parser.parseStringExpression
        : parser.parseMathExpression;

    const isValid = parseFunction.call(
      parser,
      project.getCurrentPlatform(),
      project,
      objectsContainer,
      callbacks
    );
    const error = parser.getFirstError();
    parser.delete();
    callbacks.delete();

    return isValid ? null : error;
  };

  _doValidation = (value?: string) => {
    this.setState({ errorText: this._getError(value) });
  };

  render() {
    const {
      value,
      expressionType,
      parameterMetadata,
      project,
      layout,
      globalObjectsContainer,
      objectsContainer,
      parameterRenderingService,
    } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const popoverStyle = {
      width: this._fieldElement ? this._fieldElement.clientWidth : 'auto',
    };

    return (
      <div style={styles.container}>
        <div style={styles.textFieldContainer}>
          <SemiControlledTextField
            commitOnBlur
            value={value}
            floatingLabelText={description}
            inputStyle={styles.input}
            onChange={this._handleChange}
            ref={field => (this._field = field)}
            onFocus={this._handleFocus}
            errorText={this.state.errorText}
            multiLine
            fullWidth
          />
          {this._fieldElement && (
            <Popover
              style={popoverStyle}
              open={this.state.popoverOpen}
              canAutoPosition={false}
              anchorEl={this._fieldElement}
              useLayerForClickAway={false}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={this._handleRequestClose}
              animation={PopoverAnimationVertical}
            >
              <ExpressionSelector
                style={styles.expressionSelector}
                selectedType=""
                onChoose={(type, expression) => {
                  this._handleExpressionChosen(expression);
                }}
                expressionType={expressionType}
                focusOnMount
              />
            </Popover>
          )}
        </div>
        {!this.props.isInline && (
          <RaisedButton
            icon={<Functions />}
            primary
            style={
              description
                ? styles.functionsButtonWithDescription
                : styles.functionsButton
            }
            onClick={this._openExpressionPopover}
          />
        )}
        {this.state.parametersDialogOpen &&
          this.state.selectedExpressionInfo && (
            <ExpressionParametersEditorDialog
              open={true}
              project={project}
              layout={layout}
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
      </div>
    );
  }
}
