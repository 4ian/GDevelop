// @flow
import * as React from 'react';
import VariableField from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';

type State = {|
  editorOpen: boolean,
|};

export default class SceneVariableField extends React.Component<
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
    const { layout } = this.props;

    return (
      <React.Fragment>
        <VariableField
          variablesContainer={layout ? layout.getVariables() : null}
          parameterMetadata={this.props.parameterMetadata}
          value={this.props.value}
          onChange={this.props.onChange}
          isInline={this.props.isInline}
          ref={field => (this._field = field)}
          onOpenDialog={() => this.setState({ editorOpen: true })}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
        />
        {this.state.editorOpen && layout && (
          <VariablesEditorDialog
            open={this.state.editorOpen}
            variablesContainer={layout.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
              if (this._field) this._field.forceUpdateVariables();
            }}
            emptyExplanationMessage="Scene variables can be used to store any value or text during the game."
            emptyExplanationSecondMessage="For example, you can have a variable called Score representing the current score of the player."
          />
        )}
      </React.Fragment>
    );
  }
}
