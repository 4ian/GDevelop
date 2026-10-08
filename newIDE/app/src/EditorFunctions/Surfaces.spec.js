// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import {
  type InGameEditorEditedLocation,
  type InGameEditorRaycastRequest,
  type InGameEditorRaycastResult,
} from '../EmbeddedGame/InGameEditorQueries';

// The in-game editor runs the game in a frame: it is replaced by a fake one
// showing a scene with a ground and a platform.
const mockRaycastInGameEditor = jest.fn<
  [InGameEditorRaycastRequest],
  Promise<InGameEditorRaycastResult>
>();
const mockUpdateInGameEditor = jest.fn<[], string>();
const mockEnableInGameEditor = jest.fn<[], void>();
jest.mock('../EmbeddedGame/InGameEditorQueries', () => ({
  updateInGameEditor: () => mockUpdateInGameEditor(),
  enableInGameEditor: () => mockEnableInGameEditor(),
  raycastInGameEditor: (request: InGameEditorRaycastRequest) =>
    mockRaycastInGameEditor(request),
}));

const gd: libGDevelop = global.gd;

const testSceneLocation: InGameEditorEditedLocation = {
  sceneName: 'TestScene',
  externalLayoutName: null,
  eventsBasedObjectType: null,
  eventsBasedObjectVariantName: null,
};

/**
 * The scene shown by the fake in-game editor: in 3D, a ground at Z = 100,
 * and in 2D, a platform at Y = 300, both from X = 0 to X = 1000.
 */
const raycastOnGroundAndPlatform = async (
  request: InGameEditorRaycastRequest
): Promise<InGameEditorRaycastResult> => {
  const surface =
    request.mode === '3d'
      ? { objectName: 'Ground', instanceUuid: 'ground-instance-uuid' }
      : { objectName: 'Platform', instanceUuid: 'platform-instance-uuid' };
  const isSurfaceIgnored =
    request.excludedObjectNames.includes(surface.objectName) ||
    (!!request.includedObjectNames &&
      !request.includedObjectNames.includes(surface.objectName));
  return {
    editedLocation: testSceneLocation,
    hits: request.rays.map(({ from, to }) => {
      if (isSurfaceIgnored || from[0] < 0 || from[0] > 1000) return null;
      if (request.mode === '3d') {
        return from[2] >= 100 && to[2] <= 100
          ? { x: from[0], y: from[1], z: 100, ...surface }
          : null;
      }
      return from[1] <= 300 && to[1] >= 300
        ? { x: from[0], y: 300, z: 0, ...surface }
        : null;
    }),
  };
};

const getInstanceOutputs = (
  result: EditorFunctionGenericOutput
): Array<Object> => result.instances || [];

