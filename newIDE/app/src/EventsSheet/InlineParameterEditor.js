// @flow
import * as React from 'react';
import InlinePopover from './InlinePopover';
import ParameterRenderingService from './ParameterRenderingService';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type EventsScope } from '../InstructionOrExpression/EventsScope.flow';
import { setupInstructionParameters } from '../InstructionOrExpression/SetupInstructionParameters';
import { getObjectParameterIndex } from '../InstructionOrExpression/EnumerateInstructions';
import { type ParameterFieldInterface } from './ParameterFields/ParameterFieldCommons';
import Drawer from '@material-ui/core/Drawer';
import { Column, Line } from '../UI/Grid';
import { isNativeMobileApp } from '../Utils/Platform';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from '../UI/MobileSoftKeyboard';
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,

  open: boolean,
  onRequestClose: () => void,
  onApply: () => void,
  onChange: string => void,

  instruction: ?gdInstruction,
  isCondition: boolean,
  parameterIndex: number,

  anchorEl: ?any,

  resourceManagementProps: ResourceManagementProps,
|};

const InlineParameterEditor = ({
  project,
  scope,
  globalObjectsContainer,
  objectsContainer,
  open,
  onRequestClose,
  onApply,
  onChange,
  instruction,
  isCondition,
  parameterIndex,
  anchorEl,
  resourceManagementProps,
}: Props) => {
  const [
    parameterMetadata,
    setParameterMetadata,
  ] = React.useState<?gdParameterMetadata>(null);
  const [
    instructionMetadata,
    setInstructionMetadata,
  ] = React.useState<?gdInstructionMetadata>(null);
  const [ParameterComponent, setParameterComponent] = React.useState(null);
  const field = React.useRef<?ParameterFieldInterface>(null);

  const softKeyboardBottomOffset = useSoftKeyboardBottomOffset();

  const unload = () => {
    setParameterMetadata(null);
    setInstructionMetadata(null);
    setParameterComponent(null);
  };

  const loadComponentFromInstruction = React.useCallback(
    () => {
      if (!instruction) return unload();

      const type = instruction.getType();
      const instructionMetadata = isCondition
        ? gd.MetadataProvider.getConditionMetadata(
            project.getCurrentPlatform(),
            type
          )
        : gd.MetadataProvider.getActionMetadata(
            project.getCurrentPlatform(),
            type
          );

      if (parameterIndex >= instructionMetadata.getParametersCount())
        return unload();

      const parameterMetadata = instructionMetadata.getParameter(
        parameterIndex
      );
      const ParameterComponent = ParameterRenderingService.getParameterComponent(
        parameterMetadata.getType()
      );
      setParameterComponent(ParameterComponent);
      setParameterMetadata(parameterMetadata);
      setInstructionMetadata(instructionMetadata);
      // Give a bit of time for the popover to mount itself
      setTimeout(() => {
        // We select the whole text when the inline field opens, for easier editing.
        if (field.current) field.current.focus({ selectAll: true });
      }, 10);
    },
    [instruction, isCondition, parameterIndex, project]
  );

  React.useEffect(
    () => {
      if (open && instruction) {
        loadComponentFromInstruction();
      }
    },
    [open, instruction, loadComponentFromInstruction]
  );

  const onParameterEdited = React.useCallback(
    () => {
      // When the parameter is done being edited, ensure the instruction parameters
      // are properly set up. For example, it's possible that the object name was
      // changed, and so the associated behavior should be updated.
      if (instruction && instructionMetadata) {
        const objectParameterIndex = getObjectParameterIndex(
          instructionMetadata
        );
        setupInstructionParameters(
          globalObjectsContainer,
          objectsContainer,
          instruction,
          instructionMetadata,
          objectParameterIndex !== -1
            ? instruction.getParameter(objectParameterIndex).getPlainString()
            : null
        );
      }

      onApply();
    },
    [
      instruction,
      instructionMetadata,
      onApply,
      objectsContainer,
      globalObjectsContainer,
    ]
  );

  if (
    !ParameterComponent ||
    !open ||
    !instruction ||
    !parameterMetadata ||
    !instructionMetadata
  )
    return null;

  const parameterComponent = (
    <ParameterComponent
      instruction={instruction}
      instructionMetadata={instructionMetadata}
      parameterMetadata={parameterMetadata}
      parameterIndex={parameterIndex}
      value={instruction.getParameter(parameterIndex).getPlainString()}
      onChange={onChange}
      onRequestClose={onRequestClose}
      onApply={onParameterEdited}
      project={project}
      scope={scope}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      key={instruction.ptr}
      ref={field}
      parameterRenderingService={ParameterRenderingService}
      isInline
      resourceManagementProps={resourceManagementProps}
    />
  );

  if (isNativeMobileApp()) {
    return (
      <Drawer
        anchor={'bottom'}
        open={true}
        onClose={onApply}
        transitionDuration={0}
        PaperProps={{
          style: {
            ...getAvoidSoftKeyboardStyle(softKeyboardBottomOffset),
            paddingBottom: 40,
            maxWidth: 600,
            margin: 'auto',
          },
        }}
      >
        <Column>
          <Line>{parameterComponent}</Line>
        </Column>
      </Drawer>
    );
  }

  return (
    <InlinePopover
      open={true}
      anchorEl={anchorEl}
      onRequestClose={onRequestClose}
      onApply={onParameterEdited}
    >
      {parameterComponent}
    </InlinePopover>
  );
};

export default InlineParameterEditor;
