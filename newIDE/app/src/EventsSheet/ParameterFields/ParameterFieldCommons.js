// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type ParameterRenderingServiceType = {
  components: any,
  getParameterComponent: (type: string) => any,
  getUserFriendlyTypeName: (rawType: string) => ?MessageDescriptor,
};

type CommonProps = {|
  // The parameter
  parameterMetadata?: gdParameterMetadata,
  onChange: string => void,
  value: string,

  // Context
  project?: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  isInline?: boolean,
  onRequestClose?: () => void,
  onApply?: () => void,
  resourceManagementProps?: ResourceManagementProps,

  // Pass the ParameterRenderingService to allow to render nested parameters
  parameterRenderingService?: ParameterRenderingServiceType,

  // Other
  id?: string,
|};

export type ExpressionParameters = {|
  getParametersCount: () => number,
  getParameter: (index: number) => string,
|};

export type ParameterFieldProps = {|
  ...CommonProps,

  // Instruction in which the parameter is.
  instruction?: gdInstruction,
  // Metadata of the instruction in which the parameter is.
  instructionMetadata?: gdInstructionMetadata,
  // Expression in which the parameter is.
  expression?: ExpressionParameters,
  // Metadata of the instruction in which the parameter is.
  expressionMetadata?: gdExpressionMetadata,

  // The index of the parameter in the instruction or expression.
  parameterIndex?: number,
|};

export type FieldFocusFunction = (
  ?{|
    selectAll?: boolean,
    caretPosition?: 'end' | number | null,
  |}
) => void;

export type ParameterFieldInterface = {|
  focus: FieldFocusFunction,
|};

export const getParameterValueOrDefault = (
  value: string,
  parameterMetadata: ?gdParameterMetadata
) => {
  if (value) return value;

  const defaultValue =
    parameterMetadata && parameterMetadata.isOptional()
      ? parameterMetadata.getDefaultValue()
      : '';
  return defaultValue;
};
