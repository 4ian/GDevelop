// @flow
import { mapFor, mapVector } from '../../Utils/MapFor';
import { isCollectionVariable } from '../../Utils/VariablesUtils';
import {
  buildExtensionSummary,
  type ExtensionSummary,
} from './ExtensionSummary';

export type SimplifiedBehavior = {|
  behaviorName: string,
  behaviorType: string,
|};

type SimplifiedVariable = {|
  variableName: string,
  type: string,
  value?: string,
  variableChildren?: Array<SimplifiedVariable>,
|};

type SimplifiedObject = {|
  objectName: string,
  objectType: string,
  behaviors?: Array<SimplifiedBehavior>,
  objectVariables?: Array<SimplifiedVariable>,
  animationNames?: string,
|};

type SimplifiedObjectGroup = {|
  objectGroupName: string,
  objectGroupType: string,
  objectNames: Array<string>,
  behaviors?: Array<SimplifiedBehavior>,
  variables?: Array<SimplifiedVariable>,
|};

type SimplifiedLayer = {|
  layerName: string,
  position: number,
  isBaseLayer?: boolean,
|};

type SimplifiedScene = {|
  sceneName: string,
  objects: Array<SimplifiedObject>,
  objectGroups: Array<SimplifiedObjectGroup>,
  sceneVariables: Array<SimplifiedVariable>,
  layers: Array<SimplifiedLayer>,
  instancesOnSceneDescription: string,
|};

type SimplifiedResource = {|
  name: string,
  type: string,
  file: string,
  metadata?: string,
|};

type SimplifiedProject = {|
  properties: {|
    gameResolutionWidth: number,
    gameResolutionHeight: number,
  |},
  globalObjects: Array<SimplifiedObject>,
  globalObjectGroups: Array<SimplifiedObjectGroup>,
  scenes: Array<SimplifiedScene>,
  globalVariables: Array<SimplifiedVariable>,
  resources: Array<SimplifiedResource>,
|};

type ProjectSpecificExtensionsSummary = {|
  extensionSummaries: Array<ExtensionSummary>,
|};

export type SimplifiedProjectOptions = {|
  scopeToScene?: string,
|};

