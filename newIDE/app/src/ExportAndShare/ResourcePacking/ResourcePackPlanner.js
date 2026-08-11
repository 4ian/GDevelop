// @flow

/**
 * Decides which resource goes into which ".gdpak" pack.
 *
 * The engine loads resources scene by scene (see `gdjs.ResourceLoader`), so
 * packing everything into a single archive would force the whole game to be
 * downloaded before the first scene starts. Instead we mirror the loading
 * groups the exporter already computes:
 *
 *  - the resources needed by any scene go into a global pack, loaded at
 *    startup;
 *  - each scene gets its own pack, loaded when the scene is;
 *  - resources of objects marked as "preloaded manually" get a separate pack
 *    per scene, so that marking an object as manually preloaded still avoids
 *    downloading it with the scene.
 *
 * This is the same trade-off Defold makes for its HTML5 export: a handful of
 * archives rather than one, so that lazy loading and incremental caching keep
 * working.
 */

const GLOBAL_PACK_GROUP_NAME = 'global';

export type PlannedPack = {|
  /** The file name of the pack inside the exported game. */
  name: string,
  /** The files it contains, in a stable order. */
  filePaths: Array<string>,
  /**
   * True for the pack that must be downloaded before the first scene starts,
   * whether or not the engine has a loading task for its files.
   *
   * This is what makes resources that are only reachable dynamically work: a
   * sound played by name from an expression appears in no `usedResources`
   * list, so nothing ever triggers the download of its pack, and the engine
   * asks for its URL synchronously when the sound is played. Those resources
   * are put in this pack (see the "no group refers to it" rule below).
   */
  isLoadedAtStartup: boolean,
|};

export type ResourcePackPlan = {|
  packs: Array<PlannedPack>,
  /** Resource file -> index in `packs`. This is what the game engine reads. */
  fileToPackIndex: { [filePath: string]: number },
  /** Resource files deliberately left as individual files in the export. */
  unpackedFilePaths: Array<string>,
|};

export type PlanOptions = {|
  /**
   * Resource kinds that must stay individual files. Used for resources whose
   * loader needs a real file extension in the URL (a `blob:` URL has none).
   */
  excludedResourceKinds?: Array<string>,
  /**
   * Above this number of packs, the smallest ones are merged together, so that
   * a project with hundreds of scenes does not defeat the purpose of packing.
   */
  maxPackCount?: number,
|};

const DEFAULT_MAX_PACK_COUNT = 100;

const isUrl = (filePath: string): boolean =>
  filePath.startsWith('http://') ||
  filePath.startsWith('https://') ||
  filePath.startsWith('data:') ||
  filePath.startsWith('blob:');

/**
 * Read the names of the resources embedded in another one. Spine skeletons
 * reference their atlas this way, and atlases their page images - see
 * `gdjs.RuntimeGame._updateEmbeddedResourcesMappings`.
 */
const getEmbeddedResourceNames = (resource: Object): Array<string> => {
  if (!resource.metadata) return [];

  try {
    const metadata = JSON.parse(resource.metadata);
    const mapping = metadata ? metadata.embeddedResourcesMapping : null;
    if (!mapping || typeof mapping !== 'object') return [];

    // $FlowFixMe[incompatible-call] - values of a parsed JSON object.
    return Object.keys(mapping)
      .map(key => mapping[key])
      .filter(name => typeof name === 'string');
  } catch (error) {
    // A resource with unparseable metadata simply has no embedded resource.
    return [];
  }
};

type ResourceGroup = {|
  name: string,
  packName: string,
  resourceNames: Array<string>,
|};

const collectObjectsResourceNames = (
  objects: ?Array<Object>
): Array<string> => {
  if (!objects) return [];

  const resourceNames = [];
  objects.forEach(object => {
    // `usedResources` is only serialized for objects preloaded manually.
    if (!object.usedResources) return;
    object.usedResources.forEach(({ name }) => resourceNames.push(name));
  });
  return resourceNames;
};

/**
 * Build the list of loading groups, in the order the engine loads them.
 */
const buildResourceGroups = (projectData: Object): Array<ResourceGroup> => {
  const groups: Array<ResourceGroup> = [
    {
      name: GLOBAL_PACK_GROUP_NAME,
      packName: 'resources.pak',
      resourceNames: (projectData.usedResources || []).map(({ name }) => name),
    },
  ];

  const globalLazyResourceNames = collectObjectsResourceNames(
    projectData.objects
  );
  if (globalLazyResourceNames.length) {
    groups.push({
      name: 'global-lazy',
      packName: 'resources-lazy.pak',
      resourceNames: globalLazyResourceNames,
    });
  }

  (projectData.layouts || []).forEach((layout, layoutIndex) => {
    groups.push({
      name: `scene-${layoutIndex}`,
      packName: `scene-${layoutIndex}.pak`,
      resourceNames: (layout.usedResources || []).map(({ name }) => name),
    });

    const lazyResourceNames = collectObjectsResourceNames(layout.objects);
    if (lazyResourceNames.length) {
      groups.push({
        name: `scene-${layoutIndex}-lazy`,
        packName: `scene-${layoutIndex}-lazy.pak`,
        resourceNames: lazyResourceNames,
      });
    }
  });

  return groups;
};

/**
 * Merge the smallest packs together until there are no more than
 * `maxPackCount` of them. The global pack is never merged, as it is the one
 * loaded at startup.
 */
