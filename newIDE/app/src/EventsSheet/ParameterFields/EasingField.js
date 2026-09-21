// @flow
import * as React from 'react';
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
 * A field to choose an easing (as used by the Tween extension), showing a
 * preview of the curve of the selected easing.
 */
export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function EasingField(props: ParameterFieldProps, ref) {
    return (
      <StringWithSelectorField
        ref={ref}
        {...props}
        choices={getEasingChoices(props.parameterMetadata)}
        renderChoiceAdornment={renderEasingPreview}
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

export const renderInlineEasing = (
  props: ParameterInlineRendererProps
): React.Node =>
  renderInlineStringWithSelector(props, {
    choices: getEasingChoices(props.parameterMetadata),
    renderChoiceAdornment: renderEasingPreview,
  });
