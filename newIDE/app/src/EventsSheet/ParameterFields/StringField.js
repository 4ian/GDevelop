// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import Spine43NameField, { isSpine43NameKind } from './Spine43NameField';
import TimelineNameField, {
  timelineNameIdentifierExtraInfo,
} from './TimelineNameField';
import TimelineBindingNameField, {
  timelineBindingNameIdentifierExtraInfo,
} from './TimelineBindingNameField';

const DefaultStringField = React.forwardRef<
  ParameterFieldProps,
  ParameterFieldInterface
>(function DefaultStringField(props: ParameterFieldProps, ref) {
  const field = React.useRef<?GenericExpressionField>(null);
  const focus: FieldFocusFunction = options => {
    if (field.current) field.current.focus(options);
  };
  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  return (
    <GenericExpressionField
      expressionType="string"
      ref={field}
      {...props}
      id={
        props.parameterIndex !== undefined
          ? `parameter-${props.parameterIndex}-string-field`
          : undefined
      }
    />
  );
});

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function StringField(props: ParameterFieldProps, ref) {
    const extraInfo = props.parameterMetadata
      ? props.parameterMetadata.getExtraInfo()
      : '';
    if (isSpine43NameKind(extraInfo)) {
      return <Spine43NameField ref={ref} {...props} />;
    }
    if (extraInfo === timelineNameIdentifierExtraInfo) {
      return <TimelineNameField ref={ref} {...props} />;
    }
    if (extraInfo === timelineBindingNameIdentifierExtraInfo) {
      return <TimelineBindingNameField ref={ref} {...props} />;
    }

    return <DefaultStringField ref={ref} {...props} />;
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
