const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('MetadataDeclarationHelper', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('can create metadata for free actions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventFunction.setFunctionType(gd.EventsFunction.Action);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllActions().has('MyFunction')).toBe(true);
    const action = extension.getAllActions().get('MyFunction');
    expect(action.getFullName()).toBe('My function');
    expect(action.getDescription()).toBe('My function description.');
    expect(action.getSentence()).toBe('My function sentence');

    extension.delete();
    project.delete();
  });

  it('can create metadata for free actions with an underscore and unicode characters', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'My🧩Extension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction(
      'My_📝Function',
      0
    );
    eventFunction.setFunctionType(gd.EventsFunction.Action);

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllActions().has('My_📝Function')).toBe(true);
    const action = extension.getAllActions().get('My_📝Function');
    expect(action.getFunctionName()).toBe(
      'gdjs.evtsExt__My_129513Extension__My__128221Function.func'
    );

    extension.delete();
    project.delete();
  });

  it('can create metadata for free conditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventFunction.setFunctionType(gd.EventsFunction.Condition);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllConditions().has('MyFunction')).toBe(true);
    const condition = extension.getAllConditions().get('MyFunction');
    expect(condition.getFullName()).toBe('My function');
    expect(condition.getDescription()).toBe('My function description.');
    expect(condition.getSentence()).toBe('My function sentence');

    extension.delete();
    project.delete();
  });

  it('can create metadata for free expressions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventFunction.setFunctionType(gd.EventsFunction.Expression);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllExpressions().has('MyFunction')).toBe(true);
    const expression = extension.getAllExpressions().get('MyFunction');
    expect(expression.getFullName()).toBe('My function');
    expect(expression.getDescription()).toBe('My function description.');

    extension.delete();
    project.delete();
  });

  it('can create metadata for free ExpressionAndConditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction('Value', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    eventFunction.setFullName('Some value');
    eventFunction.setDescription('some value.');
    eventFunction.setSentence('some value');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllExpressions().has('Value')).toBe(true);
    const expression = extension.getAllExpressions().get('Value');
    expect(expression.getFullName()).toBe('Some value');
    expect(expression.getDescription()).toBe('Return some value.');

    expect(extension.getAllConditions().has('Value')).toBe(true);
    const condition = extension.getAllConditions().get('Value');
    expect(condition.getFullName()).toBe('Some value');
    expect(condition.getDescription()).toBe('Compare some value.');
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe('Some value _PARAM1_ _PARAM2_');

    extension.delete();
    project.delete();
  });

  it('can create metadata for free ExpressionAndConditions without description', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventFunction = eventExtension.insertNewEventsFunction('Value', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    eventFunction.setFullName('');
    eventFunction.setDescription('');
    eventFunction.setSentence('');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllExpressions().has('Value')).toBe(true);
    const expression = extension.getAllExpressions().get('Value');
    expect(expression.getFullName()).toBe('Value');
    expect(expression.getDescription()).toBe('Return .');

    expect(extension.getAllConditions().has('Value')).toBe(true);
    const condition = extension.getAllConditions().get('Value');
    expect(condition.getFullName()).toBe('Value');
    // TODO The full name could be used when the description is not set.
    expect(condition.getDescription()).toBe('Compare .');
    // TODO The full name could be used when the sentence is not set.
    expect(condition.getSentence()).toBe(' _PARAM1_ _PARAM2_');

    extension.delete();
    project.delete();
  });

  it('can create metadata for free ActionWithOperator', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );

    const getter = eventExtension.insertNewEventsFunction('Value', 0);
    getter.setFunctionType(gd.EventsFunction.ExpressionAndConditions);
    getter.setFullName('Some value');
    getter.setDescription('some value.');
    getter.setSentence('some value');

    const eventFunction = eventExtension.insertNewEventsFunction('SetValue', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ActionWithOperator);
    eventFunction.setGetterName('Value');

    const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventExtension,
      eventFunction
    );
    metadataDeclarationHelper.delete();

    expect(extension.getAllActions().has('SetValue')).toBe(true);
    const action = extension.getAllActions().get('SetValue');
    expect(action.getFullName()).toBe('Some value');
    expect(action.getDescription()).toBe('Change some value.');
    expect(action.getSentence()).toBe('Change some value: _PARAM1_ _PARAM2_');

    extension.delete();
    project.delete();
  });

  const checkBehaviorDefaultParameters = (instructionOrExpression) => {
    expect(instructionOrExpression.getParameter(0).getType()).toBe('object');
    expect(instructionOrExpression.getParameter(1).getType()).toBe('behavior');
    expect(instructionOrExpression.getParameter(1).getExtraInfo()).toBe(
      'MyExtension::MyBehavior'
    );
    const last = instructionOrExpression.getParametersCount() - 1;
    expect(instructionOrExpression.getParameter(last).getType()).toBe(
      'eventsFunctionContext'
    );
    expect(instructionOrExpression.getParameter(last).isCodeOnly()).toBe(true);
  };

  it('can create metadata for behavior actions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const eventFunction = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Action);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventExtension,
      eventBehavior
    );

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(behaviorMetadata.getAllActions().has('MyBehavior::MyFunction')).toBe(
      true
    );
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::MyFunction');
    expect(action.getFullName()).toBe('My function');
    expect(action.getDescription()).toBe('My function description.');
    expect(action.getSentence()).toBe('My function sentence');

    expect(action.getParametersCount()).toBe(3);
    checkBehaviorDefaultParameters(action);

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior conditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const eventFunction = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Condition);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventExtension,
      eventBehavior
    );

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::MyFunction')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::MyFunction');
    expect(condition.getFullName()).toBe('My function');
    expect(condition.getDescription()).toBe('My function description.');
    expect(condition.getSentence()).toBe('My function sentence');

    expect(condition.getParametersCount()).toBe(3);
    checkBehaviorDefaultParameters(condition);

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior expressions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const eventFunction = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Expression);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventExtension,
      eventBehavior
    );

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(behaviorMetadata.getAllExpressions().has('MyFunction')).toBe(true);
    const expression = behaviorMetadata.getAllExpressions().get('MyFunction');
    expect(expression.getFullName()).toBe('My function');
    expect(expression.getDescription()).toBe('My function description.');

    expect(expression.getParametersCount()).toBe(3);
    checkBehaviorDefaultParameters(expression);

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior ExpressionAndConditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const eventFunction = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('Value', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    eventFunction.setFullName('Some value');
    eventFunction.setDescription('some value.');
    eventFunction.setSentence('some value');
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventExtension,
      eventBehavior
    );

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(behaviorMetadata.getAllExpressions().has('Value')).toBe(true);
    const expression = behaviorMetadata.getAllExpressions().get('Value');
    expect(expression.getFullName()).toBe('Some value');
    expect(expression.getDescription()).toBe('Return some value.');

    expect(expression.getParametersCount()).toBe(3);
    checkBehaviorDefaultParameters(expression);

    expect(behaviorMetadata.getAllConditions().has('MyBehavior::Value')).toBe(
      true
    );
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::Value');
    expect(condition.getFullName()).toBe('Some value');
    expect(condition.getDescription()).toBe('Compare some value.');
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe(
      'Some value of _PARAM0_ _PARAM2_ _PARAM3_'
    );

    expect(condition.getParametersCount()).toBe(5);
    checkBehaviorDefaultParameters(condition);
    expect(condition.getParameter(2).getType()).toBe('relationalOperator');
    expect(condition.getParameter(3).getType()).toBe('expression');

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior ActionWithOperator', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    const getter = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('Value', 0);
    getter.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    getter.setFullName('Some value');
    getter.setDescription('some value.');
    getter.setSentence('some value');

    const eventFunction = eventBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('SetValue', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ActionWithOperator);
    eventFunction.setGetterName('Value');

    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventExtension,
      eventBehavior
    );

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(behaviorMetadata.getAllActions().has('MyBehavior::SetValue')).toBe(
      true
    );
    const action = behaviorMetadata.getAllActions().get('MyBehavior::SetValue');
    expect(action.getFullName()).toBe('Some value');
    expect(action.getDescription()).toBe('Change some value.');
    expect(action.getSentence()).toBe(
      'Change some value of _PARAM0_: _PARAM2_ _PARAM3_'
    );

    expect(action.getParametersCount()).toBe(5);
    checkBehaviorDefaultParameters(action);
    expect(action.getParameter(2).getType()).toBe('operator');
    expect(action.getParameter(3).getType()).toBe('expression');

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior string property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    // Required behavior don't generate any instruction.
    // It covers a mutant from "continue" to "return".
    const requiredBehavior = eventBehavior
      .getPropertyDescriptors()
      .insertNew('RequiredBehavior', 0);
    requiredBehavior.setType('Behavior');

    const property = eventBehavior
      .getPropertyDescriptors()
      .insertNew('Value', 0);
    property.setLabel('Some value');

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllActions().has('MyBehavior::SetPropertyValue')
    ).toBe(true);
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::SetPropertyValue');
    expect(action.getFullName()).toBe('Some value property');
    expect(action.getDescription()).toBe(
      'Change the property value for the some value.'
    );
    expect(action.getSentence()).toBe(
      'Change the property value for the some value of _PARAM0_: _PARAM2_ _PARAM3_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(4);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(1).getType()).toBe('behavior');
    expect(action.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(action.getParameter(2).getType()).toBe('operator');
    expect(action.getParameter(3).getType()).toBe('string');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::PropertyValue')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::PropertyValue');
    expect(condition.getFullName()).toBe('Some value property');
    expect(condition.getDescription()).toBe(
      'Compare the property value for the some value.'
    );
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe(
      'The property value for the some value of _PARAM0_ _PARAM2_ _PARAM3_'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(4);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(1).getType()).toBe('behavior');
    expect(condition.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(condition.getParameter(2).getType()).toBe('relationalOperator');
    expect(condition.getParameter(3).getType()).toBe('string');

    expect(behaviorMetadata.getAllStrExpressions().has('PropertyValue')).toBe(
      true
    );
    const expression = behaviorMetadata
      .getAllStrExpressions()
      .get('PropertyValue');
    expect(expression.getFullName()).toBe('Some value property');
    expect(expression.getDescription()).toBe(
      'Return the property value for the some value.'
    );
    expect(expression.isPrivate()).toBe(true);

    expect(expression.getParametersCount()).toBe(2);
    expect(expression.getParameter(0).getType()).toBe('object');
    expect(expression.getParameter(1).getType()).toBe('behavior');
    expect(expression.getParameter(1).getExtraInfo()).toBe('MyBehavior');

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior choices property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    // Required behavior don't generate any instruction.
    // It covers a mutant from "continue" to "return".
    const requiredBehavior = eventBehavior
      .getPropertyDescriptors()
      .insertNew('RequiredBehavior', 0);
    requiredBehavior.setType('Behavior');

    const property = eventBehavior
      .getPropertyDescriptors()
      .insertNew('Value', 0);
    property.setLabel('Some value');
    property.setType('Choice');
    const choices = new gd.VectorString();
    choices.push_back("Choice A");
    choices.push_back("Choice B");
    choices.push_back("Choice C");
    property.setExtraInfo(choices);

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllActions().has('MyBehavior::SetPropertyValue')
    ).toBe(true);
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::SetPropertyValue');
    expect(action.getParameter(3).getType()).toBe('stringWithSelector');
    expect(action.getParameter(3).getExtraInfo()).toBe('["Choice A","Choice B","Choice C"]');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::PropertyValue')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::PropertyValue');
    expect(condition.getParameter(3).getType()).toBe('stringWithSelector');
    expect(condition.getParameter(3).getExtraInfo()).toBe('["Choice A","Choice B","Choice C"]');

    expect(behaviorMetadata.getAllStrExpressions().has('PropertyValue')).toBe(
      true
    );

    choices.delete();
    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior boolean property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    // Required behaviors don't generate any instruction.
    // It covers a mutant from "continue" to "return".
    const requiredBehavior = eventBehavior
      .getPropertyDescriptors()
      .insertNew('RequiredBehavior', 0);
    requiredBehavior.setType('Behavior');

    const property = eventBehavior
      .getPropertyDescriptors()
      .insertNew('Value', 0);
    property.setLabel('Some value');
    property.setType('Boolean');

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllActions().has('MyBehavior::SetPropertyValue')
    ).toBe(true);
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::SetPropertyValue');
    expect(action.getFullName()).toBe('Some value property');
    expect(action.getDescription()).toBe(
      'Update the property value for "some value".'
    );
    expect(action.getSentence()).toBe(
      'Set property value for some value of _PARAM0_ to _PARAM2_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(3);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(1).getType()).toBe('behavior');
    expect(action.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(action.getParameter(2).getType()).toBe('yesorno');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::PropertyValue')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::PropertyValue');
    expect(condition.getFullName()).toBe('Some value property');
    expect(condition.getDescription()).toBe(
      'Check the property value for some value.'
    );
    expect(condition.getSentence()).toBe(
      'Property some value of _PARAM0_ is true'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(2);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(1).getType()).toBe('behavior');
    expect(condition.getParameter(1).getExtraInfo()).toBe('MyBehavior');

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior string shared property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const property = eventBehavior
      .getSharedPropertyDescriptors()
      .insertNew('Value', 0);
    property.setLabel('Some value');

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllActions().has('MyBehavior::SetSharedPropertyValue')
    ).toBe(true);
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::SetSharedPropertyValue');
    expect(action.getFullName()).toBe('Some value shared property');
    expect(action.getDescription()).toBe(
      'Change the property value for the some value.'
    );
    expect(action.getSentence()).toBe(
      'Change the property value for the some value of _PARAM0_: _PARAM2_ _PARAM3_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(4);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(1).getType()).toBe('behavior');
    expect(action.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(action.getParameter(2).getType()).toBe('operator');
    expect(action.getParameter(3).getType()).toBe('string');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::SharedPropertyValue')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::SharedPropertyValue');
    expect(condition.getFullName()).toBe('Some value shared property');
    expect(condition.getDescription()).toBe(
      'Compare the property value for the some value.'
    );
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe(
      'The property value for the some value of _PARAM0_ _PARAM2_ _PARAM3_'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(4);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(1).getType()).toBe('behavior');
    expect(condition.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(condition.getParameter(2).getType()).toBe('relationalOperator');
    expect(condition.getParameter(3).getType()).toBe('string');

    expect(
      behaviorMetadata.getAllStrExpressions().has('SharedPropertyValue')
    ).toBe(true);
    const expression = behaviorMetadata
      .getAllStrExpressions()
      .get('SharedPropertyValue');
    expect(expression.getFullName()).toBe('Some value shared property');
    expect(expression.getDescription()).toBe(
      'Return the property value for the some value.'
    );
    expect(expression.isPrivate()).toBe(true);

    expect(expression.getParametersCount()).toBe(2);
    expect(expression.getParameter(0).getType()).toBe('object');
    expect(expression.getParameter(1).getType()).toBe('behavior');
    expect(expression.getParameter(1).getExtraInfo()).toBe('MyBehavior');

    extension.delete();
    project.delete();
  });

  it('can create metadata for behavior boolean shared property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventBehavior = eventExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const property = eventBehavior
      .getSharedPropertyDescriptors()
      .insertNew('Value', 0);
    property.setLabel('Some value');
    property.setType('Boolean');

    const behaviorMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateBehaviorMetadata(
      project,
      extension,
      eventExtension,
      eventBehavior,
      behaviorMethodMangledNames
    );
    behaviorMethodMangledNames.delete();

    expect(extension.getBehaviorsTypes().size()).toBe(1);
    expect(extension.getBehaviorsTypes().at(0)).toBe('MyBehavior');
    const behaviorMetadata = extension.getBehaviorMetadata('MyBehavior');

    expect(
      behaviorMetadata.getAllActions().has('MyBehavior::SetSharedPropertyValue')
    ).toBe(true);
    const action = behaviorMetadata
      .getAllActions()
      .get('MyBehavior::SetSharedPropertyValue');
    expect(action.getFullName()).toBe('Some value shared property');
    expect(action.getDescription()).toBe(
      'Update the property value for "some value".'
    );
    expect(action.getSentence()).toBe(
      'Set property value for some value of _PARAM0_ to _PARAM2_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(3);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(1).getType()).toBe('behavior');
    expect(action.getParameter(1).getExtraInfo()).toBe('MyBehavior');
    expect(action.getParameter(2).getType()).toBe('yesorno');

    expect(
      behaviorMetadata.getAllConditions().has('MyBehavior::SharedPropertyValue')
    ).toBe(true);
    const condition = behaviorMetadata
      .getAllConditions()
      .get('MyBehavior::SharedPropertyValue');
    expect(condition.getFullName()).toBe('Some value shared property');
    expect(condition.getDescription()).toBe(
      'Check the property value for some value.'
    );
    expect(condition.getSentence()).toBe(
      'Property some value of _PARAM0_ is true'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(2);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(1).getType()).toBe('behavior');
    expect(condition.getParameter(1).getExtraInfo()).toBe('MyBehavior');

    extension.delete();
    project.delete();
  });

  const checkObjectDefaultParameters = (instructionOrExpression) => {
    expect(instructionOrExpression.getParameter(0).getType()).toBe('object');
    const last = instructionOrExpression.getParametersCount() - 1;
    expect(instructionOrExpression.getParameter(last).getType()).toBe(
      'eventsFunctionContext'
    );
    expect(instructionOrExpression.getParameter(last).isCodeOnly()).toBe(true);
  };

  const expectArray = (actualValues) => ({
    toContainAll: (expectedValues) => {
      expectedValues.forEach((expectedValue) =>
        expect(actualValues).toContain(expectedValue)
      );
      // This expectation is inverted but it allows to get missing values.
      actualValues.forEach((actualValue) =>
        expect(expectedValues).toContain(actualValue)
      );
    },
  });

  it('can create metadata for custom object default capabilities', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    // The capabilities replaced the deprecated instructions below.
    expectArray(
      objectMetadata.getDefaultBehaviors().toNewVectorString().toJSArray()
    ).toContainAll([
      "ResizableCapability::ResizableBehavior",
      "ScalableCapability::ScalableBehavior",
      "FlippableCapability::FlippableBehavior",
      "OpacityCapability::OpacityBehavior",
      "EffectCapability::EffectBehavior",
    ]);

    expectArray(objectMetadata.getAllActions().keys().toJSArray()).toContainAll(
      [
        // Private
        'MyObject::SetRotationCenter',
        // Deprecated
        'MyObject::Width',
        'Width',
        'MyObject::Height',
        'Height',
        'MyObject::Scale',
        'Scale',
        'MyObject::SetScaleX',
        'MyObject::SetScaleY',
        'MyObject::FlipX',
        'FlipX',
        'MyObject::FlipY',
        'FlipY',
        'MyObject::SetOpacity',
      ]
    );
    expect(
      objectMetadata
        .getAllActions()
        .get('MyObject::SetRotationCenter')
        .isPrivate()
    ).toBe(true);

    expectArray(
      objectMetadata.getAllConditions().keys().toJSArray()
    ).toContainAll([
      // Deprecated
      'MyObject::ScaleX',
      'MyObject::ScaleY',
      'MyObject::FlippedX',
      'FlippedX',
      'MyObject::FlippedY',
      'FlippedY',
      'MyObject::Opacity',
    ]);

    expectArray(
      objectMetadata.getAllExpressions().keys().toJSArray()
    ).toContainAll([
      // Deprecated
      'ScaleX', 'ScaleY', 'Opacity']);

    expectArray(
      objectMetadata.getAllStrExpressions().keys().toJSArray()
    ).toContainAll([]);

    extension.delete();
    project.delete();
  });

  it('can create metadata for custom object with all capabilities', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    eventsBasedObject.markAsRenderedIn3D(true);
    eventsBasedObject.markAsAnimatable(true);
    eventsBasedObject.markAsTextContainer(true);

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventsBasedObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expectArray(
      objectMetadata.getDefaultBehaviors().toNewVectorString().toJSArray()
    ).toContainAll([
      "ResizableCapability::ResizableBehavior",
      "ScalableCapability::ScalableBehavior",
      "FlippableCapability::FlippableBehavior",
      // No effect nor opacity capabilities for 3D objects.
      "Scene3D::Base3DBehavior",
      "AnimatableCapability::AnimatableBehavior",
      "TextContainerCapability::TextContainerBehavior",
    ]);

    extension.delete();
    project.delete();
  });

  it('can create metadata for object actions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const eventFunction = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Action);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventExtension,
      eventObject
    );

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(objectMetadata.getAllActions().has('MyObject::MyFunction')).toBe(
      true
    );
    const action = objectMetadata.getAllActions().get('MyObject::MyFunction');
    expect(action.getFullName()).toBe('My function');
    expect(action.getDescription()).toBe('My function description.');
    expect(action.getSentence()).toBe('My function sentence');

    expect(action.getParametersCount()).toBe(2);
    checkObjectDefaultParameters(action);

    extension.delete();
    project.delete();
  });

  it('can create metadata for object conditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const eventFunction = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Condition);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    eventFunction.setSentence('My function sentence');
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventExtension,
      eventObject
    );

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(objectMetadata.getAllConditions().has('MyObject::MyFunction')).toBe(
      true
    );
    const condition = objectMetadata
      .getAllConditions()
      .get('MyObject::MyFunction');
    expect(condition.getFullName()).toBe('My function');
    expect(condition.getDescription()).toBe('My function description.');
    expect(condition.getSentence()).toBe('My function sentence');

    expect(condition.getParametersCount()).toBe(2);
    checkObjectDefaultParameters(condition);

    extension.delete();
    project.delete();
  });

  it('can create metadata for object expressions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const eventFunction = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventFunction.setFunctionType(gd.EventsFunction.Expression);
    eventFunction.setFullName('My function');
    eventFunction.setDescription('My function description.');
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventExtension,
      eventObject
    );

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(objectMetadata.getAllExpressions().has('MyFunction')).toBe(true);
    const expression = objectMetadata.getAllExpressions().get('MyFunction');
    expect(expression.getFullName()).toBe('My function');
    expect(expression.getDescription()).toBe('My function description.');

    expect(expression.getParametersCount()).toBe(2);
    checkObjectDefaultParameters(expression);

    extension.delete();
    project.delete();
  });

  it('can create metadata for object ExpressionAndConditions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const eventFunction = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('Value', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    eventFunction.setFullName('Some value');
    eventFunction.setDescription('some value.');
    eventFunction.setSentence('some value');
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventExtension,
      eventObject
    );

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(objectMetadata.getAllExpressions().has('Value')).toBe(true);
    const expression = objectMetadata.getAllExpressions().get('Value');
    expect(expression.getFullName()).toBe('Some value');
    expect(expression.getDescription()).toBe('Return some value.');

    expect(expression.getParametersCount()).toBe(2);
    checkObjectDefaultParameters(expression);

    expect(objectMetadata.getAllConditions().has('MyObject::Value')).toBe(true);
    const condition = objectMetadata.getAllConditions().get('MyObject::Value');
    expect(condition.getFullName()).toBe('Some value');
    expect(condition.getDescription()).toBe('Compare some value.');
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe(
      'Some value of _PARAM0_ _PARAM1_ _PARAM2_'
    );

    expect(condition.getParametersCount()).toBe(4);
    checkObjectDefaultParameters(condition);
    expect(condition.getParameter(1).getType()).toBe('relationalOperator');
    expect(condition.getParameter(2).getType()).toBe('expression');

    extension.delete();
    project.delete();
  });

  it('can create metadata for object ActionWithOperator', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);

    const getter = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('Value', 0);
    getter.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
    getter.setFullName('Some value');
    getter.setDescription('some value.');
    getter.setSentence('some value');

    const eventFunction = eventObject
      .getEventsFunctions()
      .insertNewEventsFunction('SetValue', 0);
    eventFunction.setFunctionType(gd.EventsFunction.ActionWithOperator);
    eventFunction.setGetterName('Value');

    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventExtension,
      eventObject
    );

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(objectMetadata.getAllActions().has('MyObject::SetValue')).toBe(true);
    const action = objectMetadata.getAllActions().get('MyObject::SetValue');
    expect(action.getFullName()).toBe('Some value');
    expect(action.getDescription()).toBe('Change some value.');
    expect(action.getSentence()).toBe(
      'Change some value of _PARAM0_: _PARAM1_ _PARAM2_'
    );

    expect(action.getParametersCount()).toBe(4);
    checkObjectDefaultParameters(action);
    expect(action.getParameter(1).getType()).toBe('operator');
    expect(action.getParameter(2).getType()).toBe('expression');

    extension.delete();
    project.delete();
  });

  it('can create metadata for object string property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const property = eventObject.getPropertyDescriptors().insertNew('Value', 0);
    property.setLabel('Some value');

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(
      objectMetadata.getAllActions().has('MyObject::SetPropertyValue')
    ).toBe(true);
    const action = objectMetadata
      .getAllActions()
      .get('MyObject::SetPropertyValue');
    expect(action.getFullName()).toBe('Some value property');
    expect(action.getDescription()).toBe(
      'Change the property value for the some value.'
    );
    expect(action.getSentence()).toBe(
      'Change the property value for the some value of _PARAM0_: _PARAM1_ _PARAM2_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(3);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(0).getValueTypeMetadata().getExtraInfo()).toBe('MyObject');
    expect(action.getParameter(1).getType()).toBe('operator');
    expect(action.getParameter(2).getType()).toBe('string');

    expect(
      objectMetadata.getAllConditions().has('MyObject::PropertyValue')
    ).toBe(true);
    const condition = objectMetadata
      .getAllConditions()
      .get('MyObject::PropertyValue');
    expect(condition.getFullName()).toBe('Some value property');
    expect(condition.getDescription()).toBe(
      'Compare the property value for the some value.'
    );
    // The IDE fixes the first letter case.
    expect(condition.getSentence()).toBe(
      'The property value for the some value of _PARAM0_ _PARAM1_ _PARAM2_'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(3);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(0).getValueTypeMetadata().getExtraInfo()).toBe('MyObject');
    expect(condition.getParameter(1).getType()).toBe('relationalOperator');
    expect(condition.getParameter(2).getType()).toBe('string');

    expect(objectMetadata.getAllStrExpressions().has('PropertyValue')).toBe(
      true
    );
    const expression = objectMetadata
      .getAllStrExpressions()
      .get('PropertyValue');
    expect(expression.getFullName()).toBe('Some value property');
    expect(expression.getDescription()).toBe(
      'Return the property value for the some value.'
    );
    expect(expression.isPrivate()).toBe(true);

    expect(expression.getParametersCount()).toBe(1);
    expect(expression.getParameter(0).getType()).toBe('object');
    expect(expression.getParameter(0).getValueTypeMetadata().getExtraInfo()).toBe('MyObject');

    extension.delete();
    project.delete();
  });

  it('can create metadata for object boolean property functions', () => {
    const extension = new gd.PlatformExtension();
    const project = new gd.Project();

    const eventExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventObject = eventExtension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    const property = eventObject.getPropertyDescriptors().insertNew('Value', 0);
    property.setLabel('Some value');
    property.setType('Boolean');

    const objectMethodMangledNames = new gd.MapStringString();
    gd.MetadataDeclarationHelper.generateObjectMetadata(
      project,
      extension,
      eventExtension,
      eventObject,
      objectMethodMangledNames
    );
    objectMethodMangledNames.delete();

    expect(extension.getExtensionObjectsTypes().size()).toBe(1);
    expect(extension.getExtensionObjectsTypes().at(0)).toBe('MyObject');
    const objectMetadata = extension.getObjectMetadata('MyObject');

    expect(
      objectMetadata.getAllActions().has('MyObject::SetPropertyValue')
    ).toBe(true);
    const action = objectMetadata
      .getAllActions()
      .get('MyObject::SetPropertyValue');
    expect(action.getFullName()).toBe('Some value property');
    expect(action.getDescription()).toBe(
      'Update the property value for "some value".'
    );
    expect(action.getSentence()).toBe(
      'Set property value for some value of _PARAM0_ to _PARAM1_'
    );
    expect(action.isHidden()).toBe(false);
    expect(action.isPrivate()).toBe(true);

    expect(action.getParametersCount()).toBe(2);
    expect(action.getParameter(0).getType()).toBe('object');
    expect(action.getParameter(0).getValueTypeMetadata().getExtraInfo()).toBe('MyObject');
    expect(action.getParameter(1).getType()).toBe('yesorno');

    expect(
      objectMetadata.getAllConditions().has('MyObject::PropertyValue')
    ).toBe(true);
    const condition = objectMetadata
      .getAllConditions()
      .get('MyObject::PropertyValue');
    expect(condition.getFullName()).toBe('Some value property');
    expect(condition.getDescription()).toBe(
      'Check the property value for some value.'
    );
    expect(condition.getSentence()).toBe(
      'Property some value of _PARAM0_ is true'
    );
    expect(condition.isHidden()).toBe(false);
    expect(condition.isPrivate()).toBe(true);

    expect(condition.getParametersCount()).toBe(1);
    expect(condition.getParameter(0).getType()).toBe('object');
    expect(condition.getParameter(0).getValueTypeMetadata().getExtraInfo()).toBe('MyObject');

    extension.delete();
    project.delete();
  });

  describe('shiftSentenceParamIndexes', () => {
    it('give back the sentence when there is no parameters', () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'Make an action',
          2
        )
      ).toBe('Make an action');
    });
    it('can shift a parameter at the end', () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'Change the speed to _PARAM2_',
          2
        )
      ).toBe('Change the speed to _PARAM4_');
    });
    it('can shift a parameter at the beginning', () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          '_PARAM2_ is moving',
          2
        )
      ).toBe('_PARAM4_ is moving');
    });
    it('can shift a parameter alone', () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes('_PARAM2_', 2)
      ).toBe('_PARAM4_');
    });
    it(`can shift parameters in a sentence with non-latin characters`, () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'Скорость превышает _PARAM2_ пикселей в секунду',
          1
        )
      ).toBe('Скорость превышает _PARAM3_ пикселей в секунду');
    });
    it("won't shift an ill-formed parameter", () => {
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'The speed is greater than PARAM2_ pixels per second',
          2
        )
      ).toBe('The speed is greater than PARAM2_ pixels per second');
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'The speed is greater than _PARAM2 pixels per second',
          2
        )
      ).toBe('The speed is greater than _PARAM2 pixels per second');
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'The speed is greater than PARAM2 pixels per second',
          2
        )
      ).toBe('The speed is greater than PARAM2 pixels per second');
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'The speed is greater than _param2_ pixels per second',
          2
        )
      ).toBe('The speed is greater than _param2_ pixels per second');
      expect(
        gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
          'The speed is greater than 2 pixels per second',
          2
        )
      ).toBe('The speed is greater than 2 pixels per second');
    });
    [2, 0, -2].forEach((indexOffset) => {
      it(`can shift 1 parameter by ${indexOffset}`, () => {
        expect(
          gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
            'The speed is greater than _PARAM2_ pixels per second',
            indexOffset
          )
        ).toBe(
          'The speed is greater than _PARAM' +
            (2 + indexOffset) +
            '_ pixels per second'
        );
      });
      it(`can shift 2 parameters by ${indexOffset}`, () => {
        expect(
          gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
            'The speed is between _PARAM1_ and _PARAM2_ pixels per second',
            indexOffset
          )
        ).toBe(
          `The speed is between _PARAM${1 + indexOffset}_ and _PARAM${
            2 + indexOffset
          }_ pixels per second`
        );
      });
      it(`can shift 2 parameters with jumbled indexes by ${indexOffset}`, () => {
        expect(
          gd.MetadataDeclarationHelper.shiftSentenceParamIndexes(
            'The speed is between _PARAM3_ and _PARAM2_ pixels per second',
            indexOffset
          )
        ).toBe(
          `The speed is between _PARAM${3 + indexOffset}_ and _PARAM${
            2 + indexOffset
          }_ pixels per second`
        );
      });
    });
  });
});
