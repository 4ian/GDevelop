// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import GlobalVariablesDialog from '../../VariablesList/GlobalVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariables } from './EnumerateVariables';

const gd: libGDevelop = global.gd;

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function GlobalVariableField(props: ParameterFieldProps, ref) {
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

    const { project, scope, projectScopedContainersAccessor } = props;

    const variablesContainers = React.useMemo(
      () => {
        return project ? [project.getVariables()] : [];
      },
      [project]
    );

    const enumerateGlobaleVariables = React.useCallback(
      () => {
        return project ? enumerateVariables(project.getVariables()) : [];
      },
      [project]
    );

    return (
      <React.Fragment>
        <VariableField
          isObjectVariable={false}
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateGlobaleVariables}
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
          getVariableSourceFromIdentifier={getVariableSourceFromIdentifier}
          editEventsFunctionParameter={null}
          openEventsBasedEntityPropertyEditorDialog={null}
        />
        {variableEditorOpen && project && (
          <GlobalVariablesDialog
            project={project}
            open
            onCancel={() => setVariableEditorOpen(null)}
            onApply={(selectedVariableName: string | null) => {
              if (
                selectedVariableName &&
                selectedVariableName.startsWith(props.value)
              ) {
                props.onChange(selectedVariableName);
              }
              setVariableEditorOpen(null);
              if (field.current) field.current.updateAutocompletions();
            }}
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
  variableName: string,
  projectScopedContainers: gdProjectScopedContainers
): VariablesContainer_SourceType => gd.VariablesContainer.Global;

export const renderInlineGlobalVariable = (
  props: ParameterInlineRendererProps
): any =>
  renderVariableWithIcon(
    props,
    'global variable',
    getVariableSourceFromIdentifier
  );
