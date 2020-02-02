// @flow
import Popover from '@material-ui/core/Popover';

import * as React from 'react';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import InstructionParametersEditor from './InstructionParametersEditor';
import InstructionOrObjectSelector, {
  type TabName,
} from './InstructionOrObjectSelector';
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
import { type EventsScope } from '../EventsScope.flow';
import { SelectColumns } from '../../UI/Reponsive/SelectColumns';

const gd = global.gd;

const styles = {
  fullHeightSelector: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
  },
};

type StepName = 'object-or-free-instructions' | 'object-instructions';

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
  anchorEl?: any,
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

// TODO move to utils
const setupInstruction = (
  instruction: gdInstruction,
  instructionMetadata: gdInstructionMetadata,
  objectName: ?string
) => {
  console.log(instruction, instructionMetadata, objectName);
  instruction.setParametersCount(instructionMetadata.getParametersCount());

  if (objectName) {
    const objectParameterIndex = getObjectParameterIndex(instructionMetadata);
    if (objectParameterIndex === -1) {
      console.error(
        `Instruction "${instructionMetadata.getFullName()}" is used for an object, but does not have an object as first parameter`
      );
      return;
    }

    instruction.setParameter(objectParameterIndex, objectName);
  }
};

export default class NewInstructionEditorMenu extends React.Component<
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
            step: 'object-or-free-instructions',
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
      step: 'object-or-free-instructions',
      currentInstructionOrObjectSelectorTab: isNewInstruction
        ? 'objects'
        : 'free-instructions',
    };
  }

  _chooseFreeInstruction = (type: string) => {
    const { instruction, onSubmit } = this.props;
    instruction.setType(type);
    this.setState(
      {
        chosenObjectName: null,
        chosenObjectInstructionsInfo: null,
        chosenObjectInstructionsInfoTree: null,
      },
      () => onSubmit()
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

  _onSubmitInstruction = () => {
    const { instruction, onSubmit } = this.props;
    const { chosenObjectName } = this.state;
    const instructionMetadata = this._getInstructionMetadata();
    if (instructionMetadata) {
      setupInstruction(instruction, instructionMetadata, chosenObjectName);
    }
    onSubmit();
  };

  _chooseObjectInstruction = (type: string) => {
    const { instruction } = this.props;
    const { chosenObjectName } = this.state;
    instruction.setType(type);
    this._chooseObject(chosenObjectName);
    this._onSubmitInstruction();
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
      globalObjectsContainer,
      objectsContainer,
      onCancel,
      open,
      instruction,
      isCondition,
      anchorEl,
    } = this.props;
    const {
      step,
      chosenObjectName,
      chosenObjectInstructionsInfo,
      chosenObjectInstructionsInfoTree,
      currentInstructionOrObjectSelectorTab,
    } = this.state;
    const instructionType: string = instruction.getType();

    const renderInstructionOrObjectSelector = () => (
      <InstructionOrObjectSelector
        key="instruction-or-object-selector"
        style={styles.fullHeightSelector}
        project={project}
        currentTab={currentInstructionOrObjectSelectorTab}
        onChangeTab={this._changeTab}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        isCondition={isCondition}
        chosenInstructionType={!chosenObjectName ? instructionType : undefined}
        onChooseInstruction={this._chooseFreeInstruction}
        chosenObjectName={chosenObjectName}
        onChooseObject={this._chooseObject}
        focusOnMount={!instructionType}
        onSearchStartOrReset={this._forceUpdate}
      />
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
      <Popover
        open={open}
        onClose={onCancel}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        style={{ opacity: 0.95 }}
      >
        <SelectColumns
          columnsRenderer={{
            'instruction-or-object-selector': renderInstructionOrObjectSelector,
            'object-instruction-selector': renderObjectInstructionSelector,
          }}
          getColumns={() => {
            if (step === 'object-or-free-instructions') {
              return ['instruction-or-object-selector'];
            } else if (step === 'object-instructions') {
              return ['object-instruction-selector'];
            }
          }}
        />
      </Popover>
    );
  }
}
