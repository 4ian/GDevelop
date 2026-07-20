// @flow
import {
  applyVariablesEditorRedesignSession,
  cancelVariablesEditorRedesignSession,
  createVariablesEditorRedesignSession,
  previewVariablesEditorRedesignSession,
  readVariablesFromContainer,
  writeVariablesToContainer,
} from './VariablesEditorRedesignModel';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type RedesignVariable } from './VariablesEditorRedesignWindow';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

const findVariable = (
  variables: Array<RedesignVariable>,
  name: string
): RedesignVariable => {
  const variable = variables.find(variable => variable.name === name);
  if (!variable) throw new Error(`Variable "${name}" was not found.`);
  return variable;
};

describe('VariablesEditorRedesignModel', () => {
  let variablesContainer;

  beforeEach(() => {
    variablesContainer = new gd.VariablesContainer(gd.VariablesContainer.Scene);
    variablesContainer
      .insertNew('score', variablesContainer.count())
      .setValue(42);

    const stats = variablesContainer.insertNew(
      'stats',
      variablesContainer.count()
    );
    stats.castTo('Structure');
    stats.getChild('speed').setValue(400);

    const tags = variablesContainer.insertNew(
      'tags',
      variablesContainer.count()
    );
    tags.castTo('Array');
    tags.pushNew().setString('player');

    const difficulty = new gd.Variable();
    unserializeFromJSObject(difficulty, {
      type: 'enum',
      value: 'Hard',
      values: ['Easy', 'Hard'],
    });
    variablesContainer.insert(
      'difficulty',
      difficulty,
      variablesContainer.count()
    );
    difficulty.delete();
    variablesContainer.resetPersistentUuid();
  });

  afterEach(() => {
    variablesContainer.delete();
  });

  it('reads native scalar, collection and enum values into the merged model', () => {
    const serializedVariablesById: Map<string, Object> = new Map();
    const variables = readVariablesFromContainer({
      variablesContainer,
      scopeId: 'scene-variables',
      serializedVariablesById,
    });

    expect(variables.map(variable => variable.name)).toEqual(
      expect.arrayContaining(['score', 'stats', 'tags', 'difficulty'])
    );
    expect(variables.find(variable => variable.name === 'score')).toMatchObject(
      { type: 'number', value: 42 }
    );
    expect(findVariable(variables, 'stats').children).toEqual([
      expect.objectContaining({ name: 'speed', type: 'number', value: 400 }),
    ]);
    expect(findVariable(variables, 'tags').children).toEqual([
      expect.objectContaining({ name: '0', type: 'text', value: 'player' }),
    ]);
    expect(
      variables.find(variable => variable.name === 'difficulty')
    ).toMatchObject({ type: 'enum', value: 'Hard' });
    expect(serializedVariablesById.size).toBe(6);
  });

  it('writes staged edits while retaining UUIDs used for rename refactoring', () => {
    const serializedVariablesById: Map<string, Object> = new Map();
    const variables = readVariablesFromContainer({
      variablesContainer,
      scopeId: 'scene-variables',
      serializedVariablesById,
    });
    const score = findVariable(variables, 'score');
    const stats = findVariable(variables, 'stats');
    const difficulty = findVariable(variables, 'difficulty');
    const originalScoreId = score.id;

    writeVariablesToContainer({
      variablesContainer,
      serializedVariablesById,
      variables: [
        { ...score, name: 'points', value: 100 },
        stats,
        difficulty,
        {
          id: 'new-enabled',
          scopeId: 'scene-variables',
          name: 'enabled',
          type: 'boolean',
          value: true,
        },
      ],
    });

    expect(variablesContainer.count()).toBe(4);
    expect(variablesContainer.getNameAt(0)).toBe('points');
    expect(variablesContainer.get('points').getValue()).toBe(100);
    expect(variablesContainer.get('enabled').getBool()).toBe(true);

    const serializedPoints = serializeToJSObject(
      variablesContainer.get('points')
    );
    const serializedEnabled = serializeToJSObject(
      variablesContainer.get('enabled')
    );
    const serializedDifficulty = serializeToJSObject(
      variablesContainer.get('difficulty')
    );
    expect(serializedPoints.persistentUuid).toBe(originalScoreId);
    expect(serializedEnabled.persistentUuid).toBeTruthy();
    expect(serializedDifficulty.values).toEqual(['Easy', 'Hard']);
  });

  it('builds and applies a complete scene session from the legacy scope accessor', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Game', 0);
    project
      .getVariables()
      .insertNew('difficulty', project.getVariables().count())
      .setValue(2);
    layout
      .getVariables()
      .insertNew('score', layout.getVariables().count())
      .setValue(10);
    const player = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    player
      .getVariables()
      .insertNew('health', player.getVariables().count())
      .setValue(100);
    const accessor = new ProjectScopedContainersAccessor({ project, layout });
    const session = createVariablesEditorRedesignSession(accessor);

    try {
      expect(session.title).toBe('Variables in Scene: Game');
      expect(session.scopes.map(scope => scope.label)).toEqual([
        'Scene',
        'Global',
        'Player',
      ]);
      expect(session.variables.map(variable => variable.name)).toEqual(
        expect.arrayContaining(['score', 'difficulty', 'health'])
      );

      const stagedVariables: Array<RedesignVariable> = session.variables.map(
        variable =>
          variable.name === 'score'
            ? ({ ...variable, name: 'points', value: 25 }: RedesignVariable)
            : variable
      );
      applyVariablesEditorRedesignSession({
        session,
        variables: stagedVariables,
      });

      expect(layout.getVariables().has('score')).toBe(false);
      expect(
        layout
          .getVariables()
          .get('points')
          .getValue()
      ).toBe(25);
      expect(
        project
          .getVariables()
          .get('difficulty')
          .getValue()
      ).toBe(2);
      expect(
        player
          .getVariables()
          .get('health')
          .getValue()
      ).toBe(100);
      expect(session.released).toBe(true);
    } finally {
      cancelVariablesEditorRedesignSession(session);
      project.delete();
    }
  });

  it('uses staged values for preview and restores originals on Cancel', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Game', 0);
    layout
      .getVariables()
      .insertNew('score', 0)
      .setValue(10);
    const accessor = new ProjectScopedContainersAccessor({ project, layout });
    const session = createVariablesEditorRedesignSession(accessor);

    try {
      const stagedVariables: Array<RedesignVariable> = session.variables.map(
        variable =>
          variable.name === 'score'
            ? ({ ...variable, name: 'points', value: 30 }: RedesignVariable)
            : variable
      );
      previewVariablesEditorRedesignSession({
        session,
        variables: stagedVariables,
      });
      expect(layout.getVariables().has('score')).toBe(false);
      expect(
        layout
          .getVariables()
          .get('points')
          .getValue()
      ).toBe(30);

      cancelVariablesEditorRedesignSession(session);
      expect(layout.getVariables().has('points')).toBe(false);
      expect(
        layout
          .getVariables()
          .get('score')
          .getValue()
      ).toBe(10);
    } finally {
      cancelVariablesEditorRedesignSession(session);
      project.delete();
    }
  });
});
