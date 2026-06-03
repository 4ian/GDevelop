// @flow
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const asAudioResource = (resource: gdResource): any =>
  gd.castObject(resource, gd.AudioResource);

const setResourceBooleanProperty = (
  resource: gdResource,
  propertyName: string,
  value: boolean
) => {
  if (typeof resource.updateProperty === 'function') {
    resource.updateProperty(propertyName, value ? '1' : '0');
  }
};

type SceneToolCallbacks = {|
  onSceneEventsModifiedOutsideEditor?: Function,
  onInstancesModifiedOutsideEditor?: Function,
  onObjectsModifiedOutsideEditor?: Function,
|};

const getRequiredString = (args: Object, name: string): string => {
  const value = args && args[name];
  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
};

const getOptionalString = (args: Object, name: string): string | null => {
  const value = args && args[name];
  return typeof value === 'string' ? value : null;
};

const getFiniteNumber = (value: any): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const firstNonNullNumber = (...values: Array<any>): number | null => {
  for (const value of values) {
    const number = getFiniteNumber(value);
    if (number !== null) return number;
  }
  return null;
};

const stringifyPropertyValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
};

const getScene = (project: gdProject, sceneName: string): gdLayout => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  return project.getLayout(sceneName);
};

const getObjectIndex = (
  objectsContainer: gdObjectsContainer,
  objectName: string
): number => {
  for (let i = 0; i < objectsContainer.getObjectsCount(); i++) {
    if (objectsContainer.getObjectAt(i).getName() === objectName) return i;
  }
  return -1;
};

const getSceneObject = (
  project: gdProject,
  scene: gdLayout,
  objectName: string
): { object: gdObject, isGlobal: boolean, container: gdObjectsContainer } => {
  if (scene.getObjects().hasObjectNamed(objectName)) {
    return {
      object: scene.getObjects().getObject(objectName),
      isGlobal: false,
      container: scene.getObjects(),
    };
  }

  if (project.getObjects().hasObjectNamed(objectName)) {
    return {
      object: project.getObjects().getObject(objectName),
      isGlobal: true,
      container: project.getObjects(),
    };
  }

  throw new Error(
    `Object not found: "${objectName}" in scene "${scene.getName()}" nor globally.`
  );
};

const createResourceForKind = (kind: string): gdResource | null => {
  switch (kind) {
    case 'audio':
      return new gd.AudioResource();
    case 'image':
      return new gd.ImageResource();
    case 'font':
      return new gd.FontResource();
    case 'video':
      return new gd.VideoResource();
    case 'json':
      return new gd.JsonResource();
    case 'tilemap':
      return new gd.TilemapResource();
    case 'tileset':
      return new gd.TilesetResource();
    case 'bitmapFont':
      return new gd.BitmapFontResource();
    case 'model3D':
      return new gd.Model3DResource();
    case 'atlas':
      return new gd.AtlasResource();
    case 'spine':
      return new gd.SpineResource();
    case 'javascript':
      return new gd.JavaScriptResource();
    default:
      return null;
  }
};

const isUrlResourceFile = (file: string): boolean =>
  file.startsWith('http://') ||
  file.startsWith('https://') ||
  file.startsWith('ftp://') ||
  file.startsWith('blob:') ||
  file.startsWith('data:');

const resolveLocalResourceFile = (
  project: gdProject,
  file: string
): string | null => {
  if (!file || !path || isUrlResourceFile(file)) return null;
  if (path.isAbsolute(file)) return file;

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.resolve(path.dirname(projectFile), file);
};

const getResourceFileStatus = (
  project: gdProject,
  resource: gdResource
): Object => {
  const file = resource.getFile();
  if (!file) {
    return {
      file,
      fileExists: false,
      fileStatus: 'error',
      issue: 'empty-file',
    };
  }

  if (isUrlResourceFile(file)) {
    return {
      file,
      fileExists: null,
      fileStatus: 'url',
      issue: null,
    };
  }

  const resolvedFile = resolveLocalResourceFile(project, file);
  if (!resolvedFile || !fs) {
    return {
      file,
      resolvedFile,
      fileExists: null,
      fileStatus: 'unchecked',
      issue: null,
    };
  }

  const fileExists = fs.existsSync(resolvedFile);
  return {
    file,
    resolvedFile,
    fileExists,
    fileStatus: fileExists ? 'ok' : 'error',
    issue: fileExists ? null : 'missing-file',
  };
};

const serializeResource = (resource: gdResource): Object => {
  let serializedResource = {};
  try {
    serializedResource = serializeToJSObject(resource);
  } catch (error) {
    serializedResource = {};
  }

  const result = {
    ...serializedResource,
    name: resource.getName(),
    file: resource.getFile(),
    kind: resource.getKind(),
  };

  if (typeof resource.isUserAdded === 'function') {
    result.userAdded = resource.isUserAdded();
  }

  if (resource.getKind() === 'audio') {
    const audioResource = asAudioResource(resource);
    result.preloadAsMusic =
      typeof audioResource.preloadAsMusic === 'function'
        ? audioResource.preloadAsMusic()
        : !!serializedResource.preloadAsMusic;
    result.preloadAsSound =
      typeof audioResource.preloadAsSound === 'function'
        ? audioResource.preloadAsSound()
        : !!serializedResource.preloadAsSound;
    result.preloadInCache =
      typeof audioResource.preloadInCache === 'function'
        ? audioResource.preloadInCache()
        : !!serializedResource.preloadInCache;
  }

  return result;
};

