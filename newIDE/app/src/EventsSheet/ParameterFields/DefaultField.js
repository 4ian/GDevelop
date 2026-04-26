// @flow
import * as React from 'react';
import SemiControlledTextField, {
  type SemiControlledTextFieldInterface,
} from '../../UI/SemiControlledTextField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { highlightSearchText } from '../../Utils/HighlightSearchText';
import { mapVector } from '../../Utils/MapFor';
import classNames from 'classnames';
import { instructionParameter } from '../EventsTree/ClassNames';

const gd: libGDevelop = global.gd;

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function DefaultField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SemiControlledTextFieldInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata } = props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SemiControlledTextField
        margin={props.isInline ? 'none' : 'dense'}
        commitOnBlur
        value={props.value}
        floatingLabelText={description}
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        onChange={(text: string) => props.onChange(text)}
        ref={field}
        fullWidth
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

const getColorationName = (
  colorationKind: ExpressionColorationDescription_ColorationKind
) => {
  switch (colorationKind) {
    case gd.ExpressionColorationDescription.Number:
      return 'number';

    case gd.ExpressionColorationDescription.Object:
      return 'object';

    case gd.ExpressionColorationDescription.Variable:
      return 'variable';

    case gd.ExpressionColorationDescription.Operator:
      return 'operator';

    case gd.ExpressionColorationDescription.String:
    default:
      return 'string';
  }
};

export const applySyntaxColoring = ({
  text,
  platform,
  projectScopedContainers,
  rootType,
  expression,
}: {
  text: string,
  platform: gdPlatform,
  projectScopedContainers: gdProjectScopedContainers,
  rootType: string,
  expression: gdExpression,
}): React.Node => {
  const colorationDescriptions = gd.ExpressionSyntaxColoringHelper.getColorationDescriptionsFor(
    platform,
    projectScopedContainers,
    rootType,
    expression.getRootNode()
  );
  let nextCharacterIndex = 0;
  const coloredTextParts = [];
  let partIndex = 0;
  mapVector(colorationDescriptions, colorationDescription => {
    const startPosition = colorationDescription.getStartPosition();
    if (startPosition > nextCharacterIndex) {
      coloredTextParts.push(
        <span key={`color-part-${partIndex}`}>
          {text.substring(nextCharacterIndex, startPosition)}
        </span>
      );
      partIndex++;
      nextCharacterIndex = startPosition;
    }
    const endPosition = colorationDescription.getEndPosition();
    coloredTextParts.push(
      <span
        key={`color-part-${partIndex}`}
        className={classNames({
          [instructionParameter]: true,
          [getColorationName(colorationDescription.getColorationKind())]: true,
        })}
      >
        {text.substring(nextCharacterIndex, endPosition)}
      </span>
    );
    partIndex++;
    nextCharacterIndex = endPosition;
  });
  if (nextCharacterIndex < text.length) {
    coloredTextParts.push(
      <span key={`color-part-${partIndex}`}>
        {text.substring(nextCharacterIndex)}
      </span>
    );
  }
  return coloredTextParts;
};

export const renderInlineDefaultField = ({
  value,
  expressionIsValid,
  hasDeprecationWarning,
  parameterMetadata,
  InvalidParameterValue,
  DeprecatedParameterValue,
  MissingParameterValue,
  highlightedSearchText,
  highlightedSearchMatchCase,
  scope,
  projectScopedContainersAccessor,
  expression,
}: ParameterInlineRendererProps): string | React.Node => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }
  if (!expressionIsValid) {
    return (
      <InvalidParameterValue>
        {highlightSearchText(value, highlightedSearchText, {
          matchCase: highlightedSearchMatchCase,
        })}
      </InvalidParameterValue>
    );
  }
  if (hasDeprecationWarning) {
    return (
      <DeprecatedParameterValue>
        {highlightSearchText(value, highlightedSearchText, {
          matchCase: highlightedSearchMatchCase,
        })}
      </DeprecatedParameterValue>
    );
  }
  return applySyntaxColoring({
    text: value,
    expression,
    rootType: parameterMetadata.getValueTypeMetadata().getName(),
    platform: scope.project.getCurrentPlatform(),
    projectScopedContainers: projectScopedContainersAccessor.get(),
  });

  // TODO Merge coloration and search highlighting.

  // return highlightSearchText(value, highlightedSearchText, {
  //   matchCase: highlightedSearchMatchCase,
  // });
};
