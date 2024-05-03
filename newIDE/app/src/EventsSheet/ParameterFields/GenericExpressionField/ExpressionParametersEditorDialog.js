// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';
import ExpressionParametersEditor from './ExpressionParametersEditor';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import HelpButton from '../../../UI/HelpButton';

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
  onDone: ParameterValues => void,
  onRequestClose: () => void,
  parameterRenderingService?: {
    components: any,
    getParameterComponent: (type: string) => any,
  },
};

const ExpressionParametersEditorDialog = ({
  project,
  scope,
  onDone,
  onRequestClose,
  globalObjectsContainer,
  objectsContainer,
  expressionMetadata,
  parameterRenderingService,
}: Props) => {
  const [parameterValues, setParameterValues] = React.useState<Array<string>>(
    Array(expressionMetadata.getParametersCount()).fill('')
  );

  return (
    <Dialog
      title={<Trans>Enter the expression parameters</Trans>}
      id="expression-parameters-editor-dialog"
      open
      actions={[
        <DialogPrimaryButton
          id="apply-button"
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          onClick={() => onDone(parameterValues)}
        />,
      ]}
      secondaryActions={
        expressionMetadata.getHelpPath()
          ? [
              <HelpButton
                key="help-button"
                helpPagePath={expressionMetadata.getHelpPath()}
              />,
            ]
          : []
      }
      onRequestClose={onRequestClose}
      onApply={() => onDone(parameterValues)}
    >
      <Column noMargin>
        <div style={styles.minHeightContainer}>
          <Text>{expressionMetadata.getDescription()}</Text>
          <ExpressionParametersEditor
            project={project}
            scope={scope}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            expressionMetadata={expressionMetadata}
            parameterValues={parameterValues}
            onChangeParameter={(editedIndex, value) => {
              setParameterValues(
                parameterValues.map((oldValue, index) =>
                  index === editedIndex ? value : oldValue
                )
              );
            }}
            parameterRenderingService={parameterRenderingService}
          />
        </div>
      </Column>
    </Dialog>
  );
};

export default ExpressionParametersEditorDialog;