const applyResourceMetadata = (resource: gdResource, metadata: Object) => {
  if (typeof metadata.userAdded === 'boolean') {
    if (typeof resource.setUserAdded === 'function') {
      resource.setUserAdded(metadata.userAdded);
    }
  }

  if (resource.getKind() === 'image' && typeof metadata.smooth === 'boolean') {
    gd.asImageResource(resource).setSmooth(metadata.smooth);
  }

  if (resource.getKind() === 'audio') {
    const audioResource = asAudioResource(resource);
    if (typeof metadata.preloadAsSound === 'boolean') {
      if (typeof audioResource.setPreloadAsSound === 'function') {
        audioResource.setPreloadAsSound(metadata.preloadAsSound);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload as sound',
          metadata.preloadAsSound
        );
      }
    }
    if (typeof metadata.preloadAsMusic === 'boolean') {
      if (typeof audioResource.setPreloadAsMusic === 'function') {
        audioResource.setPreloadAsMusic(metadata.preloadAsMusic);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload as music',
          metadata.preloadAsMusic
        );
      }
    }
    if (typeof metadata.preloadInCache === 'boolean') {
      if (typeof audioResource.setPreloadInCache === 'function') {
        audioResource.setPreloadInCache(metadata.preloadInCache);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload in cache',
          metadata.preloadInCache
        );
      }
    }
  }
};

export const addOrUpdateResource = (
  project: gdProject,
  args: Object
): Object => {
  const name = getRequiredString(args, 'name');
  const file = getRequiredString(args, 'file');
  const kind = getRequiredString(args, 'kind');
  if (!file.trim()) {
    throw new Error('Resource file must not be empty.');
  }
  const resourcesManager = project.getResourcesManager();

  let resource = null;
  let created = false;

  if (resourcesManager.hasResource(name)) {
    resource = resourcesManager.getResource(name);
    if (resource.getKind() !== kind) {
      if (args && args.replace_kind === true) {
        resourcesManager.removeResource(name);
        resource = null;
      } else {
        throw new Error(
          `Resource "${name}" already exists with kind "${resource.getKind()}"; pass replace_kind: true to recreate it as "${kind}".`
        );
      }
    }
  }

  if (!resource) {
    resource = createResourceForKind(kind);
    if (!resource) {
      throw new Error(`Unsupported resource kind: "${kind}".`);
    }
    created = true;
  }

  resource.setFile(file);
  resource.setName(name);

  const metadata =
    args && args.metadata && typeof args.metadata === 'object'
      ? args.metadata
      : {};
  applyResourceMetadata(resource, metadata);

  if (created) {
    resourcesManager.addResource(resource);
  }
  const storedResource = resourcesManager.hasResource(name)
    ? resourcesManager.getResource(name)
    : resource;

  return {
    success: true,
    created,
    resource: serializeResource(storedResource),
    fileStatus: getResourceFileStatus(project, storedResource),
  };
};

const visitSerializedStrings = (
  value: any,
  pathParts: Array<string>,
  visitor: (string, Array<string>) => void
) => {
  if (typeof value === 'string') {
    visitor(value, pathParts);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      visitSerializedStrings(item, [...pathParts, String(index)], visitor)
    );
    return;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach(key =>
      visitSerializedStrings(value[key], [...pathParts, key], visitor)
    );
  }
};

const collectSpriteFrameReferences = (
  serializedProject: Object,
  resourcesByName: { [string]: Object }
): Array<Object> => {
  const references = [];
  const inspectObject = (object, scope) => {
    if (
      !object ||
      object.type !== 'Sprite' ||
      !Array.isArray(object.animations)
    ) {
      return;
    }

    object.animations.forEach((animation, animationIndex) => {
      const directions = Array.isArray(animation.directions)
        ? animation.directions
        : [];
      directions.forEach((direction, directionIndex) => {
        const sprites = Array.isArray(direction.sprites)
          ? direction.sprites
          : [];
        sprites.forEach((sprite, frameIndex) => {
          const resourceName =
            sprite && typeof sprite.image === 'string' ? sprite.image : '';
          if (!resourceName) return;
          references.push({
            resourceName,
            exists: !!resourcesByName[resourceName],
            scope,
            objectName: object.name,
            animationIndex,
            directionIndex,
            frameIndex,
          });
        });
      });
    });
  };

  (serializedProject.objects || []).forEach(object =>
    inspectObject(object, 'global')
  );
  (serializedProject.layouts || []).forEach(scene => {
    (scene.objects || []).forEach(object =>
      inspectObject(object, `scene:${scene.name || ''}`)
    );
  });

  return references;
};

const getSerializedInstructionType = (instruction: any): string =>
  instruction && instruction.type && typeof instruction.type.value === 'string'
    ? instruction.type.value
    : instruction && typeof instruction.type === 'string'
    ? instruction.type
    : '';

const collectInstructionResourceReferences = ({
  instructions,
  resourcesByName,
  sceneName,
  eventPath,
  isCondition,
}: {|
  instructions: Array<any>,
  resourcesByName: { [string]: Object },
  sceneName: string,
  eventPath: string,
  isCondition: boolean,
|}): Array<Object> => {
  const references = [];
  instructions.forEach((instruction, instructionIndex) => {
    const parameters = Array.isArray(instruction.parameters)
      ? instruction.parameters
      : [];
    parameters.forEach((parameter, parameterIndex) => {
      if (typeof parameter !== 'string') return;
      if (!resourcesByName[parameter]) return;
      references.push({
        sceneName,
        eventPath,
        isCondition,
        instructionIndex,
        instructionType: getSerializedInstructionType(instruction),
        parameterIndex,
        resourceName: parameter,
        resourceKind: resourcesByName[parameter].kind,
      });
    });

    const subInstructions = Array.isArray(instruction.subInstructions)
      ? instruction.subInstructions
      : [];
    references.push(
      ...collectInstructionResourceReferences({
        instructions: subInstructions,
        resourcesByName,
        sceneName,
        eventPath,
        isCondition,
      })
    );
  });
  return references;
};

const collectEventResourceReferences = (
  serializedProject: Object,
  resourcesByName: { [string]: Object }
): Array<Object> => {
  const references = [];

  const visitEvents = (events, sceneName, parentPath) => {
    if (!Array.isArray(events)) return;
    events.forEach((event, eventIndex) => {
      const eventPathParts = [...parentPath, eventIndex];
      const eventPath = `event-${eventPathParts.join('.')}`;
      references.push(
        ...collectInstructionResourceReferences({
          instructions: Array.isArray(event.conditions) ? event.conditions : [],
          resourcesByName,
          sceneName,
          eventPath,
          isCondition: true,
        }),
        ...collectInstructionResourceReferences({
          instructions: Array.isArray(event.actions) ? event.actions : [],
          resourcesByName,
          sceneName,
          eventPath,
          isCondition: false,
        })
      );
      visitEvents(event.events, sceneName, eventPathParts);
    });
  };

  (serializedProject.layouts || []).forEach(scene => {
    visitEvents(scene.events, scene.name || '', []);
  });

  return references;
};

