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
    let object = null;
    if (objectName) {
      if (layout && layout.hasObjectNamed(objectName)) {
        object = layout.getObject(objectName);
      } else if (project && project.hasObjectNamed(objectName)) {
        object = project.getObject(objectName);
      }
    }
    const variablesContainers = React.useMemo(
      () => {
        const variablesContainers: Array<gdVariablesContainer> = [];
        if (objectName) {
          if (layout && layout.hasObjectNamed(objectName)) {
            variablesContainers.push(
              layout.getObject(objectName).getVariables()
            );
          } else if (project && project.hasObjectNamed(objectName)) {
            variablesContainers.push(
              project.getObject(objectName).getVariables()
            );
          } else if (layout && layout.getObjectGroups().has(objectName)) {
            for (const subObjectName of layout
              .getObjectGroups()
              .get(objectName)
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
          } else if (project && project.getObjectGroups().has(objectName)) {
            for (const subObjectName of project
              .getObjectGroups()
              .get(objectName)
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
      [layout, objectName, project]
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
        {editorOpen && variablesContainers.length === 1 && project && (
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
