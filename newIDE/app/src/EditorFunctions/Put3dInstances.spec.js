// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { makeTestExtensions } from '../fixtures/TestExtensions';

const gd: libGDevelop = global.gd;

describe('put_3d_instances (modifications of existing instances)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene
      .getObjects()
      .insertNewObject(project, 'FakeScene3D::Cube3DObject', 'Cube', 0);
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
    z: number,
    layer: string,
    hasCustomSize: boolean,
    hasCustomDepth: boolean,
    customWidth: number,
    customHeight: number,
    customDepth: number,
    rotationX: number,
    rotationY: number,
    angle: number,
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
        z: instance.getZ(),
        layer: instance.getLayer(),
        hasCustomSize: instance.hasCustomSize(),
        hasCustomDepth: instance.hasCustomDepth(),
        customWidth: instance.getCustomWidth(),
        customHeight: instance.getCustomHeight(),
        customDepth: instance.getCustomDepth(),
        rotationX: instance.getRotationX(),
        rotationY: instance.getRotationY(),
        angle: instance.getAngle(),
      });
    };
    // $FlowFixMe[incompatible-type]
    scene.getInitialInstances().iterateOverInstances(functor);
    functor.delete();
    return instances;
  };

  const putInstances = async (args: any) => {
    const result: EditorFunctionGenericOutput = await editorFunctions.put_3d_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Cube',
          layer_name: '',
          ...args,
        },
      }
    );
    expect(result.success).toBe(true);
    return result;
  };

  it('resizes an existing instance in place with the none brush', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'none',
      existing_instance_ids: created.id,
      instances_size: '50,60,70',
    });

    expect(result.message).toEqual(
      expect.stringContaining('Resized 1 instance of "Cube" to 50x60x70.')
    );
    const [resized] = getInstances(testScene);
    expect(resized.hasCustomSize).toBe(true);
    expect(resized.hasCustomDepth).toBe(true);
    expect(resized.customWidth).toBe(50);
    expect(resized.customHeight).toBe(60);
    expect(resized.customDepth).toBe(70);
    // The instance was resized in place, not moved.
    expect(resized.x).toBe(10);
    expect(resized.y).toBe(20);
    expect(resized.z).toBe(30);
  });

  it('rotates an existing instance on the three axes with the none brush', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'none',
      existing_instance_ids: created.id,
      instances_rotation: '15,30,45',
    });

    expect(result.message).toEqual(
      expect.stringContaining(
        'Rotated 1 instance of "Cube" to (15°, 30°, 45°).'
      )
    );
    const [rotated] = getInstances(testScene);
    expect(rotated.rotationX).toBe(15);
    expect(rotated.rotationY).toBe(30);
    expect(rotated.angle).toBe(45);
  });

  it('moves an existing instance to a new position with the point brush', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await putInstances({
      brush_kind: 'point',
      brush_position: '40,50,60',
      existing_instance_ids: created.id,
    });

    expect(result.message).toEqual(
      expect.stringContaining(
        'Repositioned 1 instance of "Cube" using point brush.'
      )
    );
    // No new instance is created; the existing one is repositioned.
    const instances = getInstances(testScene);
    expect(instances).toHaveLength(1);
    expect(instances[0].x).toBe(40);
    expect(instances[0].y).toBe(50);
    expect(instances[0].z).toBe(60);
  });

  it('moves an existing instance to a different layer with the none brush', async () => {
    testScene.insertNewLayer('Foreground', testScene.getLayersCount());
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);
    expect(created.layer).toBe('');

    const result = await putInstances({
      brush_kind: 'none',
      layer_name: 'Foreground',
      existing_instance_ids: created.id,
    });

    expect(result.message).toEqual(
      expect.stringContaining(
        'Moved 1 instance of "Cube" to layer "Foreground".'
      )
    );
    const [moved] = getInstances(testScene);
    expect(moved.layer).toBe('Foreground');
    // The instance was moved to another layer, not repositioned.
    expect(moved.x).toBe(10);
    expect(moved.y).toBe(20);
    expect(moved.z).toBe(30);
  });

  // A trailing comma used to leave an empty id in the list, and
  // `uuid.startsWith('')` matches every instance: erasing "abc," would wipe
  // the whole scene instead of the single targeted instance.
  it('ignores empty entries in existing_instance_ids instead of matching every instance', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
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

  // An instance created without an object name would be a corrupted, invisible
  // orphan: the call must fail instead of creating it and reporting a success.
  it('fails to create instances when object_name is missing', async () => {
    const result = await editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        layer_name: '',
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: 1,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Cannot create 1 new instance(s) without `object_name`.'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  // Without a radius, the random brush would silently stack every instance
  // at the exact brush position.
  it('fails when using the random_in_sphere brush without a brush_size', async () => {
    const result = await editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Cube',
        layer_name: '',
        brush_kind: 'random_in_sphere',
        brush_position: '10,20,30',
        new_instances_count: 3,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'The "random_in_sphere" brush requires a positive `brush_size`'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  it('fails on a negative new_instances_count', async () => {
    const result = await editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Cube',
        layer_name: '',
        brush_kind: 'point',
        brush_position: '10,20,30',
        new_instances_count: -1,
      },
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        '`new_instances_count` must be 0 or a positive integer (got -1).'
      )
    );
    expect(getInstances(testScene)).toHaveLength(0);
  });

  // Matching instances with the none brush but not asking for any change is a
  // no-op: it must fail so the agent provides a value to modify.
  it('fails when instances are matched but no change is requested', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getInstances(testScene);

    const result = await editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Cube',
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
    const instances = getInstances(testScene);
    expect(instances).toHaveLength(1);
    expect(instances[0].x).toBe(10);
    expect(instances[0].y).toBe(20);
    expect(instances[0].z).toBe(30);
  });
});