export const inspectProjectResources = (
  project: gdProject,
  args: Object = {}
): Object => {
  const resourcesManager = project.getResourcesManager();
  const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const serializedProject = serializeToJSObject(project);
  const resourcesByName = {};
  const invalidResources = [];

  resourceNames.forEach(name => {
    const resource = resourcesManager.getResource(name);
    const serializedResource = serializeResource(resource);
    const fileStatus = getResourceFileStatus(project, resource);
    const resourceSummary = {
      ...serializedResource,
      ...fileStatus,
    };
    resourcesByName[name] = resourceSummary;
    if (fileStatus.issue) {
      invalidResources.push({
        name,
        kind: resource.getKind(),
        issue: fileStatus.issue,
        file: resource.getFile(),
        resolvedFile: fileStatus.resolvedFile || null,
      });
    }
  });

  const stringReferences = [];
  visitSerializedStrings(serializedProject, [], (value, referencePath) => {
    if (resourcesByName[value]) {
      stringReferences.push({
        resourceName: value,
        path: referencePath.join('/'),
      });
    }
  });

  const spriteFrameReferences = collectSpriteFrameReferences(
    serializedProject,
    resourcesByName
  );
  const eventResourceReferences = collectEventResourceReferences(
    serializedProject,
    resourcesByName
  );
  const uselessResourceNames = gd.ProjectResourcesAdder.getAllUseless(
    project,
    ''
  ).toJSArray();

  const missingSpriteFrameReferences = spriteFrameReferences.filter(
    reference => !reference.exists
  );
  const summary = {
    totalResources: resourceNames.length,
    invalidResourcesCount: invalidResources.length,
    unusedResourcesCount: uselessResourceNames.length,
    spriteFrameReferencesCount: spriteFrameReferences.length,
    eventResourceReferencesCount: eventResourceReferences.length,
    missingSpriteFrameReferencesCount: missingSpriteFrameReferences.length,
    stringReferencesCount: stringReferences.length,
  };

  if (args && (args.compact === true || args.summary_only === true)) {
    return {
      success: true,
      compact: true,
      projectName: project.getName(),
      summary,
      invalidResources,
      unusedResources: uselessResourceNames,
      missingSpriteFrameReferences,
      eventResourceReferences,
    };
  }

  return {
    success: true,
    projectName: project.getName(),
    summary,
    resources: resourceNames.map(name => resourcesByName[name]),
    resourcesByName,
    invalidResources,
    unusedResources: uselessResourceNames,
    spriteFrameReferences,
    eventResourceReferences,
    stringReferences,
    includeSerializedProject: !!(args && args.include_serialized_project),
    serializedProject:
      args && args.include_serialized_project ? serializedProject : undefined,
  };
};

const readPoint = (value: any): { x: number, y: number } | null => {
  if (!value || typeof value !== 'object') return null;
  const x = getFiniteNumber(value.x);
  const y = getFiniteNumber(value.y);
  if (x === null || y === null) return null;
  return { x, y };
};

const assertResourceIsImage = (project: gdProject, imageName: string) => {
  if (!project.getResourcesManager().hasResource(imageName)) {
    throw new Error(`Image resource not found: "${imageName}".`);
  }

  const resource = project.getResourcesManager().getResource(imageName);
  if (resource.getKind() !== 'image') {
    throw new Error(
      `Resource "${imageName}" has kind "${resource.getKind()}" but Sprite frames require "image".`
    );
  }
};

const applySpritePoints = (sprite: gdSprite, frame: Object) => {
  const origin = readPoint(frame.origin);
  if (origin) {
    sprite.getOrigin().setX(origin.x);
    sprite.getOrigin().setY(origin.y);
  }

  const center = readPoint(frame.center);
  if (center) {
    sprite.setDefaultCenterPoint(false);
    sprite.getCenter().setX(center.x);
    sprite.getCenter().setY(center.y);
  } else if (frame.center === null || frame.defaultCenter === true) {
    sprite.setDefaultCenterPoint(true);
  }

  if (Array.isArray(frame.points)) {
    frame.points.forEach(pointData => {
      if (!pointData || typeof pointData !== 'object') return;
      if (typeof pointData.name !== 'string' || !pointData.name) return;
      const point = readPoint(pointData);
      if (!point) return;
      const customPoint = new gd.Point(pointData.name);
      customPoint.setX(point.x);
      customPoint.setY(point.y);
      sprite.addPoint(customPoint);
      customPoint.delete();
    });
  }
};

const applySpriteCollisionMask = (sprite: gdSprite, frame: Object) => {
  if (frame.fullImageCollisionMask === true) {
    sprite.setFullImageCollisionMask(true);
    return;
  }

  if (!Array.isArray(frame.collisionMask)) return;

  sprite.setFullImageCollisionMask(false);
  sprite.getCustomCollisionMask().clear();

  frame.collisionMask.forEach(polygonData => {
    if (!Array.isArray(polygonData) || polygonData.length < 3) {
      throw new Error(
        'Each collisionMask polygon must contain at least 3 vertices.'
      );
    }

    const polygon = new gd.Polygon2d();
    polygonData.forEach(vertexData => {
      const vertex = readPoint(vertexData);
      if (!vertex) {
        polygon.delete();
        throw new Error('Collision mask vertices must be { x, y } numbers.');
      }

      const vector = new gd.Vector2f();
      vector.x = vertex.x;
      vector.y = vertex.y;
      polygon.getVertices().push_back(vector);
      vector.delete();
    });
    sprite.getCustomCollisionMask().push_back(polygon);
    polygon.delete();
  });
};