describe('finding surfaces with the in-game editor', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    const extension = project.insertNewEventsFunctionsExtension('Kit', 0);
    const addCustomObject = (
      name: string,
      isRenderedIn3D: boolean,
      [width, height, depth]: [number, number, number]
    ) => {
      const customObject = extension.getEventsBasedObjects().insertNew(name, 0);
      customObject.markAsRenderedIn3D(isRenderedIn3D);
      customObject.setAreaMinX(0);
      customObject.setAreaMaxX(width);
      customObject.setAreaMinY(0);
      customObject.setAreaMaxY(height);
      customObject.setAreaMinZ(0);
      customObject.setAreaMaxZ(depth);
      testScene.getObjects().insertNewObject(project, `Kit::${name}`, name, 0);
    };
    addCustomObject('House', true, [100, 100, 50]);
    addCustomObject('Ground', true, [200, 100, 100]);
    addCustomObject('Player', false, [40, 20, 0]);
    testScene
      .getObjects()
      .getObjectGroups()
      .insertNew('Grounds', 0)
      .addObject('Ground');
    mockUpdateInGameEditor.mockReset();
    mockUpdateInGameEditor.mockReturnValue('up-to-date');
    mockEnableInGameEditor.mockReset();
    mockRaycastInGameEditor.mockReset();
    mockRaycastInGameEditor.mockImplementation(raycastOnGroundAndPlatform);
  });

  afterEach(() => {
    project.delete();
  });

  const getInstances = (): Array<gdInitialInstance> => {
    const instances = [];
    const functor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[cannot-write]
    functor.invoke = instancePtr => {
      instances.push(
        gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        )
      );
    };
    // $FlowFixMe[incompatible-type]
    testScene.getInitialInstances().iterateOverInstances(functor);
    functor.delete();
    return instances;
  };

  const getInstancePositions = (): Array<Array<number>> =>
    getInstances().map(instance => [
      instance.getX(),
      instance.getY(),
      instance.getZ(),
    ]);

  const putInstances = async (
    functionName: 'put_3d_instances' | 'put_2d_instances',
    args: any
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions[functionName].launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: {
        scope: { type: 'scene', scene_name: 'TestScene' },
        layer_name: '',
        ...args,
      },
    });

  describe('put_3d_instances with drop_to_surface', () => {
    it('sends the changes made before in the batch to the editor before finding surfaces', async () => {
      const calls: Array<string> = [];
      mockRaycastInGameEditor.mockImplementation(async request => {
        calls.push('raycast');
        return raycastOnGroundAndPlatform(request);
      });

      await editorFunctions.put_3d_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        sendChangesToEditor: () => {
          calls.push('sendChangesToEditor');
        },
        args: {
          scope: { type: 'scene', scene_name: 'TestScene' },
          layer_name: '',
          object_name: 'House',
          brush_kind: 'point',
          brush_position: '300,400',
          drop_to_surface: {},
        },
      });

      expect(calls[0]).toBe('sendChangesToEditor');
      expect(calls).toContain('raycast');
    });

    it('drops new instances from above everything onto the surface below', async () => {
      const result = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        instances_size: '100,100,50',
        drop_to_surface: {},
      });

      expect(result.success).toBe(true);
      // The bottom center of the house is on the ground.
      expect(getInstancePositions()).toEqual([[250, 350, 100]]);
      expect(result.message).toEqual(
        expect.stringContaining(
          'Opened scene "TestScene" in the editor to find the surfaces.'
        )
      );
      expect(result.message).toEqual(
        expect.stringContaining(
          'rests on "Ground" (instance ground-ins) at Z=100'
        )
      );
      const [request] = mockRaycastInGameEditor.mock.calls
        .map(([request]) => request)
        .filter(request => request.rays.length > 0);
      expect(request.rays).toEqual([
        { from: [300, 400, 1000000], to: [300, 400, -1000000] },
      ]);
    });

    it('leaves the instances on Z = 0 when no surface is below them', async () => {
      const result = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '2000,400',
        instances_size: '100,100,50',
        drop_to_surface: {},
      });

      expect(result.success).toBe(true);
      expect(getInstancePositions()).toEqual([[1950, 350, 0]]);
      expect(result.message).toEqual(
        expect.stringContaining(
          'no surface found below, left at the brush position with its bottom at Z=0'
        )
      );
    });

    it('only finds the surfaces below the Z of the brush position', async () => {
      const result = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400,50',
        instances_size: '100,100,50',
        drop_to_surface: {},
      });

      expect(result.success).toBe(true);
      // The ground is above: the house stays at the brush position.
      expect(getInstancePositions()).toEqual([[250, 350, 50]]);
      const raysRequest = mockRaycastInGameEditor.mock.calls
        .map(([request]) => request)
        .find(request => request.rays.length > 0);
      expect(raysRequest && raysRequest.rays).toEqual([
        { from: [300, 400, 50], to: [300, 400, -1999950] },
      ]);
    });

    it('only finds the surfaces of the included objects and groups', async () => {
      await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        instances_size: '100,100,50',
        drop_to_surface: { exclude_objects: 'Grounds' },
      });
      await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        instances_size: '100,100,50',
        drop_to_surface: { include_objects: 'Grounds' },
      });

      expect(getInstancePositions()).toEqual([[250, 350, 0], [250, 350, 100]]);
    });

    it('puts existing instances back on the surface below them with the none brush', async () => {
      await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '250,350,500',
        instances_size: '100,100,50',
      });

      const result = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'none',
        existing_instance_ids: getInstances()[0]
          .getPersistentUuid()
          .slice(0, 10),
        instances_size: '100,100,50',
        drop_to_surface: {},
      });

      expect(result.success).toBe(true);
      expect(getInstancePositions()).toEqual([[250, 350, 100]]);
      const raysRequest = mockRaycastInGameEditor.mock.calls
        .map(([request]) => request)
        .find(request => request.rays.length > 0);
      expect(raysRequest && raysRequest.excludedInstanceUuids).toHaveLength(1);
    });

    it('changes nothing when the in-game editor does not answer', async () => {
      await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '0,0,500',
      });
      mockRaycastInGameEditor.mockImplementation(async request => {
        if (request.rays.length === 0)
          return { editedLocation: testSceneLocation, hits: [] };
        throw new Error('Timeout');
      });

      // The editor waits for the in-game editor: let the time pass.
      jest.useFakeTimers();
      let isDone = false;
      const resultPromise = putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        new_instances_count: 2,
        existing_instance_ids: getInstances()[0]
          .getPersistentUuid()
          .slice(0, 10),
        instances_size: '100,100,50',
        drop_to_surface: {},
      });
      resultPromise.then(() => {
        isDone = true;
      });
      while (!isDone) {
        jest.advanceTimersByTime(1000);
        for (let index = 0; index < 20; index++) await Promise.resolve();
      }
      jest.useRealTimers();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.message).toEqual(
        expect.stringContaining(
          'Surfaces could not be found: the 3D editor did not answer (Timeout). Nothing was changed.'
        )
      );
      expect(getInstancePositions()).toEqual([[0, 0, 500]]);
      expect(getInstances()[0].hasCustomSize()).toBe(false);
    });

    it('switches the scene editors to the in-game editor when it is not used', async () => {
      mockUpdateInGameEditor.mockReturnValueOnce('disabled');

      const result = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        instances_size: '100,100,50',
        drop_to_surface: {},
      });

      expect(mockEnableInGameEditor).toHaveBeenCalled();
      expect(result.message).toEqual(
        expect.stringContaining(
          'Switched the scene editor to the 3D editor and opened scene "TestScene" in the editor to find the surfaces.'
        )
      );
    });

    it('refuses unknown objects and anchors other than bottom_center', async () => {
      const unknownObjectResult = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        drop_to_surface: { include_objects: 'Lava' },
      });
      const anchorResult = await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '300,400',
        brush_position_anchor: 'center',
        drop_to_surface: {},
      });

      expect(unknownObjectResult.success).toBe(false);
      expect(unknownObjectResult.message).toEqual(
        'No object or group named "Lava" (in `drop_to_surface`).'
      );
      expect(anchorResult.success).toBe(false);
      expect(getInstancePositions()).toEqual([]);
      expect(mockRaycastInGameEditor).not.toHaveBeenCalled();
    });
  });

  describe('put_2d_instances with drop_to_surface', () => {
    it('drops instances down onto the platform below the brush position', async () => {
      const result = await putInstances('put_2d_instances', {
        object_name: 'Player',
        brush_kind: 'point',
        brush_position: '100,50',
        instances_size: '40,20',
        drop_to_surface: {},
      });

      expect(result.success).toBe(true);
      // The bottom center of the player is on the platform.
      expect(getInstancePositions()).toEqual([[80, 280, 0]]);
      expect(result.message).toEqual(
        expect.stringContaining(
          'rests on "Platform" (instance platform-i) at Y=300'
        )
      );
    });
  });

  describe('describe_instances with surface_beneath', () => {
    const describeInstances = async (
      args: any
    ): Promise<EditorFunctionGenericOutput> =>
      editorFunctions.describe_instances.launchFunction({
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scope: { type: 'scene', scene_name: 'TestScene' }, ...args },
      });

    beforeEach(async () => {
      // A house floating 50 pixels above the ground.
      await putInstances('put_3d_instances', {
        object_name: 'House',
        brush_kind: 'point',
        brush_position: '100,100,150',
        instances_size: '100,100,50',
      });
    });

    it('gives the surface below each instance and its gap to it', async () => {
      const result = await describeInstances({ surface_beneath: {} });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Opened scene "TestScene" in the editor to find the surfaces.'
      );
      expect(getInstanceOutputs(result)[0].surfaceBeneath).toEqual({
        z: 100,
        objectName: 'Ground',
        id: 'ground-ins',
        gap: 50,
      });
      expect(getInstanceOutputs(result)[0].surfaceGrid).toBeUndefined();
    });

    it('gives the heights of the surfaces in the box of each instance with a grid', async () => {
      await putInstances('put_3d_instances', {
        object_name: 'Ground',
        brush_kind: 'point',
        brush_position: '-100,0,0',
        instances_size: '200,100,100',
      });

      const result = await describeInstances({
        filter_by_object_name: 'Ground',
        surface_beneath: { grid: 2 },
      });

      expect(result.success).toBe(true);
      // Only the right half of the ground is on the fake ground.
      expect(getInstanceOutputs(result)[0].surfaceGrid).toEqual({
        xs: [-50, 50],
        ys: [25, 75],
        z: [[null, 100], [null, 100]],
        highest: { x: 50, y: 25, z: 100 },
        lowest: { x: 50, y: 75, z: 100 },
      });
    });

    it('refuses a grid out of bounds', async () => {
      const result = await describeInstances({ surface_beneath: { grid: 40 } });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`surface_beneath.grid` must be an integer from 2 to 32 (got 40).'
      );
    });
  });
});
