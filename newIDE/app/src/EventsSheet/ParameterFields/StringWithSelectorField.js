// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';

import GenericExpressionField from './GenericExpressionField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import InputAdornment from '@material-ui/core/InputAdornment';
import FlatButton from '../../UI/FlatButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import { getParameterChoiceValues } from './ParameterMetadataTools';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { renderInlineDefaultField } from './DefaultField';

/**
 * Where a choice adornment is displayed: in the field of an instruction editor,
 * in the field of an inline (compact) editor or in the events sheet.
 */
export type ChoiceAdornmentContext = 'field' | 'inlineField' | 'eventsSheet';

export type RenderChoiceAdornment = (
  choice: string,
  context: ChoiceAdornmentContext
) => React.Node;

export type StringWithSelectorFieldProps = {|
  ...ParameterFieldProps,
  // The choices to display. If not specified, they are read from the parameter metadata.
  choices?: Array<string>,
  // If specified, displayed next to the selected choice (an icon, a preview...).
  renderChoiceAdornment?: RenderChoiceAdornment,
|};

const choiceAdornmentStyle = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

/**
 * If the value is one of the choices (i.e: `"choice"`), return the choice
 * (without quotes). Otherwise, return null.
 */
const getSelectedChoice = (
  value: string,
  choices: Array<string>
): string | null => {
  const choice = choices.find(choice => `"${choice}"` === value);
  return choice === undefined ? null : choice;
};

export default (React.forwardRef<
  StringWithSelectorFieldProps,
  ParameterFieldInterface
>(function StringWithSelectorField(props: StringWithSelectorFieldProps, ref) {
  const {
    choices: choicesFromProps,
    renderChoiceAdornment,
    ...parameterFieldProps
  } = props;
  const {
    value,
    onChange,
    parameterIndex,
    parameterMetadata,
    isInline,
  } = parameterFieldProps;

  const field = React.useRef<?(GenericExpressionField | SelectFieldInterface)>(
    null
  );

  const focus: FieldFocusFunction = options => {
    if (field.current) field.current.focus(options);
  };
  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  // The list is not kept with a memo because choices could be changed by
  // another component without this one to know.
  const choices =
    choicesFromProps || getParameterChoiceValues(parameterMetadata);

  const selectedChoice = getSelectedChoice(value, choices);
  const isCurrentValueInList = selectedChoice !== null;

  // If the current value is not in the list, display an expression field.
  const [isExpressionField, setIsExpressionField] = React.useState(
    !!value && !isCurrentValueInList
  );

  React.useEffect(
    () => {
      if (!isExpressionField && !value && choices.length > 0) {
        onChange(`"${choices[0]}"`);
      }
    },
    [choices, isExpressionField, onChange, value]
  );

  const switchFieldType = () => {
    setIsExpressionField(!isExpressionField);
  };

  // $FlowFixMe[missing-local-annot]
  const onChangeSelectValue = (event, value) => {
    onChange(event.target.value);
  };

  const fieldLabel = parameterMetadata
    ? parameterMetadata.getDescription()
    : undefined;

  const selectOptions = choices.map(choice => {
    return (
      <SelectOption
        key={choice}
        value={`"${choice}"`}
        label={choice}
        shouldNotTranslate={true}
      />
    );
  });

  return (
    <TextFieldWithButtonLayout
      renderTextField={() =>
        !isExpressionField ? (
          <SelectField
            ref={field}
            id={
              parameterIndex !== undefined
                ? `parameter-${parameterIndex}-string-with-selector`
                : undefined
            }
            value={value}
            onChange={onChangeSelectValue}
            margin={isInline ? 'none' : 'dense'}
            fullWidth
            floatingLabelText={fieldLabel}
            translatableHintText={t`Choose a value`}
            helperMarkdownText={
              (parameterMetadata && parameterMetadata.getLongDescription()) ||
              null
            }
            startAdornment={
              renderChoiceAdornment && selectedChoice !== null ? (
                <InputAdornment position="start">
                  <span style={choiceAdornmentStyle}>
                    {renderChoiceAdornment(
                      selectedChoice,
                      isInline ? 'inlineField' : 'field'
                    )}
                  </span>
                </InputAdornment>
              ) : null
            }
          >
            {selectOptions}
          </SelectField>
        ) : (
          <GenericExpressionField
            expressionType="string"
            ref={field}
            id={
              parameterIndex !== undefined
                ? `parameter-${parameterIndex}-string-with-selector`
                : undefined
            }
            {...parameterFieldProps}
            onChange={onChange}
          />
        )
      }
      renderButton={style =>
        isExpressionField ? (
          <FlatButton
            id="switch-expression-select"
            leftIcon={<TypeCursorSelect />}
            style={style}
            primary
            label={<Trans>Select</Trans>}
            onClick={switchFieldType}
          />
        ) : (
          <RaisedButton
            id="switch-expression-select"
            icon={<Functions />}
            style={style}
            primary
            label={<Trans>Use an expression</Trans>}
            onClick={switchFieldType}
          />
        )
      }
    />
  );
}): React.ComponentType<{
  ...StringWithSelectorFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

/**
 * Display the value of the parameter and, if it's one of the choices,
 * the adornment of this choice next to it.
 */
export const renderInlineStringWithSelector = (
  props: ParameterInlineRendererProps,
  {
    choices,
    renderChoiceAdornment,
  }: {|
    choices: Array<string>,
    renderChoiceAdornment: RenderChoiceAdornment,
  |}
): React.Node => {
  const defaultRendering = renderInlineDefaultField(props);
  if (!props.expressionIsValid) return defaultRendering;

  const selectedChoice = getSelectedChoice(props.value, choices);
  if (selectedChoice === null) return defaultRendering;

  return (
    <>
      {defaultRendering}
      {renderChoiceAdornment(selectedChoice, 'eventsSheet')}
    </>
  );
};
