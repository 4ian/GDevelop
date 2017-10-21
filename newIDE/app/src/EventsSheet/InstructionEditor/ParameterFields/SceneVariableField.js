import React, { Component } from 'react';
import VariableField from './VariableField';
import VariablesEditorDialog from '../../../VariablesList/VariablesEditorDialog';

export default class SceneVariableField extends Component {
  state = {
    editorOpen: false,
  };

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { layout } = this.props;

    return (
      <div>
        <VariableField
          variablesContainer={layout.getVariables()}
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
            variablesContainer={layout.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => this.setState({ editorOpen: false })}
            emptyExplanationMessage="Scene variables can be used to store any value or text during the game."
            emptyExplanationSecondMessage="For example, you can have a variable called Score representing the current score of the player."
          />
        )}
      </div>
    );
  }
}
