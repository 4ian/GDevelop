// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import ObjectVariablesDialog from '../../VariablesList/ObjectVariablesDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import { enumerateVariables } from './EnumerateVariables';
import { intersectionBy } from 'lodash';

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
    const [editorOpen, setEditorOpen] = React.useState(false);
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
    } = props;

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });

    const { layout } = scope;
    const variablesContainers = React.useMemo<Array<gdVariablesContainer>>(
      () =>
        objectName
          ? getObjectOrGroupVariablesContainers(
              globalObjectsContainer,
              objectsContainer,
              objectName
            )
          : [],
      [objectName, globalObjectsContainer, objectsContainer]
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
          variablesContainers={variablesContainers}
          enumerateVariables={enumerateObjectVariables}
          parameterMetadata={props.parameterMetadata}
          value={props.value}
          onChange={props.onChange}
          isInline={props.isInline}
          onRequestClose={props.onRequestClose}
          onApply={props.onApply}
          ref={field}
          // There is no variable editor for groups.
          onOpenDialog={
            variablesContainers.length === 1 ? () => setEditorOpen(true) : null
          }
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
        {editorOpen && project && (
          <ObjectVariablesDialog
            project={project}
            layout={layout}
            objectName={objectName}
            variablesContainer={variablesContainers[0]}
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
              if (onInstructionTypeChanged) onInstructionTypeChanged();
              if (field.current) field.current.updateAutocompletions();
            }}
            preventRefactoringToDeleteInstructions
            initiallySelectedVariableName={props.value}
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineObjectVariable = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, 'object variable', ObjectIcon);
