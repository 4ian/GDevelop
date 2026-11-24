const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

const TWEEN_SCENE_VARIABLE_ACTION = 'Tween::TweenSceneVariableNumber3';
const TWEEN_EASE_EXPRESSION = 'Tween::Ease';

describe('libGD.js - named easings', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    loadTweenExtension(gd);
  });

  describe('gd.WholeProjectRefactorer', function () {
    it('renames a named easing in scene and external events, but not extension events', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);

      const layout = project.insertNewLayout('Scene', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        layout.getEvents(),
        'PopupOpen'
      );

      const externalEvents = project.insertNewExternalEvents(
        'MyExternalEvents',
        0
      );
      insertTweenSceneVariableAction(
        gd,
        project,
        externalEvents.getEvents(),
        'PopupOpen'
      );

      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      const eventsFunction = extension
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        eventsFunction.getEvents(),
        'PopupOpen'
      );

      gd.WholeProjectRefactorer.renameNamedEasing(
        project,
        'PopupOpen',
        'PopupOpenRenamed'
      );

      expect(getActionParameter(gd, layout.getEvents(), 0, 4)).toBe(
        '"PopupOpenRenamed"'
      );
      expect(getActionParameter(gd, externalEvents.getEvents(), 0, 4)).toBe(
        '"PopupOpenRenamed"'
      );
      expect(getActionParameter(gd, eventsFunction.getEvents(), 0, 4)).toBe(
        '"PopupOpen"'
      );

      project.delete();
    });

    it('renames a named easing only in that events functions extension', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        layout.getEvents(),
        'PopupOpen'
      );

      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      extension.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);
      const eventsFunction = extension
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        eventsFunction.getEvents(),
        'PopupOpen'
      );

      gd.WholeProjectRefactorer.renameNamedEasingInEventsFunctionsExtension(
        project,
        extension,
        'PopupOpen',
        'PopupOpenRenamed'
      );

      expect(getActionParameter(gd, layout.getEvents(), 0, 4)).toBe(
        '"PopupOpen"'
      );
      expect(getActionParameter(gd, eventsFunction.getEvents(), 0, 4)).toBe(
        '"PopupOpenRenamed"'
      );

      project.delete();
    });

    it('renames a named easing literal used as an expression argument', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);

      const layout = project.insertNewLayout('Scene', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        layout.getEvents(),
        'PopupOpen',
        TWEEN_EASE_EXPRESSION + '("PopupOpen", 0, 1, 0.5)'
      );

      gd.WholeProjectRefactorer.renameNamedEasing(
        project,
        'PopupOpen',
        'PopupOpenRenamed'
      );

      expect(getActionParameter(gd, layout.getEvents(), 0, 4)).toBe(
        '"PopupOpenRenamed"'
      );
      expect(getActionParameter(gd, layout.getEvents(), 0, 3)).toBe(
        'Tween::Ease("PopupOpenRenamed", 0, 1, 0.5)'
      );

      project.delete();
    });
  });

  describe('code generation', function () {
    it('wraps easing parameters in scene events with the empty extension name', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);
      const layout = project.insertNewLayout('Scene', 0);
      layout.getVariables().insertNew('MyVariable', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        layout.getEvents(),
        'PopupOpen'
      );

      const code = generateLayoutCode(gd, project, layout);
      project.delete();

      expect(code).toContain('getNamedEasingsManager().resolve(');
      expect(code).toMatch(
        /getNamedEasingsManager\(\)\.resolve\([\s\S]*?,\s*""\)/
      );
    });

    it('wraps easing arguments of expressions', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      layout.getVariables().insertNew('MyVariable', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        layout.getEvents(),
        'linear',
        TWEEN_EASE_EXPRESSION + '("PopupOpen", 0, 1, 0.5)'
      );

      const code = generateLayoutCode(gd, project, layout);
      project.delete();

      expect(code).toContain(
        'gdjs.evtTools.tween.ease(runtimeScene.getGame().getNamedEasingsManager().resolve("PopupOpen", "")'
      );
    });

    it('wraps easing parameters in a free function with the extension name', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      extension.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);
      const eventsFunction = extension
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        eventsFunction.getEvents(),
        'PopupOpen'
      );

      const code = generateFreeEventsFunctionCode(
        gd,
        project,
        extension,
        eventsFunction
      );
      project.delete();

      expect(code).toContain('getNamedEasingsManager().resolve(');
      expect(code).toMatch(
        /getNamedEasingsManager\(\)\.resolve\([\s\S]*?,\s*"MyExt"\)/
      );
    });

    it('wraps easing parameters in a behavior function with the extension name', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      extension.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);
      const eventsBasedBehavior = extension
        .getEventsBasedBehaviors()
        .insertNew('MyBehavior', 0);
      const eventsFunction = eventsBasedBehavior
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        eventsFunction.getEvents(),
        'PopupOpen'
      );
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        extension,
        eventsBasedBehavior
      );

      const code = generateBehaviorCode(
        gd,
        project,
        extension,
        eventsBasedBehavior
      );
      project.delete();

      expect(code).toContain('getNamedEasingsManager().resolve(');
      expect(code).toMatch(
        /getNamedEasingsManager\(\)\.resolve\([\s\S]*?,\s*"MyExt"\)/
      );
    });

    it('wraps easing parameters in an object function with the extension name', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      extension.getNamedEasings().insertNewNamedEasing('PopupOpen', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyObject', 0);
      const eventsFunction = eventsBasedObject
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      insertTweenSceneVariableAction(
        gd,
        project,
        eventsFunction.getEvents(),
        'PopupOpen'
      );
      gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
        extension,
        eventsBasedObject
      );

      const code = generateObjectCode(
        gd,
        project,
        extension,
        eventsBasedObject
      );
      project.delete();

      expect(code).toContain('getNamedEasingsManager().resolve(');
      expect(code).toMatch(
        /getNamedEasingsManager\(\)\.resolve\([\s\S]*?,\s*"MyExt"\)/
      );
    });
  });

  describe('gd.ProjectScopedContainers', function () {
    it('exposes project named easings for a layout and extension ones for an extension', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      project.getNamedEasings().insertNewNamedEasing('ProjectEasing', 0);

      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      extension.getNamedEasings().insertNewNamedEasing('ExtEasing', 0);

      const forLayout =
        gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
          project,
          layout
        );
      expect(forLayout.getNamedEasings()).toBeTruthy();
      expect(typeof forLayout.getNamedEasings().hasNamedEasingNamed).toBe(
        'function'
      );
      expect(
        forLayout.getNamedEasings().hasNamedEasingNamed('ProjectEasing')
      ).toBe(true);
      expect(forLayout.getNamedEasings().hasNamedEasingNamed('ExtEasing')).toBe(
        false
      );
      expect(forLayout.getScopeExtensionName()).toBe('');

      const forExtension =
        gd.ProjectScopedContainers.makeNewProjectScopedContainersForEventsFunctionsExtension(
          project,
          extension
        );
      expect(forExtension.getNamedEasings()).toBeTruthy();
      expect(
        forExtension.getNamedEasings().hasNamedEasingNamed('ExtEasing')
      ).toBe(true);
      expect(
        forExtension.getNamedEasings().hasNamedEasingNamed('ProjectEasing')
      ).toBe(false);
      expect(forExtension.getScopeExtensionName()).toBe('MyExt');

      project.delete();
    });
  });
});

