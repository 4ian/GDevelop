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

export const timelineNameIdentifierExtraInfo =
  'TimelineSequencer::TimelineName';

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
  function TimelineNameField(props: ParameterFieldProps, ref) {
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

    const projectTimelineNames = React.useMemo(
      () => {
        if (!project) {
          return ([]: Array<string>);
        }

        const usedNames = new Set<string>();
        return readTimelineProjectData(project)
          .timelines.map(timeline => timeline.name)
          .filter(name => {
            if (!name || usedNames.has(name)) {
              return false;
            }
            usedNames.add(name);
            return true;
          });
      },
      [project]
    );

    const currentTimelineName = parseStringExpression(value);
    const timelineNames = React.useMemo(
      () => {
        const usedNames = new Set<string>();
        const names: Array<string> = [];
        const appendTimelineName = (timelineName: ?string) => {
          if (!timelineName || usedNames.has(timelineName)) {
            return;
          }

          usedNames.add(timelineName);
          names.push(timelineName);
        };

        projectTimelineNames.forEach(appendTimelineName);
        appendTimelineName(currentTimelineName);

        if (names.length === 0) {
          names.push('Timeline');
        }

        return names;
      },
      [currentTimelineName, projectTimelineNames]
    );

    const isCurrentValueInList = timelineNames.some(
      timelineName => toStringExpression(timelineName) === value
    );
    const isEmptyTimelineExpression = !value || currentTimelineName === '';
    const hasCustomExpressionValue = !!value && currentTimelineName === null;

    const [isExpressionField, setIsExpressionField] = React.useState(
      hasCustomExpressionValue && !isCurrentValueInList
    );

    React.useEffect(
      () => {
        if (
          isExpressionField &&
          (isEmptyTimelineExpression || isCurrentValueInList)
        ) {
          setIsExpressionField(false);
        }
      },
      [isCurrentValueInList, isEmptyTimelineExpression, isExpressionField]
    );

    React.useEffect(
      () => {
        if (
          !isExpressionField &&
          isEmptyTimelineExpression &&
          timelineNames.length > 0
        ) {
          onChange(toStringExpression(timelineNames[0]));
        }
      },
      [isEmptyTimelineExpression, isExpressionField, onChange, timelineNames]
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

    const selectOptions = timelineNames.map(timelineName => (
      <SelectOption
        key={timelineName}
        value={toStringExpression(timelineName)}
        label={timelineName}
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
                  ? `parameter-${parameterIndex}-timeline-name-field`
                  : undefined
              }
              value={value}
              onChange={onChangeSelectValue}
              margin={isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={t`Choose a timeline`}
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
                  ? `parameter-${parameterIndex}-timeline-name-field`
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