describe('put_3d_instances (instances_hidden)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene
      .getObjects()
      .insertNewObject(project, 'FakeScene3D::Cube3DObject', 'Cube', 0);
  });

  afterEach(() => {
    project.delete();
  });

  const getRawInstances = (scene: gdLayout): Array<gdInitialInstance> => {
    const instances = [];
    const functor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[cannot-write]
    functor.invoke = instancePtr => {
      const instance: gdInitialInstance = gd.wrapPointer(
        // $FlowFixMe[incompatible-type]
        instancePtr,
        gd.InitialInstance
      );
      instances.push(instance);
    };
    // $FlowFixMe[incompatible-type]
    scene.getInitialInstances().iterateOverInstances(functor);
    functor.delete();
    return instances;
  };

  const putInstances = async (args: any) =>
    editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Cube',
        layer_name: '',
        ...args,
      },
    });

  it('creates 3D instances hidden at start', async () => {
    const result = await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
      instances_hidden: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toEqual(expect.stringContaining('hidden at start'));
    const [created] = getRawInstances(testScene);
    expect(created.isHidden()).toBe(true);
  });

  it('hides an existing 3D instance with the none brush, alone as a change', async () => {
    await putInstances({
      brush_kind: 'point',
      brush_position: '10,20,30',
      new_instances_count: 1,
    });
    const [created] = getRawInstances(testScene);
    expect(created.isHidden()).toBe(false);

    const result = await putInstances({
      brush_kind: 'none',
      existing_instance_ids: created.getPersistentUuid().slice(0, 10),
      instances_hidden: true,
    });
    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      expect.stringContaining('Marked 1 instance of "Cube" as hidden at start')
    );
    expect(created.isHidden()).toBe(true);
  });
});

