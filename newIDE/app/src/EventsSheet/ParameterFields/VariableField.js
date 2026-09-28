// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import RaisedButton from '../../UI/RaisedButton';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import classNames from 'classnames';
import {
  icon,
  nameAndIconContainer,
  instructionParameter,
} from '../EventsTree/ClassNames';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import {
  renderStylizedText,
  mergeStylizedText,
  getHighlightSearchTextParts,
  applySyntaxColoring,
} from '../../Utils/HighlightSearchText';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { ColumnStackLayout } from '../../UI/Layout';
import VariableStringIcon from '../../VariablesList/Icons/VariableStringIcon';
import VariableNumberIcon from '../../VariablesList/Icons/VariableNumberIcon';
import VariableBooleanIcon from '../../VariablesList/Icons/VariableBooleanIcon';
import VariableArrayIcon from '../../VariablesList/Icons/VariableArrayIcon';
import VariableStructureIcon from '../../VariablesList/Icons/VariableStructureIcon';
import UnknownTypeIcon from '../../UI/CustomSvgIcons/Cross';
import GlobalVariableIcon from '../../UI/CustomSvgIcons/GlobalVariable';
import SceneVariableIcon from '../../UI/CustomSvgIcons/SceneVariable';
import ObjectVariableIcon from '../../UI/CustomSvgIcons/ObjectVariable';
import LocalVariableIcon from '../../UI/CustomSvgIcons/LocalVariable';
import PropertyIcon from '../../UI/CustomSvgIcons/Settings';
import ParameterIcon from '../../UI/CustomSvgIcons/Parameter';
import Add from '../../UI/CustomSvgIcons/Add';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import GenericExpressionField from './GenericExpressionField';
import { type AutocompletionAction } from './GenericExpressionField/ExpressionAutocompletionsHandler';

const gd: libGDevelop = global.gd;

const getVariableTypeName = (
  variableType: Variable_Type | null
): 'number' | 'string' | 'boolean' => {
  switch (variableType) {
    case gd.Variable.Number:
      return 'number';
    case gd.Variable.Boolean:
      return 'boolean';
    case gd.Variable.String:
    default:
      return 'string';
  }
};

type Props = {
  ...ParameterFieldProps,
  variablesContainers: Array<gdVariablesContainer>,
  getVariableSourceFromIdentifier: (
    identifier: string,
    projectScopedContainers: gdProjectScopedContainers
  ) => VariablesContainer_SourceType,
  openVariableEditorDialog: (VariableDialogOpeningProps => void) | null,
  editEventsFunctionParameter: (VariableDialogOpeningProps => void) | null,
  openEventsBasedEntityPropertyEditorDialog:
    | (VariableDialogOpeningProps => void)
    | null,
};

export type VariableFieldInterface = {|
  ...ParameterFieldInterface,
  updateAutocompletions: () => void,
|};

export const getRootVariableName = (name: string): string => {
  const dotPosition = name.indexOf('.');
  const squareBracketPosition = name.indexOf('[');
  return dotPosition !== -1 || squareBracketPosition !== -1
    ? name.substring(
        0,
        Math.min(
          dotPosition === -1 ? name.length : dotPosition,
          squareBracketPosition === -1 ? name.length : squareBracketPosition
        )
      )
    : name;
};

const isRootVariableDeclared = (
  variableName: string,
  variablesContainers?: Array<gdVariablesContainer>
) => {
  return (
    !variablesContainers ||
    variablesContainers.some(variablesContainer =>
      variablesContainer.has(getRootVariableName(variableName))
    )
  );
};

export const getVariableSourceIcon = (
  variableSourceType: VariablesContainer_SourceType
): any => {
  switch (variableSourceType) {
    case gd.VariablesContainer.Global:
    case gd.VariablesContainer.ExtensionGlobal:
      return GlobalVariableIcon;
    case gd.VariablesContainer.Scene:
    case gd.VariablesContainer.ExtensionScene:
      return SceneVariableIcon;
    case gd.VariablesContainer.Object:
      return ObjectVariableIcon;
    case gd.VariablesContainer.Local:
      return LocalVariableIcon;
    case gd.VariablesContainer.Parameters:
      return ParameterIcon;
    case gd.VariablesContainer.Properties:
      return PropertyIcon;
    default:
      return UnknownTypeIcon;
  }
};