const validateSpriteAnimationsData = (
  project: gdProject,
  animationsData: Array<any>
) => {
  animationsData.forEach((animationData, animationIndex) => {
    if (!animationData || typeof animationData !== 'object') {
      throw new Error(`Invalid animation at index ${animationIndex}.`);
    }
    const directionsData = Array.isArray(animationData.directions)
      ? animationData.directions
      : [
          {
            frames: Array.isArray(animationData.frames)
              ? animationData.frames
              : [],
          },
        ];
    if (!directionsData.length) {
      throw new Error(
        `Animation at index ${animationIndex} has no directions.`
      );
    }
    directionsData.forEach((directionData, directionIndex) => {
      const frames =
        directionData && Array.isArray(directionData.frames)
          ? directionData.frames
          : [];
      if (!frames.length) {
        throw new Error(
          `Animation ${animationIndex}, direction ${directionIndex} has no frames.`
        );
      }
      frames.forEach((frameData, frameIndex) => {
        if (!frameData || typeof frameData !== 'object') {
          throw new Error(
            `Invalid frame at animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        const imageName =
          typeof frameData.image === 'string'
            ? frameData.image
            : typeof frameData.resourceName === 'string'
            ? frameData.resourceName
            : typeof frameData.imageName === 'string'
            ? frameData.imageName
            : '';
        if (!imageName) {
          throw new Error(
            `Missing image for animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        assertResourceIsImage(project, imageName);

        if (Array.isArray(frameData.collisionMask)) {
          frameData.collisionMask.forEach(polygonData => {
            if (!Array.isArray(polygonData) || polygonData.length < 3) {
              throw new Error(
                'Each collisionMask polygon must contain at least 3 vertices.'
              );
            }
            polygonData.forEach(vertexData => {
              if (!readPoint(vertexData)) {
                throw new Error(
                  'Collision mask vertices must be { x, y } numbers.'
                );
              }
            });
          });
        }
      });
    });
  });
};

export const setSpriteAnimations = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const animationsData =
    args && Array.isArray(args.animations) ? args.animations : null;
  if (!animationsData) {
    throw new Error('Missing animations array.');
  }

  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);
  if (object.getType() !== 'Sprite') {
    throw new Error(
      `Object "${objectName}" has type "${object.getType()}" but set_sprite_animations only supports Sprite objects.`
    );
  }
  validateSpriteAnimationsData(project, animationsData);

  const spriteConfiguration = gd.asSpriteConfiguration(
    object.getConfiguration()
  );
  const animations = spriteConfiguration.getAnimations();
  for (let index = animations.getAnimationsCount() - 1; index >= 0; index--) {
    animations.removeAnimation(index);
  }

  animationsData.forEach((animationData, animationIndex) => {
    if (!animationData || typeof animationData !== 'object') {
      throw new Error(`Invalid animation at index ${animationIndex}.`);
    }
    const directionsData = Array.isArray(animationData.directions)
      ? animationData.directions
      : [
          {
            frames: Array.isArray(animationData.frames)
              ? animationData.frames
              : [],
          },
        ];
    if (!directionsData.length) {
      throw new Error(
        `Animation at index ${animationIndex} has no directions.`
      );
    }

    const animation = new gd.Animation();
    if (typeof animationData.name === 'string') {
      animation.setName(animationData.name);
    }
    if (typeof animationData.useMultipleDirections === 'boolean') {
      animation.setUseMultipleDirections(animationData.useMultipleDirections);
    } else if (directionsData.length > 1) {
      animation.setUseMultipleDirections(true);
    }
    animation.setDirectionsCount(directionsData.length);

    directionsData.forEach((directionData, directionIndex) => {
      const frames =
        directionData && Array.isArray(directionData.frames)
          ? directionData.frames
          : [];
      if (!frames.length) {
        animation.delete();
        throw new Error(
          `Animation ${animationIndex}, direction ${directionIndex} has no frames.`
        );
      }

      const direction = animation.getDirection(directionIndex);
      frames.forEach((frameData, frameIndex) => {
        if (!frameData || typeof frameData !== 'object') {
          animation.delete();
          throw new Error(
            `Invalid frame at animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        const imageName =
          typeof frameData.image === 'string'
            ? frameData.image
            : typeof frameData.resourceName === 'string'
            ? frameData.resourceName
            : typeof frameData.imageName === 'string'
            ? frameData.imageName
            : '';
        if (!imageName) {
          animation.delete();
          throw new Error(
            `Missing image for animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        assertResourceIsImage(project, imageName);

        const sprite = new gd.Sprite();
        sprite.setImageName(imageName);
        applySpritePoints(sprite, frameData);
        applySpriteCollisionMask(sprite, frameData);
        direction.addSprite(sprite);
        sprite.delete();
      });
    });

    animations.addAnimation(animation);
    animation.delete();
  });

  scene.updateBehaviorsSharedData(project);
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    animationsCount: animations.getAnimationsCount(),
    serializedObject: serializeToJSObject(object),
  };
};

export const replaceObjectDefinition = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const serializedObject =
    (args &&
    args.serialized_object &&
    typeof args.serialized_object === 'object'
      ? args.serialized_object
      : null) ||
    (args && args.serializedObject && typeof args.serializedObject === 'object'
      ? args.serializedObject
      : null);
  if (!serializedObject) {
    throw new Error('Missing serialized_object.');
  }

  const objectType =
    getOptionalString(args, 'object_type') ||
    (typeof serializedObject.type === 'string' ? serializedObject.type : null);
  if (!objectType) {
    throw new Error(
      'Missing object type in object_type or serialized_object.type.'
    );
  }

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    objectType
  );
  if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
    throw new Error(`Object type "${objectType}" does not exist.`);
  }

  // Validate before mutating the real scene. Losing the previous object because
  // a serialized replacement cannot be unserialized would be worse than failing.
  // $FlowFixMe[invalid-constructor]
  const validationProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    const validationScene = validationProject.insertNewLayout(sceneName, 0);
    const validationObject = validationScene
      .getObjects()
      .insertNewObject(validationProject, objectType, objectName, 0);
    unserializeFromJSObject(
      validationObject,
      {
        ...serializedObject,
        name: objectName,
        type: objectType,
      },
      'unserializeFrom',
      project
    );
    serializeToJSObject(validationObject);
  } finally {
    validationProject.delete();
  }

  const scene = getScene(project, sceneName);
  const objects = scene.getObjects();
  const previousIndex = getObjectIndex(objects, objectName);
  const insertionIndex =
    previousIndex >= 0 ? previousIndex : objects.getObjectsCount();
  const didReplace = previousIndex >= 0;
  const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
    project,
    objectType
  );

  if (didReplace) {
    objects.removeObject(objectName);
  }

  const object = objects.insertNewObject(
    project,
    objectType,
    objectName,
    Math.min(insertionIndex, objects.getObjectsCount())
  );
  unserializeFromJSObject(
    object,
    {
      ...serializedObject,
      name: objectName,
      type: objectType,
    },
    'unserializeFrom',
    project
  );
  object.setName(objectName);

  scene.updateBehaviorsSharedData(project);
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    didReplace,
    objectType: object.getType(),
    serializedObject: serializeToJSObject(object),
  };
};

