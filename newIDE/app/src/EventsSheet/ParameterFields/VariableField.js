// @flow
import { Trans } from '@lingui/macro';
import OpenInNew from '@material-ui/icons/OpenInNew';
import React, { Component } from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import classNames from 'classnames';
import {
  icon,
  nameAndIconContainer,
  instructionWarningParameter,
} from '../EventsTree/ClassNames';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
  type DataSource,
} from '../../UI/SemiControlledAutoComplete';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import uniq from 'lodash/uniq';

type Props = {
  ...ParameterFieldProps,
  variablesContainer: ?gdVariablesContainer,
  onComputeAllVariableNames: () => Array<string>,
  onOpenDialog: ?() => void,
};

type State = {|
  autocompletionVariableNames: DataSource,
|};

type VariableNameQuickAnalyzeResult = 0 | 1 | 2 | 3;

export const VariableNameQuickAnalyzeResults = {
  OK: 0,
  WRONG_QUOTE: 1,
  WRONG_SPACE: 2,
  WRONG_EXPRESSION: 3,
};

export const quicklyAnalyzeVariableName = (
  name: string
): VariableNameQuickAnalyzeResult => {
  for (let i = 0; i < name.length; ++i) {
    const character = name[i];
    if (character === '[') {
      // This probably starts an expression, so stop the analysis.
      return VariableNameQuickAnalyzeResults.OK;
    } else if (character === ' ') {
      return VariableNameQuickAnalyzeResults.WRONG_SPACE;
    } else if (character === '"') {
      return VariableNameQuickAnalyzeResults.WRONG_QUOTE;
    } else if (
      character === '(' ||
      character === '+' ||
      character === '-' ||
      character === '/' ||
      character === '*'
    ) {
      return VariableNameQuickAnalyzeResults.WRONG_EXPRESSION;
    }
  }

  return VariableNameQuickAnalyzeResults.OK;
};

export default class VariableField extends Component<Props, State> {
  _field: ?SemiControlledAutoCompleteInterface;

  static contextType = PreferencesContext;

  constructor(props: Props) {
    super(props);
    this.state = {
      autocompletionVariableNames: [],
    };
  }

  componentDidMount() {
    this.updateAutocompletions();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.variablesContainer !== this.props.variablesContainer) {
      this.updateAutocompletions();
    }
  }

  /**
   * Can be called to set up or force updating the variables list.
   */
  updateAutocompletions() {
    const definedVariableNames = enumerateVariables(
      this.props.variablesContainer
    )
      .map(({ name, isValidName }) =>
        isValidName
          ? name
          : // Hide invalid variable names - they would not
            // be parsed correctly anyway.
            null
      )
      .filter(Boolean);
    const preferences = this.context;
    const autocompletionVariableNames = preferences.values
      .useUndefinedVariablesInAutocompletion
      ? uniq([
          ...definedVariableNames,
          ...this.props.onComputeAllVariableNames(),
        ])
      : definedVariableNames;
    this.setState({
      autocompletionVariableNames: autocompletionVariableNames.map(name => ({
        text: name,
        value: name,
      })),
    });
  }

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      onOpenDialog,
      parameterMetadata,
      onRequestClose,
      onApply,
    } = this.props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const quicklyAnalysisResult = quicklyAnalyzeVariableName(value);

    const errorText =
      quicklyAnalysisResult === VariableNameQuickAnalyzeResults.WRONG_QUOTE ? (
        <Trans>
          It seems you entered a name with a quote. Variable names should not be
          quoted.
        </Trans>
      ) : quicklyAnalysisResult ===
        VariableNameQuickAnalyzeResults.WRONG_SPACE ? (
        <Trans>
          The variable name contains a space - this is not recommended. Prefer
          to use underscores or uppercase letters to separate words.
        </Trans>
      ) : quicklyAnalysisResult ===
        VariableNameQuickAnalyzeResults.WRONG_EXPRESSION ? (
        <Trans>
          The variable name looks like you're building an expression or a
          formula. You can only use this for structure or arrays. For example:
          Score[3].
        </Trans>
      ) : null;

    return (
      <TextFieldWithButtonLayout
        renderTextField={() => (
          <SemiControlledAutoComplete
            margin={this.props.isInline ? 'none' : 'dense'}
            floatingLabelText={description}
            helperMarkdownText={
              parameterMetadata
                ? parameterMetadata.getLongDescription()
                : undefined
            }
            errorText={errorText}
            fullWidth
            value={value}
            onChange={onChange}
            onRequestClose={onRequestClose}
            onApply={onApply}
            dataSource={this.state.autocompletionVariableNames}
            openOnFocus={!isInline}
            ref={field => (this._field = field)}
          />
        )}
        renderButton={style =>
          onOpenDialog && !isInline ? (
            <RaisedButton
              icon={<OpenInNew />}
              disabled={!this.props.variablesContainer}
              primary
              style={style}
              onClick={onOpenDialog}
            />
          ) : null
        }
      />
    );
  }
}

export const renderVariableWithIcon = (
  {
    value,
    parameterMetadata,
    expressionIsValid,
    InvalidParameterValue,
    MissingParameterValue,
  }: ParameterInlineRendererProps,
  iconPath: string,
  tooltip: string
) => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }

  return (
    <span
      title={tooltip}
      className={classNames({
        [nameAndIconContainer]: true,
        [instructionWarningParameter]:
          quicklyAnalyzeVariableName(value) !==
          VariableNameQuickAnalyzeResults.OK,
      })}
    >
      <img
        className={classNames({
          [icon]: true,
        })}
        src={iconPath}
        alt=""
      />
      {expressionIsValid ? (
        value
      ) : (
        <InvalidParameterValue>{value}</InvalidParameterValue>
      )}
    </span>
  );
};
