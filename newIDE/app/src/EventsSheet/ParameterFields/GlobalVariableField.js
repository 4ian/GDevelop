// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, { renderVariableWithIcon } from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldCommons';

type State = {|
  editorOpen: boolean,
|};

export default class GlobalVariableField extends React.Component<
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
    const { project, scope } = this.props;

    return (
      <React.Fragment>
        <VariableField
          variablesContainer={project ? project.getVariables() : null}
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
        {this.state.editorOpen && project && (
          <VariablesEditorDialog
            open={this.state.editorOpen}
            variablesContainer={project.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
            }}
            emptyExplanationMessage={
              <Trans>
                Global variables are variables that are persisted across the
                scenes during the game.
              </Trans>
            }
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineGlobalVariable = ({
  value,
}: ParameterInlineRendererProps) => {
  return renderVariableWithIcon(
    value,
    'res/types/globalvar.png',
    'global variable'
  );
};
