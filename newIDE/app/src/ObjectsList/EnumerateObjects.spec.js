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

    expect(containerObjectsList).toHaveLength(22);
    expect(projectObjectsList).toHaveLength(2);
    expect(allObjectsList).toHaveLength(24);
  });

  it('can enumerate objects with a filter on object type', () => {
    const { project, testLayout } = makeTestProject(gd);
    const countByType = {
      'Button::PanelSpriteButton': 1,
      'TextObject::Text': 2,
      Sprite: 13,
    };
    Object.entries(countByType).forEach(([type, count]) => {
      const { allObjectsList } = enumerateObjects(project, testLayout, {
        type,
      });

      expect(allObjectsList).toHaveLength(count);
    });
  });

  it('can enumerate objects with a filter on object names', () => {
    const { project, testLayout } = makeTestProject(gd);
    const { allObjectsList } = enumerateObjects(project, testLayout, {
      names: [
        'MyTiledSpriteObject',
        'MyParticleEmitter',
        'MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name',
        'MyButton',
      ],
    });

    expect(allObjectsList).toHaveLength(4);
  });

  it('can enumerate objects with a filter on both object name and type', () => {
    const { project, testLayout } = makeTestProject(gd);
    const { allObjectsList } = enumerateObjects(project, testLayout, {
      type: 'TiledSpriteObject::TiledSprite',
      names: [
        'MyTiledSpriteObject',
        'MyParticleEmitter',
        'MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name',
        'MyButton',
      ],
    });

    expect(allObjectsList).toHaveLength(1);
  });

  it('can enumerate groups from a project and scene', () => {
    const { testLayout } = makeTestProject(gd);
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
    const { testLayout } = makeTestProject(gd);
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
