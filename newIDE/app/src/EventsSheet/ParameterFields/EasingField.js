// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import StringWithSelectorField, {
  renderInlineStringWithSelector,
  type ChoiceAdornmentContext,
} from './StringWithSelectorField';
import { getEasingChoices } from './ParameterMetadataTools';
import EasingPreview from '../../UI/EasingPreview';
import {
  customEasingExampleIdentifier,
  parseCubicBezierOrNull,
} from '../../Utils/Easings';

const previewSizes = {
  field: { width: 40, height: 24 },
  inlineField: { width: 30, height: 18 },
  menu: { width: 40, height: 24 },
  eventsSheet: { width: 24, height: 16 },
};

const eventsSheetPreviewStyle = {
  verticalAlign: 'middle',
  marginLeft: 4,
};

const renderEasingPreview = (
  easingName: string,
  context: ChoiceAdornmentContext
): React.Node => (
  <EasingPreview
    easingName={easingName}
    width={previewSizes[context].width}
    height={previewSizes[context].height}
    style={context === 'eventsSheet' ? eventsSheetPreviewStyle : undefined}
  />
);

/**
 * Syntax shown under the easing field. The value must stay a quoted string
 * expression, including when it is pasted from cubic-bezier.com.
 */
export const getCustomEasingHelperMarkdown = (i18n: I18nType): string => {
  const quotedExample = `"${customEasingExampleIdentifier}"`;
  return i18n._(
    t`For a custom curve, use an expression: ${quotedExample}. x1 and x2 must be between 0 and 1. y1 and y2 can be outside this range.`
  );
};

/**
 * A field to choose an easing (as used by the Tween extension), showing a
 * preview of the curve of the selected easing.
 */
export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function EasingField(props: ParameterFieldProps, ref) {
    return (
      <I18n>
        {({ i18n }) => (
          <StringWithSelectorField
            ref={ref}
            {...props}
            choices={getEasingChoices(props.parameterMetadata)}
            renderChoiceAdornment={renderEasingPreview}
            helperMarkdownText={getCustomEasingHelperMarkdown(i18n)}
          />
        )}
      </I18n>
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

/**
 * Add the current value to the choices when it is a valid custom literal
 * (`"cubic-bezier(...)"`), so the events sheet can draw its preview.
 */
export const getEasingChoicesWithCustomValue = (
  parameterMetadata: ?gdParameterMetadata,
  value: string
): Array<string> => {
  const choices = getEasingChoices(parameterMetadata);
  if (value.length < 2 || value[0] !== '"' || value[value.length - 1] !== '"') {
    return choices;
  }

  const easingIdentifier = value.substring(1, value.length - 1);
  if (
    !parseCubicBezierOrNull(easingIdentifier) ||
    choices.indexOf(easingIdentifier) !== -1
  ) {
    return choices;
  }
  return choices.concat(easingIdentifier);
};

export const renderInlineEasing = (
  props: ParameterInlineRendererProps
): React.Node =>
  renderInlineStringWithSelector(props, {
    choices: getEasingChoicesWithCustomValue(
      props.parameterMetadata,
      props.value
    ),
    renderChoiceAdornment: renderEasingPreview,
  });
