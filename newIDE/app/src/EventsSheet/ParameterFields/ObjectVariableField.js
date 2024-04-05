// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, {
  renderVariableWithIcon,
  type VariableFieldInterface,
} from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import { enumerateValidVariableNames } from './EnumerateVariables';
import intersection from 'lodash/intersection';

const gd: libGDevelop = global.gd;

// TODO Move this function to the ObjectsContainersList class.
const getObjectOrGroupVariablesContainers = (
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

const getVariableTypeFromParameters = (
  platform: gdPlatform,
  projectScopedContainers: gdProjectScopedContainers,
  instruction: gdInstruction
): Variable_Type | null => {
  if (
    instruction.getParametersCount() > 1 &&
    gd.VariableInstructionSwitcher.isSwitchableVariableInstruction(
      instruction.getType()
    )
  ) {
    const objectName = instruction.getParameter(0).getPlainString();

    const variableType = gd.ExpressionVariableTypeFinder.getVariableType(
      platform,
      projectScopedContainers,
      instruction.getParameter(1).getRootNode(),
      objectName
    );
    return variableType === gd.Variable.Array
      ? // "Push" actions need the child type to be able to switch.
        gd.ExpressionVariableTypeFinder.getArrayVariableType(
          platform,
          projectScopedContainers,
          instruction.getParameter(1).getRootNode(),
          objectName
        )
      : variableType;
  }
  return null;
};

export const switchBetweenUnifiedObjectInstructionIfNeeded = (
  platform: gdPlatform,
  projectScopedContainers: gdProjectScopedContainers,
  instruction: gdInstruction
): void => {
  const variableType = getVariableTypeFromParameters(
    platform,
    projectScopedContainers,
    instruction
  );
  if (variableType != null) {
    gd.VariableInstructionSwitcher.switchVariableInstructionType(
      instruction,
      variableType
    );
  }
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
    const object = objectName
      ? getObjectByName(globalObjectsContainer, objectsContainer, objectName)
      : null;
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

    const enumerateVariableNames = React.useCallback(
      () =>
        variablesContainers.length > 0
          ? variablesContainers
              .map(variablesContainer =>
                enumerateValidVariableNames(variablesContainer)
              )
              .reduce((a, b) => intersection(a, b))
          : [],
      [variablesContainers]
    );

    const onComputeAllVariableNames = () =>
      project && layout && object
        ? EventsRootVariablesFinder.findAllObjectVariables(
            project.getCurrentPlatform(),
            project,
            layout,
            object
          )
        : [];

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
          enumerateVariableNames={enumerateVariableNames}
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
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-object-variable-field`
              : undefined
          }
          getVariableTypeFromParameters={getVariableTypeFromParameters}
          onInstructionTypeChanged={onInstructionTypeChanged}
        />
        {editorOpen && project && (
          <VariablesEditorDialog
            project={project}
            title={<Trans>Object Variables</Trans>}
            open={editorOpen}
            variablesContainer={variablesContainers[0]}
            emptyPlaceholderTitle={
              <Trans>Add your first object variable</Trans>
            }
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on an object.
              </Trans>
            }
            helpPagePath={'/all-features/variables/object-variables'}
            onComputeAllVariableNames={onComputeAllVariableNames}
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
          />
        )}
      </React.Fragment>
    );
  }
);

export const renderInlineObjectVariable = (
  props: ParameterInlineRendererProps
) => renderVariableWithIcon(props, ObjectIcon, 'object variable');
