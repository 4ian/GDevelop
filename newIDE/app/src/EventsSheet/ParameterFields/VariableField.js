// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import RaisedButton from '../../UI/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
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
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import intersection from 'lodash/intersection';
import SvgIcon, { type SvgIconProps } from '@material-ui/core/SvgIcon';

type Props = {
  ...ParameterFieldProps,
  variablesContainers: Array<gdVariablesContainer>,
  onOpenDialog: ?() => void,
};

type VariableNameQuickAnalyzeResult = 0 | 1 | 2 | 3 | 4;

export type VariableFieldInterface = {|
  ...ParameterFieldInterface,
  updateAutocompletions: () => void,
|};

export const VariableNameQuickAnalyzeResults = {
  OK: 0,
  WRONG_QUOTE: 1,
  WRONG_SPACE: 2,
  WRONG_EXPRESSION: 3,
  UNDECLARED_VARIABLE: 4,
};

// TODO: the entire VariableField could be reworked to be a "real" GenericExpressionField
// (of type: "variable" or the legacy: "scenevar", "globalvar" or "objectvar"). This will
// ensure we 100% validate and can autocomplete what is entered (and we can have also a simpler
// selector that offers the variables in the scope).
export const quicklyAnalyzeVariableName = (
  name: string,
  variablesContainers?: Array<gdVariablesContainer>
): VariableNameQuickAnalyzeResult => {
  if (!name) return VariableNameQuickAnalyzeResults.OK;

  for (let i = 0; i < name.length; ++i) {
    const character = name[i];

    if (character === '[') {
      // This probably starts an expression, so stop the analysis.
      break;
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

  // Check at least the name of the root variable, it's the best we can do.
  const dotPosition = name.indexOf('.');
  const squareBracketPosition = name.indexOf('[');
  const nameToCheck =
    dotPosition !== -1 || squareBracketPosition !== -1
      ? name.substring(
          0,
          Math.min(
            dotPosition === -1 ? name.length : dotPosition,
            squareBracketPosition === -1 ? name.length : squareBracketPosition
          )
        )
      : name;

  if (
    variablesContainers &&
    !variablesContainers.some(variablesContainer =>
      variablesContainer.has(nameToCheck)
    )
  ) {
    return VariableNameQuickAnalyzeResults.UNDECLARED_VARIABLE;
  }
  return VariableNameQuickAnalyzeResults.OK;
};

export default React.forwardRef<Props, VariableFieldInterface>(
  function VariableField(props: Props, ref) {
    const {
      variablesContainers,
      value,
      onChange,
      isInline,
      onOpenDialog,
      parameterMetadata,
      onRequestClose,
      onApply,
      id,
    } = props;

    const field = React.useRef<?SemiControlledAutoCompleteInterface>(null);
    const [
      autocompletionVariableNames,
      setAutocompletionVariableNames,
    ] = React.useState<DataSource>([]);
    /**
     * Can be called to set up or force updating the variables list.
     */
    const updateAutocompletions = React.useCallback(
      () => {
        const definedVariableNames =
          variablesContainers.length === 0
            ? []
            : variablesContainers
                .map(variablesContainer =>
                  enumerateVariables(variablesContainer)
                    .map(({ name, isValidName }) =>
                      isValidName
                        ? name
                        : // Hide invalid variable names - they would not
                          // be parsed correctly anyway.
                          null
                    )
                    .filter(Boolean)
                )
                .reduce((a, b) => intersection(a, b));
        setAutocompletionVariableNames(
          definedVariableNames.map(name => ({
            text: name,
            value: name,
          }))
        );
      },
      [variablesContainers]
    );

    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
      updateAutocompletions,
    }));

    React.useEffect(
      () => {
        updateAutocompletions();
      },
      [updateAutocompletions]
    );

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const quicklyAnalysisResult = quicklyAnalyzeVariableName(
      value,
      variablesContainers
    );

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
    const warningTranslatableText =
      quicklyAnalysisResult ===
      VariableNameQuickAnalyzeResults.UNDECLARED_VARIABLE
        ? t`This variable is not declared. It's recommended to use the *variables editor* to add it.`
        : null;

    return (
      <I18n>
        {({ i18n }) => (
          <TextFieldWithButtonLayout
            renderTextField={() => (
              <SemiControlledAutoComplete
                margin={isInline ? 'none' : 'dense'}
                floatingLabelText={description}
                helperMarkdownText={
                  warningTranslatableText
                    ? i18n._(warningTranslatableText)
                    : parameterMetadata
                    ? parameterMetadata.getLongDescription()
                    : undefined
                }
                errorText={errorText}
                fullWidth
                value={value}
                onChange={onChange}
                onRequestClose={onRequestClose}
                onApply={onApply}
                dataSource={[
                  ...autocompletionVariableNames,
                  onOpenDialog && variablesContainers.length === 1
                    ? {
                        translatableValue: t`Add or edit variables...`,
                        text: '',
                        value: '',
                        onClick: onOpenDialog,
                      }
                    : null,
                ].filter(Boolean)}
                openOnFocus={!isInline}
                ref={field}
                id={id}
              />
            )}
            renderButton={style =>
              onOpenDialog && !isInline ? (
                <RaisedButton
                  icon={<ShareExternal />}
                  disabled={variablesContainers.length !== 1}
                  primary
                  style={style}
                  onClick={onOpenDialog}
                />
              ) : null
            }
          />
        )}
      </I18n>
    );
  }
);

export const renderVariableWithIcon = (
  {
    value,
    parameterMetadata,
    expressionIsValid,
    InvalidParameterValue,
    MissingParameterValue,
  }: ParameterInlineRendererProps,
  VariableIcon: SvgIconProps => React.Element<typeof SvgIcon>,
  tooltip: string
) => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }

  const IconAndNameContainer = expressionIsValid
    ? React.Fragment
    : InvalidParameterValue;

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
      <IconAndNameContainer>
        <VariableIcon
          className={classNames({
            [icon]: true,
          })}
        />
        {value}
      </IconAndNameContainer>
    </span>
  );
};
