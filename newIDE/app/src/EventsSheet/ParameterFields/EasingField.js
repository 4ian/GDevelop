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
  getBuiltInEasingFunction,
  parseCubicBezierOrNull,
  type CubicBezierPoints,
} from '../../Utils/Easings';
import {
  applyNamedEasingDefinition,
  canUseNamedEasings,
  deleteNamedEasing,
  getEasingChoicesWithNamedEasings,
  getEasingPreviewIdentifier,
  getNamedEasingNames,
  getNamedEasingPointsByName,
  getNamedEasingPointsOrNull,
  getNamedEasingsContainerFromAccessor,
  getQuotedStringLiteralOrNull,
  getUnknownEasingWarning,
  insertNamedEasing,
} from '../../Utils/NamedEasings';
import CubicBezierEditorDialog from '../../UI/CubicBezierEditor/CubicBezierEditorDialog';
import { getInitialCubicBezierPoints } from '../../UI/CubicBezierEditor/CubicBezierPresets';
import UnsavedChangesContext from '../../MainFrame/UnsavedChangesContext';
import Edit from '../../UI/CustomSvgIcons/Edit';

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
  value: string,
  namedEasingNames?: Array<string>
): Array<string> => {
  const choices = getEasingChoicesWithNamedEasings(
    getEasingChoices(parameterMetadata),
    namedEasingNames || []
  );
  const customEasingIdentifier = getCustomEasingIdentifierOrNull(value);
  if (
    !customEasingIdentifier ||
    choices.indexOf(customEasingIdentifier) !== -1
  ) {
    return choices;
  }
  return choices.concat(customEasingIdentifier);
};

export const getEasingChoiceGroup = (
  easingName: string,
  namedEasingNames: Array<string>
): 'named' | 'custom' | 'builtIn' =>
  namedEasingNames.indexOf(easingName) !== -1
    ? 'named'
    : parseCubicBezierOrNull(easingName)
    ? 'custom'
    : 'builtIn';

