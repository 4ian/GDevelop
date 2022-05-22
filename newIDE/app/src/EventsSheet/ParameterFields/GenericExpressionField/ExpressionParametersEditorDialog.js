// @flow
import { Trans } from '@lingui/macro';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';
import React, { Component } from 'react';
import FlatButton from '../../../UI/FlatButton';
import ExpressionParametersEditor from './ExpressionParametersEditor';
import Dialog from '../../../UI/Dialog';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';

export type ParameterValues = Array<string>;

const styles = {
  minHeightContainer: {
    // Use a minimum height that is large enough so that ExpressionSelector in
    // GenericExpressionField can fit and display entirely.
    minHeight: 300,
    flex: 1,
    flexDirection: 'column',
  },
};

type Props = {
  project?: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  expressionMetadata: gdExpressionMetadata,
  onDone: (ParameterValues) => void,
  onRequestClose: () => void,
  parameterRenderingService?: {
    components: any,
    getParameterComponent: (type: string) => any,
  },
};

type State = {
  parameterValues: ParameterValues,
};

export default class ExpressionParametersEditorDialog extends Component<
  Props,
  State
> {
  state = {
    parameterValues: Array(
      this.props.expressionMetadata.getParametersCount()
    ).fill(''),
  };

  render() {
    const {
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      expressionMetadata,
      parameterRenderingService,
    } = this.props;

    return (
      <Dialog
        title={<Trans>Enter the expression parameters</Trans>}
        cannotBeDismissed={true}
        open
        actions={[
          <FlatButton
            key="apply"
            label={<Trans>Apply</Trans>}
            primary
            onClick={() => this.props.onDone(this.state.parameterValues)}
          />,
        ]}
        noMargin
        onRequestClose={this.props.onRequestClose}
      >
        <Column>
          <div style={styles.minHeightContainer}>
            <Text>{expressionMetadata.getDescription()}</Text>
            <ExpressionParametersEditor
              project={project}
              scope={scope}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              expressionMetadata={expressionMetadata}
              parameterValues={this.state.parameterValues}
              onChangeParameter={(editedIndex, value) => {
                this.setState({
                  parameterValues: this.state.parameterValues.map(
                    (oldValue, index) =>
                      index === editedIndex ? value : oldValue
                  ),
                });
              }}
              parameterRenderingService={parameterRenderingService}
            />
          </div>
        </Column>
      </Dialog>
    );
  }
}
