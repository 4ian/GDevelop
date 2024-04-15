// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import GlobalVariablesDialog from '../../VariablesList/GlobalVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariables } from './EnumerateVariables';
import GlobalIcon from '../../UI/CustomSvgIcons/Publish';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function GlobalVariableField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?VariableFieldInterface>(null);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { project, scope, projectScopedContainers } = props;

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
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateGlobaleVariables}
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
        />
        {editorOpen && project && (
          <GlobalVariablesDialog
            project={project}
            open={editorOpen}
            onCancel={() => setEditorOpen(false)}
            onApply={(selectedVariableName: string | null) => {
              if (
                selectedVariableName &&
                selectedVariableName.startsWith(props.value)
              ) {
                props.onChange(selectedVariableName);
              }
              setEditorOpen(false);
              if (field.current) field.current.updateAutocompletions();
            }}
            preventRefactoringToDeleteInstructions
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineGlobalVariable = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, 'global variable', GlobalIcon);
