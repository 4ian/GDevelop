// @flow
import { type EventsScope } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

export type GeneratedEventsCode = {|
  /** A human-readable name for what was generated (scene/function name). */
  name: string,
  /** The generated JavaScript, or null if it could not be generated. */
  code: ?string,
  /** An error message if generation failed. */
  error: ?string,
  /**
   * True when the generated code is the WHOLE behavior/object (all its methods),
   * because GDevelop does not expose per-method generation for those.
   */
  isWholeEntity?: boolean,
|};

/**
 * Generate the JavaScript code GDevelop produces for whatever the given events
 * sheet `scope` describes:
 *  - a scene (layout) → the scene's complete events code;
 *  - a free events-function → that function's complete code;
 *  - a behavior/object events-function → the WHOLE runtime behavior/object code
 *    (which includes the edited method — GDevelop has no per-method generator).
 *
 * Mirrors the EventsFunctionsExtensionsLoader code paths. Every `new gd.*` wasm
 * object created here is freed before returning.
 */
export const generateEventsCodeForScope = (
  project: gdProject,
  scope: EventsScope
): GeneratedEventsCode => {
  // 1) Scene (layout).
  if (scope.layout) {
    const layout = scope.layout;
    let layoutCodeGenerator = null;
    let includeFiles = null;
    let diagnosticReport = null;
    try {
      layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      includeFiles = new gd.SetString();
      diagnosticReport = new gd.DiagnosticReport();
      const code = layoutCodeGenerator.generateLayoutCompleteCode(
        layout,
        includeFiles,
        diagnosticReport,
        /* compilationForRuntime= */ true
      );
      return { name: layout.getName(), code, error: null };
    } catch (error) {
      return {
        name: layout.getName(),
        code: null,
        error: errorMessage(error),
      };
    } finally {
      if (diagnosticReport) diagnosticReport.delete();
      if (includeFiles) includeFiles.delete();
      if (layoutCodeGenerator) layoutCodeGenerator.delete();
    }
  }

  const eventsFunctionsExtension = scope.eventsFunctionsExtension;

  // 2) Behavior events-function → whole runtime behavior.
  if (eventsFunctionsExtension && scope.eventsBasedBehavior) {
    const eventsBasedBehavior = scope.eventsBasedBehavior;
    const name = eventsBasedBehavior.getName();
    let extension = null;
    let behaviorMethodMangledNames = null;
    let behaviorCodeGenerator = null;
    let includeFiles = null;
    try {
      extension = new gd.PlatformExtension();
      gd.MetadataDeclarationHelper.declareExtension(
        extension,
        eventsFunctionsExtension
      );
      behaviorMethodMangledNames = new gd.MapStringString();
      // Populate the mangled-names map (required by the generator).
      gd.MetadataDeclarationHelper.generateBehaviorMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        behaviorMethodMangledNames
      );
      const codeNamespacePrefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
        eventsFunctionsExtension
      );
      const codeNamespace = gd.MetadataDeclarationHelper.getBehaviorFunctionCodeNamespace(
        eventsBasedBehavior,
        codeNamespacePrefix
      );
      includeFiles = new gd.SetString();
      behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);
      const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
        eventsFunctionsExtension,
        eventsBasedBehavior,
        codeNamespace,
        behaviorMethodMangledNames,
        includeFiles,
        /* compilationForRuntime= */ true
      );
      return { name, code, error: null, isWholeEntity: true };
    } catch (error) {
      return { name, code: null, error: errorMessage(error) };
    } finally {
      if (behaviorCodeGenerator) behaviorCodeGenerator.delete();
      if (behaviorMethodMangledNames) behaviorMethodMangledNames.delete();
      if (includeFiles) includeFiles.delete();
      if (extension) extension.delete();
    }
  }

  // 3) Object events-function → whole runtime object.
  if (eventsFunctionsExtension && scope.eventsBasedObject) {
    const eventsBasedObject = scope.eventsBasedObject;
    const name = eventsBasedObject.getName();
    let extension = null;
    let objectMethodMangledNames = null;
    let objectCodeGenerator = null;
    let includeFiles = null;
    try {
      extension = new gd.PlatformExtension();
      gd.MetadataDeclarationHelper.declareExtension(
        extension,
        eventsFunctionsExtension
      );
      objectMethodMangledNames = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateObjectMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedObject,
        objectMethodMangledNames
      );
      const codeNamespacePrefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
        eventsFunctionsExtension
      );
      const codeNamespace = gd.MetadataDeclarationHelper.getObjectFunctionCodeNamespace(
        eventsBasedObject,
        codeNamespacePrefix
      );
      includeFiles = new gd.SetString();
      objectCodeGenerator = new gd.ObjectCodeGenerator(project);
      const code = objectCodeGenerator.generateRuntimeObjectCompleteCode(
        eventsFunctionsExtension,
        eventsBasedObject,
        codeNamespace,
        objectMethodMangledNames,
        includeFiles,
        /* compilationForRuntime= */ true
      );
      return { name, code, error: null, isWholeEntity: true };
    } catch (error) {
      return { name, code: null, error: errorMessage(error) };
    } finally {
      if (objectCodeGenerator) objectCodeGenerator.delete();
      if (objectMethodMangledNames) objectMethodMangledNames.delete();
      if (includeFiles) includeFiles.delete();
      if (extension) extension.delete();
    }
  }

  // 4) Free events-function.
  if (eventsFunctionsExtension && scope.eventsFunction) {
    const eventsFunction = scope.eventsFunction;
    const name = eventsFunction.getName();
    let generator = null;
    let includeFiles = null;
    try {
      const codeNamespacePrefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
        eventsFunctionsExtension
      );
      const codeNamespace = gd.MetadataDeclarationHelper.getFreeFunctionCodeNamespace(
        eventsFunction,
        codeNamespacePrefix
      );
      includeFiles = new gd.SetString();
      generator = new gd.EventsFunctionsExtensionCodeGenerator(project);
      const code = generator.generateFreeEventsFunctionCompleteCode(
        eventsFunctionsExtension,
        eventsFunction,
        codeNamespace,
        includeFiles,
        /* compilationForRuntime= */ true
      );
      return { name, code, error: null };
    } catch (error) {
      return { name, code: null, error: errorMessage(error) };
    } finally {
      if (generator) generator.delete();
      if (includeFiles) includeFiles.delete();
    }
  }

  return {
    name: '',
    code: null,
    error: 'Generating code is not supported for this events sheet.',
  };
};

/** True when the given scope can have its JavaScript code generated. */
export const canGenerateEventsCodeForScope = (scope: EventsScope): boolean =>
  !!(
    scope.layout ||
    (scope.eventsFunctionsExtension &&
      (scope.eventsBasedBehavior ||
        scope.eventsBasedObject ||
        scope.eventsFunction))
  );

const errorMessage = (error: ?Error): string =>
  (error && error.message) ||
  'An unexpected error happened while generating the code.';
