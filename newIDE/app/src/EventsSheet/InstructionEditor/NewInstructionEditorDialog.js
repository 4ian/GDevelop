// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import InstructionParametersEditor from './InstructionParametersEditor';
import InstructionOrObjectSelector, {
  type TabName,
} from './InstructionOrObjectSelector';
import { Column } from '../../UI/Grid';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from './InstructionOrExpressionSelector/CreateTree';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from './InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';
import InstructionOrExpressionSelector from './InstructionOrExpressionSelector';
import {
  enumerateObjectInstructions,
  enumerateInstructions,
  getObjectParameterIndex,
} from './InstructionOrExpressionSelector/EnumerateInstructions';
import HelpButton from '../../UI/HelpButton';
import Background from '../../UI/Background';
import { type EventsScope } from '../EventsScope.flow';
import { SelectColumns } from '../../UI/Reponsive/SelectColumns';
import {
  ResponsiveWidthMeasurer,
  type WidthType,
} from '../../UI/Reponsive/ResponsiveWidthMeasurer';
const gd = global.gd;

const styles = {
  fullHeightSelector: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

type StepName =
  | 'object-or-free-instructions'
  | 'object-instructions'
  | 'parameters';

type Props = {|
  project: gdProject,
  scope: EventsScope,
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
  step: StepName,
  chosenObjectName: ?string,
  chosenObjectInstructionsInfo: ?Array<EnumeratedInstructionOrExpressionMetadata>,
  chosenObjectInstructionsInfoTree: ?InstructionOrExpressionTreeNode,
  currentInstructionOrObjectSelectorTab: TabName,
|};

const findInstruction = (
  list: Array<EnumeratedInstructionOrExpressionMetadata>,
  instructionType: string
): ?EnumeratedInstructionOrExpressionMetadata => {
  return list.find(({ type }) => type === instructionType);
};

export default class NewInstructionEditorDialog extends React.Component<
  Props,
  State
> {
  state = this._getInitialState();
  _instructionParametersEditor: ?InstructionParametersEditor;

  _getInitialState(): State {
    const { isNewInstruction, isCondition, instruction } = this.props;

    if (!isNewInstruction) {
      // Check if the instruction is an object/behavior instruction. If yes
      // select the object, which is the first parameter of the instruction.
      const allInstructions = enumerateInstructions(isCondition);
      const instructionType: string = instruction.getType();
      const enumeratedInstructionMetadata = findInstruction(
        allInstructions,
        instructionType
      );
      if (
        enumeratedInstructionMetadata &&
        (enumeratedInstructionMetadata.scope.objectMetadata ||
          enumeratedInstructionMetadata.scope.behaviorMetadata)
      ) {
        const objectParameterIndex = getObjectParameterIndex(
          enumeratedInstructionMetadata.metadata
        );
        if (objectParameterIndex !== -1) {
          return {
            ...this._getChosenObjectState(
              instruction.getParameter(objectParameterIndex),
              false /* Even if the instruction is invalid for the object, show it as it's what we have already */
            ),
            step: isNewInstruction
              ? 'object-or-free-instructions'
              : 'parameters',
            currentInstructionOrObjectSelectorTab: 'objects',
          };
        }
      }
    }

    // We're either making a new instruction or editing a free instruction.
    return {
      chosenObjectName: null,
      chosenObjectInstructionsInfo: null,
      chosenObjectInstructionsInfoTree: null,
      step: isNewInstruction ? 'object-or-free-instructions' : 'parameters',
      currentInstructionOrObjectSelectorTab: isNewInstruction
        ? 'objects'
        : 'free-instructions',
    };
  }

  _chooseFreeInstruction = (type: string) => {
    const { instruction } = this.props;
    instruction.setType(type);
    this.setState(
      {
        chosenObjectName: null,
        chosenObjectInstructionsInfo: null,
        chosenObjectInstructionsInfoTree: null,
      },
      () => this._stepToParameters()
    );
  };

  _getChosenObjectState(
    objectName: string,
    discardInstructionTypeIfNotInObjectInstructions: boolean
  ): State {
    const {
      globalObjectsContainer,
      objectsContainer,
      isCondition,
      scope,
      instruction,
    } = this.props;

    const chosenObjectInstructionsInfo = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateObjectInstructions(
        isCondition,
        globalObjectsContainer,
        objectsContainer,
        objectName
      ),
      scope
    );

    // As we changed to a new object, verify if the instruction is still valid for this object. If not,
    // discard the chosen instruction - this is to avoid the user creating invalid instructions.
    if (
      instruction.getType() &&
      discardInstructionTypeIfNotInObjectInstructions
    ) {
      const instructionMetadata = findInstruction(
        chosenObjectInstructionsInfo,
        instruction.getType()
      );
      if (!instructionMetadata) {
        instruction.setType('');
      }
    }

    return {
      step: 'object-instructions',
      chosenObjectName: objectName,
      chosenObjectInstructionsInfo,
      chosenObjectInstructionsInfoTree: createTree(
        chosenObjectInstructionsInfo
      ),
      currentInstructionOrObjectSelectorTab: 'objects',
    };
  }

  _chooseObjectInstruction = (type: string) => {
    const { instruction } = this.props;
    instruction.setType(type);
    this._stepToParameters();
  };

  _stepBackFrom = (origin: StepName, width: WidthType) => {
    if (origin === 'parameters' && this.state.chosenObjectName) {
      return this.setState({
        // "medium" displays 2 columns, so "Back" button should go back to the first screen.
        step:
          width === 'medium'
            ? 'object-or-free-instructions'
            : 'object-instructions',
      });
    } else {
      return this.setState({
        step: 'object-or-free-instructions',
      });
    }
  };

  _stepToParameters = () => {
    this.setState(
      {
        step: 'parameters',
      },
      () => {
        if (this._instructionParametersEditor) {
          this._instructionParametersEditor.focus();
        }
      }
    );
  };

  // TODO: This was copied from InstructionParametersEditor. Move this to a helper
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

  _changeTab = (currentInstructionOrObjectSelectorTab: TabName) =>
    this.setState({
      currentInstructionOrObjectSelectorTab,
    });

  _forceUpdate = () => {
    this.forceUpdate(); /*Force update to ensure dialog is properly positioned*/
  };

  _chooseObject = (objectName: string) => {
    this.setState(this._getChosenObjectState(objectName, true));
  };

  render() {
    const {
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      onCancel,
      onSubmit,
      open,
      instruction,
      isCondition,
    } = this.props;
    const {
      step,
      chosenObjectName,
      chosenObjectInstructionsInfo,
      chosenObjectInstructionsInfoTree,
      currentInstructionOrObjectSelectorTab,
    } = this.state;
    const instructionType: string = instruction.getType();

    const instructionMetadata = this._getInstructionMetadata();
    const instructionHelpPage = instructionMetadata
      ? instructionMetadata.getHelpPath()
      : undefined;

    const renderInstructionOrObjectSelector = () => (
      <Background noFullHeight key="instruction-or-object-selector">
        <InstructionOrObjectSelector
          style={styles.fullHeightSelector}
          project={project}
          currentTab={currentInstructionOrObjectSelectorTab}
          onChangeTab={this._changeTab}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          isCondition={isCondition}
          chosenInstructionType={
            !chosenObjectName ? instructionType : undefined
          }
          onChooseInstruction={this._chooseFreeInstruction}
          chosenObjectName={chosenObjectName}
          onChooseObject={this._chooseObject}
          focusOnMount={!instructionType}
          onSearchStartOrReset={this._forceUpdate}
        />
      </Background>
    );

    const renderParameters = () => (
      <Column expand justifyContent="center" key="parameters">
        <InstructionParametersEditor
          project={project}
          scope={scope}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          objectName={chosenObjectName}
          isCondition={isCondition}
          instruction={instruction}
          resourceSources={this.props.resourceSources}
          onChooseResource={this.props.onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          ref={instructionParametersEditor =>
            (this._instructionParametersEditor = instructionParametersEditor)
          }
          focusOnMount={!!instructionType}
          noHelpButton
        />
      </Column>
    );

    const renderObjectInstructionSelector = () =>
      chosenObjectInstructionsInfoTree && chosenObjectInstructionsInfo ? (
        <InstructionOrExpressionSelector
          key="object-instruction-selector"
          style={styles.fullHeightSelector}
          instructionsInfo={chosenObjectInstructionsInfo}
          instructionsInfoTree={chosenObjectInstructionsInfoTree}
          iconSize={24}
          onChoose={this._chooseObjectInstruction}
          selectedType={instructionType}
          useSubheaders
          focusOnMount={!instructionType}
          searchPlaceholderObjectName={chosenObjectName}
          searchPlaceholderIsCondition={isCondition}
        />
      ) : null;

    return (
      <ResponsiveWidthMeasurer>
        {width => (
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
              width !== 'large' && step !== 'object-or-free-instructions' ? (
                <FlatButton
                  label={<Trans>Back</Trans>}
                  primary={false}
                  onClick={() => this._stepBackFrom(step, width)}
                  key="back"
                />
              ) : null,
              <HelpButton
                key="help"
                helpPagePath={instructionHelpPage || '/events'}
                label={
                  !instructionHelpPage ||
                  (width === 'small' ||
                    step === 'object-or-free-instructions') ? (
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
            maxWidth={false}
            noMargin
            flexRowBody
          >
            <SelectColumns
              columnsRenderer={{
                'instruction-or-object-selector': renderInstructionOrObjectSelector,
                'object-instruction-selector': renderObjectInstructionSelector,
                parameters: renderParameters,
              }}
              getColumns={() => {
                if (width === 'large') {
                  if (chosenObjectName) {
                    return [
                      'instruction-or-object-selector',
                      'object-instruction-selector',
                      'parameters',
                    ];
                  } else {
                    return ['instruction-or-object-selector', 'parameters'];
                  }
                } else if (width === 'medium') {
                  if (step === 'object-or-free-instructions') {
                    return ['instruction-or-object-selector'];
                  } else {
                    if (chosenObjectName) {
                      return ['object-instruction-selector', 'parameters'];
                    } else {
                      return ['parameters'];
                    }
                  }
                } else {
                  if (step === 'object-or-free-instructions') {
                    return ['instruction-or-object-selector'];
                  } else if (step === 'object-instructions') {
                    return ['object-instruction-selector'];
                  } else {
                    return ['parameters'];
                  }
                }
              }}
            />
          </Dialog>
        )}
      </ResponsiveWidthMeasurer>
    );
  }
}