const mergeSmallestPacks = (
  packs: Array<PlannedPack>,
  maxPackCount: number
): Array<PlannedPack> => {
  if (packs.length <= maxPackCount) return packs;

  const [globalPack, ...otherPacks] = packs;
  const mergeable = otherPacks.slice();
  let mergedCount = 0;

  while (mergeable.length + 1 > maxPackCount && mergeable.length > 1) {
    mergeable.sort((a, b) => a.filePaths.length - b.filePaths.length);
    const first = mergeable.shift();
    const second = mergeable.shift();
    if (!first || !second) break;

    mergeable.push({
      name: `shared-${mergedCount++}.pak`,
      filePaths: [...first.filePaths, ...second.filePaths],
      isLoadedAtStartup: false,
    });
  }

  return [globalPack, ...mergeable];
};

/**
 * Decide the pack each resource file belongs to.
 */
export const planResourcePacks = (
  projectData: Object,
  options?: PlanOptions
): ResourcePackPlan => {
  const excludedResourceKinds = new Set(
    (options && options.excludedResourceKinds) || []
  );
  const maxPackCount =
    (options && options.maxPackCount) || DEFAULT_MAX_PACK_COUNT;

  const resourcesByName: Map<string, Object> = new Map();
  (projectData.resources && projectData.resources.resources
    ? projectData.resources.resources
    : []
  ).forEach(resource => {
    // Resources without a file are ignored by the engine too
    // (see `gdjs.ResourceLoader.setResources`).
    if (!resource.file) return;
    resourcesByName.set(resource.name, resource);
  });

  // Resources that must stay individual files in the export.
  const unpackedFilePaths: Set<string> = new Set();
  const isPackable = (resource: Object): boolean => {
    if (isUrl(resource.file)) return false;
    if (excludedResourceKinds.has(resource.kind)) return false;
    return true;
  };

  const loadingScreen =
    projectData.properties && projectData.properties.loadingScreen;
  const loadingScreenResourceName = loadingScreen
    ? loadingScreen.backgroundImageResourceName
    : '';
  if (loadingScreenResourceName) {
    // The loading screen background is downloaded before the loading screen can
    // be displayed (see `gdjs.RuntimeGame.loadFirstAssetsAndStartBackgroundLoading`).
    // Packing it would mean waiting for the whole global pack before showing
    // anything.
    const resource = resourcesByName.get(loadingScreenResourceName);
    if (resource) unpackedFilePaths.add(resource.file);
  }

  resourcesByName.forEach(resource => {
    if (!isPackable(resource)) unpackedFilePaths.add(resource.file);
  });

  // Resolve each loading group to a set of files, following embedded resources
  // so that a Spine skeleton, its atlas and the atlas pages always end up in
  // the same pack: the atlas manager reaches page textures synchronously and
  // cannot wait for another pack to be downloaded.
  const groups = buildResourceGroups(projectData);
  const groupFiles: Array<Set<string>> = groups.map(group => {
    const files: Set<string> = new Set();
    const visitedResourceNames: Set<string> = new Set();

    const visit = (resourceName: string) => {
      if (visitedResourceNames.has(resourceName)) return;
      visitedResourceNames.add(resourceName);

      const resource = resourcesByName.get(resourceName);
      if (!resource) return;
      if (!unpackedFilePaths.has(resource.file)) files.add(resource.file);

      getEmbeddedResourceNames(resource).forEach(visit);
    };

    group.resourceNames.forEach(visit);
    return files;
  });

  // A file needed by more than one group is moved to the global pack. It cannot
  // be duplicated in each pack: the engine resolves a file to a pack without
  // knowing which scene asked for it.
  const groupCountByFile: Map<string, number> = new Map();
  groupFiles.forEach((files, groupIndex) => {
    if (groupIndex === 0) return; // The global group always wins.
    files.forEach(file => {
      groupCountByFile.set(file, (groupCountByFile.get(file) || 0) + 1);
    });
  });

  const globalFiles = groupFiles[0];
  groupCountByFile.forEach((count, file) => {
    if (count > 1) globalFiles.add(file);
  });
  groupFiles.forEach((files, groupIndex) => {
    if (groupIndex === 0) return;
    files.forEach(file => {
      if (globalFiles.has(file)) files.delete(file);
    });
  });

  // Resources that no group refers to are only reachable dynamically (a sound
  // played by name, an animation picked by an expression...). They must not be
  // lost: put them in the global pack.
  const assignedFiles: Set<string> = new Set();
  groupFiles.forEach(files => files.forEach(file => assignedFiles.add(file)));
  resourcesByName.forEach(resource => {
    if (unpackedFilePaths.has(resource.file)) return;
    if (assignedFiles.has(resource.file)) return;
    globalFiles.add(resource.file);
  });

  const packs: Array<PlannedPack> = groups
    .map((group, groupIndex) => ({
      name: group.packName,
      filePaths: Array.from(groupFiles[groupIndex]),
      // The global pack holds the resources that no loading task refers to, so
      // it must be downloaded up front: nothing else would ever trigger it.
      isLoadedAtStartup: group.name === GLOBAL_PACK_GROUP_NAME,
    }))
    // Keep the global pack even when empty, so that the pack list order is
    // stable, but drop the scene packs that ended up with nothing.
    .filter((pack, packIndex) => packIndex === 0 || pack.filePaths.length > 0);

  const mergedPacks = mergeSmallestPacks(
    packs,
    Math.max(1, maxPackCount)
  ).filter(pack => pack.filePaths.length > 0);

  const fileToPackIndex: { [filePath: string]: number } = {};
  mergedPacks.forEach((pack, packIndex) => {
    pack.filePaths.forEach(filePath => {
      fileToPackIndex[filePath] = packIndex;
    });
  });

  return {
    packs: mergedPacks,
    fileToPackIndex,
    unpackedFilePaths: Array.from(unpackedFilePaths),
  };
};
