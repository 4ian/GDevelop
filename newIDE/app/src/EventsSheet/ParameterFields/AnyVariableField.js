// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  getRootVariableName,
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import GlobalAndSceneVariablesDialog from '../../VariablesList/GlobalAndSceneVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariablesOfContainersList } from './EnumerateVariables';
import { mapFor } from '../../Utils/MapFor';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function AnyVariableField(props: ParameterFieldProps, ref) {
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

    const isGlobal = !!(
      layout &&
      project &&
      !layout.getVariables().has(getRootVariableName(props.value)) &&
      project.getVariables().has(getRootVariableName(props.value))
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
          onInstructionTypeChanged={onInstructionTypeChanged}
        />
        {editorOpen && layout && project && (
          <GlobalAndSceneVariablesDialog
            project={project}
            layout={layout}
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
            isGlobalTabInitiallyOpen={isGlobal}
            initiallySelectedVariableName={props.value}
            preventRefactoringToDeleteInstructions
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineAnyVariable = (props: ParameterInlineRendererProps) =>
  renderVariableWithIcon(props, 'variable');
