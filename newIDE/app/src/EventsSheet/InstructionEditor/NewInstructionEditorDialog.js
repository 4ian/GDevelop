// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import InstructionParametersEditor, {
  type InstructionParametersEditorInterface,
} from './InstructionParametersEditor';
import InstructionOrObjectSelector, {
  type TabName,
} from './InstructionOrObjectSelector';
import InstructionOrExpressionSelector from './InstructionOrExpressionSelector';
import HelpButton from '../../UI/HelpButton';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { SelectColumns } from '../../UI/Reponsive/SelectColumns';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  useNewInstructionEditor,
  getInstructionMetadata,
} from './NewInstructionEditor';
import NewBehaviorDialog from '../../BehaviorsEditor/NewBehaviorDialog';
import useForceUpdate from '../../Utils/UseForceUpdate';
import getObjectByName from '../../Utils/GetObjectByName';
import {
  addBehaviorToObject,
  listObjectBehaviorsTypes,
} from '../../Utils/Behavior';
import ExtensionsSearchDialog from '../../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import { sendBehaviorAdded } from '../../Utils/Analytics/EventSender';

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
  anchorEl?: any, // Unused
  canPasteInstructions: boolean, // Unused
  onPasteInstructions: () => void, // Unused
|};

const getInitialStepName = (isNewInstruction: boolean): StepName => {
  if (isNewInstruction) return 'object-or-free-instructions';
  return 'parameters';
};

const getInitialTab = (
  isNewInstruction: boolean,
  hasObjectChosen: boolean
): TabName => {
  if (isNewInstruction) return 'objects';
  return hasObjectChosen ? 'objects' : 'free-instructions';
};

/**
 * A responsive instruction editor in a dialog, showing InstructionParametersEditor
 * at the end.
 */
