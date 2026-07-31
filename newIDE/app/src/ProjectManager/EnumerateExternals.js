// @flow

export type SceneExternals = {|
  externalLayouts: Array<gdExternalLayout>,
  externalEvents: Array<gdExternalEvents>,
|};

export type ExternalsByScene = {|
  bySceneName: Map<string, SceneExternals>,
  unlinkedExternals: SceneExternals,
|};

const makeEmptySceneExternals = (): SceneExternals => ({
  externalLayouts: [],
  externalEvents: [],
});

/**
 * Group externals under the scene they are associated with.
 *
 * Empty and stale scene associations are kept separately so older projects
 * remain fully accessible from the project manager.
 */
export const enumerateExternalsByScene = (
  project: gdProject
): ExternalsByScene => {
  const bySceneName = new Map<string, SceneExternals>();
  const unlinkedExternals = makeEmptySceneExternals();

  for (let index = 0; index < project.getLayoutsCount(); index++) {
    bySceneName.set(
      project.getLayoutAt(index).getName(),
      makeEmptySceneExternals()
    );
  }

  for (let index = 0; index < project.getExternalLayoutsCount(); index++) {
    const externalLayout = project.getExternalLayoutAt(index);
    const sceneExternals = bySceneName.get(
      externalLayout.getAssociatedLayout()
    );
    (sceneExternals || unlinkedExternals).externalLayouts.push(externalLayout);
  }

  for (let index = 0; index < project.getExternalEventsCount(); index++) {
    const externalEvents = project.getExternalEventsAt(index);
    const sceneExternals = bySceneName.get(
      externalEvents.getAssociatedLayout()
    );
    (sceneExternals || unlinkedExternals).externalEvents.push(externalEvents);
  }

  return { bySceneName, unlinkedExternals };
};
