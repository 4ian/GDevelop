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
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
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
      ? layout && layout.hasObjectNamed(objectName)
        ? layout.getObject(objectName)
        : project && project.hasObjectNamed(objectName)
        ? project.getObject(objectName)
        : null
      : null;
    const variablesContainers = React.useMemo<Array<gdVariablesContainer>>(
      () => {
        if (!objectName) {
          return [];
        }
        const variablesContainers: Array<gdVariablesContainer> = [];
        if (object) {
          variablesContainers.push(object.getVariables());
        } else {
          const group =
            layout && layout.getObjectGroups().has(objectName)
              ? layout.getObjectGroups().get(objectName)
              : project && project.getObjectGroups().has(objectName)
              ? project.getObjectGroups().get(objectName)
              : null;

          if (group) {
            for (const subObjectName of group
              .getAllObjectsNames()
              .toJSArray()) {
              if (layout && layout.hasObjectNamed(subObjectName)) {
                variablesContainers.push(
                  layout.getObject(subObjectName).getVariables()
                );
              } else if (project && project.hasObjectNamed(subObjectName)) {
                variablesContainers.push(
                  project.getObject(subObjectName).getVariables()
                );
              }
            }
          }
        }
        return variablesContainers;
      },
      [layout, object, objectName, project]
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
          variablesContainers={variablesContainers}
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
          scope={scope}
          id={
            props.parameterIndex !== undefined
              ? `parameter-${props.parameterIndex}-object-variable-field`
              : undefined
          }
        />
        {editorOpen &&
          // There is no variable editor for groups.
          variablesContainers.length === 1 &&
          project && (
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
              onApply={() => {
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

export const renderInlineObjectVariable = (
  props: ParameterInlineRendererProps
) =>
  renderVariableWithIcon(props, 'res/types/objectvar.png', 'object variable');