const iterateInitialInstances = (
  initialInstances: gdInitialInstancesContainer,
  callback: gdInitialInstance => void
) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type]
  initialInstances.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
};

const findInstanceByShortId = (
  initialInstances: gdInitialInstancesContainer,
  id: string
): gdInitialInstance | null => {
  let foundInstance = null;
  iterateInitialInstances(initialInstances, instance => {
    if (!foundInstance && instance.getPersistentUuid().startsWith(id)) {
      foundInstance = instance;
    }
  });
  return foundInstance;
};

export const deleteSceneObject = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const objects = scene.getObjects();

  if (!objects.hasObjectNamed(objectName)) {
    throw new Error(`Scene object not found: "${objectName}".`);
  }

  gd.WholeProjectRefactorer.objectRemovedInScene(project, scene, objectName);
  objects.removeObject(objectName);

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }
  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    sceneName,
    objectName,
    deleted: true,
  };
};

const findObjectPropertyName = (
  properties: any,
  requestedName: string
): string | null => {
  if (properties.has(requestedName)) return requestedName;

  const normalizedRequest = requestedName.toLowerCase().replace(/[-_ ]/g, '');
  const propertyNames = properties.keys().toJSArray();
  return (
    propertyNames.find(
      propertyName =>
        propertyName.toLowerCase().replace(/[-_ ]/g, '') === normalizedRequest
    ) || null
  );
};

export const setObjectProperties = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const requestedProperties =
    args && args.properties && typeof args.properties === 'object'
      ? args.properties
      : null;
  if (!requestedProperties) {
    throw new Error('Missing properties object.');
  }

  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);
  const objectConfiguration = object.getConfiguration();
  const objectProperties = objectConfiguration.getProperties();
  const changes = [];
  const warnings = [];

  Object.keys(requestedProperties).forEach(requestedName => {
    const propertyName = findObjectPropertyName(
      objectProperties,
      requestedName
    );
    if (!propertyName) {
      warnings.push(
        `Property "${requestedName}" not found on "${objectName}".`
      );
      return;
    }

    const property = objectProperties.get(propertyName);
    const newValue = stringifyPropertyValue(requestedProperties[requestedName]);

    if (property.getType() === 'resource') {
      if (!project.getResourcesManager().hasResource(newValue)) {
        warnings.push(
          `"${propertyName}" on "${objectName}": resource "${newValue}" does not exist.`
        );
        return;
      }

      const expectedKind = (
        property.getExtraInfo().toJSArray()[0] || ''
      ).toLowerCase();
      const resource = project.getResourcesManager().getResource(newValue);
      if (expectedKind && resource.getKind().toLowerCase() !== expectedKind) {
        warnings.push(
          `"${propertyName}" on "${objectName}": resource "${newValue}" has kind "${resource.getKind()}" but expected "${expectedKind}".`
        );
        return;
      }
    }

    if (!objectConfiguration.updateProperty(propertyName, newValue)) {
      warnings.push(
        `Could not set "${propertyName}" on "${objectName}": invalid value or type.`
      );
      return;
    }

    changes.push({
      propertyName,
      newValue,
    });
  });

  if (!changes.length && warnings.length) {
    throw new Error(`No changes. Issues: ${warnings.join(' ')}`);
  }

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    changes,
    warnings,
    serializedObject: serializeToJSObject(object),
  };
};

const readTextObjectProperties = (textObjectConfiguration: any): Object => ({
  text: textObjectConfiguration.getText(),
  characterSize: textObjectConfiguration.getCharacterSize(),
  color: textObjectConfiguration.getColor(),
  bold: textObjectConfiguration.isBold(),
  italic: textObjectConfiguration.isItalic(),
  textAlignment: textObjectConfiguration.getTextAlignment(),
  verticalTextAlignment: textObjectConfiguration.getVerticalTextAlignment(),
  fontName: textObjectConfiguration.getFontName(),
  outlineEnabled: textObjectConfiguration.isOutlineEnabled(),
  outlineColor: textObjectConfiguration.getOutlineColor(),
  outlineThickness: textObjectConfiguration.getOutlineThickness(),
  shadowEnabled: textObjectConfiguration.isShadowEnabled(),
  shadowColor: textObjectConfiguration.getShadowColor(),
  shadowDistance: textObjectConfiguration.getShadowDistance(),
  shadowAngle: textObjectConfiguration.getShadowAngle(),
  shadowOpacity: textObjectConfiguration.getShadowOpacity(),
  shadowBlurRadius: textObjectConfiguration.getShadowBlurRadius(),
  lineHeight: textObjectConfiguration.getLineHeight(),
});

