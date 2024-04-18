// @flow
import { Trans } from '@lingui/macro';
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
import { enumerateVariablesOfContainersList } from './EnumerateVariables';
import { ProjectScopedContainers } from '../../InstructionOrExpression/EventsScope.flow';
import { mapFor } from '../../Utils/MapFor';

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
    const variableType = gd.ExpressionVariableTypeFinder.getVariableType(
      platform,
      projectScopedContainers,
      instruction.getParameter(0).getRootNode(),
      ''
    );
    return variableType === gd.Variable.Array
      ? // "Push" actions need the child type to be able to switch.
        gd.ExpressionVariableTypeFinder.getArrayVariableType(
          platform,
          projectScopedContainers,
          instruction.getParameter(0).getRootNode(),
          ''
        )
      : variableType;
  }
  return null;
};

export const switchBetweenUnifiedInstructionIfNeeded = (
  platform: gdPlatform,
  projectScopedContainers: ProjectScopedContainers,
  instruction: gdInstruction
): void => {
  const variableType = getVariableTypeFromParameters(
    platform,
    projectScopedContainers.get(),
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
      scope,
      instruction,
      onInstructionTypeChanged,
      projectScopedContainers,
    } = props;
    const { layout } = scope;

    const onComputeAllVariableNames = React.useCallback(() => [], []);

    const enumerateGlobalAndSceneVariables = React.useCallback(
      () =>
        enumerateVariablesOfContainersList(
          projectScopedContainers.get().getVariablesContainersList()
        ),
      [projectScopedContainers]
    );

    const variablesContainers = React.useMemo(
      () => {
        const variablesContainersList = projectScopedContainers
          .get()
          .getVariablesContainersList();
        return mapFor(
          0,
          variablesContainersList.getVariablesContainersCount(),
          i => {
            return variablesContainersList.getVariablesContainer(i);
          }
        );
      },
      [projectScopedContainers]
    );

    const isGlobal =
      layout &&
      project &&
      !layout.getVariables().has(getRootVariableName(props.value)) &&
      project.getVariables().has(getRootVariableName(props.value));

    const globalAndSceneVariableDialogTabs = React.useMemo(
      () =>
        [
          layout && {
            id: 'scene-variables',
            label: <Trans>Scene variables</Trans>,
            variablesContainer: layout.getVariables(),
            emptyPlaceholderTitle: <Trans>Add your first scene variable</Trans>,
            emptyPlaceholderDescription: (
              <Trans>
                These variables hold additional information on a scene.
              </Trans>
            ),
          },
          project && {
            id: 'global-variables',
            label: <Trans>Global variables</Trans>,
            variablesContainer: project.getVariables(),
            emptyPlaceholderTitle: (
              <Trans>Add your first global variable</Trans>
            ),
            emptyPlaceholderDescription: (
              <Trans>
                These variables hold additional information on a project.
              </Trans>
            ),
          },
        ].filter(Boolean),
      [layout, project]
    );

    return (
      <React.Fragment>
        <VariableField
          forceDeclaration
          project={project}
          instruction={instruction}
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateGlobalAndSceneVariables}
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
          projectScopedContainers={projectScopedContainers}
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-scene-variable-field`
              : undefined
          }
          getVariableTypeFromParameters={getVariableTypeFromParameters}
          onInstructionTypeChanged={onInstructionTypeChanged}
        />
        {editorOpen && layout && project && (
          <VariablesEditorDialog
            project={project}
            title={<Trans>{layout.getName()} variables</Trans>}
            open
            onCancel={() => setEditorOpen(false)}
            onApply={(selectedVariableName: string | null) => {
              if (
                selectedVariableName &&
                selectedVariableName.startsWith(props.value)
              ) {
                props.onChange(selectedVariableName);
              }
              setEditorOpen(false);
              if (onInstructionTypeChanged) onInstructionTypeChanged();
              if (field.current) field.current.updateAutocompletions();
            }}
            initiallyOpenTabId={
              isGlobal ? 'global-variables' : 'scene-variables'
            }
            initiallySelectedVariableName={props.value}
            tabs={globalAndSceneVariableDialogTabs}
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
  renderVariableWithIcon(props, 'variable');