export const makeSimplifiedProjectBuilder = (gd: libGDevelop) => {
  const getVariableType = (variable: gdVariable) => {
    const type = variable.getType();
    return type === gd.Variable.String
      ? 'String'
      : type === gd.Variable.Number
      ? 'Number'
      : type === gd.Variable.Boolean
      ? 'Boolean'
      : type === gd.Variable.Structure
      ? 'Structure'
      : type === gd.Variable.Array
      ? 'Array'
      : 'unknown';
  };

  const getVariableValueAsString = (variable: gdVariable) => {
    const type = variable.getType();
    return type === gd.Variable.Structure || type === gd.Variable.Array
      ? variable.getChildrenCount() === 0
        ? `No children`
        : variable.getChildrenCount() === 1
        ? `1 child`
        : `${variable.getChildrenCount()} children`
      : type === gd.Variable.String
      ? variable.getString()
      : type === gd.Variable.Number
      ? variable.getValue().toString()
      : type === gd.Variable.Boolean
      ? variable.getBool()
        ? `True`
        : `False`
      : 'unknown';
  };

  const getSimplifiedVariable = (
    name: string,
    variable: gdVariable,
    depth = 0
  ): SimplifiedVariable => {
    const isCollection = isCollectionVariable(variable);

    if (isCollection) {
      if (variable.getType() === gd.Variable.Structure) {
        return {
          variableName: name,
          type: getVariableType(variable),
          variableChildren: variable
            .getAllChildrenNames()
            .toJSArray()
            .map(childName => {
              const childVariable = variable.getChild(childName);
              return getSimplifiedVariable(childName, childVariable, depth + 1);
            }),
        };
      } else if (variable.getType() === gd.Variable.Array) {
        return {
          variableName: name,
          type: getVariableType(variable),
          variableChildren: mapFor(0, variable.getChildrenCount(), index => {
            const childVariable = variable.getAtIndex(index);
            return getSimplifiedVariable(
              index.toString(),
              childVariable,
              depth + 1
            );
          }),
        };
      }
    }

    return {
      variableName: name,
      type: getVariableType(variable),
      value: getVariableValueAsString(variable),
    };
  };

  const getSimplifiedVariablesContainerJson = (
    container: gdVariablesContainer
  ): Array<SimplifiedVariable> => {
    return mapFor(0, container.count(), (index: number) => {
      const name = container.getNameAt(index);
      const variable = container.getAt(index);
      return getSimplifiedVariable(name, variable);
    }).filter(Boolean);
  };

  const getSimplifiedObject = (object: gdObject): SimplifiedObject => {
    const objectVariables = getSimplifiedVariablesContainerJson(
      object.getVariables()
    );
    const behaviors = object
      .getAllBehaviorNames()
      .toJSArray()
      .map(behaviorName => {
        const behavior = object.getBehavior(behaviorName);

        return {
          behaviorName: behavior.getName(),
          behaviorType: behavior.getTypeName(),
        };
      })
      .filter(Boolean);

    const simplifiedObject: SimplifiedObject = {
      objectName: object.getName(),
      objectType: object.getType(),
    };

    if (behaviors.length > 0) {
      simplifiedObject.behaviors = behaviors;
    }
    if (objectVariables.length > 0) {
      simplifiedObject.objectVariables = objectVariables;
    }

    const objectConfiguration = object.getConfiguration();
    const animationNames = mapFor(
      0,
      objectConfiguration.getAnimationsCount(),
      i => {
        return (
          objectConfiguration.getAnimationName(i) ||
          `(animation without name, animation index is: ${i})`
        );
      }
    );
    if (animationNames.length > 0) {
      simplifiedObject.animationNames = animationNames.join(', ');
    }

    return simplifiedObject;
  };

  const getSimplifiedObjectsJson = (
    objects: gdObjectsContainer
  ): Array<SimplifiedObject> => {
    return mapFor(0, objects.getObjectsCount(), i => {
      const object = objects.getObjectAt(i);
      return getSimplifiedObject(object);
    });
  };

  const getSimplifiedObjectGroups = (
    objectGroups: gdObjectGroupsContainer,
    objectsContainersList: gdObjectsContainersList
  ): Array<SimplifiedObjectGroup> => {
    return mapFor(0, objectGroups.count(), i => {
      const objectGroup = objectGroups.getAt(i);

      const behaviorNames = objectsContainersList
        .getBehaviorsOfObject(objectGroup.getName(), true)
        .toJSArray();

      const variablesContainer = gd.ObjectVariableHelper.mergeVariableContainers(
        objectsContainersList,
        objectGroup
      );

      return {
        objectGroupName: objectGroup.getName(),
        objectGroupType: objectsContainersList.getTypeOfObject(
          objectGroup.getName()
        ),
        objectNames: objectGroup.getAllObjectsNames().toJSArray(),
        behaviors:
          behaviorNames.length > 0
            ? behaviorNames.map(behaviorName => ({
                behaviorName,
                behaviorType: objectsContainersList.getTypeOfBehaviorInObjectOrGroup(
                  objectGroup.getName(),
                  behaviorName,
                  true
                ),
              }))
            : undefined,
        variables:
          variablesContainer.count() > 0
            ? getSimplifiedVariablesContainerJson(variablesContainer)
            : undefined,
      };
    });
  };

  const getSimplifiedResourcesJson = (
    resources: gdResourcesContainer
  ): Array<SimplifiedResource> => {
    return resources.getAllResourceNames().toJSArray().map(resourceName => {
      const resource = resources.getResource(resourceName);
      return {
        name: resourceName,
        type: resource.getKind(),
        file: resource.getFile(),
        metadata: resource.getMetadata() ? resource.getMetadata() : undefined,
      };
    });
  };

  const getSimplifiedLayers = (
    layers: gdLayersContainer
  ): Array<SimplifiedLayer> => {
    return mapFor(0, layers.getLayersCount(), i => {
      const layer = layers.getLayerAt(i);
      return {
        layerName: layer.getName(),
        position: i,
        isBaseLayer: layer.getName() === '' ? true : undefined,
      };
    });
  };

  const getInstancesDescription = (scene: gdLayout): string => {
    let isEmpty = true;
    const instancesCountPerLayer: { [string]: { [string]: number } } = {};

    const instancesListerFunctor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - invoke is not writable
    instancesListerFunctor.invoke = instancePtr => {
      // $FlowFixMe - wrapPointer is not exposed
      const instance: gdInitialInstance = gd.wrapPointer(
        instancePtr,
        gd.InitialInstance
      );
      const name = instance.getObjectName();
      if (!name) return;

      const layer = instance.getLayer();

      const layerInstancesCount = (instancesCountPerLayer[layer] =
        instancesCountPerLayer[layer] || {});
      layerInstancesCount[name] = (layerInstancesCount[name] || 0) + 1;
      isEmpty = false;
    };
    // $FlowFixMe - JSFunctor is incompatible with Functor
    scene.getInitialInstances().iterateOverInstances(instancesListerFunctor);
    instancesListerFunctor.delete();

    if (isEmpty) {
      return 'There are no instances of objects placed on the scene - the scene is empty.';
    }

    const layersContainer = scene.getLayers();

    return [
      `On the scene, there are:`,
      ...mapFor(0, layersContainer.getLayersCount(), i => {
        const layer = layersContainer.getLayerAt(i);
        const layerName = layer.getName();
        const layerInstancesCount = instancesCountPerLayer[layerName];

        return [
          layerName ? `- on layer "${layer.getName()}":` : `- on base layer:`,
          !layerInstancesCount || Object.keys(layerInstancesCount).length === 0
            ? `  - Nothing (no instances)`
            : Object.keys(layerInstancesCount)
                .map(name => `  - ${layerInstancesCount[name]} ${name}`)
                .join('\n'),
        ].join('\n');
      }),
      '',
      `Inspect instances on the scene to get more details if needed.`,
    ].join('\n');
  };

  const getSimplifiedScene = (
    project: gdProject,
    scene: gdLayout
  ): SimplifiedScene => {
    const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
      project,
      scene
    );

    return {
      sceneName: scene.getName(),
      objects: getSimplifiedObjectsJson(scene.getObjects()),
      objectGroups: getSimplifiedObjectGroups(
        scene.getObjects().getObjectGroups(),
        projectScopedContainers.getObjectsContainersList()
      ),
      sceneVariables: getSimplifiedVariablesContainerJson(scene.getVariables()),
      layers: getSimplifiedLayers(scene.getLayers()),
      instancesOnSceneDescription: getInstancesDescription(scene),
    };
  };

  const getSimplifiedProject = (
    project: gdProject,
    options: SimplifiedProjectOptions
  ): SimplifiedProject => {
    const globalObjects = getSimplifiedObjectsJson(project.getObjects());
    const scenes = mapFor(0, project.getLayoutsCount(), i => {
      const scene = project.getLayoutAt(i);
      if (options.scopeToScene && scene.getName() !== options.scopeToScene)
        return null;

      return getSimplifiedScene(project, scene);
    }).filter(Boolean);

    const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProject(
      project
    );

    // Filter extensions to only include extensions from the project.

    const simplifiedProject: SimplifiedProject = {
      properties: {
        gameResolutionWidth: project.getGameResolutionWidth(),
        gameResolutionHeight: project.getGameResolutionHeight(),
      },
      resources: getSimplifiedResourcesJson(project.getResourcesManager()),
      globalObjects,
      globalObjectGroups: getSimplifiedObjectGroups(
        project.getObjects().getObjectGroups(),
        projectScopedContainers.getObjectsContainersList()
      ),
      scenes,
      globalVariables: getSimplifiedVariablesContainerJson(
        project.getVariables()
      ),
    };

    return simplifiedProject;
  };

  const getProjectSpecificExtensionsSummary = (
    project: gdProject
  ): ProjectSpecificExtensionsSummary => {
    const startTime = Date.now();
    const platform = project.getCurrentPlatform();
    const allExtensions = platform.getAllPlatformExtensions();

    const projectExtensionNames = new Set(
      mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
        const extension = project.getEventsFunctionsExtensionAt(i);
        return extension.getName();
      })
    );

    const projectSpecificExtensions: Array<gdPlatformExtension> = mapVector(
      allExtensions,
      extension => {
        if (projectExtensionNames.has(extension.getName())) {
          return extension;
        }
        return null;
      }
    ).filter(Boolean);

    const extensionsSummary: ProjectSpecificExtensionsSummary = {
      extensionSummaries: projectSpecificExtensions.map(extension => {
        const extensionName = extension.getName();
        const eventsFunctionsExtension = project.hasEventsFunctionsExtensionNamed(
          extensionName
        )
          ? project.getEventsFunctionsExtension(extensionName)
          : null;

        return buildExtensionSummary({
          gd,
          eventsFunctionsExtension,
          extension,
        });
      }),
    };

    const duration = Date.now() - startTime;
    console.info(
      `Project specific extensions summary generated in ${duration.toFixed(
        0
      )}ms`
    );

    return extensionsSummary;
  };

  return { getSimplifiedProject, getProjectSpecificExtensionsSummary };
};
