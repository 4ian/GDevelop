// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
  type VariableDialogOpeningProps,
} from './VariableField';
import SceneVariablesDialog from '../../VariablesList/SceneVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariables } from './EnumerateVariables';
import SceneVariableIcon from '../../UI/CustomSvgIcons/SceneVariable';
import GlobalAndSceneVariablesDialog from '../../VariablesList/GlobalAndSceneVariablesDialog';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function SceneVariableField(props: ParameterFieldProps, ref) {
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
      projectScopedContainersAccessor,
      value,
      onChange,
    } = props;
    const { layout, eventsFunctionsExtension } = scope;

    const variablesContainers = React.useMemo(
      () => {
        return layout
          ? [layout.getVariables()]
          : eventsFunctionsExtension
          ? [eventsFunctionsExtension.getSceneVariables()]
          : [];
      },
      [eventsFunctionsExtension, layout]
    );

    const enumerateSceneVariables = React.useCallback(
      () => {
        return layout
          ? enumerateVariables(layout.getVariables())
          : eventsFunctionsExtension
          ? enumerateVariables(eventsFunctionsExtension.getSceneVariables())
          : [];
      },
      [eventsFunctionsExtension, layout]
    );

    const onVariableEditorApply = React.useCallback(
      (selectedVariableName: string | null) => {
        if (selectedVariableName && selectedVariableName.startsWith(value)) {
          onChange(selectedVariableName);
        }
        setEditorOpen(null);
        if (field.current) field.current.updateAutocompletions();
      },
      [onChange, value]
    );

    return (
      <React.Fragment>
        <VariableField
          isObjectVariable={false}
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateSceneVariables}
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
        />
        {editorOpen && layout && project && (
          <SceneVariablesDialog
            project={project}
            layout={layout}
            open
            onCancel={() => setEditorOpen(null)}
            onApply={onVariableEditorApply}
            preventRefactoringToDeleteInstructions
            initiallySelectedVariableName={editorOpen.variableName}
            shouldCreateInitiallySelectedVariable={
              editorOpen.shouldCreate || false
            }
            hotReloadPreviewButtonProps={null}
          />
        )}
        {editorOpen && eventsFunctionsExtension && !layout && (
          <GlobalAndSceneVariablesDialog
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            open
            onCancel={() => setEditorOpen(null)}
            onApply={onVariableEditorApply}
            isGlobalTabInitiallyOpen={false}
            initiallySelectedVariableName={editorOpen.variableName}
            shouldCreateInitiallySelectedVariable={editorOpen.shouldCreate}
            hotReloadPreviewButtonProps={null}
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineSceneVariable = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, 'scene variable', SceneVariableIcon);
