// @flow
import { enumerateExternalsByScene } from './EnumerateExternals';

const gd: libGDevelop = global.gd;

describe('enumerateExternalsByScene', () => {
  it('groups externals under their linked scene and preserves unlinked ones', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Menu', 0);
    project.insertNewLayout('Game', 1);

    const menuLayout = project.insertNewExternalLayout('MenuDecorations', 0);
    menuLayout.setAssociatedLayout('Menu');
    const gameEvents = project.insertNewExternalEvents('SharedGameLogic', 0);
    gameEvents.setAssociatedLayout('Game');
    const staleLayout = project.insertNewExternalLayout('LegacyLayout', 1);
    staleLayout.setAssociatedLayout('RemovedScene');
    const unlinkedEvents = project.insertNewExternalEvents('LegacyEvents', 1);
    unlinkedEvents.setAssociatedLayout('');

    const { bySceneName, unlinkedExternals } = enumerateExternalsByScene(
      project
    );
    const menuExternals = bySceneName.get('Menu');
    const gameExternals = bySceneName.get('Game');
    if (!menuExternals || !gameExternals) {
      throw new Error('Expected externals groups for every scene.');
    }

    expect(menuExternals.externalLayouts.map(item => item.getName())).toEqual([
      'MenuDecorations',
    ]);
    expect(menuExternals.externalEvents.map(item => item.getName())).toEqual(
      []
    );
    expect(gameExternals.externalLayouts.map(item => item.getName())).toEqual(
      []
    );
    expect(gameExternals.externalEvents.map(item => item.getName())).toEqual([
      'SharedGameLogic',
    ]);
    expect(
      unlinkedExternals.externalLayouts.map(item => item.getName())
    ).toEqual(['LegacyLayout']);
    expect(
      unlinkedExternals.externalEvents.map(item => item.getName())
    ).toEqual(['LegacyEvents']);

    project.delete();
  });
});
