// @flow

/**
 * Builds the options object that the *real* `processEditorFunctionCalls`
 * expects, wiring each callback to a headless-but-faithful implementation:
 *
 *  - `generateEvents`  -> real backend call (POST /ai-generated-event), mirroring
 *                         AiGeneration/UseGenerateEvents.js. This is what makes
 *                         the `add_scene_events` / `generate_events` tools produce
 *                         real, backend-generated events applied to the project.
 *  - `searchAndInstallAsset` -> inserts a real object of the requested type into
 *                         the project (same approach as EditorFunctions.spec.js).
 *                         The object is structurally real; visual asset resources
 *                         are not downloaded (headless). See README "Fidelity".
 *  - "outside editor changes" + extension-install callbacks -> no-ops (they only
 *                         tell the IDE UI to refresh; there is no UI here).
 *
 * Everything else (object/behavior/variable/scene/instance tools) runs the
 * exact production code against a real `gdProject`.
 */

import { delay } from '../Utils/Delay';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import { type BackendClient } from './BackendClient';

const fakeI18n: any = {
  // Mirror AiGeneration/EditorFunctions.spec.js: resolve a Lingui descriptor to
  // its id (or pass through a plain string).
  _: (message: any) =>
    typeof message === 'string' ? message : message && message.id,
};

export type EditorEnvironment = {|
  gd: Object,
  /** Serialize the live project the way the backend expects it on each turn. */
  serializeProject: (
    project: Object
  ) => {|
    gameProjectJson: string,
    projectSpecificExtensionsSummaryJson: string,
  |},
  /** Build the options passed to processEditorFunctionCalls for one project. */
  buildProcessOptions: (params: {|
    project: ?Object,
    relatedAiRequestId: string,
    getRelatedAiRequestLastMessages: () => Object,
  |}) => Object,
|};

export const makeEditorEnvironment = ({
  gd,
  backendClient,
}: {|
  gd: Object,
  backendClient: BackendClient,
|}): EditorEnvironment => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);

  const serializeProject = (project: Object) => ({
    gameProjectJson: JSON.stringify(
      simplifiedProjectBuilder.getSimplifiedProject(project, {})
    ),
    projectSpecificExtensionsSummaryJson: JSON.stringify(
      simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(project)
    ),
  });

  /**
   * Faithful headless port of UseGenerateEvents.js#generateEvents: create an
   * AI-generated-event request on the backend, poll it to completion, and
   * return the EventsGenerationResult the editor tools expect.
   */
  const makeGenerateEvents = (project: Object) => async (
    options: Object
  ): Promise<Object> => {
    const { gameProjectJson, projectSpecificExtensionsSummaryJson } =
      serializeProject(project);
    try {
      let aiGeneratedEvent = await backendClient.createAiGeneratedEvent({
        gameProjectJson,
        projectSpecificExtensionsSummaryJson,
        sceneName: options.sceneName,
        eventsDescription: options.eventsDescription,
        eventBatches: options.eventBatches,
        extensionNamesList: options.extensionNamesList,
        objectsList: options.objectsList,
        existingEventsAsText: options.existingEventsAsText,
        existingEventsJson: options.existingEventsJson,
        placementHint: options.placementHint,
        relatedAiRequestId: options.relatedAiRequestId,
        estimatedComplexity: options.estimatedComplexity,
      });

      const maxTotalWaitMs = 60000;
      const startTime = Date.now();
      let pollIntervalMs = 1000;
      while (aiGeneratedEvent && aiGeneratedEvent.status === 'working') {
        await delay(pollIntervalMs);
        pollIntervalMs = Math.min(pollIntervalMs * 1.5, 5000);
        try {
          aiGeneratedEvent = await backendClient.getAiGeneratedEvent(
            aiGeneratedEvent.id
          );
        } catch (error) {
          // Transient errors: keep polling within the budget.
        }
        if (Date.now() - startTime >= maxTotalWaitMs) {
          return {
            generationCompleted: false,
            errorMessage: 'Event generation timed out.',
          };
        }
      }

      if (aiGeneratedEvent && aiGeneratedEvent.status === 'suspended') {
        return { generationAborted: true };
      }
      return { generationCompleted: true, aiGeneratedEvent };
    } catch (error) {
      return {
        generationCompleted: false,
        errorMessage: (error && error.message) || 'Unknown error.',
      };
    }
  };

  const buildProcessOptions = ({
    project,
    relatedAiRequestId,
    getRelatedAiRequestLastMessages,
  }) => ({
    project,
    i18n: fakeI18n,
    editorCallbacks: {
      onOpenLayout: () => {},
      onCreateProject: () => {},
    },
    toolOptions: { includeEventsJson: true },
    relatedAiRequestId,
    getRelatedAiRequestLastMessages,
    generateEvents: project ? makeGenerateEvents(project) : async () => ({
      generationCompleted: false,
      errorMessage: 'No project.',
    }),
    // UI-refresh notifications: irrelevant headless.
    onSceneEventsModifiedOutsideEditor: () => {},
    onInstancesModifiedOutsideEditor: () => {},
    onObjectsModifiedOutsideEditor: () => {},
    onObjectGroupsModifiedOutsideEditor: () => {},
    onProjectItemRenamedOutsideEditor: () => {},
    // Extension install: built-in features are already available in `gd`. For
    // community extensions, this would need wiring (see README "Fidelity").
    ensureExtensionInstalled: async () => {},
    onWillInstallExtension: () => {},
    onExtensionInstalled: () => {},
    // Asset install: create a real object of the requested type, like the
    // EditorFunctions unit tests do, so structural grading is meaningful.
    searchAndInstallAsset: async ({ objectsContainer, objectName, objectType }) => {
      const fakeFoundObjectType = objectType || 'Sprite';
      const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
        project,
        fakeFoundObjectType
      );
      const object = objectsContainer.insertNewObject(
        project,
        fakeFoundObjectType,
        objectName,
        objectsContainer.getObjectsCount()
      );
      return {
        status: 'asset-installed',
        message: 'Object installed (headless: structure only, no resources).',
        createdObjects: [object],
        assetShortHeader: null,
        isTheFirstOfItsTypeInProject,
      };
    },
    searchAndInstallResources: async () => ({ results: [] }),
    getAssetStoreTagForNewObject: () => null,
    PixiResourcesLoader,
  });

  return { gd, serializeProject, buildProcessOptions };
};
