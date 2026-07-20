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
      expect.stringContaining('Resized 1 instance to 50x60x70.')
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
      expect.stringContaining('Rotated 1 instance to (15°, 30°, 45°).')
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
      expect.stringContaining('Repositioned 1 instance using point brush.')
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
      expect.stringContaining('Moved 1 instance to layer "Foreground".')
    );
    const [moved] = getInstances(testScene);
    expect(moved.layer).toBe('Foreground');
    // The instance was moved to another layer, not repositioned.
    expect(moved.x).toBe(10);
    expect(moved.y).toBe(20);
    expect(moved.z).toBe(30);
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
