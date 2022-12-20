// @flow
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';

const gd: libGDevelop = global.gd;

describe('enumerateAssetStoreIds', () => {
  const makeNewTestProject = (): {|
    project: gdProject,
    scene1: gdLayout,
    scene2: gdLayout,
  |} => {
    const project = gd.ProjectHelper.createNewGDJSProject();

    const globalObject1 = project.insertNewObject(
      project,
      'Sprite',
      'MyGlobalObject',
      0
    );
    globalObject1.setAssetStoreId('1234');
    project.insertNewObject(project, 'Sprite', 'MyGlobalObject2', 1);
    const globalObject3 = project.insertNewObject(
      project,
      'Sprite',
      'MyGlobalObject3',
      2
    );
    globalObject3.setAssetStoreId('56-78');

    const scene1 = project.insertNewLayout('Scene 1', 0);
    scene1
      .insertNewObject(project, 'Sprite', 'Scene1Object1', 0)
      .setAssetStoreId('abcd');
    scene1.insertNewObject(project, 'Sprite', 'Scene1Object2', 0);
    const scene2 = project.insertNewLayout('Scene 2', 0);
    scene2
      .insertNewObject(project, 'Sprite', 'Scene2Object1', 0)
      .setAssetStoreId('efgh');
    scene2.insertNewObject(project, 'Sprite', 'Scene2Object2', 0);

    return { project, scene1, scene2 };
  };

  test('enumerate asset store ids for a full project', () => {
    const { project } = makeNewTestProject();
    expect([...enumerateAssetStoreIds(project, null)].sort()).toEqual(
      ['1234', '56-78', 'abcd', 'efgh'].sort()
    );

    project.delete();
  });

  test('enumerate asset store ids for a specific scene', () => {
    const { project, scene1, scene2 } = makeNewTestProject();

    const scene1AssetStoreIds = [
      ...enumerateAssetStoreIds(project, scene1),
    ].sort();
    expect(scene1AssetStoreIds).toEqual(['1234', '56-78', 'abcd'].sort());
    const scene2AssetStoreIds = [
      ...enumerateAssetStoreIds(project, scene2),
    ].sort();
    expect(scene2AssetStoreIds).toEqual(['1234', '56-78', 'efgh'].sort());

    project.delete();
  });
});
