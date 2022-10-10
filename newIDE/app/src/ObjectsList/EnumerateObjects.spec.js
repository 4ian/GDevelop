import {
  enumerateObjects,
  enumerateGroups,
  filterObjectsList,
  filterGroupsList,
  type GroupWithContextList,
} from './EnumerateObjects';
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

    expect(containerObjectsList).toHaveLength(19);
    expect(projectObjectsList).toHaveLength(2);
    expect(allObjectsList).toHaveLength(21);
  });

  it('can enumerate groups from a project and scene', () => {
    const { project, testLayout } = makeTestProject(gd);
    const allGroupsList = enumerateGroups(testLayout.getObjectGroups());

    expect(allGroupsList).toHaveLength(4);
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
      filterObjectsList(containerObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
        hideExactMatches: true,
      })
    ).toHaveLength(1);
    expect(
      filterObjectsList(containerObjectsList, {
        searchText: 'MyShapePainterObject',
        selectedTags: [],
        hideExactMatches: true,
      })
    ).toHaveLength(0);
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
    expect(
      filterObjectsList(allObjectsList, {
        searchText: 'myshapepainterobject',
        selectedTags: [],
        hideExactMatches: true,
      })
    ).toHaveLength(1);
    expect(
      filterObjectsList(allObjectsList, {
        searchText: 'MyShapePainterObject',
        selectedTags: [],
        hideExactMatches: true,
      })
    ).toHaveLength(0);
  });

  it('can do a case-insensitive search in the lists of groups of objects', () => {
    const { project, testLayout } = makeTestProject(gd);
    const objectGroupsList: GroupWithContextList = enumerateGroups(
      testLayout.getObjectGroups()
    ).map(group => ({ group, global: false }));

    expect(
      filterGroupsList(objectGroupsList, {
        searchText: 'groupofsprites',
      })
    ).toHaveLength(1);
    expect(
      filterGroupsList(objectGroupsList, {
        searchText: 'groupofsprites',
        hideExactMatches: true,
      })
    ).toHaveLength(1);
    expect(
      filterGroupsList(objectGroupsList, {
        searchText: 'GroupOfSprites',
        hideExactMatches: true,
      })
    ).toHaveLength(0);
  });
});
