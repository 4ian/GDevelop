// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import InstructionParametersEditor, {
  type InstructionParametersEditorInterface,
} from './InstructionParametersEditor';
import InstructionOrObjectSelector, {
  type TabName,
} from './InstructionOrObjectSelector';
import InstructionOrExpressionSelector from './InstructionOrExpressionSelector';
import HelpButton from '../../UI/HelpButton';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { SelectColumns } from '../../UI/Responsive/SelectColumns';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  useInstructionEditor,
  getInstructionMetadata,
} from './InstructionEditor';
import NewBehaviorDialog from '../../BehaviorsEditor/NewBehaviorDialog';
import useForceUpdate from '../../Utils/UseForceUpdate';
import getObjectByName from '../../Utils/GetObjectByName';
import {
  addBehaviorToObject,
  listObjectBehaviorsTypes,
} from '../../Utils/Behavior';
import ExtensionsSearchDialog from '../../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import { sendBehaviorAdded } from '../../Utils/Analytics/EventSender';
import { useShouldAutofocusInput } from '../../UI/Responsive/ScreenTypeMeasurer';
import ErrorBoundary from '../../UI/ErrorBoundary';

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
  resourceManagementProps: ResourceManagementProps,
  style?: Object,
  isNewInstruction: boolean,
  onCancel: () => void,
  onSubmit: () => void,
  open: boolean,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  i18n: I18nType,
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
const InstructionEditorDialog = ({
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
  resourceManagementProps,
  openInstructionOrExpression,
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
  const { isMobile, windowSize, isMediumScreen } = useResponsiveWindowSize();
  const isLargeScreen = windowSize === 'large' || windowSize === 'xlarge';
  const instructionType: string = instruction.getType();
  const [
    newBehaviorDialogOpen,
    setNewBehaviorDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    newExtensionDialogOpen,
    setNewExtensionDialogOpen,
  ] = React.useState<boolean>(false);
  const shouldAutofocusInput = useShouldAutofocusInput();

  // Handle the back button
  const stepBackFrom = (origin: StepName) => {
    if (origin === 'parameters' && chosenObjectName) {
      setStep(
        // "medium" displays 2 columns, so "Back" button should go back to the first screen.
        isMediumScreen ? 'object-or-free-instructions' : 'object-instructions'
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

  const onExtensionInstalled = (i18n: I18nType) => {
    setNewExtensionDialogOpen(false);
    freeInstructionComponentRef.current &&
      freeInstructionComponentRef.current.reEnumerateInstructions(i18n);
  };

  const instructionParametersEditor = React.useRef<?InstructionParametersEditorInterface>(
    null
  );
  // Focus the parameters when showing them
  React.useEffect(
    () => {
      if (shouldAutofocusInput && step === 'parameters') {
        if (instructionParametersEditor.current) {
          instructionParametersEditor.current.focus();
        }
      }
    },
    [step, shouldAutofocusInput]
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
    <I18n>
      {({ i18n }) => (
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
          chosenInstructionType={
            !chosenObjectName ? instructionType : undefined
          }
          onChooseInstruction={(instructionType: string) => {
            chooseInstruction(instructionType);
            setStep('parameters');
          }}
          chosenObjectName={chosenObjectName}
          onChooseObject={(chosenObjectName: string) => {
            chooseObject(chosenObjectName);
            setStep('object-instructions');
          }}
          focusOnMount={shouldAutofocusInput && !instructionType}
          onSearchStartOrReset={forceUpdate}
          onClickMore={() => setNewExtensionDialogOpen(true)}
          i18n={i18n}
        />
      )}
    </I18n>
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
      resourceManagementProps={resourceManagementProps}
      openInstructionOrExpression={openInstructionOrExpression}
      ref={instructionParametersEditor}
      focusOnMount={shouldAutofocusInput && !!instructionType}
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
        focusOnMount={shouldAutofocusInput && !instructionType}
        searchPlaceholderObjectName={chosenObjectName}
        searchPlaceholderIsCondition={isCondition}
        onClickMore={() => setNewBehaviorDialogOpen(true)}
        id="object-instruction-selector"
      />
    ) : null;

  return (
    <>
      <Dialog
        title={isCondition ? <Trans>Condition</Trans> : <Trans>Action</Trans>}
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
          (isMobile || isMediumScreen) &&
          step !== 'object-or-free-instructions' ? (
            <FlatButton
              label={<Trans>Back</Trans>}
              primary={false}
              onClick={() => stepBackFrom(step)}
              key="back"
            />
          ) : null,
          <HelpButton
            key="help"
            helpPagePath={instructionHelpPage || '/events'}
            label={
              !instructionHelpPage ||
              (isMobile || step === 'object-or-free-instructions') ? (
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
            if (isLargeScreen) {
              return [
                {
                  columnName: 'instruction-or-object-selector',
                },
                chosenObjectName
                  ? {
                      columnName: 'object-instruction-selector',
                    }
                  : null,
                {
                  columnName: 'parameters',
                  ratio: !chosenObjectName ? 2 : 1,
                },
              ].filter(Boolean);
            } else if (isMediumScreen) {
              if (step === 'object-or-free-instructions') {
                return [
                  {
                    columnName: 'instruction-or-object-selector',
                    ratio: 1,
                  },
                ];
              } else {
                return [
                  chosenObjectName
                    ? { columnName: 'object-instruction-selector' }
                    : null,
                  { columnName: 'parameters' },
                ].filter(Boolean);
              }
            } else {
              if (step === 'object-or-free-instructions') {
                return [
                  {
                    columnName: 'instruction-or-object-selector',
                  },
                ];
              } else if (step === 'object-instructions') {
                return [
                  {
                    columnName: 'object-instruction-selector',
                  },
                ];
              } else {
                return [
                  {
                    columnName: 'parameters',
                  },
                ];
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
        <I18n>
          {({ i18n }) => (
            <ExtensionsSearchDialog
              project={project}
              onClose={() => setNewExtensionDialogOpen(false)}
              onInstallExtension={() => {}}
              onExtensionInstalled={() => onExtensionInstalled(i18n)}
            />
          )}
        </I18n>
      )}
    </>
  );
};

const InstructionEditorDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Instruction editor</Trans>}
    scope="scene-events-instruction-editor"
    onClose={props.onCancel}
  >
    <InstructionEditorDialog {...props} />
  </ErrorBoundary>
);

export default InstructionEditorDialogWithErrorBoundary;