describe('put_3d_instances (brush_position_anchor)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  // A custom object whose area is symmetric on X and Y and starts at 0 on Z:
  // its origin is in the middle of its width and its height, and at the bottom
  // of its depth - like the 3D models a scene is built from.
  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('Kit', 0);
    const turret = extension.getEventsBasedObjects().insertNew('Turret', 0);
    turret.markAsRenderedIn3D(true);
    turret.setAreaMinX(-60);
    turret.setAreaMaxX(60);
    turret.setAreaMinY(-40);
    turret.setAreaMaxY(40);
    turret.setAreaMinZ(0);
    turret.setAreaMaxZ(70);
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Kit::Turret', 'Turret', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 1);
  });

  afterEach(() => {
    project.delete();
  });

  const putInstances = async (args: any) =>
    await editorFunctions.put_3d_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scene_name: 'TestScene',
        object_name: 'Turret',
        layer_name: '',
        brush_kind: 'point',
        new_instances_count: 1,
        ...args,
      },
    });

  const getPlacedInstance = () => {
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
        position: [instance.getX(), instance.getY(), instance.getZ()],
      });
    };
    // $FlowFixMe[incompatible-type]
    testScene.getInitialInstances().iterateOverInstances(functor);
    functor.delete();
    return instances[0];
  };

  const getPlacedPosition = () => {
    const placed = getPlacedInstance();
    return placed ? placed.position : undefined;
  };

  it('places instances by their origin without an anchor', async () => {
    const result = await putInstances({ brush_position: '0,0,0' });

    expect(result.success).toBe(true);
    expect(getPlacedPosition()).toEqual([0, 0, 0]);
  });

  it('centers the box of the instances on the position', async () => {
    const result = await putInstances({
      brush_position: '0,0,0',
      brush_position_anchor: 'center',
    });

    expect(result.success).toBe(true);
    // The origin is already in the middle on X and Y: only Z moves, by half
    // the depth of the object.
    expect(getPlacedPosition()).toEqual([0, 0, -35]);
    expect(result.message).toEqual(
      expect.stringContaining(
        'anchored by their center on 0, 0, 0, origin at this position, each occupies X -60 to 60, Y -40 to 40, Z -35 to 35'
      )
    );
  });

  it('rests the instances on the position with the bottom_center anchor', async () => {
    const result = await putInstances({
      brush_position: '10,20,30',
      brush_position_anchor: 'bottom_center',
    });

    expect(result.success).toBe(true);
    expect(getPlacedPosition()).toEqual([10, 20, 30]);
  });

  it('puts the minimum corner of the box on the position', async () => {
    const result = await putInstances({
      brush_position: '0,0,0',
      brush_position_anchor: 'min_corner',
    });

    expect(result.success).toBe(true);
    expect(getPlacedPosition()).toEqual([60, 40, 0]);
  });

  it('scales the origin of the object to the size of the instances', async () => {
    const result = await putInstances({
      brush_position: '0,0,0',
      brush_position_anchor: 'min_corner',
      instances_size: '60,40,35',
    });

    expect(result.success).toBe(true);
    expect(getPlacedPosition()).toEqual([30, 20, 0]);
  });

  it('moves an existing instance by its anchor, at the size it has', async () => {
    await putInstances({
      brush_position: '0,0,0',
      instances_size: '60,40,35',
    });
    const placed = getPlacedInstance();
    expect(placed.position).toEqual([0, 0, 0]);

    const result = await putInstances({
      brush_position: '100,100,100',
      brush_position_anchor: 'center',
      new_instances_count: 0,
      existing_instance_ids: placed.id,
    });

    // Half the default size: its box is 60x40x35 around the position.
    expect(result.success).toBe(true);
    expect(getPlacedPosition()).toEqual([100, 100, 82.5]);
  });

  it('refuses an anchor when the box of the object is unknown', async () => {
    const result = await putInstances({
      object_name: 'Player',
      brush_position: '0,0,0',
      brush_position_anchor: 'center',
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        '`brush_position_anchor: "center"` needs the box of "Player", which is unknown'
      )
    );
    expect(getPlacedPosition()).toBe(undefined);
  });

  it('refuses an anchor it does not know', async () => {
    const result = await putInstances({
      brush_position: '0,0,0',
      brush_position_anchor: 'top_left',
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        '`brush_position_anchor` must be one of: origin, min_corner, center, bottom_center (got "top_left").'
      )
    );
  });
});
