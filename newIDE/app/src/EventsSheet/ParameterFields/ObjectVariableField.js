// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, { renderVariableWithIcon } from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';

type State = {|
  editorOpen: boolean,
|};

export default class ObjectVariableField extends React.Component<
  ParameterFieldProps,
  State
> {
  _field: ?VariableField;
  state = {
    editorOpen: false,
  };

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = this.props;

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });

    const { layout } = scope;
    let object = null;
    let variablesContainer = null;
    if (objectName) {
      if (layout && layout.hasObjectNamed(objectName)) {
        object = layout.getObject(objectName);
        variablesContainer = object.getVariables();
      } else if (project && project.hasObjectNamed(objectName)) {
        object = project.getObject(objectName);
        variablesContainer = object.getVariables();
      }
    }

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
          variablesContainer={variablesContainer}
          onComputeAllVariableNames={onComputeAllVariableNames}
          parameterMetadata={this.props.parameterMetadata}
          value={this.props.value}
          onChange={this.props.onChange}
          isInline={this.props.isInline}
          onRequestClose={this.props.onRequestClose}
          onApply={this.props.onApply}
          ref={field => (this._field = field)}
          onOpenDialog={() => this.setState({ editorOpen: true })}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          scope={scope}
        />
        {this.state.editorOpen && variablesContainer && (
          <VariablesEditorDialog
            title={<Trans>Object Variables</Trans>}
            open={this.state.editorOpen}
            variablesContainer={variablesContainer}
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
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
              if (this._field) this._field.updateAutocompletions();
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineObjectVariable = (
  props: ParameterInlineRendererProps
) => {
  return renderVariableWithIcon(
    props,
    'res/types/objectvar.png',
    'object variable'
  );
};
