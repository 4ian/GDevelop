// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, { renderVariableWithIcon } from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldCommons';

const gd: libGDevelop = global.gd;

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
    const { project, scope } = this.props;
    const { layout } = scope;

    const onComputeAllVariableNames = () =>
      (project && layout) ?
      gd.EventsVariablesFinder.findAllLayoutVariables(
        project.getCurrentPlatform(),
        project,
        layout
      )
        .toNewVectorString()
        .toJSArray()
        : [];

    return (
      <React.Fragment>
        <VariableField
          variablesContainer={layout ? layout.getVariables() : null}
          onComputeAllVariableNames={onComputeAllVariableNames}
          parameterMetadata={this.props.parameterMetadata}
          value={this.props.value}
          onChange={this.props.onChange}
          isInline={this.props.isInline}
          onRequestClose={this.props.onRequestClose}
          ref={field => (this._field = field)}
          onOpenDialog={() => this.setState({ editorOpen: true })}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          scope={scope}
        />
        {this.state.editorOpen && layout && (
          <VariablesEditorDialog
            title={<Trans>Scene Variables</Trans>}
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
            onComputeAllVariableNames={onComputeAllVariableNames}
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineSceneVariable = (
  props: ParameterInlineRendererProps
) => {
  return renderVariableWithIcon(
    props,
    'res/types/scenevar.png',
    'scene variable'
  );
};