function loadTweenExtension(gd) {
  const platform = gd.JsPlatform.get();
  if (platform.isExtensionLoaded('Tween')) {
    return;
  }
  const tweenModule = require('../../Extensions/TweenBehavior/JsExtension.js');
  const extension = tweenModule.createExtension(function (str) {
    return str;
  }, gd);
  platform.addNewExtension(extension);
  extension.delete();
}

function insertTweenSceneVariableAction(
  gd,
  project,
  eventsList,
  easingName,
  finalValue
) {
  const evt = eventsList.insertNewEvent(
    project,
    'BuiltinCommonInstructions::Standard',
    eventsList.getEventsCount()
  );
  const action = new gd.Instruction();
  action.setType(TWEEN_SCENE_VARIABLE_ACTION);
  action.setParametersCount(6);
  action.setParameter(0, '');
  action.setParameter(1, '"MyTween"');
  action.setParameter(2, 'MyVariable');
  action.setParameter(3, finalValue || '100');
  action.setParameter(4, '"' + easingName + '"');
  action.setParameter(5, '1');
  gd.asStandardEvent(evt).getActions().insert(action, 0);
  action.delete();
}

function getActionParameter(gd, eventsList, eventIndex, parameterIndex) {
  return gd
    .asStandardEvent(eventsList.getEventAt(eventIndex))
    .getActions()
    .get(0)
    .getParameter(parameterIndex)
    .getPlainString();
}

function generateLayoutCode(gd, project, layout) {
  const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
  const diagnosticReport = new gd.DiagnosticReport();
  const includeFiles = new gd.SetString();
  const code = layoutCodeGenerator.generateLayoutCompleteCode(
    layout,
    includeFiles,
    diagnosticReport,
    true
  );
  diagnosticReport.delete();
  includeFiles.delete();
  layoutCodeGenerator.delete();
  return code;
}

function generateFreeEventsFunctionCode(
  gd,
  project,
  extension,
  eventsFunction
) {
  const eventsFunctionsExtensionCodeGenerator =
    new gd.EventsFunctionsExtensionCodeGenerator(project);
  const includeFiles = new gd.SetString();
  const code =
    eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      extension,
      eventsFunction,
      'gdjs.eventsFunction.myTest',
      includeFiles,
      true
    );
  includeFiles.delete();
  eventsFunctionsExtensionCodeGenerator.delete();
  return code;
}

function generateBehaviorCode(gd, project, extension, eventsBasedBehavior) {
  const behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);
  const includeFiles = new gd.SetString();
  const behaviorMethodMangledNames = new gd.MapStringString();
  for (
    let i = 0;
    i < eventsBasedBehavior.getEventsFunctions().getEventsFunctionsCount();
    i++
  ) {
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .getEventsFunctionAt(i);
    behaviorMethodMangledNames.set(
      eventsFunction.getName(),
      eventsFunction.getName()
    );
  }
  const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
    extension,
    eventsBasedBehavior,
    'behaviorNamespace',
    behaviorMethodMangledNames,
    includeFiles,
    true
  );
  includeFiles.delete();
  behaviorMethodMangledNames.delete();
  behaviorCodeGenerator.delete();
  return code;
}

function generateObjectCode(gd, project, extension, eventsBasedObject) {
  const objectCodeGenerator = new gd.ObjectCodeGenerator(project);
  const includeFiles = new gd.SetString();
  const objectMethodMangledNames = new gd.MapStringString();
  const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
  for (let i = 0; i < eventsFunctionsContainer.getEventsFunctionsCount(); i++) {
    const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(i);
    objectMethodMangledNames.set(
      eventsFunction.getName(),
      eventsFunction.getName()
    );
  }
  const code = objectCodeGenerator.generateRuntimeObjectCompleteCode(
    extension,
    eventsBasedObject,
    'objectNamespace',
    objectMethodMangledNames,
    includeFiles,
    true
  );
  includeFiles.delete();
  objectMethodMangledNames.delete();
  objectCodeGenerator.delete();
  return code;
}
