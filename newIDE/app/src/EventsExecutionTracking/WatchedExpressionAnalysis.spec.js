// @flow
import {
  getWatchableVariables,
  getWatchedExpressionType,
  isWatchedExpressionValid,
} from './WatchedExpressionAnalysis';

// Transitively imported, but shipped as untransformed ESM that Jest cannot
// load. jest.mock is hoisted above imports by babel-jest.
jest.mock('three/src/math/MathUtils', () => ({
  generateUUID: () => 'mock-uuid',
}));

const gd: libGDevelop = global.gd;

describe('WatchedExpressionAnalysis', () => {
  let project: gdProject;
  let scene: gdLayout;
  let projectScopedContainers: gdProjectScopedContainers;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Scene', 0);
    project.getVariables().insertNew('GlobalScore', 0);
    scene.getVariables().insertNew('Score', 0);

    const sceneObjects = scene.getObjects();
    const bat = sceneObjects.insertNewObject(project, 'Sprite', 'Bat', 0);
    bat.getVariables().insertNew('Life', 0);
    bat.getVariables().insertNew('Wings', 1);
    // A global object in a group of the scene: the group has the variables
    // shared by its objects, wherever they are declared.
    const rat = project
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Rat', 0);
    rat.getVariables().insertNew('Life', 0);
    const group = sceneObjects.getObjectGroups().insertNew('Enemies', 0);
    group.addObject('Bat');
    group.addObject('Rat');

    projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
      project,
      scene
    );
  });

  afterEach(() => {
    project.delete();
  });

  describe('getWatchableVariables', () => {
    it('lists the variables of the scene, the project and the objects', () => {
      const names = getWatchableVariables({
        project,
        layout: scene,
        projectScopedContainers,
        isGlobalOnly: false,
      }).map(variable => variable.name);

      expect(names).toEqual([
        'Bat.Life',
        'Bat.Wings',
        'Enemies.Life',
        'GlobalScore',
        'Rat.Life',
        'Score',
      ]);
    });

    it('only lists the global variables when asked to', () => {
      const variables = getWatchableVariables({
        project,
        layout: scene,
        projectScopedContainers,
        isGlobalOnly: true,
      });

      expect(variables).toEqual([
        { name: 'GlobalScore', sourceType: gd.VariablesContainer.Global },
      ]);
    });
  });

  describe('getWatchedExpressionType', () => {
    it('reads a known variable path as a variable', () => {
      expect(getWatchedExpressionType('Score', projectScopedContainers)).toBe(
        'variable'
      );
      expect(
        getWatchedExpressionType('Bat.Life', projectScopedContainers)
      ).toBe('variable');
    });

    it('reads any other expression as a number, or else as a text', () => {
      expect(
        getWatchedExpressionType('Score + 1', projectScopedContainers)
      ).toBe('number');
      expect(
        getWatchedExpressionType('"Hello" + "World"', projectScopedContainers)
      ).toBe('string');
    });
  });

  describe('isWatchedExpressionValid', () => {
    it('accepts what the platform can read', () => {
      expect(isWatchedExpressionValid('Score', projectScopedContainers)).toBe(
        true
      );
      expect(
        isWatchedExpressionValid('Score + 1', projectScopedContainers)
      ).toBe(true);
      expect(
        isWatchedExpressionValid('"Hello" + "World"', projectScopedContainers)
      ).toBe(true);
    });

    it('rejects an expression naming something that does not exist', () => {
      expect(
        isWatchedExpressionValid('UnknownFunction(12)', projectScopedContainers)
      ).toBe(false);
    });
  });
});
