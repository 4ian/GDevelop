import React, { Component } from 'react';
import VariableField from './VariableField';
import VariablesEditorDialog from '../../../VariablesList/VariablesEditorDialog';

export default class GlobalVariableField extends Component {
  state = {
    editorOpen: false,
  };

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { project } = this.props;

    return (
      <div>
        <VariableField
          variablesContainer={project.getVariables()}
          parameterMetadata={this.props.parameterMetadata}
          value={this.props.value}
          onChange={this.props.onChange}
          isInline={this.props.isInline}
          ref={field => (this._field = field)}
          onOpenDialog={() => this.setState({ editorOpen: true })}
        />
        {this.state.editorOpen && (
          <VariablesEditorDialog
            open={this.state.editorOpen}
            variablesContainer={project.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => this.setState({ editorOpen: false })}
            emptyExplanationMessage="Global variables are variables that are persisted across the scenes during the game."
          />
        )}
      </div>
    );
  }
}
