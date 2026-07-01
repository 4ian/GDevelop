// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import { readTimelineProjectData } from '../../TimelineEditor/TimelineProjectStorage';

export const timelineBindingNameIdentifierExtraInfo =
  'TimelineSequencer::BindingName';

const toStringExpression = (value: string): string => JSON.stringify(value);

const parseStringExpression = (value: string): ?string => {
  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === 'string' ? parsedValue : null;
  } catch (error) {
    return null;
  }
};

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function TimelineBindingNameField(props: ParameterFieldProps, ref) {
    const {
      isInline,
      onChange,
      parameterIndex,
      parameterMetadata,
      project,
      value,
    } = props;
    const field = React.useRef<?(
      | GenericExpressionField
      | SelectFieldInterface
    )>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const projectBindingNames = React.useMemo(
      () => {
        if (!project) {
          return ([]: Array<string>);
        }

        const usedNames = new Set<string>();
        const bindingNames: Array<string> = [];
        readTimelineProjectData(project).timelines.forEach(timeline => {
          timeline.tracks.forEach(track => {
            const target = track.target;
            const bindingName =
              target && target.mode === 'runtimeBinding'
                ? target.bindingName
                : '';
            if (!bindingName || usedNames.has(bindingName)) {
              return;
            }
            usedNames.add(bindingName);
            bindingNames.push(bindingName);
          });
        });
        return bindingNames;
      },
      [project]
    );

    const currentBindingName = parseStringExpression(value);
    const bindingNames = React.useMemo(
      () => {
        const usedNames = new Set<string>();
        const names: Array<string> = [];
        const appendBindingName = (bindingName: ?string) => {
          if (!bindingName || usedNames.has(bindingName)) {
            return;
          }

          usedNames.add(bindingName);
          names.push(bindingName);
        };

        projectBindingNames.forEach(appendBindingName);
        appendBindingName(currentBindingName);

        if (names.length === 0) {
          names.push('Target');
        }

        return names;
      },
      [currentBindingName, projectBindingNames]
    );

    const isCurrentValueInList = bindingNames.some(
      bindingName => toStringExpression(bindingName) === value
    );
    const isEmptyBindingExpression = !value || currentBindingName === '';
    const hasCustomExpressionValue = !!value && currentBindingName === null;

    const [isExpressionField, setIsExpressionField] = React.useState(
      hasCustomExpressionValue && !isCurrentValueInList
    );

    React.useEffect(
      () => {
        if (
          isExpressionField &&
          (isEmptyBindingExpression || isCurrentValueInList)
        ) {
          setIsExpressionField(false);
        }
      },
      [isCurrentValueInList, isEmptyBindingExpression, isExpressionField]
    );

    React.useEffect(
      () => {
        if (
          !isExpressionField &&
          isEmptyBindingExpression &&
          bindingNames.length > 0
        ) {
          onChange(toStringExpression(bindingNames[0]));
        }
      },
      [bindingNames, isEmptyBindingExpression, isExpressionField, onChange]
    );

    const switchFieldType = () => {
      setIsExpressionField(!isExpressionField);
    };

    // $FlowFixMe[missing-local-annot]
    const onChangeSelectValue = (event, value) => {
      onChange(event.target.value);
    };

    const onChangeTextValue = (value: string) => {
      onChange(value);
    };

    const fieldLabel = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const selectOptions = bindingNames.map(bindingName => (
      <SelectOption
        key={bindingName}
        value={toStringExpression(bindingName)}
        label={bindingName}
        shouldNotTranslate
      />
    ));

    return (
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isExpressionField ? (
            <SelectField
              ref={field}
              id={
                parameterIndex !== undefined
                  ? `parameter-${parameterIndex}-timeline-binding-name-field`
                  : undefined
              }
              value={value}
              onChange={onChangeSelectValue}
              margin={isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose a timeline target`}
              helperMarkdownText={
                (parameterMetadata && parameterMetadata.getLongDescription()) ||
                null
              }
            >
              {selectOptions}
            </SelectField>
          ) : (
            <GenericExpressionField
              ref={field}
              id={
                parameterIndex !== undefined
                  ? `parameter-${parameterIndex}-timeline-binding-name-field`
                  : undefined
              }
              expressionType="string"
              {...props}
              onChange={onChangeTextValue}
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
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
