// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, { renderVariableWithIcon } from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';

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

    let variablesContainer = null;
    if (objectName) {
      const { layout } = scope;
      if (layout && layout.hasObjectNamed(objectName)) {
        variablesContainer = layout.getObject(objectName).getVariables();
      } else if (project && project.hasObjectNamed(objectName)) {
        variablesContainer = project.getObject(objectName).getVariables();
      }
    }

    return (
      <React.Fragment>
        <VariableField
          variablesContainer={variablesContainer}
          parameterMetadata={this.props.parameterMetadata}
          value={this.props.value}
          onChange={this.props.onChange}
          isInline={this.props.isInline}
          ref={field => (this._field = field)}
          onOpenDialog={() => this.setState({ editorOpen: true })}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          scope={scope}
        />
        {this.state.editorOpen && variablesContainer && (
          <VariablesEditorDialog
            open={this.state.editorOpen}
            variablesContainer={variablesContainer}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineObjectVariable = ({
  value,
}: ParameterInlineRendererProps) => {
  return renderVariableWithIcon(
    value,
    'res/types/objectvar.png',
    'object variable'
  );
};