export const setTextObjectProperties = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);

  if (object.getType() !== 'TextObject::Text') {
    throw new Error(
      `Object "${objectName}" has type "${object.getType()}" but set_text_object_properties only supports TextObject::Text.`
    );
  }

  const textObjectConfiguration = gd.asTextObjectConfiguration(
    object.getConfiguration()
  );
  const changes = [];
  const setValue = (name, value, setter) => {
    if (value === undefined || value === null) return;
    setter(value);
    changes.push(name);
  };

  setValue('text', args.text, value =>
    textObjectConfiguration.setText(String(value))
  );
  setValue(
    'characterSize',
    firstNonNullNumber(args.character_size, args.characterSize),
    value => textObjectConfiguration.setCharacterSize(value)
  );
  setValue('color', args.color, value =>
    textObjectConfiguration.setColor(String(value))
  );
  setValue(
    'bold',
    typeof args.bold === 'boolean' ? args.bold : undefined,
    value => textObjectConfiguration.setBold(value)
  );
  setValue(
    'italic',
    typeof args.italic === 'boolean' ? args.italic : undefined,
    value => textObjectConfiguration.setItalic(value)
  );
  setValue('fontName', args.font_name || args.fontName, value =>
    textObjectConfiguration.setFontName(String(value))
  );
  setValue('textAlignment', args.text_alignment || args.textAlignment, value =>
    textObjectConfiguration.setTextAlignment(String(value))
  );
  setValue(
    'verticalTextAlignment',
    args.vertical_text_alignment || args.verticalTextAlignment,
    value => textObjectConfiguration.setVerticalTextAlignment(String(value))
  );
  setValue(
    'lineHeight',
    firstNonNullNumber(args.line_height, args.lineHeight),
    value => textObjectConfiguration.setLineHeight(value)
  );

  const outline =
    args && args.outline && typeof args.outline === 'object'
      ? args.outline
      : {};
  setValue(
    'outlineEnabled',
    typeof outline.enabled === 'boolean'
      ? outline.enabled
      : typeof args.outline_enabled === 'boolean'
      ? args.outline_enabled
      : undefined,
    value => textObjectConfiguration.setOutlineEnabled(value)
  );
  setValue('outlineColor', outline.color || args.outline_color, value =>
    textObjectConfiguration.setOutlineColor(String(value))
  );
  setValue(
    'outlineThickness',
    firstNonNullNumber(outline.thickness, args.outline_thickness),
    value => textObjectConfiguration.setOutlineThickness(value)
  );

  const shadow =
    args && args.shadow && typeof args.shadow === 'object' ? args.shadow : {};
  setValue(
    'shadowEnabled',
    typeof shadow.enabled === 'boolean'
      ? shadow.enabled
      : typeof args.shadow_enabled === 'boolean'
      ? args.shadow_enabled
      : undefined,
    value => textObjectConfiguration.setShadowEnabled(value)
  );
  setValue('shadowColor', shadow.color || args.shadow_color, value =>
    textObjectConfiguration.setShadowColor(String(value))
  );
  setValue(
    'shadowDistance',
    firstNonNullNumber(shadow.distance, args.shadow_distance),
    value => textObjectConfiguration.setShadowDistance(value)
  );
  setValue(
    'shadowAngle',
    firstNonNullNumber(shadow.angle, args.shadow_angle),
    value => textObjectConfiguration.setShadowAngle(value)
  );
  setValue(
    'shadowOpacity',
    firstNonNullNumber(shadow.opacity, args.shadow_opacity),
    value => textObjectConfiguration.setShadowOpacity(value)
  );
  setValue(
    'shadowBlurRadius',
    firstNonNullNumber(
      shadow.blur_radius,
      shadow.blurRadius,
      args.shadow_blur_radius
    ),
    value => textObjectConfiguration.setShadowBlurRadius(value)
  );

  if (!changes.length) {
    throw new Error('No supported text object properties were provided.');
  }

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    changes,
    properties: readTextObjectProperties(textObjectConfiguration),
    serializedObject: serializeToJSObject(object),
  };
};

const applyInstanceFields = (
  instance: gdInitialInstance,
  instanceData: Object
) => {
  const objectName =
    getOptionalString(instanceData, 'object_name') ||
    getOptionalString(instanceData, 'objectName');
  if (objectName) instance.setObjectName(objectName);

  const layer =
    getOptionalString(instanceData, 'layer_name') ||
    getOptionalString(instanceData, 'layer');
  if (layer !== null) instance.setLayer(layer);

  const x = getFiniteNumber(instanceData.x);
  const y = getFiniteNumber(instanceData.y);
  const z = getFiniteNumber(instanceData.z);
  const angle = firstNonNullNumber(instanceData.angle, instanceData.rotation);
  const zOrder = firstNonNullNumber(instanceData.z_order, instanceData.zOrder);
  const opacity = getFiniteNumber(instanceData.opacity);

  if (x !== null) instance.setX(x);
  if (y !== null) instance.setY(y);
  if (z !== null) instance.setZ(z);
  if (angle !== null) instance.setAngle(angle);
  if (zOrder !== null) instance.setZOrder(zOrder);
  if (opacity !== null) instance.setOpacity(opacity);

  const rotationX = getFiniteNumber(instanceData.rotationX);
  const rotationY = getFiniteNumber(instanceData.rotationY);
  if (rotationX !== null) instance.setRotationX(rotationX);
  if (rotationY !== null) instance.setRotationY(rotationY);

  const customSize = instanceData.custom_size || instanceData.customSize;
  const width = firstNonNullNumber(
    instanceData.width,
    customSize && customSize.width
  );
  const height = firstNonNullNumber(
    instanceData.height,
    customSize && customSize.height
  );
  const depth = firstNonNullNumber(
    instanceData.depth,
    customSize && customSize.depth
  );
  if (width !== null || height !== null) {
    instance.setHasCustomSize(true);
    if (width !== null) instance.setCustomWidth(width);
    if (height !== null) instance.setCustomHeight(height);
  }
  if (depth !== null) {
    instance.setHasCustomDepth(true);
    instance.setCustomDepth(depth);
  }

  if (typeof instanceData.locked === 'boolean') {
    instance.setLocked(instanceData.locked);
  }
  if (typeof instanceData.sealed === 'boolean') {
    instance.setSealed(instanceData.sealed);
    if (instanceData.sealed) instance.setLocked(true);
  }
};

