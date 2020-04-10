// @flow
import { type ExpressionAutocompletion } from '../ExpressionAutocompletion';
import { type EnumeratedInstructionOrExpressionMetadata } from '../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { mapVector } from '../Utils/MapFor';

const makeFakeEnumeratedExpressionMetadata = (
  name: string,
  expressionMetadata: gdExpressionMetadata
): EnumeratedInstructionOrExpressionMetadata => ({
  type: name,
  name: name,
  displayedName: expressionMetadata.getFullName(),
  fullGroupName: expressionMetadata.getGroup(),
  iconFilename: expressionMetadata.getSmallIconFilename(),
  metadata: expressionMetadata,
  parameters: mapVector(
    expressionMetadata.getParameters(),
    parameterMetadata => parameterMetadata
  ),
  scope: {},
  isPrivate: false,
});

export const makeFakeExactExpressionAutocompletion = () => {
  const gd = global.gd;
  const expressionMetadata = new gd.ExpressionMetadata(
    'SomeExtension',
    'MyFunction',
    'My function',
    'Some description for this function, containing some parameters',
    'My group/sub group',
    'res/actions/replaceScene.png'
  );
  expressionMetadata.addParameter('objectList', 'Object', '', false);
  expressionMetadata.addParameter('objectvar', 'Object variable', '', false);
  expressionMetadata.addParameter('expression', 'Some number', '', false);
  expressionMetadata.addParameter('string', 'Some string', '', false);

  return [
    {
      kind: 'Expression',
      completion: 'MyFunction',
      addParenthesis: true,
      isExact: true,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunction',
        expressionMetadata
      ),
    },
  ];
};

export const makeFakeExpressionAutocompletions = (): Array<ExpressionAutocompletion> => {
  const gd = global.gd;

  const expressionMetadata = new gd.ExpressionMetadata(
    'SomeExtension',
    'MyFunction',
    'My function',
    'Some description for this function, containing some parameters',
    'My group/sub group',
    'res/actions/replaceScene.png'
  );
  expressionMetadata.addParameter('objectList', 'Object', '', false);
  expressionMetadata.addParameter('objectvar', 'Object variable', '', false);
  expressionMetadata.addParameter('expression', 'Some number', '', false);
  expressionMetadata.addParameter('string', 'Some string', '', false);

  const expressionWithoutParamsMetadata = new gd.ExpressionMetadata(
    'SomeExtension',
    'MyFunctionWithoutParams',
    'My function without params',
    'Some description for this function without parameters',
    'My group/sub group',
    'res/actions/replaceScene.png'
  );

  return [
    {
      kind: 'Object',
      completion: 'SomeObject',
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Object',
      completion: 'SomeOtherObject',
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Object',
      completion: 'SomeOtherObjectWithALoooooooooooongLoooooooooooongName',
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Behavior',
      completion: 'PlatformerObject',
      addNamespaceSeparator: true,
      isExact: false,
    },
    {
      kind: 'Behavior',
      completion: 'Physics2',
      addNamespaceSeparator: true,
      isExact: false,
    },
    {
      kind: 'Expression',
      completion: 'MyFunctionWithoutParams',
      addParenthesis: true,
      isExact: false,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunctionWithoutParams',
        expressionWithoutParamsMetadata
      ),
    },
    {
      kind: 'Expression',
      completion: 'MyFunction',
      addParenthesis: true,
      isExact: false,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunction',
        expressionMetadata
      ),
    },
  ];
};

export const getFakePopperJsAnchorElement = () => ({
  clientWidth: 100,
  clientHeight: 100,
  getBoundingClientRect: () => ({
    x: 45,
    y: 40,
    width: 100,
    height: 100,
    top: 40,
    right: 100 + 45,
    bottom: 100 + 40,
    left: 45,
  }),
});
