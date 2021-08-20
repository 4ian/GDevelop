import { enumerateObjects, filterObjectsList } from './EnumerateObjects';
import { makeTestProject } from '../fixtures/TestProject';
const gd: libGDevelop = global.gd;

describe('EnumerateObjects', () => {
  it('can enumerate objects from a project and scene', () => {
    const { project, testLayout } = makeTestProject(gd);
    const {
      containerObjectsList,
      projectObjectsList,
      allObjectsList,
    } = enumerateObjects(project, testLayout);

    expect(containerObjectsList).toHaveLength(13);
    expect(projectObjectsList).toHaveLength(2);
    expect(allObjectsList).toHaveLength(15);
  });

  it('can do a case-insensitive search in the lists of objects', () => {
    const { project, testLayout } = makeTestProject(gd);
    const {
      containerObjectsList,
      projectObjectsList,
      allObjectsList,
    } = enumerateObjects(project, testLayout);

    expect(
      filterObjectsList(containerObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
      })
    ).toHaveLength(1);
    expect(
      filterObjectsList(projectObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
      })
    ).toHaveLength(0);
    expect(
      filterObjectsList(allObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
      })
    ).toHaveLength(1);
  });
});
