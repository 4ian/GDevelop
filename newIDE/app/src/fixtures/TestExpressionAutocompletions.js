// @flow
import { type ExpressionAutocompletion } from '../ExpressionAutocompletion';
import { type EnumeratedExpressionMetadata } from '../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { mapVector } from '../Utils/MapFor';

const makeNewFakeExtension = (gd: libGDevelop) => {
  const extension = new gd.PlatformExtension();
  extension.setExtensionInformation(
    'FakeExtensionForAutocompletionTests',
    'FakeExtensionForAutocompletionTests',
    'FakeExtensionForAutocompletionTests',
    'The extension author',
    'MIT'
  );
  return extension;
};

const makeFakeEnumeratedExpressionMetadata = (
  name: string,
  extension: gdPlatformExtension,
  expressionMetadata: gdExpressionMetadata
): EnumeratedExpressionMetadata => ({
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
  scope: { extension },
  isPrivate: false,
  isRelevantForLayoutEvents: true,
  isRelevantForFunctionEvents: true,
  isRelevantForAsynchronousFunctionEvents: true,
  isRelevantForCustomObjectEvents: true,
});

export const makeFakeExactExpressionAutocompletion = () => {
  const gd: libGDevelop = global.gd;
  const expressionMetadata = new gd.ExpressionMetadata(
    'number',
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

  const extension = makeNewFakeExtension(gd);

  return [
    {
      kind: 'Expression',
      completion: 'MyFunction',
      addParenthesis: true,
      isExact: true,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunction',
        extension,
        expressionMetadata
      ),
      shouldConvertToString: false,
    },
  ];
};

export const makeFakeExpressionAutocompletions = (): Array<ExpressionAutocompletion> => {
  const gd: libGDevelop = global.gd;

  const expressionMetadata = new gd.ExpressionMetadata(
    'number',
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
    'number',
    'SomeExtension',
    'MyFunctionWithoutParams',
    'My function without params',
    'Some description for this function without parameters',
    'My group/sub group',
    'res/actions/replaceScene.png'
  );

  const extension = makeNewFakeExtension(gd);

  return [
    {
      kind: 'Object',
      completion: 'SomeObject',
      objectConfiguration: null,
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Object',
      completion: 'SomeOtherObject',
      objectConfiguration: null,
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Object',
      completion: 'SomeOtherObjectWithALoooooooooooongLoooooooooooongName',
      objectConfiguration: null,
      addDot: true,
      isExact: false,
    },
    {
      kind: 'Behavior',
      completion: 'PlatformBehavior::PlatformerObjectBehavior',
      addNamespaceSeparator: true,
      isExact: false,
      behaviorType: '',
    },
    {
      kind: 'Behavior',
      completion: 'Physics2',
      addNamespaceSeparator: true,
      isExact: false,
      behaviorType: 'Physics2::Physics2Behavior',
    },
    {
      kind: 'Expression',
      completion: 'MyFunctionWithoutParams',
      addParenthesis: true,
      isExact: false,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunctionWithoutParams',
        extension,
        expressionWithoutParamsMetadata
      ),
      shouldConvertToString: false,
    },
    {
      kind: 'Expression',
      completion: 'MyFunction',
      addParenthesis: true,
      isExact: false,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunction',
        extension,
        expressionMetadata
      ),
      shouldConvertToString: false,
    },
    {
      kind: 'Expression',
      completion: 'MyFunctionThatShouldBeConvertedToString',
      addParenthesis: true,
      isExact: false,
      enumeratedExpressionMetadata: makeFakeEnumeratedExpressionMetadata(
        'MyFunction',
        extension,
        expressionMetadata
      ),
      shouldConvertToString: true,
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