export const getVariableTypeIcon = (variableType: Variable_Type): any => {
  switch (variableType) {
    case gd.Variable.Number:
      return VariableNumberIcon;
    case gd.Variable.String:
      return VariableStringIcon;
    case gd.Variable.Boolean:
      return VariableBooleanIcon;
    case gd.Variable.Array:
      return VariableArrayIcon;
    case gd.Variable.Structure:
      return VariableStructureIcon;
    default:
      return UnknownTypeIcon;
  }
};

// TODO: the entire VariableField could be reworked to be a "real" GenericExpressionField
// (of type: "variable" or the legacy: "scenevar", "globalvar" or "objectvar"). This will
// ensure we 100% validate and can autocomplete what is entered (and we can have also a simpler
// selector that offers the variables in the scope).

export default (React.forwardRef<Props, VariableFieldInterface>(
  function VariableField(props: Props, ref) {
    const {
      project,
      projectScopedContainersAccessor,
      variablesContainers,
      instruction,
      value,
      onChange,
      isInline,
      parameterMetadata,
      id,
      onInstructionTypeChanged,
      getVariableSourceFromIdentifier,
      openVariableEditorDialog,
      editEventsFunctionParameter,
      openEventsBasedEntityPropertyEditorDialog,
    } = props;

    const field = React.useRef<?GenericExpressionField>(null);

    const openVariableEditor = React.useCallback(
      () => {
        if (!openVariableEditorDialog) {
          return;
        }
        // Access to the input directly because the value
        // may not have been sent to onChange yet.
        const fieldCurrentValue = field.current
          ? field.current.getInputValue()
          : value;

        onChange(fieldCurrentValue);
        openVariableEditorDialog({
          variableName: fieldCurrentValue,
          shouldCreate:
            !!fieldCurrentValue &&
            !isRootVariableDeclared(fieldCurrentValue, variablesContainers),
          variableType: instruction
            ? getVariableTypeName(
                gd.VariableInstructionSwitcher.getSwitchableInstructionVariableType(
                  instruction.getType()
                )
              )
            : 'number',
        });
      },
      [
        instruction,
        onChange,
        openVariableEditorDialog,
        value,
        variablesContainers,
      ]
    );

    const openParameterEditor = React.useCallback(
      () => {
        if (!editEventsFunctionParameter) {
          return;
        }
        // Access to the input directly because the value
        // may not have been sent to onChange yet.
        const fieldCurrentValue = field.current
          ? field.current.getInputValue()
          : value;

        onChange(fieldCurrentValue);
        editEventsFunctionParameter({
          variableName: fieldCurrentValue,
          shouldCreate:
            !!fieldCurrentValue &&
            !isRootVariableDeclared(fieldCurrentValue, variablesContainers),
          variableType: instruction
            ? getVariableTypeName(
                gd.VariableInstructionSwitcher.getSwitchableInstructionVariableType(
                  instruction.getType()
                )
              )
            : 'number',
        });
      },
      [
        editEventsFunctionParameter,
        value,
        onChange,
        variablesContainers,
        instruction,
      ]
    );

    const openPropertyEditor = React.useCallback(
      () => {
        if (!openEventsBasedEntityPropertyEditorDialog) {
          return;
        }
        // Access to the input directly because the value
        // may not have been sent to onChange yet.
        const fieldCurrentValue = field.current
          ? field.current.getInputValue()
          : value;

        onChange(fieldCurrentValue);
        openEventsBasedEntityPropertyEditorDialog({
          variableName: fieldCurrentValue,
          shouldCreate:
            !!fieldCurrentValue &&
            !isRootVariableDeclared(fieldCurrentValue, variablesContainers),
          variableType: instruction
            ? getVariableTypeName(
                gd.VariableInstructionSwitcher.getSwitchableInstructionVariableType(
                  instruction.getType()
                )
              )
            : 'number',
        });
      },
      [
        openEventsBasedEntityPropertyEditorDialog,
        value,
        onChange,
        instruction,
        variablesContainers,
      ]
    );

    const isSwitchableInstruction =
      instruction &&
      gd.VariableInstructionSwitcher.isSwitchableVariableInstruction(
        instruction.getType()
      );
    const variableType =
      project && instruction && isSwitchableInstruction
        ? gd.VariableInstructionSwitcher.getVariableTypeFromParameters(
            project.getCurrentPlatform(),
            projectScopedContainersAccessor.get(),
            instruction
          )
        : null;

    const needManualTypeSwitcher =
      isSwitchableInstruction &&
      variableType !== gd.Variable.Number &&
      variableType !== gd.Variable.String &&
      variableType !== gd.Variable.Boolean &&
      field.current &&
      !field.current.hasAnyError() &&
      value;

    const onGetAdditionalActions = React.useCallback(
      (fieldCurrentValue: string): Array<AutocompletionAction> => {
        const actions = [];

        const variableSourceType = getVariableSourceFromIdentifier(
          fieldCurrentValue,
          projectScopedContainersAccessor.get()
        );
        const isVariableDeclared =
          variableSourceType !== gd.VariablesContainer.Unknown;

        if (isVariableDeclared) {
          if (variableSourceType === gd.VariablesContainer.Parameters) {
            if (editEventsFunctionParameter) {
              actions.push({
                id: 'edit-parameters',
                translatableValue: t`Edit parameters...`,
                renderIcon: () => <Add />,
                onClick: openParameterEditor,
              });
            }
          } else if (variableSourceType === gd.VariablesContainer.Properties) {
            if (openEventsBasedEntityPropertyEditorDialog) {
              actions.push({
                id: 'edit-properties',
                translatableValue: t`Edit properties...`,
                renderIcon: () => <Add />,
                onClick: openPropertyEditor,
              });
            }
          } else {
            if (openVariableEditorDialog) {
              actions.push({
                id: 'edit-variables',
                translatableValue: t`Edit variables...`,
                renderIcon: () => <Add />,
                onClick: openVariableEditor,
              });
            }
          }
        } else if (fieldCurrentValue) {
          if (editEventsFunctionParameter) {
            actions.push({
              id: 'add-parameter',
              translatableValue: t`Add parameter...`,
              renderIcon: () => <Add />,
              onClick: openParameterEditor,
            });
          }
          if (openEventsBasedEntityPropertyEditorDialog) {
            actions.push({
              id: 'add-property',
              translatableValue: t`Add property...`,
              renderIcon: () => <Add />,
              onClick: openPropertyEditor,
            });
          }
          if (openVariableEditorDialog) {
            actions.push({
              id: 'add-variable',
              translatableValue: t`Add variable...`,
              renderIcon: () => <Add />,
              onClick: openVariableEditor,
            });
          }
        } else {
          if (openEventsBasedEntityPropertyEditorDialog) {
            actions.push({
              id: 'edit-or-add-properties',
              translatableValue: t`Edit or add properties...`,
              renderIcon: () => <Add />,
              onClick: openPropertyEditor,
            });
          }
          if (openVariableEditorDialog) {
            actions.push({
              id: 'edit-or-add-variables',
              translatableValue: t`Edit or add variables...`,
              renderIcon: () => <Add />,
              onClick: openVariableEditor,
            });
          }
        }
        return actions;
      },
      [
        editEventsFunctionParameter,
        getVariableSourceFromIdentifier,
        openEventsBasedEntityPropertyEditorDialog,
        openParameterEditor,
        openPropertyEditor,
        openVariableEditor,
        openVariableEditorDialog,
        projectScopedContainersAccessor,
      ]
    );

    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout noMargin expand>
            <TextFieldWithButtonLayout
              renderTextField={() => (
                <GenericExpressionField
                  expressionType={
                    parameterMetadata
                      ? // $FlowFixMe[incompatible-type]
                        parameterMetadata.getValueTypeMetadata().getName()
                      : // $FlowFixMe[incompatible-type]
                        ''
                  }
                  ref={field}
                  id={id}
                  globalObjectsContainer={props.globalObjectsContainer}
                  objectsContainer={props.objectsContainer}
                  onChange={onChange}
                  project={project}
                  projectScopedContainersAccessor={
                    projectScopedContainersAccessor
                  }
                  scope={props.scope}
                  value={value}
                  instruction={props.instruction}
                  instructionMetadata={props.instructionMetadata}
                  parameterMetadata={parameterMetadata}
                  expression={props.expression}
                  expressionMetadata={props.expressionMetadata}
                  parameterIndex={props.parameterIndex}
                  onInstructionTypeChanged={onInstructionTypeChanged}
                  editEventsFunctionParameter={editEventsFunctionParameter}
                  openEventsBasedEntityPropertyEditorDialog={
                    openEventsBasedEntityPropertyEditorDialog
                  }
                  isInline={isInline}
                  onRequestClose={props.onRequestClose}
                  onApply={props.onApply}
                  resourceManagementProps={props.resourceManagementProps}
                  parameterRenderingService={props.parameterRenderingService}
                  onGetAdditionalActions={onGetAdditionalActions}
                />
              )}
              renderButton={style =>
                !isInline ? (
                  <RaisedButton
                    icon={<ShareExternal />}
                    disabled={!openVariableEditorDialog}
                    primary
                    style={style}
                    onClick={() => {
                      if (openVariableEditorDialog) {
                        openVariableEditorDialog({
                          variableName: value,
                          shouldCreate: false,
                          variableType: getVariableTypeName(variableType),
                        });
                      }
                    }}
                  />
                ) : null
              }
            />
            {!isInline &&
              needManualTypeSwitcher &&
              instruction &&
              onInstructionTypeChanged && (
                <SelectField
                  floatingLabelText={<Trans>Use as...</Trans>}
                  value={(() => {
                    const type = gd.VariableInstructionSwitcher.getSwitchableInstructionVariableType(
                      instruction.getType()
                    );
                    return type === gd.Variable.Unknown
                      ? gd.Variable.Number
                      : type;
                  })()}
                  onChange={(e, i, value: any) => {
                    gd.VariableInstructionSwitcher.switchVariableInstructionType(
                      instruction,
                      value
                    );
                    onInstructionTypeChanged();
                  }}
                >
                  <SelectOption value={gd.Variable.Number} label={t`Number`} />
                  <SelectOption value={gd.Variable.String} label={t`Text`} />
                  <SelectOption
                    value={gd.Variable.Boolean}
                    label={t`Boolean`}
                  />
                </SelectField>
              )}
          </ColumnStackLayout>
        )}
      </I18n>
    );
  }
): React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<VariableFieldInterface>,
}>);