export const putStructured2dInstances = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const instancesData =
    args && Array.isArray(args.instances) ? args.instances : null;
  if (!instancesData) {
    throw new Error('Missing instances array.');
  }

  const defaultOperation =
    getOptionalString(args, 'operation') ||
    getOptionalString(args, 'op') ||
    'upsert';
  const initialInstances = scene.getInitialInstances();

  const plannedOperations = instancesData.map((instanceData, index) => {
    if (!instanceData || typeof instanceData !== 'object') {
      throw new Error(`Invalid instance at index ${index}.`);
    }

    const operation =
      getOptionalString(instanceData, 'operation') ||
      getOptionalString(instanceData, 'op') ||
      defaultOperation;
    const id = getOptionalString(instanceData, 'id');
    const existingInstance = id
      ? findInstanceByShortId(initialInstances, id)
      : null;

    if (operation === 'delete' || operation === 'remove') {
      if (!id) throw new Error(`Missing id for delete at instances[${index}].`);
      return { operation, id, existingInstance, instanceData };
    }

    if (operation === 'update' && !existingInstance) {
      throw new Error(`Instance id not found for update: "${id || ''}".`);
    }

    const objectName =
      getOptionalString(instanceData, 'object_name') ||
      getOptionalString(instanceData, 'objectName') ||
      (existingInstance ? existingInstance.getObjectName() : null);
    if (!objectName) {
      throw new Error(
        `Missing object_name for new instance at index ${index}.`
      );
    }
    if (
      !scene.getObjects().hasObjectNamed(objectName) &&
      !project.getObjects().hasObjectNamed(objectName)
    ) {
      throw new Error(
        `Object "${objectName}" not found for instance at index ${index}.`
      );
    }

    const layer =
      getOptionalString(instanceData, 'layer_name') ||
      getOptionalString(instanceData, 'layer') ||
      (existingInstance ? existingInstance.getLayer() : '');
    if (layer !== '' && !scene.hasLayerNamed(layer)) {
      throw new Error(
        `Layer "${layer}" not found for instance at index ${index}.`
      );
    }

    return { operation, id, existingInstance, instanceData };
  });

  const changes = [];

  plannedOperations.forEach(
    ({ operation, id, existingInstance, instanceData }) => {
      if (operation === 'delete' || operation === 'remove') {
        if (!existingInstance) {
          changes.push({ operation: 'delete', id, deleted: false });
          return;
        }
        initialInstances.removeInstance(existingInstance);
        changes.push({ operation: 'delete', id, deleted: true });
        return;
      }

      const instance =
        existingInstance || initialInstances.insertNewInitialInstance();
      applyInstanceFields(instance, instanceData);
      changes.push({
        operation: existingInstance ? 'update' : 'create',
        id: instance.getPersistentUuid().slice(0, 10),
        objectName: instance.getObjectName(),
      });
    }
  );

  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    sceneName,
    changes,
    instances: serializeToJSObject(scene.getInitialInstances()),
  };
};

export const readSerializedScene = (
  project: gdProject,
  args: Object
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  return {
    success: true,
    sceneName,
    serializedScene: serializeToJSObject(scene),
  };
};

export const readSceneEventsSerialized = (
  project: gdProject,
  args: Object
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  return {
    success: true,
    sceneName,
    serializedEvents: serializeToJSObject(scene.getEvents()),
    serializedEventsJson: serializeToJSON(scene.getEvents()),
  };
};

export const bulkEditSceneAssets = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  getScene(project, sceneName);

  const resources = Array.isArray(args.resources) ? args.resources : [];
  const objects = Array.isArray(args.objects) ? args.objects : [];
  const spriteAnimations = Array.isArray(args.sprite_animations)
    ? args.sprite_animations
    : Array.isArray(args.spriteAnimations)
    ? args.spriteAnimations
    : [];
  const instances = Array.isArray(args.instances) ? args.instances : [];

  const results = {
    resources: [],
    objects: [],
    spriteAnimations: [],
    instances: null,
  };

  resources.forEach((resourceArgs, index) => {
    if (!resourceArgs || typeof resourceArgs !== 'object') {
      throw new Error(`Invalid resource at resources[${index}].`);
    }
    const result = addOrUpdateResource(project, resourceArgs);
    results.resources.push({
      name: result.resource.name,
      kind: result.resource.kind,
      file: result.resource.file,
      created: result.created,
      fileStatus: result.fileStatus,
    });
  });

  objects.forEach((objectArgs, index) => {
    if (!objectArgs || typeof objectArgs !== 'object') {
      throw new Error(`Invalid object at objects[${index}].`);
    }
    const result = replaceObjectDefinition(
      project,
      {
        ...objectArgs,
        scene_name: objectArgs.scene_name || objectArgs.sceneName || sceneName,
      },
      callbacks
    );
    results.objects.push({
      objectName: result.objectName,
      objectType: result.objectType,
      didReplace: result.didReplace,
    });
  });

  spriteAnimations.forEach((animationArgs, index) => {
    if (!animationArgs || typeof animationArgs !== 'object') {
      throw new Error(
        `Invalid Sprite animation payload at sprite_animations[${index}].`
      );
    }
    const result = setSpriteAnimations(
      project,
      {
        ...animationArgs,
        scene_name:
          animationArgs.scene_name || animationArgs.sceneName || sceneName,
      },
      callbacks
    );
    results.spriteAnimations.push({
      objectName: result.objectName,
      animationsCount: result.animationsCount,
    });
  });

  if (instances.length) {
    results.instances = putStructured2dInstances(
      project,
      {
        scene_name: sceneName,
        operation:
          getOptionalString(args, 'instances_operation') ||
          getOptionalString(args, 'instancesOperation') ||
          'create',
        instances,
      },
      callbacks
    );
  }

  return {
    success: true,
    sceneName,
    counts: {
      resources: results.resources.length,
      objects: results.objects.length,
      spriteAnimations: results.spriteAnimations.length,
      instances: results.instances ? results.instances.changes.length : 0,
    },
    results,
  };
};

const parseJsonPointer = (path: string): Array<string> => {
  if (path === '') return [];
  if (!path.startsWith('/')) {
    throw new Error(`JSON patch path must start with "/": "${path}".`);
  }
  return path
    .slice(1)
    .split('/')
    .map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'));
};

