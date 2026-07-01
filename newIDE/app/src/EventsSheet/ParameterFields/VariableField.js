// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import RaisedButton from '../../UI/RaisedButton';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import classNames from 'classnames';
import {
  icon,
  nameAndIconContainer,
  instructionWarningParameter,
  instructionParameter,
} from '../EventsTree/ClassNames';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
  type DataSource,
} from '../../UI/SemiControlledAutoComplete';
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
import { type EnumeratedVariable } from './EnumerateVariables';
import { LineStackLayout } from '../../UI/Layout';
import GlobalVariableIcon from '../../UI/CustomSvgIcons/GlobalVariable';
import SceneVariableIcon from '../../UI/CustomSvgIcons/SceneVariable';
import ObjectVariableIcon from '../../UI/CustomSvgIcons/ObjectVariable';
import LocalVariableIcon from '../../UI/CustomSvgIcons/LocalVariable';
import PropertyIcon from '../../UI/CustomSvgIcons/Settings';
import ParameterIcon from '../../UI/CustomSvgIcons/Parameter';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import Link from '../../UI/Link';
import Add from '../../UI/CustomSvgIcons/Add';
import {
  lookupVariable,
  formatVariableValue,
} from '../RuntimeVariablesContext';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';

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
  isObjectVariable: boolean,
  variablesContainers: Array<gdVariablesContainer>,
  getVariableSourceFromIdentifier: (
    identifier: string,
    projectScopedContainers: gdProjectScopedContainers
  ) => VariablesContainer_SourceType,
  enumerateVariables: () => Array<EnumeratedVariable>,
  forceDeclaration?: boolean,
  openVariableEditorDialog: (VariableDialogOpeningProps => void) | null,
  editEventsFunctionParameter: (VariableDialogOpeningProps => void) | null,
  openEventsBasedEntityPropertyEditorDialog:
    | (VariableDialogOpeningProps => void)
    | null,
};

type VariableNameQuickAnalyzeResult = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type VariableFieldInterface = {|
  ...ParameterFieldInterface,
  updateAutocompletions: () => void,
|};

export const VariableNameQuickAnalyzeResults: {
  [string]: VariableNameQuickAnalyzeResult,
} = {
  OK: 0,
  WRONG_QUOTE: 1,
  WRONG_SPACE: 2,
  WRONG_EXPRESSION: 3,
  UNDECLARED_VARIABLE: 4,
  NAME_COLLISION_WITH_OBJECT: 5,
  PARAMETER_WITH_CHILD: 6,
  PROPERTY_WITH_CHILD: 7,
};

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

