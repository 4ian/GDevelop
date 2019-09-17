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
    const { scope } = this.props;
    const { layout } = scope;

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
          scope={scope}
        />
        {this.state.editorOpen && layout && (
          <VariablesEditorDialog
            open
            variablesContainer={layout.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
            }}
            emptyExplanationMessage={
              <Trans>
                Scene variables can be used to store any value or text during
                the game.
              </Trans>
            }
            emptyExplanationSecondMessage={
              <Trans>
                For example, you can have a variable called Score representing
                the current score of the player.
              </Trans>
            }
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineSceneVariable = ({
  value,
}: ParameterInlineRendererProps) => {
  return renderVariableWithIcon(
    value,
    'res/types/scenevar.png',
    'scene variable'
  );
};
