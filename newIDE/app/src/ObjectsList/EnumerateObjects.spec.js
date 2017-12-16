import { enumerateObjects, filterObjectsList } from './EnumerateObjects';
import { makeTestProject } from '../fixtures/TestProject';
const gd = global.gd;

describe('EnumerateObjects', () => {
  const { project, testLayout } = makeTestProject(gd);

  it('can enumerate objects from a project and scene', () => {
    const {
      containerObjectsList,
      projectObjectsList,
      allObjectsList,
    } = enumerateObjects(project, testLayout);

    expect(containerObjectsList).toHaveLength(6);
    expect(projectObjectsList).toHaveLength(2);
    expect(allObjectsList).toHaveLength(8);
  });

  it('can do a case-insensitive search in the lists of objects', () => {
    const {
      containerObjectsList,
      projectObjectsList,
      allObjectsList,
    } = enumerateObjects(project, testLayout);

    expect(
      filterObjectsList(containerObjectsList, 'myshapepainterobject')
    ).toHaveLength(1);
    expect(
      filterObjectsList(projectObjectsList, 'myshapepainterobject')
    ).toHaveLength(0);
    expect(
      filterObjectsList(allObjectsList, 'myshapepainterobject')
    ).toHaveLength(1);
  });
});
