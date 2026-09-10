// @flow
import { renameLayoutInProject } from './Layout';

const gd: libGDevelop = global.gd;

describe('renameLayoutInProject', () => {
  const makeProject = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Scene1', 0);
    project.insertNewLayout('Scene2', 1);
    return project;
  };

  it('renames the scene, keeping the same layout pointer', () => {
    const project = makeProject();
    const scene = project.getLayout('Scene1');

    renameLayoutInProject(project, 'Scene1', 'GameScene');

    expect(project.hasLayoutNamed('Scene1')).toBe(false);
    expect(project.hasLayoutNamed('GameScene')).toBe(true);
    expect(scene.getName()).toBe('GameScene');
    expect(project.hasLayoutNamed('Scene2')).toBe(true);

    project.delete();
  });

  it('preserves the first scene when the renamed scene was first', () => {
    const project = makeProject();
    project.setFirstLayout('Scene1');

    renameLayoutInProject(project, 'Scene1', 'GameScene');

    expect(project.getFirstLayout()).toBe('GameScene');

    project.delete();
  });

  it('leaves the first scene untouched when renaming another scene', () => {
    const project = makeProject();
    project.setFirstLayout('Scene1');

    renameLayoutInProject(project, 'Scene2', 'OtherScene');

    expect(project.getFirstLayout()).toBe('Scene1');

    project.delete();
  });
});
