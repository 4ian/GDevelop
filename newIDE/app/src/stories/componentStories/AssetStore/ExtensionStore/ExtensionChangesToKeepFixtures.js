// @flow
import { type SerializedExtension } from '../../../../Utils/GDevelopServices/Extension';

type FakeFunctionOptions = {|
  name: string,
  fullName: string,
  functionType?: string,
  sentence?: string,
  parameterNames?: Array<string>,
  calledInstructionTypes?: Array<string>,
  eventsCount?: number,
  isPrivate?: boolean,
|};

const createFunction = ({
  name,
  fullName,
  functionType = 'Action',
  sentence = '',
  parameterNames = [],
  calledInstructionTypes = [],
  eventsCount = 1,
  isPrivate,
}: FakeFunctionOptions) => ({
  name,
  private: isPrivate,
  fullName,
  functionType,
  sentence,
  description: '',
  parameters: parameterNames.map(parameterName => ({
    name: parameterName,
    type: 'expression',
    description: parameterName,
  })),
  events: Array.from({ length: eventsCount }, (_, index) => ({
    type: 'BuiltinCommonInstructions::Standard',
    conditions: ([]: Array<any>),
    actions: (index === 0 ? calledInstructionTypes : []).map(type => ({
      type: { value: type },
      parameters: ([]: Array<string>),
    })),
  })),
});

const createProperty = (name: string, type: string = 'Number') => ({
  name,
  type,
  value: '',
  label: name,
});

const createChild = (name: string, type: string = 'Sprite') => ({
  name,
  type,
});

const createLeaderboardExtension = ({
  version,
  previewIconUrl,
  description,
  functions,
  dialogFunctions,
  dialogProperties,
  childNames,
  globalVariableNames,
}: {|
  version: string,
  previewIconUrl: string,
  description: string,
  functions: Array<any>,
  dialogFunctions: Array<any>,
  dialogProperties: Array<any>,
  childNames: Array<string>,
  globalVariableNames: Array<string>,
|}): SerializedExtension => ({
  name: 'LeaderboardDialog',
  fullName: 'Leaderboard dialog',
  version,
  previewIconUrl,
  description,
  author: 'GDevelop',
  globalVariables: globalVariableNames.map(name => ({
    name,
    type: 'number',
    value: 0,
  })),
  sceneVariables: [],
  eventsFunctions: functions,
  eventsBasedBehaviors: [
    {
      name: 'ScoreCounter',
      fullName: 'Score counter',
      objectType: 'TextObject::Text',
      propertyDescriptors: [createProperty('Score'), createProperty('Speed')],
      eventsFunctions: [
        createFunction({
          name: 'doStepPreEvents',
          fullName: '',
          eventsCount: 2,
        }),
      ],
    },
  ],
  eventsBasedObjects: [
    {
      name: 'LeaderboardDialog',
      fullName: 'Leaderboard dialog',
      defaultName: 'LeaderboardDialog',
      eventsFunctions: dialogFunctions,
      propertyDescriptors: dialogProperties,
      objects: childNames.map(childName => createChild(childName)),
      instances: [],
      layers: [],
    },
  ],
});

/** A prefab with logic and assets, tweaked by a studio. */
export const leaderboardProjectExtension: SerializedExtension = createLeaderboardExtension(
  {
    version: '1.0.0',
    previewIconUrl: 'res/functions/extension_black.svg',
    description: 'A dialog to submit scores.',
    globalVariableNames: ['BestScore', 'StudioTheme'],
    functions: [
      createFunction({
        name: 'SubmitScore',
        fullName: 'Submit a score',
        sentence: 'Submit _PARAM1_ to the leaderboard',
        parameterNames: ['Score'],
      }),
      createFunction({
        name: 'FormatScore',
        fullName: 'Formatted score',
        functionType: 'StringExpression',
        parameterNames: ['Score'],
      }),
      createFunction({
        name: 'IsSubmitted',
        fullName: 'Score is submitted',
        functionType: 'Condition',
      }),
      createFunction({
        name: 'PlayStudioJingle',
        fullName: 'Play the studio jingle',
        sentence: 'Play the studio jingle',
        eventsCount: 3,
      }),
    ],
    dialogFunctions: [
      createFunction({ name: 'Open', fullName: 'Open', eventsCount: 4 }),
      createFunction({ name: 'Close', fullName: 'Close', eventsCount: 2 }),
    ],
    dialogProperties: [
      createProperty('LeaderboardId', 'String'),
      createProperty('ShowPlayerName', 'Boolean'),
    ],
    childNames: [
      'Panel',
      'Title',
      'ScoreLabel',
      'SubmitButton',
      'StudioLogo',
      'StudioBackground',
    ],
  }
);