export const renderVariableWithIcon = (
  {
    value,
    expression,
    parameterMetadata,
    expressionIsValid,
    hasDeprecationWarning,
    InvalidParameterValue,
    DeprecatedParameterValue,
    MissingParameterValue,
    projectScopedContainersAccessor,
    highlightedSearchText,
    highlightedSearchMatchCase,
    scope,
  }: ParameterInlineRendererProps,
  tooltip: string,
  getVariableSourceFromIdentifier: (
    variableName: string,
    projectScopedContainers: gdProjectScopedContainers
  ) => VariablesContainer_SourceType
): React.MixedElement => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }
  const VariableIcon = getVariableSourceIcon(
    getVariableSourceFromIdentifier(
      value,
      projectScopedContainersAccessor.get()
    )
  );

  let IconAndNameContainer;
  if (!expressionIsValid) {
    IconAndNameContainer = InvalidParameterValue;
  } else if (hasDeprecationWarning) {
    IconAndNameContainer = DeprecatedParameterValue;
  } else {
    IconAndNameContainer = React.Fragment;
  }

  return (
    <span
      title={tooltip}
      className={classNames({
        [nameAndIconContainer]: true,
      })}
    >
      <IconAndNameContainer>
        <VariableIcon
          className={classNames({
            [icon]: true,
            [instructionParameter]: expressionIsValid,
            variable: true,
          })}
        />
        {renderStylizedText(
          value,
          expressionIsValid
            ? mergeStylizedText(
                getHighlightSearchTextParts(value, highlightedSearchText, {
                  matchCase: highlightedSearchMatchCase,
                }),
                applySyntaxColoring({
                  text: value,
                  rootNode: expression.getRootNode(),
                  rootType: parameterMetadata.getValueTypeMetadata().getName(),
                  platform: scope.project.getCurrentPlatform(),
                  projectScopedContainers: projectScopedContainersAccessor.get(),
                })
              )
            : getHighlightSearchTextParts(value, highlightedSearchText, {
                matchCase: highlightedSearchMatchCase,
              })
        )}
      </IconAndNameContainer>
    </span>
  );
};
