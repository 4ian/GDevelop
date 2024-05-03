// @flow
import {
  getAutocompletionsFromDescriptions,
  insertAutocompletionInExpression,
} from '.';
const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

const makeTestContext = () => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const testLayout = project.insertNewLayout('Scene', 0);

  testLayout.insertNewLayer('Background', 0);
  testLayout.insertNewLayer('Foreground', 0);

  const object = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObject',
    0
  );
  const spriteConfiguration = gd.asSpriteConfiguration(
    object.getConfiguration()
  );
  const point = new gd.Point('Head');
  const sprite = new gd.Sprite();
  sprite.addPoint(point);
  const direction = new gd.Direction();
  direction.addSprite(sprite);
  const animation = new gd.Animation();
  animation.setName('Jump');
  animation.setDirectionsCount(1);
  animation.setDirection(direction, 0);
  spriteConfiguration.getAnimations().addAnimation(animation);

  const spriteObjectWithBehaviors = testLayout.insertNewObject(
    project,
    'Sprite',
    'MySpriteObjectWithBehaviors',
    0
  );
  spriteObjectWithBehaviors.addNewBehavior(
    project,
    'PlatformBehavior::PlatformerObjectBehavior',
    'PlatformerObject'
  );
  spriteObjectWithBehaviors.addNewBehavior(
    project,
    'DraggableBehavior::Draggable',
    'Draggable'
  );

  const parser = new gd.ExpressionParser2();

  return {
    project,
    testLayout,
    parser,
  };
};

