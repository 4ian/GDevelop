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

    expect(containerObjectsList).toHaveLength(14);
    expect(projectObjectsList).toHaveLength(2);
    expect(allObjectsList).toHaveLength(16);
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
        searchText: 'myshapepainterobj',
        selectedTags: [],
      })
    ).toHaveLength(1);
    expect(
      filterObjectsList(containerObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
      })
    ).toHaveLength(0);
    expect(
      filterObjectsList(projectObjectsList, {
        searchText: 'myshapepainterobj',
        selectedTags: [],
      })
    ).toHaveLength(0);
    expect(
      filterObjectsList(allObjectsList, {
        searchText: 'myshapepainterobj',
        selectedTags: [],
      })
    ).toHaveLength(1);
    expect(
      filterObjectsList(allObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
      })
    ).toHaveLength(0);
  });
});
