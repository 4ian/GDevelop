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
import CubicBezierEditorDialog from '../../UI/CubicBezierEditor/CubicBezierEditorDialog';
import { getInitialCubicBezierPoints } from '../../UI/CubicBezierEditor/CubicBezierPresets';

const getQuotedStringLiteralOrNull = (value: string): ?string => {
  if (value.length < 2 || value[0] !== '"' || value[value.length - 1] !== '"') {
    return null;
  }
  const literal = value.substring(1, value.length - 1);
  if (literal.indexOf('"') !== -1) return null;
  return literal;
};

/**
 * Return the unquoted `cubic-bezier(...)` if the value is a valid custom
 * easing literal (`"cubic-bezier(...)"`). Otherwise, return null.
 */
export const getCustomEasingIdentifierOrNull = (value: string): ?string => {
  const literal = getQuotedStringLiteralOrNull(value);
  return literal && parseCubicBezierOrNull(literal) ? literal : null;
};

/**
 * Add the current value to the choices when it is a custom easing, so the
 * field stays in select mode and can draw its preview.
 */
export const getEasingChoicesWithCustomValue = (
  parameterMetadata: ?gdParameterMetadata,
  value: string
): Array<string> => {
  const choices = getEasingChoices(parameterMetadata);
  const customEasingIdentifier = getCustomEasingIdentifierOrNull(value);
  if (
    !customEasingIdentifier ||
    choices.indexOf(customEasingIdentifier) !== -1
  ) {
    return choices;
  }
  return choices.concat(customEasingIdentifier);
};

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
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const customEasingIdentifier = getCustomEasingIdentifierOrNull(props.value);

    return (
      <I18n>
        {({ i18n }) => (
          <>
            <StringWithSelectorField
              ref={ref}
              {...props}
              choices={getEasingChoicesWithCustomValue(
                props.parameterMetadata,
                props.value
              )}
              extraOptions={[
                {
                  label: customEasingIdentifier
                    ? t`Edit custom curve...`
                    : t`Custom curve...`,
                  onClick: () => setIsDialogOpen(true),
                },
              ]}
              renderChoiceAdornment={renderEasingPreview}
              extraHelperMarkdownText={getCustomEasingHelperMarkdown(i18n)}
            />
            {isDialogOpen ? (
              <CubicBezierEditorDialog
                initialPoints={getInitialCubicBezierPoints(
                  getQuotedStringLiteralOrNull(props.value)
                )}
                onApply={cubicBezier => {
                  props.onChange(`"${cubicBezier}"`);
                  setIsDialogOpen(false);
                }}
                onClose={() => setIsDialogOpen(false)}
              />
            ) : null}
          </>
        )}
      </I18n>
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
    choices: getEasingChoicesWithCustomValue(
      props.parameterMetadata,
      props.value
    ),
    renderChoiceAdornment: renderEasingPreview,
  });