// TODO: the entire VariableField could be reworked to be a "real" GenericExpressionField
// (of type: "variable" or the legacy: "scenevar", "globalvar" or "objectvar"). This will
// ensure we 100% validate and can autocomplete what is entered (and we can have also a simpler
// selector that offers the variables in the scope).
export const quicklyAnalyzeVariableName = (
  name: string,
  variablesContainers?: Array<gdVariablesContainer>,
  getVariableSourceFromIdentifier?: (
    identifier: string,
    projectScopedContainers: gdProjectScopedContainers
  ) => VariablesContainer_SourceType | null,
  projectScopedContainersAccessor?: ProjectScopedContainersAccessor,
  isObjectVariable: boolean = false
): VariableNameQuickAnalyzeResult => {
  if (!name) return VariableNameQuickAnalyzeResults.OK;

  for (let i = 0; i < name.length; ++i) {
    const character = name[i];

    if (character === '[') {
      // This probably starts an expression, so stop the analysis.
      break;
    } else if (character === ' ') {
      return VariableNameQuickAnalyzeResults.WRONG_SPACE;
    } else if (character === '"') {
      return VariableNameQuickAnalyzeResults.WRONG_QUOTE;
    } else if (
      character === '(' ||
      character === '+' ||
      character === '-' ||
      character === '/' ||
      character === '*'
    ) {
      return VariableNameQuickAnalyzeResults.WRONG_EXPRESSION;
    }
  }

  const rootVariableName = getRootVariableName(name);
  // Check at least the name of the root variable, it's the best we can do.
  if (!isRootVariableDeclared(rootVariableName, variablesContainers)) {
    return VariableNameQuickAnalyzeResults.UNDECLARED_VARIABLE;
  }

  if (!projectScopedContainersAccessor) {
    return VariableNameQuickAnalyzeResults.OK;
  }
  const projectScopedContainers = projectScopedContainersAccessor.get();

  if (
    !isObjectVariable &&
    projectScopedContainers
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(rootVariableName)
  ) {
    return VariableNameQuickAnalyzeResults.NAME_COLLISION_WITH_OBJECT;
  }

  if (
    name.length !== rootVariableName.length &&
    getVariableSourceFromIdentifier
  ) {
    const variableSource = getVariableSourceFromIdentifier(
      rootVariableName,
      projectScopedContainers
    );

    if (variableSource === gd.VariablesContainer.Parameters) {
      return VariableNameQuickAnalyzeResults.PARAMETER_WITH_CHILD;
    }
    if (variableSource === gd.VariablesContainer.Properties) {
      return VariableNameQuickAnalyzeResults.PROPERTY_WITH_CHILD;
    }
  }

  return VariableNameQuickAnalyzeResults.OK;
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

export default (React.forwardRef<Props, VariableFieldInterface>(
  function VariableField(props: Props, ref) {
    const {
      project,
      projectScopedContainersAccessor,
      variablesContainers,
      enumerateVariables,
      instruction,
      forceDeclaration,
      value,
      onChange,
      isInline,
      parameterMetadata,
      onRequestClose,
      onApply,
      id,
      onInstructionTypeChanged,
      isObjectVariable,
      getVariableSourceFromIdentifier,
      openVariableEditorDialog,
      editEventsFunctionParameter,
      openEventsBasedEntityPropertyEditorDialog,
    } = props;

    const field = React.useRef<?SemiControlledAutoCompleteInterface>(null);
    const [
      autocompletionVariableNames,
      setAutocompletionVariableNames,
    ] = React.useState<DataSource>([]);
    /**
     * Can be called to set up or force updating the variables list.
     */
    const updateAutocompletions = React.useCallback(
      () => {
        setAutocompletionVariableNames(
          enumerateVariables()
            .map(variable =>
              variable.isValidName
                ? variable
                : // Hide invalid variable names - they would not
                  // be parsed correctly anyway.
                  null
            )
            .filter(Boolean)
            .map(variable => ({
              text: variable.name,
              value: variable.name,
              renderIcon: () => {
                const VariableSourceIcon = getVariableSourceIcon(
                  variable.source
                );
                const VariableTypeIcon = getVariableTypeIcon(variable.type);
                return (
                  <LineStackLayout>
                    <VariableSourceIcon fontSize="small" />
                    <VariableTypeIcon fontSize="small" />
                  </LineStackLayout>
                );
              },
            }))
        );
      },
      [enumerateVariables]
    );

    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
      updateAutocompletions,
    }));

    React.useEffect(
      () => {
        updateAutocompletions();
      },
      [updateAutocompletions]
    );

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

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const quicklyAnalysisResult = quicklyAnalyzeVariableName(
      value,
      variablesContainers,
      getVariableSourceFromIdentifier,
      projectScopedContainersAccessor,
      isObjectVariable
    );

    const errorText =
      quicklyAnalysisResult === VariableNameQuickAnalyzeResults.WRONG_QUOTE ? (
        <Trans>
          It seems you entered a name with a quote. Variable names should not be
          quoted.
        </Trans>
      ) : quicklyAnalysisResult ===
        VariableNameQuickAnalyzeResults.WRONG_SPACE ? (
        <Trans>
          The variable name contains a space - this is not recommended. Prefer
          to use underscores or uppercase letters to separate words.
        </Trans>
      ) : quicklyAnalysisResult ===
        VariableNameQuickAnalyzeResults.WRONG_EXPRESSION ? (
        <Trans>
          The variable name looks like you're building an expression or a
          formula. You can only use this for structure or arrays. For example:
          Score[3].
        </Trans>
      ) : forceDeclaration &&
        quicklyAnalysisResult ===
          VariableNameQuickAnalyzeResults.UNDECLARED_VARIABLE ? (
        <Trans>
          This variable does not exist.{' '}
          <Link onClick={openVariableEditor} href="#">
            Click to add it.
          </Link>
        </Trans>
      ) : forceDeclaration &&
        quicklyAnalysisResult ===
          VariableNameQuickAnalyzeResults.NAME_COLLISION_WITH_OBJECT ? (
        <Trans>
          This variable has the same name as an object. Consider renaming one or
          the other.
        </Trans>
      ) : forceDeclaration &&
        quicklyAnalysisResult ===
          VariableNameQuickAnalyzeResults.PARAMETER_WITH_CHILD ? (
        <Trans>Parameters can't have children.</Trans>
      ) : forceDeclaration &&
        quicklyAnalysisResult ===
          VariableNameQuickAnalyzeResults.PROPERTY_WITH_CHILD ? (
        <Trans>Properties can't have children.</Trans>
      ) : null;
    const warningTranslatableText =
      !forceDeclaration &&
      quicklyAnalysisResult ===
        VariableNameQuickAnalyzeResults.UNDECLARED_VARIABLE
        ? t`This variable is not declared. It's recommended to use the *variables editor* to add it.`
        : !forceDeclaration &&
          quicklyAnalysisResult ===
            VariableNameQuickAnalyzeResults.NAME_COLLISION_WITH_OBJECT
        ? t`This variable has the same name as an object. Consider renaming one or the other.`
        : null;

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
      !errorText &&
      value;

    const filterOptionById = React.useCallback(
      (id: string) => {
        // Access to the input directly because the value
        // may not have been sent to onChange yet.
        const fieldCurrentValue = field.current
          ? field.current.getInputValue()
          : value;

        const variableSourceType = getVariableSourceFromIdentifier(
          fieldCurrentValue,
          projectScopedContainersAccessor.get()
        );
        const isVariableDeclared =
          variableSourceType !== gd.VariablesContainer.Unknown;

        const optionIds = isVariableDeclared
          ? variableSourceType === gd.VariablesContainer.Parameters
            ? ['edit-parameters']
            : variableSourceType === gd.VariablesContainer.Properties
            ? ['edit-properties']
            : ['edit-variables']
          : fieldCurrentValue
          ? ['add-parameter', 'add-property', 'add-variable']
          : ['edit-or-add-properties', 'edit-or-add-variables'];

        return optionIds.includes(id);
      },
      [getVariableSourceFromIdentifier, projectScopedContainersAccessor, value]
    );

    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout noMargin expand>
            <TextFieldWithButtonLayout
              renderTextField={() => (
                <SemiControlledAutoComplete
                  margin={isInline ? 'none' : 'dense'}
                  floatingLabelText={description}
                  helperMarkdownText={
                    warningTranslatableText
                      ? i18n._(warningTranslatableText)
                      : parameterMetadata
                      ? parameterMetadata.getLongDescription()
                      : undefined
                  }
                  errorText={errorText}
                  fullWidth
                  value={value}
                  onChange={onChange}
                  onRequestClose={onRequestClose}
                  onApply={onApply}
                  filterOptionById={filterOptionById}
                  dataSource={[
                    ...autocompletionVariableNames,
                    ...(editEventsFunctionParameter
                      ? [
                          {
                            id: 'edit-parameters',
                            translatableValue: t`Edit parameters...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openParameterEditor,
                          },
                          {
                            id: 'add-parameter',
                            translatableValue: t`Add parameter...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openParameterEditor,
                          },
                        ]
                      : []),
                    ...(openEventsBasedEntityPropertyEditorDialog
                      ? [
                          {
                            id: 'edit-properties',
                            translatableValue: t`Edit properties...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openPropertyEditor,
                          },
                          {
                            id: 'add-property',
                            translatableValue: t`Add property...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openPropertyEditor,
                          },
                          {
                            id: 'edit-or-add-properties',
                            translatableValue: t`Edit or add properties...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openPropertyEditor,
                          },
                        ]
                      : []),
                    ...(openVariableEditorDialog
                      ? [
                          {
                            id: 'edit-variables',
                            translatableValue: t`Edit variables...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openVariableEditor,
                          },
                          {
                            id: 'add-variable',
                            translatableValue: t`Add variable...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openVariableEditor,
                          },
                          {
                            id: 'edit-or-add-variables',
                            translatableValue: t`Edit or add variables...`,
                            text: '',
                            value: '',
                            renderIcon: () => <Add />,
                            onClick: openVariableEditor,
                          },
                        ]
                      : []),
                  ]}
                  openOnFocus={!isInline}
                  ref={field}
                  id={id}
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
    runtimeVariables,
    scope,
    lastObjectName,
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

  const sourceType = getVariableSourceFromIdentifier(
    value,
    projectScopedContainersAccessor.get()
  );
  const VariableIcon = getVariableSourceIcon(sourceType);

  let effectiveTooltip = tooltip;
  if (runtimeVariables && value) {
    // Use `sourceType` (resolved container kind) for scope selection;
    // fall back to the tooltip string for callers that don't set sourceType.
    let varScope: 'global' | 'scene' | 'local' | 'object' | 'any';
    if (
      sourceType === gd.VariablesContainer.Global ||
      sourceType === gd.VariablesContainer.ExtensionGlobal
    ) {
      varScope = 'global';
    } else if (
      sourceType === gd.VariablesContainer.Scene ||
      sourceType === gd.VariablesContainer.ExtensionScene
    ) {
      varScope = 'scene';
    } else if (sourceType === gd.VariablesContainer.Local) {
      varScope = 'local';
    } else if (sourceType === gd.VariablesContainer.Object) {
      varScope = 'object';
    } else if (tooltip === 'global variable') {
      varScope = 'global';
    } else if (tooltip === 'scene variable') {
      varScope = 'scene';
    } else if (tooltip === 'object variable') {
      varScope = 'object';
    } else {
      varScope = 'any';
    }
    const extName = scope.eventsFunctionsExtension
      ? scope.eventsFunctionsExtension.getName()
      : undefined;
    // Scene-scoped locals only; extension function locals are omitted from the dump.
    const codeNamespace =
      varScope === 'local' && scope.layout && !scope.eventsFunctionsExtension
        ? gd.MetadataDeclarationHelper.getSceneCodeNamespace(
            scope.layout.getName()
          )
        : undefined;
    // Object scope requires lastObjectName; value only carries the variable path.
    const runtimeVar =
      varScope === 'object' && !lastObjectName
        ? null
        : lookupVariable(
            runtimeVariables,
            varScope,
            value,
            extName,
            codeNamespace,
            lastObjectName
          );
    if (runtimeVar) {
      const displayName =
        varScope === 'object' && lastObjectName
          ? `${lastObjectName}.${value}`
          : value;
      effectiveTooltip = `${displayName} = ${formatVariableValue(runtimeVar)}`;
    }
  }

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
      title={effectiveTooltip}
      className={classNames({
        [nameAndIconContainer]: true,
        [instructionWarningParameter]:
          quicklyAnalyzeVariableName(value) !==
          VariableNameQuickAnalyzeResults.OK,
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
