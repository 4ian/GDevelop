// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
  type VariableDialogOpeningProps,
} from './VariableField';
import ObjectVariablesDialog from '../../VariablesList/ObjectVariablesDialog';
import ObjectGroupVariablesDialog from '../../VariablesList/ObjectGroupVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import ObjectVariableIcon from '../../UI/CustomSvgIcons/ObjectVariable';
import { enumerateVariables } from './EnumerateVariables';
import { intersectionBy } from 'lodash';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';

const gd: libGDevelop = global.gd;

// TODO Move this function to the ObjectsContainersList class.
export const getObjectOrGroupVariablesContainers = (
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string
): Array<gdVariablesContainer> => {
  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );
  const variablesContainers: Array<gdVariablesContainer> = [];
  if (object) {
    variablesContainers.push(object.getVariables());
  } else {
    const group = getObjectGroupByName(
      globalObjectsContainer,
      objectsContainer,
      objectName
    );
    if (group) {
      for (const subObjectName of group.getAllObjectsNames().toJSArray()) {
        const subObject = getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          subObjectName
        );
        if (subObject) {
          variablesContainers.push(subObject.getVariables());
        }
      }
    }
  }
  return variablesContainers;
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectVariableField(props: ParameterFieldProps, ref) {
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
      globalObjectsContainer,
      objectsContainer,
      projectScopedContainersAccessor,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
      onInstructionTypeChanged,
      value,
      onChange,
    } = props;

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });
    const objectGroup = objectName
      ? getObjectGroupByName(
          globalObjectsContainer,
          objectsContainer,
          objectName
        )
      : null;

    const objectSourceType = React.useMemo(
      () =>
        objectName
          ? projectScopedContainersAccessor
              .get()
              .getObjectsContainersList()
              .getObjectsContainerSourceType(objectName)
          : gd.ObjectsContainer.Unknown,
      [objectName, projectScopedContainersAccessor]
    );
    const canObjectDeclareVariable =
      objectSourceType !== gd.ObjectsContainer.Function;

    const { layout } = scope;
    const variablesContainers = React.useMemo<Array<gdVariablesContainer>>(
      () =>
        objectName && canObjectDeclareVariable
          ? getObjectOrGroupVariablesContainers(
              globalObjectsContainer,
              objectsContainer,
              objectName
            )
          : [],
      [
        objectName,
        canObjectDeclareVariable,
        globalObjectsContainer,
        objectsContainer,
      ]
    );

    const enumerateObjectVariables = React.useCallback(
      () =>
        variablesContainers.length > 0
          ? variablesContainers
              .map(variablesContainer => enumerateVariables(variablesContainer))
              .reduce((a, b) => intersectionBy(a, b, 'name'))
          : [],
      [variablesContainers]
    );

    const onVariableEditorApply = React.useCallback(
      (selectedVariableName: string | null) => {
        if (selectedVariableName && selectedVariableName.startsWith(value)) {
          onChange(selectedVariableName);
        }
        setEditorOpen(null);
        // The variable editor may have refactored the events for a variable type
        // change which may have changed the currently edited instruction type.
        if (onInstructionTypeChanged) onInstructionTypeChanged();
        if (field.current) field.current.updateAutocompletions();
      },
      [onChange, onInstructionTypeChanged, value]
    );

    const onComputeAllVariableNames = React.useCallback(
      () => {
        if (!project || !layout || !objectName) return [];

        return EventsRootVariablesFinder.findAllObjectVariables(
          project.getCurrentPlatform(),
          project,
          layout, // TODO: Handle this for custom objects?
          objectName
        );
      },
      [layout, objectName, project]
    );

    return (
      <React.Fragment>
        <VariableField
          forceDeclaration={
            instruction &&
            gd.VariableInstructionSwitcher.isSwitchableVariableInstruction(
              instruction.getType()
            )
          }
          project={project}
          instruction={instruction}
          isObjectVariable={true}
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateObjectVariables}
          parameterMetadata={props.parameterMetadata}
          value={props.value}
          onChange={props.onChange}
          isInline={props.isInline}
          onRequestClose={props.onRequestClose}
          onApply={props.onApply}
          ref={field}
          onOpenDialog={canObjectDeclareVariable ? setEditorOpen : null}
          globalObjectsContainer={props.globalObjectsContainer}
          objectsContainer={props.objectsContainer}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-object-variable-field`
              : undefined
          }
          onInstructionTypeChanged={onInstructionTypeChanged}
        />
        {editorOpen &&
          project &&
          !!variablesContainers.length &&
          !objectGroup && (
            <ObjectVariablesDialog
              project={project}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              objectName={objectName}
              variablesContainer={variablesContainers[0]}
              open
              onCancel={() => setEditorOpen(null)}
              onApply={onVariableEditorApply}
              preventRefactoringToDeleteInstructions
              initiallySelectedVariableName={editorOpen.variableName}
              shouldCreateInitiallySelectedVariable={editorOpen.shouldCreate}
              onComputeAllVariableNames={onComputeAllVariableNames}
              hotReloadPreviewButtonProps={null}
            />
          )}
        {editorOpen &&
          project &&
          objectGroup &&
          !!variablesContainers.length && (
            <ObjectGroupVariablesDialog
              project={project}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              objectGroup={objectGroup}
              onCancel={() => setEditorOpen(null)}
              onApply={onVariableEditorApply}
              open
              initiallySelectedVariableName={editorOpen.variableName}
              shouldCreateInitiallySelectedVariable={editorOpen.shouldCreate}
              onComputeAllVariableNames={onComputeAllVariableNames}
            />
          )}
      </React.Fragment>
    );
  }
);

export const renderInlineObjectVariable = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, 'object variable', ObjectVariableIcon);
