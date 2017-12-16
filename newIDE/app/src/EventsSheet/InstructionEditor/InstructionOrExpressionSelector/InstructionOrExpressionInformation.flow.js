//@flow

export type InstructionOrExpressionInformation = {
  type: string,
  name?: string, //For expressions
  displayedName: string,
  fullGroupName: string,
  metadata: Object,
  parameters?: Array<any>,
  objectMetadata?: Object, //For expressions
  behaviorMetadata?: Object, //For expressions
};
