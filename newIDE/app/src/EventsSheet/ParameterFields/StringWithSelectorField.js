// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
  getParameterHelperMarkdownText,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import RichSelectField, {
  type RichSelectFieldInterface,
  type RichSelectFieldExtraOption,
  type RichSelectFieldOptionAction,
} from '../../UI/RichSelectField';

import GenericExpressionField from './GenericExpressionField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import FlatButton from '../../UI/FlatButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import { getParameterChoiceValues } from './ParameterMetadataTools';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { renderInlineDefaultField } from './DefaultField';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

/**
 * Where a choice adornment is displayed: in the field of an instruction editor,
 * in the field of an inline (compact) editor, in the menu listing the choices
 * or in the events sheet.
 */
export type ChoiceAdornmentContext =
  | 'field'
  | 'inlineField'
  | 'menu'
  | 'eventsSheet';

export type RenderChoiceAdornment = (
  choice: string,
  context: ChoiceAdornmentContext
) => React.Node;

export type StringWithSelectorFieldProps = {|
  ...ParameterFieldProps,
  // The choices to display. If not specified, they are read from the parameter metadata.
  choices?: Array<string>,
  // If specified, displayed next to each choice (an icon, a preview...).
  renderChoiceAdornment?: RenderChoiceAdornment,
  // Consecutive choices of different groups are separated by a divider, and
  // the label of the group (from `choiceGroupLabels`), if any.
  getChoiceGroup?: (choice: string) => string,
  choiceGroupLabels?: { [group: string]: MessageDescriptor },
  // If specified, a button shown at the end of a choice in the list.
  getChoiceAction?: (choice: string) => ?RichSelectFieldOptionAction,
  // Actions shown after the choices, below a divider.
  extraOptions?: Array<RichSelectFieldExtraOption>,
  // Shown under the field, after the parameter long description.
  extraHelperMarkdownText?: ?string,
  // Chosen when the value is empty. The first choice if not specified.
  defaultChoice?: string,
  // Return an error to show for the value, or null.
  onExtractAdditionalErrors?: (value: string) => ?string,
|};

/**
 * If the value is one of the choices (i.e: `"choice"`), return the choice
 * (without quotes). Otherwise, return null.
 */
export const getSelectedChoice = (
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
    getChoiceGroup,
    choiceGroupLabels,
    getChoiceAction,
    extraOptions,
    extraHelperMarkdownText,
    defaultChoice,
    onExtractAdditionalErrors,
    ...parameterFieldProps
  } = props;
  const {
    value,
    onChange,
    parameterIndex,
    parameterMetadata,
    isInline,
  } = parameterFieldProps;

  const field = React.useRef<?(
    | GenericExpressionField
    | SelectFieldInterface
    | RichSelectFieldInterface
  )>(null);

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
        onChange(`"${defaultChoice || choices[0]}"`);
      }
    },
    [choices, defaultChoice, isExpressionField, onChange, value]
  );

  const switchFieldType = () => {
    setIsExpressionField(!isExpressionField);
  };

  // $FlowFixMe[missing-local-annot]
  const onChangeSelectValue = event => {
    onChange(event.target.value);
  };

  const fieldLabel = parameterMetadata
    ? parameterMetadata.getDescription()
    : undefined;

  const fieldId =
    parameterIndex !== undefined
      ? `parameter-${parameterIndex}-string-with-selector`
      : undefined;
  const helperMarkdownText = getParameterHelperMarkdownText(
    parameterMetadata,
    extraHelperMarkdownText
  );
  const errorText = onExtractAdditionalErrors
    ? onExtractAdditionalErrors(value)
    : null;

  const renderSelectField = () =>
    renderChoiceAdornment ||
    getChoiceGroup ||
    getChoiceAction ||
    extraOptions ? (
      <RichSelectField
        ref={field}
        id={fieldId}
        value={value}
        onChange={onChange}
        margin={isInline ? 'none' : 'dense'}
        fullWidth
        floatingLabelText={fieldLabel}
        translatableHintText={t`Choose a value`}
        helperMarkdownText={helperMarkdownText}
        errorText={errorText}
        options={choices.map(choice => ({
          value: `"${choice}"`,
          label: choice,
          adornment: renderChoiceAdornment
            ? renderChoiceAdornment(choice, isInline ? 'inlineField' : 'field')
            : undefined,
          group: getChoiceGroup ? getChoiceGroup(choice) : undefined,
          action: (getChoiceAction && getChoiceAction(choice)) || undefined,
        }))}
        groupLabels={choiceGroupLabels}
        extraOptions={extraOptions}
      />
    ) : (
      <SelectField
        ref={field}
        id={fieldId}
        value={value}
        onChange={onChangeSelectValue}
        margin={isInline ? 'none' : 'dense'}
        fullWidth
        floatingLabelText={fieldLabel}
        translatableHintText={t`Choose a value`}
        helperMarkdownText={helperMarkdownText}
        errorText={errorText}
      >
        {choices.map(choice => (
          <SelectOption
            key={choice}
            value={`"${choice}"`}
            label={choice}
            shouldNotTranslate={true}
          />
        ))}
      </SelectField>
    );

  return (
    <TextFieldWithButtonLayout
      renderTextField={() =>
        !isExpressionField ? (
          renderSelectField()
        ) : (
          <GenericExpressionField
            expressionType="string"
            ref={field}
            id={fieldId}
            {...parameterFieldProps}
            extraHelperMarkdownText={extraHelperMarkdownText}
            onExtractAdditionalErrors={onExtractAdditionalErrors}
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
