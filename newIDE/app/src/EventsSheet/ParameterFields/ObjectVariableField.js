// @flow
import * as React from 'react';
import VariableField from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';

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
    const { project, layout, instructionOrExpression } = this.props;

    let variablesContainer = null;
    if (
      instructionOrExpression &&
      instructionOrExpression.getParametersCount() > 0
    ) {
      const objectName = instructionOrExpression.getParameter(0);
      if (layout && layout.hasObjectNamed(objectName)) {
        variablesContainer = layout.getObject(objectName).getVariables();
      } else if (project && project.hasObjectNamed(objectName)) {
        variablesContainer = project.getObject(objectName).getVariables();
      }
    }

    return (
      <div>
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
        />
        {this.state.editorOpen && variablesContainer && (
          <VariablesEditorDialog
            open={this.state.editorOpen}
            variablesContainer={variablesContainer}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
              if (this._field) this._field.forceUpdateVariables();
            }}
          />
        )}
      </div>
    );
  }
}
