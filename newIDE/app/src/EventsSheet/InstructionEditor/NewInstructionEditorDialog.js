// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import InstructionParametersEditor from './InstructionParametersEditor';
import InstructionOrObjectSelector from './InstructionOrObjectSelector';
import { Column, Line } from '../../UI/Grid';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from './InstructionOrExpressionSelector/CreateTree';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import InstructionOrExpressionSelector from './InstructionOrExpressionSelector';
import { enumerateObjectInstructions } from './InstructionOrExpressionSelector/EnumerateInstructions';
import HelpButton from '../../UI/HelpButton';
import ScrollView from '../../UI/ScrollView';
const gd = global.gd;

const styles = {
  dialogContent: {
    width: 'calc(100% - 16px)',
    maxWidth: 'none',
  },
  dialogBody: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  instruction: gdInstruction,
  isCondition: boolean,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  style?: Object,
  isNewInstruction: boolean,
  onCancel: () => void,
  onSubmit: () => void,
  open: boolean,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
|};
type State = {|
  chosenObjectName: ?string,
  chosenObjectInstructionsInfo: ?Array<InstructionOrExpressionInformation>,
  chosenObjectInstructionsInfoTree: ?InstructionOrExpressionTreeNode,
|};

export default class NewInstructionEditorDialog extends React.Component<
  Props,
  State
> {
  state = {
    chosenObjectName: null,
    chosenObjectInstructionsInfo: null,
    chosenObjectInstructionsInfoTree: null,
  };
  _instructionParametersEditor: ?InstructionParametersEditor;

  _chooseInstruction = (type: string) => {
    const { instruction } = this.props;
    instruction.setType(type);
    this.forceUpdate(() => {
      if (this._instructionParametersEditor) {
        this._instructionParametersEditor.focus();
      }
    });
  };

  _chooseObject = (objectName: string) => {
    const {
      globalObjectsContainer,
      objectsContainer,
      isCondition,
    } = this.props;

    const chosenObjectInstructionsInfo = enumerateObjectInstructions(
      isCondition,
      globalObjectsContainer,
      objectsContainer,
      objectName
    );
    this.setState({
      chosenObjectName: objectName,
      chosenObjectInstructionsInfo,
      chosenObjectInstructionsInfoTree: createTree(
        chosenObjectInstructionsInfo
      ),
    });
  };

  _back = () => {
    this.props.instruction.setType('');
    if (this.state.chosenObjectName) {
      this.setState({
        chosenObjectName: null,
        chosenObjectInstructionsInfo: null,
        chosenObjectInstructionsInfoTree: null,
      });
    } else {
      this.forceUpdate();
    }
  }

  // TOOD: This was copied from InstructionParametersEditor. Move this to a helper
  // or pass it down.
  _getInstructionMetadata = (): ?gdInstructionMetadata => {
    const { instruction, isCondition, project } = this.props;
    const type = instruction.getType();
    if (!type) return null;

    return isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          project.getCurrentPlatform(),
          type
        )
      : gd.MetadataProvider.getActionMetadata(
          project.getCurrentPlatform(),
          type
        );
  };

  render() {
    const {
      project,
      layout,
      globalObjectsContainer,
      objectsContainer,
      onCancel,
      onSubmit,
      open,
      instruction,
      isCondition,
    } = this.props;
    const {
      chosenObjectName,
      chosenObjectInstructionsInfo,
      chosenObjectInstructionsInfoTree,
    } = this.state;
    const instructionType = instruction.getType();

    const instructionMetadata = this._getInstructionMetadata();
    const instructionHelpPage = instructionMetadata
      ? instructionMetadata.getHelpPath()
      : undefined;

    const isFirstStep = instructionType || chosenObjectName;

    return (
      <Dialog
        actions={[
          <FlatButton
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onCancel}
            key="cancel"
          />,
          <FlatButton
            label={<Trans>Ok</Trans>}
            primary={true}
            keyboardFocused={false}
            disabled={!instructionType}
            onClick={onSubmit}
            key="ok"
          />,
        ]}
        secondaryActions={[
          isFirstStep ? (
            <FlatButton
              label={<Trans>Back</Trans>}
              primary={false}
              onClick={this._back}
              key="back"
            />
          ) : null,
          <HelpButton
            key="help"
            helpPagePath={instructionHelpPage || '/events'}
            label={
              !instructionHelpPage ? (
                <Trans>Help</Trans>
              ) : this.props.isCondition ? (
                <Trans>Help for this condition</Trans>
              ) : (
                <Trans>Help for this action</Trans>
              )
            }
          />,
        ]}
        open={open}
        onRequestClose={onCancel}
        contentStyle={styles.dialogContent}
        bodyStyle={styles.dialogBody}
      >
        {!isFirstStep && (
          <Column expand noMargin>
            <InstructionOrObjectSelector
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // TODO
              project={project}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              isCondition={isCondition}
              selectedType={instructionType}
              onChooseInstruction={this._chooseInstruction}
              onChooseObject={this._chooseObject}
              focusOnMount={!instructionType}
            />
          </Column>
        )}
        {isFirstStep && (
          <Line expand noMargin>
            {chosenObjectName &&
              chosenObjectInstructionsInfoTree &&
              chosenObjectInstructionsInfo && (
                <ScrollView>
                  <InstructionOrExpressionSelector
                    instructionsInfo={chosenObjectInstructionsInfo}
                    instructionsInfoTree={chosenObjectInstructionsInfoTree}
                    iconSize={24}
                    onChoose={this._chooseInstruction}
                    selectedType={instructionType}
                    useSubheaders
                  />
                </ScrollView>
              )}
            <Column expand>
              <InstructionParametersEditor
                project={project}
                layout={layout}
                globalObjectsContainer={globalObjectsContainer}
                objectsContainer={objectsContainer}
                objectName={chosenObjectName}
                isCondition={isCondition}
                instruction={instruction}
                resourceSources={this.props.resourceSources}
                onChooseResource={this.props.onChooseResource}
                resourceExternalEditors={this.props.resourceExternalEditors}
                openInstructionOrExpression={
                  this.props.openInstructionOrExpression
                }
                ref={instructionParametersEditor =>
                  (this._instructionParametersEditor = instructionParametersEditor)
                }
                focusOnMount={instruction.getType()}
                noHelpButton
              />
            </Column>
          </Line>
        )}
      </Dialog>
    );
  }
}