export default function NewInstructionEditorDialog({
  project,
  globalObjectsContainer,
  objectsContainer,
  onCancel,
  open,
  instruction,
  isCondition,
  isNewInstruction,
  scope,
  onSubmit,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
  openInstructionOrExpression,
}: Props) {
  const forceUpdate = useForceUpdate();
  const [
    newInstructionEditorState,
    newInstructionEditorSetters,
  ] = useNewInstructionEditor({
    instruction,
    isCondition,
    project,
    isNewInstruction,
    scope,
    globalObjectsContainer,
    objectsContainer,
  });
  const {
    chosenObjectName,
    chosenObjectInstructionsInfo,
    chosenObjectInstructionsInfoTree,
  } = newInstructionEditorState;
  const {
    chooseInstruction,
    chooseObject,
    chooseObjectInstruction,
  } = newInstructionEditorSetters;
  const hasObjectChosen =
    !!chosenObjectInstructionsInfo && !!chosenObjectInstructionsInfoTree;
  const chosenObject = chosenObjectName
    ? getObjectByName(project, scope.layout, chosenObjectName)
    : null;
  const freeInstructionComponentRef = React.useRef<?InstructionOrObjectSelector>(
    null
  );
  const [step, setStep] = React.useState(() =>
    getInitialStepName(isNewInstruction)
  );
  const [
    currentInstructionOrObjectSelectorTab,
    setCurrentInstructionOrObjectSelectorTab,
  ] = React.useState(() => getInitialTab(isNewInstruction, hasObjectChosen));
  const windowWidth = useResponsiveWindowWidth();
  const instructionType: string = instruction.getType();
  const [
    newBehaviorDialogOpen,
    setNewBehaviorDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    newExtensionDialogOpen,
    setNewExtensionDialogOpen,
  ] = React.useState<boolean>(false);

  // Handle the back button
  const stepBackFrom = (origin: StepName, windowWidth: WidthType) => {
    if (origin === 'parameters' && chosenObjectName) {
      setStep(
        // "medium" displays 2 columns, so "Back" button should go back to the first screen.
        windowWidth === 'medium'
          ? 'object-or-free-instructions'
          : 'object-instructions'
      );
    } else {
      setStep('object-or-free-instructions');
    }
  };

  const addBehavior = (type: string, defaultName: string) => {
    if (!chosenObject) return;

    const wasBehaviorAdded = addBehaviorToObject(
      project,
      chosenObject,
      type,
      defaultName
    );

    if (wasBehaviorAdded) {
      setNewBehaviorDialogOpen(false);
      sendBehaviorAdded({
        behaviorType: type,
        parentEditor: 'instruction-editor-dialog',
      });
    }

    // Re-choose the same object to force recomputation of chosenObjectInstructionsInfoTree
    // This is not done automatically because a change in the object behaviors
    // is not detected by React at this level.
    chooseObject(chosenObject.getName());
  };

  const onExtensionInstalled = () => {
    setNewExtensionDialogOpen(false);
    freeInstructionComponentRef.current &&
      freeInstructionComponentRef.current.reEnumerateInstructions();
  };

  // Focus the parameters when showing them
  const instructionParametersEditor = React.useRef<?InstructionParametersEditorInterface>(
    null
  );
  React.useEffect(
    () => {
      if (step === 'parameters') {
        if (instructionParametersEditor.current) {
          instructionParametersEditor.current.focus();
        }
      }
    },
    [step]
  );

  const instructionMetadata = getInstructionMetadata({
    instructionType,
    isCondition,
    project,
  });
  const instructionHelpPage = instructionMetadata
    ? instructionMetadata.getHelpPath()
    : undefined;

  const renderInstructionOrObjectSelector = () => (
    <InstructionOrObjectSelector
      key="instruction-or-object-selector"
      style={styles.fullHeightSelector}
      project={project}
      scope={scope}
      ref={freeInstructionComponentRef}
      currentTab={currentInstructionOrObjectSelectorTab}
      onChangeTab={setCurrentInstructionOrObjectSelectorTab}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      isCondition={isCondition}
      chosenInstructionType={!chosenObjectName ? instructionType : undefined}
      onChooseInstruction={(instructionType: string) => {
        chooseInstruction(instructionType);
        setStep('parameters');
      }}
      chosenObjectName={chosenObjectName}
      onChooseObject={(chosenObjectName: string) => {
        chooseObject(chosenObjectName);
        setStep('object-instructions');
      }}
      focusOnMount={!instructionType}
      onSearchStartOrReset={forceUpdate}
      onClickMore={() => setNewExtensionDialogOpen(true)}
    />
  );

  const renderParameters = () => (
    <InstructionParametersEditor
      key="parameters"
      project={project}
      scope={scope}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      objectName={chosenObjectName}
      isCondition={isCondition}
      instruction={instruction}
      resourceSources={resourceSources}
      onChooseResource={onChooseResource}
      resourceExternalEditors={resourceExternalEditors}
      openInstructionOrExpression={openInstructionOrExpression}
      ref={instructionParametersEditor}
      focusOnMount={!!instructionType}
      noHelpButton
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
        onChoose={(instructionType: string) => {
          chooseObjectInstruction(instructionType);
          setStep('parameters');
        }}
        selectedType={instructionType}
        useSubheaders
        focusOnMount={!instructionType}
        searchPlaceholderObjectName={chosenObjectName}
        searchPlaceholderIsCondition={isCondition}
        onClickMore={() => setNewBehaviorDialogOpen(true)}
        id="object-instruction-selector"
      />
    ) : null;

  return (
    <>
      <Dialog
        actions={[
          <FlatButton
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onCancel}
            key="cancel"
          />,
          <DialogPrimaryButton
            label={<Trans>Ok</Trans>}
            primary={true}
            disabled={!instructionType}
            onClick={onSubmit}
            key="ok"
            id="ok-button"
          />,
        ]}
        secondaryActions={[
          windowWidth !== 'large' && step !== 'object-or-free-instructions' ? (
            <FlatButton
              label={<Trans>Back</Trans>}
              primary={false}
              onClick={() => stepBackFrom(step, windowWidth)}
              key="back"
            />
          ) : null,
          <HelpButton
            key="help"
            helpPagePath={instructionHelpPage || '/events'}
            label={
              !instructionHelpPage ||
              (windowWidth === 'small' ||
                step === 'object-or-free-instructions') ? (
                <Trans>Help</Trans>
              ) : isCondition ? (
                <Trans>Help for this condition</Trans>
              ) : (
                <Trans>Help for this action</Trans>
              )
            }
          />,
        ]}
        open={open}
        onRequestClose={onCancel}
        onApply={instructionType ? onSubmit : null}
        maxWidth={false}
        noMargin
        flexBody
        fullHeight={
          true /* Always use full height to avoid a very small dialog when there are not a lot of objects. */
        }
        id="instruction-editor-dialog"
      >
        <SelectColumns
          columnsRenderer={{
            'instruction-or-object-selector': renderInstructionOrObjectSelector,
            'object-instruction-selector': renderObjectInstructionSelector,
            parameters: renderParameters,
          }}
          getColumns={() => {
            if (windowWidth === 'large') {
              if (chosenObjectName) {
                return [
                  'instruction-or-object-selector',
                  'object-instruction-selector',
                  'parameters',
                ];
              } else {
                return ['instruction-or-object-selector', 'parameters'];
              }
            } else if (windowWidth === 'medium') {
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
      {newBehaviorDialogOpen && chosenObject && (
        <NewBehaviorDialog
          project={project}
          eventsFunctionsExtension={scope.eventsFunctionsExtension}
          open={newBehaviorDialogOpen}
          objectType={chosenObject.getType()}
          objectBehaviorsTypes={listObjectBehaviorsTypes(chosenObject)}
          onClose={() => setNewBehaviorDialogOpen(false)}
          onChoose={addBehavior}
        />
      )}
      {newExtensionDialogOpen && (
        <ExtensionsSearchDialog
          project={project}
          onClose={() => setNewExtensionDialogOpen(false)}
          onInstallExtension={() => {}}
          onExtensionInstalled={onExtensionInstalled}
        />
      )}
    </>
  );
}
