// @flow
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ExpressionParametersEditor from './ExpressionParametersEditor';
import Dialog from '../../../../UI/Dialog';

export type ParameterValues = Array<string>;

type Props = {
  project: Object,
  layout: Object,
  expressionMetadata: Object,
  onDone: ParameterValues => void,
  onRequestClose: () => void,
  open: boolean,
  parameterRenderingService: Object,
};

type State = {
  parameterValues: ParameterValues,
};

export default class ExpressionParametersEditorDialog extends Component<
  Props,
  State
> {
  state = {
    parameterValues: [],
  };

  componentWillMount() {
    this.setState({
      parameterValues: Array(
        this.props.expressionMetadata.getParametersCount()
      ).fill(''),
    });
  }

  render() {
    const {
      project,
      layout,
      expressionMetadata,
      parameterRenderingService,
    } = this.props;

    return (
      <Dialog
        open={this.props.open}
        actions={
          <FlatButton
            key="done"
            label="Done"
            primary
            onClick={() => this.props.onDone(this.state.parameterValues)}
          />
        }
        modal
        onRequestClose={this.props.onRequestClose}
        autoScrollBodyContent
      >
        <ExpressionParametersEditor
          project={project}
          layout={layout}
          expressionMetadata={expressionMetadata}
          parameterValues={this.state.parameterValues}
          onChangeParameter={(editedIndex, value) => {
            this.setState({
              parameterValues: this.state.parameterValues.map(
                (oldValue, index) => (index === editedIndex ? value : oldValue)
              ),
            });
          }}
          parameterRenderingService={parameterRenderingService}
        />
      </Dialog>
    );
  }
}