const assertSafePathParts = (parts: Array<string>) => {
  parts.forEach(part => {
    if (
      part === '__proto__' ||
      part === 'constructor' ||
      part === 'prototype'
    ) {
      throw new Error(`Unsafe JSON patch path segment: "${part}".`);
    }
  });
};

const getPatchTarget = (
  document: any,
  path: string
): { container: any, key: string } => {
  const parts = parseJsonPointer(path);
  assertSafePathParts(parts);
  if (!parts.length) {
    throw new Error('Patching the scene root is not supported.');
  }

  let container = document;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (Array.isArray(container)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= container.length) {
        throw new Error(`Invalid array index in patch path: "${path}".`);
      }
      container = container[index];
    } else if (
      container &&
      typeof container === 'object' &&
      Object.prototype.hasOwnProperty.call(container, part)
    ) {
      container = container[part];
    } else {
      throw new Error(`Patch path does not exist: "${path}".`);
    }
  }

  return {
    container,
    key: parts[parts.length - 1],
  };
};

const applySinglePatchOperation = (document: any, operation: Object) => {
  if (!operation || typeof operation !== 'object') {
    throw new Error('Patch operations must be objects.');
  }
  const op = getRequiredString(operation, 'op');
  const path = getRequiredString(operation, 'path');
  const { container, key } = getPatchTarget(document, path);

  if (Array.isArray(container)) {
    if (op === 'add' && key === '-') {
      container.push(operation.value);
      return;
    }
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`Invalid array index in patch path: "${path}".`);
    }
    if (op === 'add') {
      if (index > container.length) {
        throw new Error(`Array add index out of bounds: "${path}".`);
      }
      container.splice(index, 0, operation.value);
      return;
    }
    if (index >= container.length) {
      throw new Error(`Array index out of bounds: "${path}".`);
    }
    if (op === 'replace') {
      container[index] = operation.value;
      return;
    }
    if (op === 'remove') {
      container.splice(index, 1);
      return;
    }
  } else if (container && typeof container === 'object') {
    if (op === 'add' || op === 'replace') {
      if (
        op === 'replace' &&
        !Object.prototype.hasOwnProperty.call(container, key)
      ) {
        throw new Error(`Patch replace path does not exist: "${path}".`);
      }
      container[key] = operation.value;
      return;
    }
    if (op === 'remove') {
      if (!Object.prototype.hasOwnProperty.call(container, key)) {
        throw new Error(`Patch remove path does not exist: "${path}".`);
      }
      delete container[key];
      return;
    }
  }

  throw new Error(`Unsupported JSON patch operation: "${op}".`);
};

const validateSerializedSceneStructure = (serializedScene: Object) => {
  if (!serializedScene || typeof serializedScene !== 'object') {
    throw new Error('Patched scene must be an object.');
  }
  if (typeof serializedScene.name !== 'string' || !serializedScene.name) {
    throw new Error('Patched scene must keep a non-empty name.');
  }
  if (!Array.isArray(serializedScene.objects)) {
    throw new Error('Patched scene must keep an objects array.');
  }
  serializedScene.objects.forEach((object, index) => {
    if (!object || typeof object !== 'object') {
      throw new Error(
        `Patched scene object at index ${index} must be an object.`
      );
    }
    if (typeof object.name !== 'string' || !object.name) {
      throw new Error(
        `Patched scene object at index ${index} must keep a name.`
      );
    }
    if (typeof object.type !== 'string' || !object.type) {
      throw new Error(
        `Patched scene object "${object.name}" must keep a type.`
      );
    }
  });
  if (!Array.isArray(serializedScene.instances)) {
    throw new Error('Patched scene must keep an instances array.');
  }
  if (!Array.isArray(serializedScene.events)) {
    throw new Error('Patched scene must keep an events array.');
  }
  if (!Array.isArray(serializedScene.layers)) {
    throw new Error('Patched scene must keep a layers array.');
  }
};

const validateSceneCanBeUnserialized = (
  project: gdProject,
  serializedScene: Object
) => {
  // $FlowFixMe[invalid-constructor]
  const validationProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    const validationScene = validationProject.insertNewLayout(
      serializedScene.name || 'Scene',
      0
    );
    unserializeFromJSObject(
      validationScene,
      serializedScene,
      'unserializeFrom',
      project
    );
    serializeToJSObject(validationScene);
  } finally {
    validationProject.delete();
  }
};

export const applyValidatedScenePatch = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  let patch = args && Array.isArray(args.patch) ? args.patch : null;
  const patchFile = getOptionalString(args || {}, 'patch_file');
  if (!patch && patchFile) {
    if (!fs) throw new Error('Filesystem access is not available.');
    if (!fs.existsSync(patchFile)) {
      throw new Error(`Patch file not found: "${patchFile}".`);
    }
    const parsedPatch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));
    if (!Array.isArray(parsedPatch)) {
      throw new Error('patch_file must contain a JSON patch array.');
    }
    patch = parsedPatch;
  }
  if (!patch) {
    throw new Error('Missing patch array or patch_file.');
  }

  const originalSerializedScene = serializeToJSObject(scene);
  const patchedSerializedScene = JSON.parse(
    JSON.stringify(originalSerializedScene)
  );
  patch.forEach(operation =>
    applySinglePatchOperation(patchedSerializedScene, operation)
  );

  validateSerializedSceneStructure(patchedSerializedScene);
  validateSceneCanBeUnserialized(project, patchedSerializedScene);

  if (args && args.dry_run === true) {
    return {
      success: true,
      dryRun: true,
      sceneName,
      patchOperations: patch.length,
      serializedScene: patchedSerializedScene,
    };
  }

  unserializeFromJSObject(
    scene,
    patchedSerializedScene,
    'unserializeFrom',
    project
  );
  if (callbacks.onSceneEventsModifiedOutsideEditor) {
    callbacks.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(),
    });
  }
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }
  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    dryRun: false,
    sceneName,
    patchOperations: patch.length,
    serializedScene: serializeToJSObject(scene),
  };
};
