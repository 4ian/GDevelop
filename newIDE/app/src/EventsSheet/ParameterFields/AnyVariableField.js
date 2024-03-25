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
import { enumerateValidVariableNames } from './EnumerateVariables';

const gd: libGDevelop = global.gd;

export const isUnifiedInstruction = (type: string): boolean =>
  type === 'StringVariable' || type === 'BooleanVariable';

export const getUnifiedInstructionType = (instructionType: string): string =>
  instructionType === 'StringVariable' || instructionType === 'BooleanVariable'
    ? 'NumberVariable'
    : instructionType;

export const switchBetweenUnifiedInstructionIfNeeded = (
  projectScopedContainers: gdProjectScopedContainers,
  instruction: gdInstruction
): void => {
  if (
    (instruction.getType() === 'NumberVariable' ||
      instruction.getType() === 'StringVariable' ||
      instruction.getType() === 'BooleanVariable') &&
    instruction.getParametersCount() > 0
  ) {
    const variableName = instruction.getParameter(0).getPlainString();
    if (
      projectScopedContainers.getVariablesContainersList().has(variableName)
    ) {
      const variable = projectScopedContainers
        .getVariablesContainersList()
        .get(variableName);
      if (variable.getType() === gd.Variable.String) {
        instruction.setType('StringVariable');
        instruction.setParametersCount(3);
      } else if (variable.getType() === gd.Variable.Number) {
        instruction.setType('NumberVariable');
        instruction.setParametersCount(3);
      } else if (variable.getType() === gd.Variable.Boolean) {
        instruction.setType('BooleanVariable');
        instruction.setParametersCount(2);
      }
    }
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

    const { project, scope } = props;
    const { layout } = scope;

    const onComputeAllVariableNames = React.useCallback(() => [], []);

    // TODO Handle object variable?
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
        return layout && project ? [layout.getVariables(), project.getVariables()] : [];
      },
      [layout, project]
    );

    return (
      <React.Fragment>
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
        />
        {editorOpen && layout && project && (
          <VariablesEditorDialog
            project={project}
            title={<Trans>{layout.getName()} variables</Trans>}
            open
            variablesContainer={layout.getVariables()}
            onCancel={() => setEditorOpen(false)}
            onApply={() => {
              setEditorOpen(false);
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
