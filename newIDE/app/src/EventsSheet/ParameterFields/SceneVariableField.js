// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import SceneVariablesDialog from '../../VariablesList/SceneVariablesDialog';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariables } from './EnumerateVariables';
import GlobalAndSceneVariablesDialog from '../../VariablesList/GlobalAndSceneVariablesDialog';

const gd: libGDevelop = global.gd;

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function SceneVariableField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?VariableFieldInterface>(null);
    const [
      variableEditorOpen,
      setVariableEditorOpen,
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
        setVariableEditorOpen(null);
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
          openVariableEditorDialog={setVariableEditorOpen}
          globalObjectsContainer={props.globalObjectsContainer}
          objectsContainer={props.objectsContainer}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-scene-variable-field`
              : undefined
          }
          getVariableSourceFromIdentifier={getVariableSourceFromIdentifier}
          editEventsFunctionParameter={null}
          openEventsBasedEntityPropertyEditorDialog={null}
        />
        {variableEditorOpen && layout && project && (
          <SceneVariablesDialog
            project={project}
            layout={layout}
            open
            onCancel={() => setVariableEditorOpen(null)}
            onApply={onVariableEditorApply}
            initiallySelectedVariable={variableEditorOpen}
            hotReloadPreviewButtonProps={null}
            isListLocked={false}
          />
        )}
        {variableEditorOpen && eventsFunctionsExtension && !layout && (
          <GlobalAndSceneVariablesDialog
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            open
            onCancel={() => setVariableEditorOpen(null)}
            onApply={onVariableEditorApply}
            isGlobalTabInitiallyOpen={false}
            initiallySelectedVariable={variableEditorOpen}
            hotReloadPreviewButtonProps={null}
            isListLocked={false}
          />
        )}
      </React.Fragment>
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

const getVariableSourceFromIdentifier = (
  identifier: string,
  projectScopedContainers: gdProjectScopedContainers
): VariablesContainer_SourceType => gd.VariablesContainer.Scene;

export const renderInlineSceneVariable = (
  props: ParameterInlineRendererProps
): any =>
  renderVariableWithIcon(
    props,
    'scene variable',
    getVariableSourceFromIdentifier
  );
