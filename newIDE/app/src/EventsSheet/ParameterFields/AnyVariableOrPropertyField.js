// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  getRootVariableName,
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import GlobalAndSceneVariablesDialog from '../../VariablesList/GlobalAndSceneVariablesDialog';
import LocalVariablesDialog from '../../VariablesList/LocalVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { enumerateVariablesOrPropertiesOfContainersList } from './EnumerateVariables';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function AnyVariableField(props: ParameterFieldProps, ref) {
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
      instruction,
      onInstructionTypeChanged,
      projectScopedContainersAccessor,
      onChange,
      value,
      openEventsBasedEntityPropertyEditorDialog,
    } = props;

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
        setVariableEditorOpen(null);
        // The variable editor may have refactor the events for a variable type
        // change which may have change the currently edited instruction type.
        if (onInstructionTypeChanged) onInstructionTypeChanged();
        if (field.current) field.current.updateAutocompletions();
      },
      [onChange, onInstructionTypeChanged, value]
    );

    const variablesContainer = React.useMemo(
      () => {
        const variablesContainersList = projectScopedContainersAccessor
          .get()
          .getVariablesContainersList();
        return variablesContainersList.getVariablesContainerFromVariableOrPropertyName(
          props.value
        );
      },
      [projectScopedContainersAccessor, props.value]
    );
    const variableSourceType = variablesContainer.getSourceType();

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
          onInstructionTypeChanged={onInstructionTypeChanged}
          getVariableSourceFromIdentifier={getVariableSourceFromIdentifier}
          editEventsFunctionParameter={null}
          openEventsBasedEntityPropertyEditorDialog={
            openEventsBasedEntityPropertyEditorDialog || null
          }
        />
        {variableEditorOpen &&
          (variableSourceType === gd.VariablesContainer.Local ? (
            project && (
              <LocalVariablesDialog
                project={project}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                variablesContainer={variablesContainer}
                open
                onCancel={() => setVariableEditorOpen(null)}
                onApply={onVariableEditorApply}
                initiallySelectedVariable={variableEditorOpen}
                isListLocked={false}
              />
            )
          ) : (
            <GlobalAndSceneVariablesDialog
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              open
              onCancel={() => setVariableEditorOpen(null)}
              onApply={onVariableEditorApply}
              isGlobalTabInitiallyOpen={
                variableSourceType === gd.VariablesContainer.Global ||
                variableSourceType === gd.VariablesContainer.ExtensionGlobal
              }
              initiallySelectedVariable={variableEditorOpen}
              hotReloadPreviewButtonProps={null}
              isListLocked={false}
            />
          ))}
      </React.Fragment>
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

export const getVariableSourceFromIdentifier = (
  variableName: string,
  projectScopedContainers: gdProjectScopedContainers
): VariablesContainer_SourceType => {
  const rootVariableName = getRootVariableName(variableName);
  const variablesContainersList = projectScopedContainers.getVariablesContainersList();
  return variablesContainersList.has(rootVariableName)
    ? variablesContainersList
        .getVariablesContainerFromVariableOrPropertyName(rootVariableName)
        .getSourceType()
    : gd.VariablesContainer.Unknown;
};

export const renderInlineAnyVariableOrProperty = (
  props: ParameterInlineRendererProps
): any =>
  renderVariableWithIcon(props, 'variable', getVariableSourceFromIdentifier);