describe('ExpressionAutocompletion', () => {
  describe('It can suggest autocompletion', () => {
    it('can autocomplete objects', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser.parseExpression('My').get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode,
        1
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toHaveLength(2);
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'MySpriteObjectWithBehaviors',
            addDot: true,
            kind: 'Object',
          }),
          expect.objectContaining({
            completion: 'MySpriteObject',
            addDot: true,
            kind: 'Object',
          }),
        ])
      );

      const expressionNode2 = parser.parseExpression('MySpriteObjectW').get();
      const completionDescriptions2 = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode2,
        1
      );
      const autocompletions2 = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions2,
        makeFakeI18n()
      );
      expect(autocompletions2).toHaveLength(1);
      expect(autocompletions2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'MySpriteObjectWithBehaviors',
            addDot: true,
            kind: 'Object',
          }),
        ])
      );
    });

    it('can autocomplete free expressions', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser.parseExpression('To').get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'string',
        expressionNode,
        1
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'ToDeg',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
          expect.objectContaining({
            completion: 'ToRad',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
          expect.objectContaining({
            completion: 'TouchX',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
          expect.objectContaining({
            completion: 'ToString',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: false,
          }),
        ])
      );
    });

    it('can autocomplete layer parameters', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser.parseExpression('MouseX("Ba').get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode,
        9
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: '"Background"',
            addParameterSeparator: true,
          }),
        ])
      );
    });

    it('can autocomplete object expressions', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser.parseExpression('MySpriteObject.Ani').get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'string',
        expressionNode,
        16
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'AnimationFrameCount',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
        ])
      );
    });

    it('can autocomplete behavior expressions directly from object', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser
        .parseExpression('MySpriteObjectWithBehaviors.Speed')
        .get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'string',
        expressionNode,
        'MySpriteObjectWithBehaviors.Speed'.length - 1
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'PlatformerObject::JumpSpeed',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
        ])
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'Animation::SpeedScale',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
        ])
      );
    });

    it('can autocomplete object points', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser
        .parseExpression('MySpriteObject.PointX("He')
        .get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode,
        24
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: '"Head"',
            addParameterSeparator: false,
          }),
        ])
      );
    });

    it('can autocomplete behaviors (1)', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser
        .parseExpression('MySpriteObjectWithBehaviors.Plat')
        .get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode,
        28
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'PlatformerObject',
            addNamespaceSeparator: true,
            isExact: false,
          }),
        ])
      );
    });

    it('can autocomplete behaviors (2)', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser
        .parseExpression('MySpriteObjectWithBehaviors.a')
        .get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'number',
        expressionNode,
        28
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'PlatformerObject',
            addNamespaceSeparator: true,
            isExact: false,
          }),
          expect.objectContaining({
            completion: 'PlatformerObject',
            addNamespaceSeparator: true,
            isExact: false,
          }),
        ])
      );
    });

    it('can autocomplete behavior expressions', () => {
      const { project, testLayout, parser } = makeTestContext();
      const scope = { project, layout: testLayout };

      const expressionNode = parser
        .parseExpression('MySpriteObjectWithBehaviors.PlatformerObject::Jum')
        .get();
      const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        testLayout
      );
      const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
        gd.JsPlatform.get(),
        projectScopedContainers,
        'string',
        expressionNode,
        47
      );
      const autocompletions = getAutocompletionsFromDescriptions(
        {
          gd,
          project: project,
          projectScopedContainers,
          scope,
        },
        completionDescriptions,
        makeFakeI18n()
      );
      expect(autocompletions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            completion: 'JumpSpeed',
            addParenthesis: true,
            isExact: false,
            shouldConvertToString: true,
          }),
        ])
      );
    });
  });

  describe('can insert autocompletion', () => {
    it('Check empty string/over limit.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '', caretLocation: 0 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 0,
            replacementEndPosition: 0,
          }
        )
      ).toMatchObject({ expression: 'HelloWorld' });
      expect(
        insertAutocompletionInExpression(
          { expression: '', caretLocation: 1 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 0,
            replacementEndPosition: 0,
          }
        )
      ).toMatchObject({ expression: 'HelloWorld' });
    });
    it('Check inserting suffixes.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addDot: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld.' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addNamespaceSeparator: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld::' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addParenthesis: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld()' });
    });
    it('Check already existing suffixes.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addDot: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld.' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello::', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addNamespaceSeparator: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld::' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello(', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
            addParenthesis: true,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld(' });
    });

    it('Check word limits.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 7 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld + 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 8 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld + 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 9 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld + 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 10 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld + 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 11 },
          {
            completion: 'HelloWorld',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + HelloWorld + 456' });
    });

    it('Check word limits with separators.', () => {
      // Check word limits with separators.
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello + 456', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 12,
          }
        )
      ).toMatchObject({ expression: '123 + Hello World+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello +456', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 12,
          }
        )
      ).toMatchObject({ expression: '123 + Hello World+456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello ++456', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 12,
          }
        )
      ).toMatchObject({ expression: '123 + Hello World++456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello ++456', caretLocation: 11 },
          {
            completion: 'World',
            replacementStartPosition: 6,
            replacementEndPosition: 11,
          }
        )
      ).toMatchObject({ expression: '123 + World ++456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.+ 456', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 12,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a+ 456', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a:+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World:+ 456' });
    });

    it('Check word limits with separators and suffixes.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a:+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addNamespaceSeparator: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World:+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a:+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addDot: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World.:+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a:+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addParenthesis: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World():+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a.+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addNamespaceSeparator: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World::.+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a.+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addDot: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World.+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a.+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addParenthesis: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World().+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a(+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addNamespaceSeparator: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World::(+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a(+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addDot: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World.(+ 456' });
      expect(
        insertAutocompletionInExpression(
          { expression: '123 + Hello.a(+ 456', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            addParenthesis: true,
          }
        )
      ).toMatchObject({ expression: '123 + Hello.World(+ 456' });
    });

    it('Check ToString conversion for simple insertions.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '', caretLocation: 0 },
          {
            completion: 'World',
            replacementStartPosition: 0,
            replacementEndPosition: 0,
            shouldConvertToString: false,
          }
        )
      ).toMatchObject({ expression: 'World' });
      // Check simple insertion.
      expect(
        insertAutocompletionInExpression(
          { expression: '', caretLocation: 0 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'ToString(World)' });
      expect(
        insertAutocompletionInExpression(
          { expression: '', caretLocation: 0 },
          {
            completion: 'World',
            replacementStartPosition: 0,
            replacementEndPosition: 0,
            addParenthesis: true,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'ToString(World())' });
    });
    it('Check ToString conversion wraps the whole expression.', () => {
      // Check that the beginning of the expression is wrapped in ToString.
      expect(
        insertAutocompletionInExpression(
          { expression: 'Object::w', caretLocation: 9 },
          {
            completion: 'World',
            replacementStartPosition: 8,
            replacementEndPosition: 9,
            addParenthesis: true,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'ToString(Object::World())' });
      expect(
        insertAutocompletionInExpression(
          { expression: 'Object.Behavior::w', caretLocation: 18 },
          {
            completion: 'World',
            replacementStartPosition: 17,
            replacementEndPosition: 18,
            addParenthesis: true,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'ToString(Object.Behavior::World())' });
      expect(
        insertAutocompletionInExpression(
          { expression: 'Object::', caretLocation: 8 },
          {
            completion: 'World',
            replacementStartPosition: 8,
            replacementEndPosition: 8,
            addParenthesis: true,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'ToString(Object::World())' });
    });
    it('Check ToString wraps only the autocompleted expression.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: 'Expression(w)', caretLocation: 12 },
          {
            completion: 'World',
            replacementStartPosition: 11,
            replacementEndPosition: 12,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'Expression(ToString(World))' });
      expect(
        insertAutocompletionInExpression(
          { expression: 'Expression()w', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'Expression()ToString(World)' });
      expect(
        insertAutocompletionInExpression(
          { expression: 'Expression(Parameter1,w)', caretLocation: 23 },
          {
            completion: 'World',
            replacementStartPosition: 22,
            replacementEndPosition: 23,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: 'Expression(Parameter1,ToString(World))' });
    });
    it('Check that ToString is added in the middle of the expression.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '"a" + Hello.a + "b"', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 12,
            replacementEndPosition: 13,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: '"a" + ToString(Hello.World) + "b"' });
      expect(
        insertAutocompletionInExpression(
          { expression: '"a" +Hello.a+ "b"', caretLocation: 13 },
          {
            completion: 'World',
            replacementStartPosition: 11,
            replacementEndPosition: 12,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: '"a" +ToString(Hello.World)+ "b"' });
      expect(
        insertAutocompletionInExpression(
          { expression: '"a" + Object:: + "b"', caretLocation: 14 },
          {
            completion: 'World',
            replacementStartPosition: 14,
            replacementEndPosition: 14,
            addParenthesis: true,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: '"a" + ToString(Object::World()) + "b"' });
    });
    it('Check insertion of ToString with existing suffix.', () => {
      expect(
        insertAutocompletionInExpression(
          { expression: '"123" + Hello.a:+ "456"', caretLocation: 15 },
          {
            completion: 'World',
            replacementStartPosition: 14,
            replacementEndPosition: 15,
            shouldConvertToString: true,
          }
        )
      ).toMatchObject({ expression: '"123" + ToString(Hello.World):+ "456"' });
    });
  });
});
