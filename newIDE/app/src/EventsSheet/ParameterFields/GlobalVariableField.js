// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import VariableField, { renderVariableWithIcon } from './VariableField';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';

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

    const onComputeAllVariableNames = () =>
      project
        ? EventsRootVariablesFinder.findAllGlobalVariables(
            project.getCurrentPlatform(),
            project
          )
        : [];

    return (
      <React.Fragment>
        <VariableField
          variablesContainer={project ? project.getVariables() : null}
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
        {this.state.editorOpen && project && (
          <VariablesEditorDialog
            title={<Trans>Global Variables</Trans>}
            open={this.state.editorOpen}
            variablesContainer={project.getVariables()}
            onCancel={() => this.setState({ editorOpen: false })}
            onApply={() => {
              this.setState({ editorOpen: false });
              if (this._field) this._field.updateAutocompletions();
            }}
            emptyPlaceholderTitle={
              <Trans>Add your first global variable</Trans>
            }
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on a project.
              </Trans>
            }
            helpPagePath={'/all-features/variables/global-variables'}
            onComputeAllVariableNames={onComputeAllVariableNames}
          />
        )}
      </React.Fragment>
    );
  }
}

export const renderInlineGlobalVariable = (
  props: ParameterInlineRendererProps
) => {
  return renderVariableWithIcon(
    props,
    'res/types/globalvar.png',
    'global variable'
  );
};
