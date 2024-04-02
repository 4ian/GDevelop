// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  getRootVariableName,
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateValidVariableNames } from './EnumerateVariables';
import { getProjectScopedContainersFromScope } from '../../InstructionOrExpression/EventsScope.flow';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { ColumnStackLayout } from '../../UI/Layout';

const gd: libGDevelop = global.gd;

const getVariableTypeFromParameters = (
  platform: gdPlatform,
  projectScopedContainers: gdProjectScopedContainers,
  instruction: gdInstruction
): Variable_Type | null => {
  if (
    instruction.getParametersCount() > 0 &&
    gd.VariableInstructionSwitcher.isSwitchableVariableInstruction(
      instruction.getType()
    )
  ) {
    return gd.ExpressionVariableTypeFinder.getVariableType(
      platform,
      projectScopedContainers,
      instruction.getParameter(0).getRootNode(),
      ''
    );
  }
  return null;
};

export const switchBetweenUnifiedInstructionIfNeeded = (
  platform: gdPlatform,
  projectScopedContainers: gdProjectScopedContainers,
  instruction: gdInstruction
): void => {
  const variableType = getVariableTypeFromParameters(
    platform,
    projectScopedContainers,
    instruction
  );
  if (variableType != null) {
    gd.VariableInstructionSwitcher.switchVariableInstructionType(
      instruction,
      variableType
    );
  }
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function SceneVariableField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?VariableFieldInterface>(null);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      scope,
      onInstructionTypeChanged,
      instruction,
    } = props;
    const { layout } = scope;

    const onComputeAllVariableNames = React.useCallback(() => [], []);

    const enumerateGlobalAndSceneVariableNames = React.useCallback(
      () => {
        return project && layout
          ? [
              ...enumerateValidVariableNames(layout.getVariables()),
              ...enumerateValidVariableNames(project.getVariables()),
            ]
          : [];
      },
      [project, layout]
    );

    const variablesContainers = React.useMemo(
      () => {
        return layout && project
          ? [layout.getVariables(), project.getVariables()]
          : [];
      },
      [layout, project]
    );

    const projectScopedContainers = getProjectScopedContainersFromScope(
      scope,
      globalObjectsContainer,
      objectsContainer
    );
    const variableType =
      project && instruction
        ? getVariableTypeFromParameters(
            project.getCurrentPlatform(),
            projectScopedContainers,
            instruction
          )
        : null;
    const needManualTypeSwitcher = variableType === gd.Variable.Unknown;

    return (
      <React.Fragment>
        <ColumnStackLayout noMargin>
          <VariableField
            forceDeclaration
            variablesContainers={variablesContainers}
            enumerateVariableNames={enumerateGlobalAndSceneVariableNames}
            parameterMetadata={props.parameterMetadata}
            value={props.value}
            onChange={props.onChange}
            isInline={props.isInline}
            onRequestClose={props.onRequestClose}
            onApply={props.onApply}
            ref={field}
            onOpenDialog={() => setEditorOpen(true)}
            globalObjectsContainer={props.globalObjectsContainer}
            objectsContainer={props.objectsContainer}
            scope={scope}
            id={
              props.parameterIndex !== undefined
                ? `parameter-${props.parameterIndex}-scene-variable-field`
                : undefined
            }
            getVariableTypeFromParameters={getVariableTypeFromParameters}
          />
          {needManualTypeSwitcher && instruction && onInstructionTypeChanged && (
            <SelectField
              floatingLabelText={<Trans>Use as...</Trans>}
              value={(() => {
                const type = gd.VariableInstructionSwitcher.getSwitchableInstructionVariableType(
                  instruction.getType()
                );
                return type === gd.Variable.Unknown ? gd.Variable.Number : type;
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
              <SelectOption value={gd.Variable.String} label={t`String`} />
              <SelectOption value={gd.Variable.Boolean} label={t`Boolean`} />
            </SelectField>
          )}
        </ColumnStackLayout>
        {editorOpen && layout && project && (
          <VariablesEditorDialog
            project={project}
            title={<Trans>{layout.getName()} variables</Trans>}
            open
            variablesContainer={layout.getVariables()}
            onCancel={() => setEditorOpen(false)}
            onApply={() => {
              setEditorOpen(false);
              if (onInstructionTypeChanged) onInstructionTypeChanged();
              if (field.current) field.current.updateAutocompletions();
            }}
            emptyPlaceholderTitle={<Trans>Add your first scene variable</Trans>}
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on a scene.
              </Trans>
            }
            helpPagePath={'/all-features/variables/scene-variables'}
            onComputeAllVariableNames={onComputeAllVariableNames}
            preventRefactoringToDeleteInstructions
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineAnyVariable = (props: ParameterInlineRendererProps) =>
  renderVariableWithIcon(
    props,
    props.scope.layout &&
      props.scope.layout.getVariables().has(getRootVariableName(props.value))
      ? 'res/types/scenevar.png'
      : 'res/types/globalvar.png',
    'variable'
  );
