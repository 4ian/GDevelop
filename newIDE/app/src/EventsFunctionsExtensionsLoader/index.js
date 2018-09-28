// @flow
import { mapVector } from '../Utils/MapFor';

const gd = global.gd;

export type EventsFunctionExtensionContext = {|
   project: gdProject,
   getIncludeFileFor: (functionName: string) => string,
   onFunctionGeneratedCode: (functionName: string, code: string) => void,
|};

export const generateEventsFunctionExtension = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  context: EventsFunctionExtensionContext
) => {
  const extension = new gd.PlatformExtension();

  extension.setExtensionInformation(
    eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getFullName(),
    eventsFunctionsExtension.getDescription(),
    '',
    '' //TODO
  );

  mapVector(
    extension.getEventsFunctions(),
    (eventsFunction: gdEventsFunction) => {
      const isCondition = false; //TODO
      const instruction = extension.addAction(
        eventsFunction.getName(),
        eventsFunction.getFullName(),
        eventsFunction.getDescription(),
        'TODO: Sentence',
        eventsFunction.getName(),
        'res/function.png',
        'res/function24.png'
      );

      mapVector(
        eventsFunction.getParameters(),
        (parameter: gdParameterMetadata) => {
          instruction.addParameter(
            parameter.getType(),
            parameter.getDescription(),
            parameter.getExtraInfo(),
            parameter.isOptional()
          );
        }
      );

      
      const code = gd.EventsCodeGenerator.generateEventsFunctionCode(
        context.project,
        eventsFunction.getParameters(),
        eventsFunction.getEvents(),
        true //TODO
      );
      context.onFunctionGeneratedCode(instruction.getName(), code);

      //TODO: code generation
      instruction
        .getCodeExtraInformation()
        .setIncludeFile(context.getIncludeFileFor(instruction.getName()))
        .setFunctionName('todoFunction'); //TODO: get namespace function
    }
  );

  return extension;
};
