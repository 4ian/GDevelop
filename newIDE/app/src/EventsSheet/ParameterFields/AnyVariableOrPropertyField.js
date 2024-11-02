// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  getRootVariableName,
  renderVariableWithIcon,
  type VariableFieldInterface,
  type VariableDialogOpeningProps,
} from './VariableField';
import GlobalAndSceneVariablesDialog from '../../VariablesList/GlobalAndSceneVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariablesOrPropertiesOfContainersList } from './EnumerateVariables';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function AnyVariableField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?VariableFieldInterface>(null);
    const [
      editorOpen,
      setEditorOpen,
    ] = React.useState<VariableDialogOpeningProps | null>(null);
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
      projectScopedContainersAccessor,
      onChange,
      value,
    } = props;
    const { layout } = scope;

    const enumerateGlobalAndSceneVariables = React.useCallback(
      () =>
        enumerateVariablesOrPropertiesOfContainersList(
          projectScopedContainersAccessor.get().getVariablesContainersList()
        ),
      [projectScopedContainersAccessor]
    );

    const variablesContainers = React.useMemo(
      () => {
        const variablesContainersList = projectScopedContainersAccessor
          .get()
          .getVariablesContainersList();
        return mapFor(
          0,
          variablesContainersList.getVariablesContainersCount(),
          i => {
            return variablesContainersList.getVariablesContainer(i);
          }
        ).filter(
          variableContainer =>
            variableContainer.getSourceType() !==
            gd.VariablesContainer.Parameters
        );
      },
      [projectScopedContainersAccessor]
    );

    const onVariableEditorApply = React.useCallback(
      (selectedVariableName: string | null) => {
        if (selectedVariableName && selectedVariableName.startsWith(value)) {
          onChange(selectedVariableName);
        }
        setEditorOpen(null);
        // The variable editor may have refactor the events for a variable type
        // change which may have change the currently edited instruction type.
        if (onInstructionTypeChanged) onInstructionTypeChanged();
        if (field.current) field.current.updateAutocompletions();
      },
      [onChange, onInstructionTypeChanged, value]
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
          isObjectVariable={false}
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateGlobalAndSceneVariables}
          parameterMetadata={props.parameterMetadata}
          value={props.value}
          onChange={props.onChange}
          isInline={props.isInline}
          onRequestClose={props.onRequestClose}
          onApply={props.onApply}
          ref={field}
          onOpenDialog={setEditorOpen}
          globalObjectsContainer={props.globalObjectsContainer}
          objectsContainer={props.objectsContainer}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-scene-variable-field`
              : undefined
          }
          onInstructionTypeChanged={onInstructionTypeChanged}
        />
        {editorOpen && (
          <GlobalAndSceneVariablesDialog
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            open
            onCancel={() => setEditorOpen(null)}
            onApply={onVariableEditorApply}
            isGlobalTabInitiallyOpen={isGlobal}
            initiallySelectedVariableName={editorOpen.variableName}
            shouldCreateInitiallySelectedVariable={editorOpen.shouldCreate}
            hotReloadPreviewButtonProps={null}
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineAnyVariableOrProperty = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, 'variable');
