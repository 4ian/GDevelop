// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import Popover from '@material-ui/core/Popover';
import * as React from 'react';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import {
  useInstructionEditor,
  getInstructionMetadata,
} from './InstructionEditor';
import InstructionOrObjectSelector, {
  type TabName,
} from './InstructionOrObjectSelector';
import InstructionOrExpressionSelector from './InstructionOrExpressionSelector';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { SelectColumns } from '../../UI/Responsive/SelectColumns';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { setupInstructionParameters } from '../../InstructionOrExpression/SetupInstructionParameters';
import TextButton from '../../UI/TextButton';
import Paste from '../../UI/CustomSvgIcons/Paste';
import { Column, Line } from '../../UI/Grid';

const styles = {
  fullHeightSelector: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    width: '400px',
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
  resourceManagementProps: ResourceManagementProps,
  style?: Object,
  anchorEl: ?HTMLElement,
  isNewInstruction: boolean,
  onCancel: () => void,
  onSubmit: () => void,
  open: boolean,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  i18n: I18nType,
  canPasteInstructions: boolean, // Unused
  onPasteInstructions: () => void, // Unused
|};

/**
 * An instruction editor in a popover.
 * Does not show the parameters for the instruction.
 */
const InstructionEditorMenu = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  onCancel,
  open,
  instruction,
  isCondition,
  isNewInstruction,
  anchorEl,
  scope,
  onSubmit,
  canPasteInstructions,
  onPasteInstructions,
  i18n,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [
    instructionEditorState,
    instructionEditorSetters,
  ] = useInstructionEditor({
    instruction,
    isCondition,
    project,
    isNewInstruction,
    scope,
    globalObjectsContainer,
    objectsContainer,
    i18n,
  });
  const {
    chosenObjectName,
    chosenObjectInstructionsInfo,
    chosenObjectInstructionsInfoTree,
  } = instructionEditorState;
  const {
    chooseInstruction,
    chooseObject,
    chooseObjectInstruction,
  } = instructionEditorSetters;
  // As we're in a context menu, always start from 'object-or-free-instructions' step and with 'objects' tab.
  const [step, setStep] = React.useState<StepName>(
    'object-or-free-instructions'
  );
  const [
    currentInstructionOrObjectSelectorTab,
    setCurrentInstructionOrObjectSelectorTab,
  ] = React.useState<TabName>('objects');
  const instructionType: string = instruction.getType();

  const submitInstruction = ({
    instruction,
    chosenObjectName,
  }: {
    instruction: gdInstruction,
    chosenObjectName: ?string,
  }) => {
    // Before submitting the instruction, ensure that we set the default
    // parameters, notably the object and behavior name.
    const instructionMetadata = getInstructionMetadata({
      instructionType: instruction.getType(),
      isCondition,
      project,
    });
    if (instructionMetadata) {
      setupInstructionParameters(
        globalObjectsContainer,
        objectsContainer,
        instruction,
        instructionMetadata,
        chosenObjectName
      );
    }
    onSubmit();
  };

  const renderInstructionOrObjectSelector = () => (
    <I18n>
      {({ i18n }) => (
        <InstructionOrObjectSelector
          key="instruction-or-object-selector"
          style={styles.fullHeightSelector}
          project={project}
          scope={scope}
          currentTab={currentInstructionOrObjectSelectorTab}
          onChangeTab={setCurrentInstructionOrObjectSelectorTab}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          isCondition={isCondition}
          chosenInstructionType={
            !chosenObjectName ? instructionType : undefined
          }
          onChooseInstruction={(instructionType: string) => {
            const { instruction, chosenObjectName } = chooseInstruction(
              instructionType
            );
            submitInstruction({ instruction, chosenObjectName });
          }}
          chosenObjectName={chosenObjectName}
          onChooseObject={chosenObjectName => {
            chooseObject(chosenObjectName);
            setStep('object-instructions');
          }}
          focusOnMount={!instructionType}
          onSearchStartOrReset={forceUpdate}
          i18n={i18n}
        />
      )}
    </I18n>
  );

  const renderObjectInstructionSelector = () =>
    chosenObjectInstructionsInfoTree && chosenObjectInstructionsInfo ? (
      <InstructionOrExpressionSelector
        key="object-instruction-selector"
        style={styles.fullHeightSelector}
        instructionsInfo={chosenObjectInstructionsInfo}
        instructionsInfoTree={chosenObjectInstructionsInfoTree}
        iconSize={24}
        onChoose={(instructionType: string) => {
          const { instruction, chosenObjectName } = chooseObjectInstruction(
            instructionType
          );
          submitInstruction({ instruction, chosenObjectName });
        }}
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
    >
      <Column>
        <Line>
          <SelectColumns
            columnsRenderer={{
              'instruction-or-object-selector': renderInstructionOrObjectSelector,
              'object-instruction-selector': renderObjectInstructionSelector,
            }}
            getColumns={() => {
              if (step === 'object-or-free-instructions') {
                return [
                  {
                    columnName: 'instruction-or-object-selector',
                  },
                ];
              } else {
                return [
                  {
                    columnName: 'object-instruction-selector',
                  },
                ];
              }
            }}
          />
        </Line>
        <Line noMargin justifyContent="flex-end">
          <TextButton
            label={
              isCondition ? (
                <Trans>Paste condition(s)</Trans>
              ) : (
                <Trans>Paste action(s)</Trans>
              )
            }
            icon={<Paste />}
            disabled={!canPasteInstructions}
            onClick={() => onPasteInstructions()}
          />
        </Line>
      </Column>
    </Popover>
  );
};

export default InstructionEditorMenu;
