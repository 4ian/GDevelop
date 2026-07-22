// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('put_2d_instances (modifications of existing instances)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
  });

  afterEach(() => {
    project.delete();
  });

  // Collect every instance of the scene with the attributes asserted on by the
  // tests. `id` is the 10-character prefix of the persistent uuid, as reported
  // by `describe_instances` and expected in `existing_instance_ids`.
  const getInstances = (
    scene: gdLayout
  ): Array<{|
    id: string,
    x: number,
    y: number,
    layer: string,
    zOrder: number,
  |}> => {
    const instances = [];
    const functor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[cannot-write]
    functor.invoke = instancePtr => {
      const instance: gdInitialInstance = gd.wrapPointer(
        // $FlowFixMe[incompatible-type]
        instancePtr,
        gd.InitialInstance
      );
      instances.push({
        id: instance.getPersistentUuid().slice(0, 10),
        x: instance.getX(),
        y: instance.getY(),
        layer: instance.getLayer(),
        zOrder: instance.getZOrder(),
      });
    };
    // $FlowFixMe[incompatible-type]
    scene.getInitialInstances().iterateOverInstances(functor);
    functor.delete();
    return instances;
  };

  const putInstances = async (args: any) => {
    const result: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          layer_name: '',
          ...args,
        },
      }
    );
    expect(result.success).toBe(true);
    return result;
  };

  it('moves an existing instance to a different layer with the none brush', async () => {
    testScene.insertNewLayer('UI', testScene.getLayersCount());
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);
    expect(created.layer).toBe('');

    const result = await putInstances({
      brush_kind: 'none',
      layer_name: 'UI',
      existing_instance_ids: created.id,
    });

    expect(result.message).toEqual(
      expect.stringContaining('Moved 1 instance of "Player" to layer "UI".')
    );
    const [moved] = getInstances(testScene);
    expect(moved.layer).toBe('UI');
    // The instance was moved to another layer, not repositioned.
    expect(moved.x).toBe(100);
    expect(moved.y).toBe(200);
    expect(getInstances(testScene)).toHaveLength(1);
  });

  it('changes the Z-order of an existing instance with the none brush', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'none',
      existing_instance_ids: created.id,
      instances_z_order: 42,
    });

    expect(result.message).toEqual(
      expect.stringContaining(
        'Changed Z-order of 1 instance of "Player" to 42.'
      )
    );
    const [modified] = getInstances(testScene);
    expect(modified.zOrder).toBe(42);
  });

  // A request whose values all equal the current ones does nothing: it must
  // fail with an explanation instead of returning a misleading success.
  it('fails when the requested values are identical to the current ones', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 1,
      instances_z_order: 5,
    });
    const [created] = getInstances(testScene);
    expect(created.zOrder).toBe(5);

    const result = await editorFunctions.put_2d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Player',
        layer_name: '',
        brush_kind: 'none',
        existing_instance_ids: created.id,
        instances_z_order: 5,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Matched 1 existing instance but the requested values are identical to their current ones, so nothing changed.'
      )
    );
    // The "none" brush cannot move: the failure must point to the point brush.
    expect(result.message).toEqual(
      expect.stringContaining('To move instances, use the "point" brush')
    );
  });

  // Matching instances with the none brush but not asking for any change is a
  // no-op: it must fail so the agent provides a value to modify.
  it('fails when instances are matched but no change is requested', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await editorFunctions.put_2d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Player',
        layer_name: '',
        brush_kind: 'none',
        existing_instance_ids: created.id,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Matched 1 existing instance but no change was requested'
      )
    );
    // Nothing was created or changed.
    const [instance] = getInstances(testScene);
    expect(instance.x).toBe(100);
    expect(instance.y).toBe(200);
    expect(getInstances(testScene)).toHaveLength(1);
  });

  // A trailing comma used to leave an empty id in the list, and
  // `uuid.startsWith('')` matches every instance: erasing "abc," would wipe
  // the whole scene instead of the single targeted instance.
  it('ignores empty entries in existing_instance_ids instead of matching every instance', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 2,
    });
    const [first, second] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'erase',
      existing_instance_ids: `${first.id},`,
    });

    expect(result.message).toEqual(
      expect.stringContaining('Erased 1 instance')
    );
    // Only the targeted instance was erased, not the whole scene.
    const remaining = getInstances(testScene);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
  });

  it('accepts spaces after the commas in existing_instance_ids', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 2,
    });
    const [first, second] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'erase',
      existing_instance_ids: `${first.id}, ${second.id}`,
    });

    expect(result.message).toEqual(
      expect.stringContaining('Erased 2 instances')
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  // An instance created without an object name would be a corrupted, invisible
  // orphan: the call must fail instead of creating it and reporting a success.
  it('fails to create instances when object_name is missing', async () => {
    const result = await editorFunctions.put_2d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        layer_name: '',
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: 2,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Cannot create 2 new instance(s) without `object_name`.'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  // Without a radius, the random brush would silently stack every instance
  // at the exact brush position.
  it('fails when using the random_in_circle brush without a brush_size', async () => {
    const result = await editorFunctions.put_2d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Player',
        layer_name: '',
        brush_kind: 'random_in_circle',
        brush_position: '100,200',
        new_instances_count: 3,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'The "random_in_circle" brush requires a positive `brush_size`'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  it('fails on a negative new_instances_count', async () => {
    const result = await editorFunctions.put_2d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Player',
        layer_name: '',
        brush_kind: 'point',
        brush_position: '100,200',
        new_instances_count: -3,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        '`new_instances_count` must be 0 or a positive integer (got -3).'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  // The creation loop runs a whole number of times: a fractional count must
  // be normalized so the reported count matches what was created.
  it('rounds a fractional new_instances_count', async () => {
    const result = await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 2.4,
    });

    expect(result.message).toEqual(
      expect.stringContaining('Created 2 new instances')
    );
    expect(getInstances(testScene)).toHaveLength(2);
  });

  it('moves existing instances along a line with the line brush', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '100,200',
      new_instances_count: 2,
    });
    const created = getInstances(testScene);
    expect(created).toHaveLength(2);

    const result = await putInstances({
      brush_kind: 'line',
      brush_position: '0,50',
      brush_end_position: '300,50',
      existing_instance_ids: created.map(instance => instance.id).join(','),
    });

    expect(result.message).toEqual(
      expect.stringContaining(
        'Repositioned 2 instances of "Player" using line brush.'
      )
    );
    // No new instance is created; the 2 existing ones are spread on the line.
    const positions = getInstances(testScene)
      .map(({ x, y }) => ({ x, y }))
      .sort((a, b) => a.x - b.x || a.y - b.y);
    expect(positions).toEqual([{ x: 0, y: 50 }, { x: 300, y: 50 }]);
  });
});
