// @flow
import { buildRuntimeApiDeclaration } from '../ProjectsStorage/JavaScriptAuthoringApi';

const javascriptEventContextDeclaration = `
/** The scene being played by this JavaScript event. */
declare const runtimeScene: gdjs.RuntimeScene;

/** Object instances explicitly passed by the JavaScript event's objects= option. */
declare const objects: gdjs.RuntimeObject[];

/** Available only inside extension, prefab, and behavior function events. */
declare const eventsFunctionContext: gdjs.EventsFunctionContext;
`;

const gameplayTestContextDeclaration = `
/**
 * The harness driving a gameplay test: it steps frames, simulates player
 * input and inspects objects in the scene.
 */
declare const harness: gdjs.gameplayTests.GameplayTestHarness;
`;

export const setupAutocompletions = (monaco: any) => {
  // Use the same reviewed public API declaration as save-time validation.
  // Loading the complete runtime source tree exposed implementation-only
  // members and made editor suggestions disagree with the AI authoring API.
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    buildRuntimeApiDeclaration(),
    'gdevelop-runtime-api.d.ts'
  );
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    javascriptEventContextDeclaration,
    'gdevelop-javascript-event-context.d.ts'
  );
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    gameplayTestContextDeclaration,
    'gdevelop-gameplay-test-context.d.ts'
  );
};