/** The next version of the prefab, published by its author. */
export const leaderboardNewExtension: SerializedExtension = createLeaderboardExtension(
  {
    version: '1.1.0',
    previewIconUrl: 'res/functions/object2d_black.svg',
    description:
      'A dialog to submit scores to a leaderboard, with the name of the player and a medal for the best scores.',
    globalVariableNames: ['BestScore', 'MedalThreshold'],
    functions: [
      createFunction({
        name: 'SubmitScore',
        fullName: 'Submit a score',
        sentence: 'Submit _PARAM1_ of _PARAM2_ to the leaderboard',
        parameterNames: ['Score', 'PlayerName'],
        eventsCount: 2,
      }),
      createFunction({
        name: 'FormatScore',
        fullName: 'Formatted score',
        functionType: 'StringExpression',
        parameterNames: ['Score'],
        calledInstructionTypes: ['LeaderboardDialog::SubmitScore'],
        eventsCount: 3,
      }),
      createFunction({
        name: 'IsSubmitted',
        fullName: 'Score is submitted',
        functionType: 'ExpressionAndCondition',
        isPrivate: true,
      }),
      createFunction({
        name: 'HasMedal',
        fullName: 'Player has a medal',
        functionType: 'Condition',
      }),
    ],
    dialogFunctions: [
      createFunction({ name: 'Open', fullName: 'Open', eventsCount: 6 }),
      createFunction({ name: 'Close', fullName: 'Close', eventsCount: 2 }),
      createFunction({
        name: 'ShowMedal',
        fullName: 'Show the medal',
        eventsCount: 3,
      }),
    ],
    dialogProperties: [
      createProperty('LeaderboardId', 'String'),
      createProperty('ShowPlayerName', 'Boolean'),
      createProperty('MedalThreshold'),
    ],
    childNames: ['Panel', 'Title', 'ScoreLabel', 'SubmitButton', 'Medal'],
  }
);

const arrayFunctionNames = [
  ['IndexOf', 'Index of a number'],
  ['IndexOfStr', 'Index of a text'],
  ['LastIndexOf', 'Last index of a number'],
  ['LastIndexOfStr', 'Last index of a text'],
  ['RandomNumberInArray', 'Random number in an array'],
  ['RandomStringInArray', 'Random text in an array'],
  ['PopNumber', 'Remove the last number'],
  ['PopString', 'Remove the last text'],
  ['ShiftNumber', 'Remove the first number'],
  ['ShiftString', 'Remove the first text'],
  ['HasNumber', 'Array has a number'],
  ['HasString', 'Array has a text'],
  ['Slice', 'Slice an array'],
  ['Splice', 'Splice an array'],
  ['Shuffle', 'Shuffle an array'],
  ['SortNumbers', 'Sort numbers'],
  ['SortStrings', 'Sort texts'],
  ['Reverse', 'Reverse an array'],
  ['Join', 'Join texts'],
  ['Split', 'Split a text'],
];

const createArrayToolsExtension = (
  version: string,
  isNewVersion: boolean
): SerializedExtension => ({
  name: 'ArrayTools',
  fullName: 'Array tools',
  version,
  description: 'Functions to manipulate arrays.',
  globalVariables: [],
  sceneVariables: [],
  eventsFunctions: arrayFunctionNames.map(([name, fullName], index) =>
    createFunction({
      name,
      fullName,
      functionType: index % 3 === 0 ? 'Action' : 'ExpressionAndCondition',
      parameterNames:
        isNewVersion && index % 2 === 0
          ? ['Variable', 'Value', 'StartIndex']
          : ['Array', 'Value'],
      eventsCount: isNewVersion && index % 4 === 0 ? 3 : 1,
    })
  ),
  eventsBasedBehaviors: [],
  eventsBasedObjects: [],
});

/** An extension with many functions changed by the new version. */
export const arrayToolsProjectExtension: SerializedExtension = createArrayToolsExtension(
  '2.0.0',
  false
);
export const arrayToolsNewExtension: SerializedExtension = createArrayToolsExtension(
  '3.0.4',
  true
);
