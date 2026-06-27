// @flow

/**
 * Small helpers to build real starter `gdProject`s for scenarios. They use the
 * same `gd` API as the rest of the unit tests (see e.g. AssetSwapper.spec.js).
 */

/** A project with one scene containing the given Sprite objects. */
export const makeProjectWithScene = (
  gd: Object,
  {
    sceneName = 'Level',
    spriteObjects = ['Player'],
  }: {| sceneName?: string, spriteObjects?: Array<string> |}
): Object => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const layout = project.insertNewLayout(sceneName, 0);
  const objects = layout.getObjects();
  spriteObjects.forEach(objectName => {
    objects.insertNewObject(
      project,
      'Sprite',
      objectName,
      objects.getObjectsCount()
    );
  });
  return project;
};