const easingChoiceGroupLabels = {
  named: t`Named easings`,
  custom: t`Custom curve`,
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
  context: ChoiceAdornmentContext,
  namedEasingPointsByName: { [string]: CubicBezierPoints }
): React.Node => (
  <EasingPreview
    easingName={getEasingPreviewIdentifier(easingName, namedEasingPointsByName)}
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
    const { triggerUnsavedChanges } = React.useContext(UnsavedChangesContext);
    const [dialogMode, setDialogMode] = React.useState<
      'anonymous' | 'named' | null
    >(null);
    const [
      namedEasingBeingEdited,
      setNamedEasingBeingEdited,
    ] = React.useState<?string>(null);
    // The curve a named easing was created from in the open dialog, to restore
    // it if this named easing is deleted before the dialog is closed.
    const [
      customCurveSavedAsNamedEasing,
      setCustomCurveSavedAsNamedEasing,
    ] = React.useState<?string>(null);

    const supportsNamedEasings = canUseNamedEasings(props.parameterMetadata);
    const container = supportsNamedEasings
      ? getNamedEasingsContainerFromAccessor(
          props.projectScopedContainersAccessor
        )
      : null;
    const namedEasingNames = getNamedEasingNames(container);
    const namedEasingPointsByName = getNamedEasingPointsByName(container);
    const customEasingIdentifier = getCustomEasingIdentifierOrNull(props.value);
    const quotedLiteral = getQuotedStringLiteralOrNull(props.value);
    const openNamedEasingEditor = (name: string) => {
      setNamedEasingBeingEdited(name);
      setDialogMode('named');
    };
    const extraOptions = [
      {
        label: customEasingIdentifier
          ? t`Edit custom curve...`
          : t`Custom curve...`,
        onClick: () => setDialogMode('anonymous'),
      },
    ];

    const closeDialog = () => {
      setDialogMode(null);
      setNamedEasingBeingEdited(null);
      setCustomCurveSavedAsNamedEasing(null);
    };

    const applyCustomCurve = (cubicBezier: string) => {
      props.onChange(`"${cubicBezier}"`);
    };

    return (
      <I18n>
        {({ i18n }) => (
          <>
            <StringWithSelectorField
              ref={ref}
              {...props}
              choices={getEasingChoicesWithCustomValue(
                props.parameterMetadata,
                props.value,
                namedEasingNames
              )}
              defaultChoice={getEasingChoices(props.parameterMetadata)[0]}
              extraOptions={extraOptions}
              getChoiceGroup={easingName =>
                getEasingChoiceGroup(easingName, namedEasingNames)
              }
              choiceGroupLabels={easingChoiceGroupLabels}
              getChoiceAction={easingName =>
                namedEasingNames.indexOf(easingName) !== -1
                  ? {
                      icon: <Edit />,
                      tooltip: t`Edit named easing`,
                      onClick: () => openNamedEasingEditor(easingName),
                    }
                  : null
              }
              renderChoiceAdornment={(easingName, context) =>
                renderEasingPreview(
                  easingName,
                  context,
                  namedEasingPointsByName
                )
              }
              extraHelperMarkdownText={getCustomEasingHelperMarkdown(i18n)}
              onExtractAdditionalErrors={
                supportsNamedEasings
                  ? value => {
                      const warning = getUnknownEasingWarning(
                        value,
                        namedEasingNames
                      );
                      return warning ? i18n._(warning) : null;
                    }
                  : undefined
              }
            />
            {dialogMode ? (
              <CubicBezierEditorDialog
                initialPoints={
                  (namedEasingBeingEdited &&
                    getNamedEasingPointsOrNull(
                      container,
                      namedEasingBeingEdited
                    )) ||
                  getInitialCubicBezierPoints(quotedLiteral)
                }
                existingNamedEasingNames={namedEasingNames}
                existingNamedEasingPointsByName={namedEasingPointsByName}
                onSaveAsNamedEasing={
                  supportsNamedEasings && dialogMode === 'anonymous'
                    ? (name, cubicBezier) => {
                        const points = parseCubicBezierOrNull(cubicBezier);
                        if (!points) return;
                        insertNamedEasing({
                          projectScopedContainersAccessor:
                            props.projectScopedContainersAccessor,
                          name,
                          points,
                          onChange: props.onChange,
                          triggerUnsavedChanges,
                        });
                        setCustomCurveSavedAsNamedEasing(cubicBezier);
                        setNamedEasingBeingEdited(name);
                        setDialogMode('named');
                      }
                    : undefined
                }
                namedEasing={
                  dialogMode === 'named' && namedEasingBeingEdited
                    ? {
                        name: namedEasingBeingEdited,
                        onApplyNamedEasing: (name, cubicBezier) => {
                          const points = parseCubicBezierOrNull(cubicBezier);
                          if (!points) return;
                          applyNamedEasingDefinition({
                            projectScopedContainersAccessor:
                              props.projectScopedContainersAccessor,
                            oldName: namedEasingBeingEdited,
                            newName: name,
                            points,
                            currentValue: props.value,
                            onChange: props.onChange,
                            triggerUnsavedChanges,
                          });
                          closeDialog();
                        },
                        onDeleteNamedEasing: () => {
                          deleteNamedEasing({
                            projectScopedContainersAccessor:
                              props.projectScopedContainersAccessor,
                            name: namedEasingBeingEdited,
                            triggerUnsavedChanges,
                          });
                          if (
                            customCurveSavedAsNamedEasing &&
                            quotedLiteral === namedEasingBeingEdited
                          ) {
                            applyCustomCurve(customCurveSavedAsNamedEasing);
                          }
                        },
                        onDetachAsCustomCurve:
                          quotedLiteral === namedEasingBeingEdited
                            ? applyCustomCurve
                            : undefined,
                      }
                    : null
                }
                onApply={cubicBezier => {
                  applyCustomCurve(cubicBezier);
                  closeDialog();
                }}
                onClose={closeDialog}
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

const getInlineNamedEasingPointsOrNull = (
  props: ParameterInlineRendererProps,
  literal: ?string
): ?CubicBezierPoints => {
  if (
    !literal ||
    !canUseNamedEasings(props.parameterMetadata) ||
    getBuiltInEasingFunction(literal) ||
    parseCubicBezierOrNull(literal)
  ) {
    return null;
  }
  return getNamedEasingPointsOrNull(
    getNamedEasingsContainerFromAccessor(props.projectScopedContainersAccessor),
    literal
  );
};

export const renderInlineEasing = (
  props: ParameterInlineRendererProps
): React.Node => {
  const literal = getQuotedStringLiteralOrNull(props.value);
  const namedEasingPoints = getInlineNamedEasingPointsOrNull(props, literal);
  const namedEasingPointsByName =
    literal && namedEasingPoints ? { [literal]: namedEasingPoints } : {};
  const namedEasingNames = Object.keys(namedEasingPointsByName);
  const rendering = renderInlineStringWithSelector(props, {
    choices: getEasingChoicesWithCustomValue(
      props.parameterMetadata,
      props.value,
      namedEasingNames
    ),
    renderChoiceAdornment: (easingName, context) =>
      renderEasingPreview(easingName, context, namedEasingPointsByName),
  });
  if (
    !canUseNamedEasings(props.parameterMetadata) ||
    !getUnknownEasingWarning(props.value, namedEasingNames)
  ) {
    return rendering;
  }
  return <props.InvalidParameterValue>{rendering}</props.InvalidParameterValue>;
};
