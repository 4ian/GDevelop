// @flow
import 'pixi-spine';
import slugs from 'slugs';
import axios from 'axios';
import * as PIXI from 'pixi.js-legacy';
import * as PIXI_SPINE from 'pixi-spine';
import { ISkeleton } from 'pixi-spine';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import ResourcesLoader from '../ResourcesLoader';
import { loadFontFace } from '../Utils/FontFaceLoader';
import { checkIfCredentialsRequired } from '../Utils/CrossOrigin';
const gd: libGDevelop = global.gd;

type ResourcePromise<T> = { [resourceName: string]: Promise<T> };

const loadedBitmapFonts = {};
const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.from('res/error48.png');
const loadedThreeTextures = {};
const loadedThreeMaterials = {};
const loadedOrLoading3DModelPromises: ResourcePromise<THREE.THREE_ADDONS.GLTF> = {};
const atlasPromises: ResourcePromise<string> = {};
const spineDataPromises: ResourcePromise<ISkeleton> = {};

const createInvalidModel = (): GLTF => {
  /**
   * The invalid model is a box with magenta (#ff00ff) faces, to be
   * easily spotted if rendered on screen.
   */
  const group = new THREE.Group();
  group.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: '#ff00ff' })
    )
  );
  return {
    scene: group,
    animations: [],
    cameras: [],
    scenes: [],
    asset: {},
    userData: {},
    parser: null,
  };
};
const invalidModel: GLTF = createInvalidModel();

let gltfLoader = null;
const getOrCreateGltfLoader = () => {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./external/draco/gltf/');
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  return gltfLoader;
};

const load3DModel = (
  project: gdProject,
  resourceName: string
): Promise<THREE.THREE_ADDONS.GLTF> => {
  if (!project.getResourcesManager().hasResource(resourceName))
    return Promise.resolve(invalidModel);

  const resource = project.getResourcesManager().getResource(resourceName);
  if (resource.getKind() !== 'model3D') return Promise.resolve(invalidModel);

  const url = ResourcesLoader.getResourceFullUrl(project, resourceName, {
    isResourceForPixi: true,
  });

  const gltfLoader = getOrCreateGltfLoader();
  gltfLoader.withCredentials = checkIfCredentialsRequired(url);
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      gltf => {
        traverseToRemoveMetalnessFromMeshes(gltf.scene);
        resolve(gltf);
      },
      undefined,
      error => {
        reject(error);
      }
    );
  });
};

const determineCrossOrigin = (url: string) => {
  // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
  // i.e: its gdevelop.io cookie, to be passed.
  if (checkIfCredentialsRequired(url)) return 'use-credentials';

  // For other resources, use "anonymous" as done by default by PixiJS. Note that using `false`
  // to not having `crossorigin` at all would NOT work because the browser would taint the
  // loaded resource so that it can't be read/used in a canvas (it's only working for display `<img>` on screen).
  return 'anonymous';
};

const applyPixiTextureSettings = (resource: gdResource, texture: any) => {
  if (resource.getKind() !== 'image') return;

  const imageResource = gd.asImageResource(resource);
  if (!imageResource.isSmooth()) {
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  }
};

const applyThreeTextureSettings = (
  resource: gdResource,
  threeTexture: THREE.Texture
) => {
  if (resource.getKind() !== 'image') return;

  const imageResource = gd.asImageResource(resource);
  if (!imageResource.isSmooth()) {
    threeTexture.magFilter = THREE.NearestFilter;
    threeTexture.minFilter = THREE.NearestFilter;
  }
};

const removeMetalness = (material: THREE.Material): void => {
  if (material.metalness) {
    material.metalness = 0;
  }
};

const removeMetalnessFromMesh = (node: THREE.Object3D<THREE.Event>): void => {
  const mesh = (node: THREE.Mesh);
  if (!mesh.material) {
    return;
  }
  if (Array.isArray(mesh.material)) {
    for (let index = 0; index < mesh.material.length; index++) {
      removeMetalness(mesh.material[index]);
    }
  } else {
    removeMetalness(mesh.material);
  }
};

const traverseToRemoveMetalnessFromMeshes = (
  node: THREE.Object3D<THREE.Event>
) => node.traverse(removeMetalnessFromMesh);

/**
 * Expose functions to load PIXI textures or fonts, given the names of
 * resources and a gd.Project.
 *
 * This internally uses ResourcesLoader to get the URL of the resources.
 */
export default class PixiResourcesLoader {
  static burstCache() {
    loadedBitmapFonts = {};
    loadedFontFamilies = {};
    loadedTextures = {};
    loadedThreeTextures = {};
    loadedThreeMaterials = {};
    loadedOrLoading3DModelPromises = {};
  }

  static async reloadTextureForResource(
    project: gdProject,
    resourceName: string
  ) {
    const loadedTexture = loadedTextures[resourceName];
    if (loadedTexture && loadedTexture.textureCacheIds) {
      // The property textureCacheIds indicates that the PIXI.Texture object has some
      // items cached in PIXI caches (PIXI.utils.BaseTextureCache and PIXI.utils.TextureCache).
      // PIXI.Assets.unload will handle the clearing of those caches.
      await PIXI.Assets.unload(loadedTexture.textureCacheIds);
      // The cached texture is also removed. This is to handle cases where an empty texture
      // has been cached (if file was not found for instance), and a corresponding file has
      // been added and detected by file watcher. When reloading the texture, the cache must
      // be cleaned too.
      delete loadedTextures[resourceName];
    }

    await PixiResourcesLoader.loadTextures(project, [resourceName]);

    if (loadedOrLoading3DModelPromises[resourceName]) {
      delete loadedOrLoading3DModelPromises[resourceName];
    }
    if (loadedFontFamilies[resourceName]) {
      delete loadedFontFamilies[resourceName];
    }
    if (loadedBitmapFonts[resourceName]) {
      delete loadedBitmapFonts[resourceName];
    }
    if (loadedThreeTextures[resourceName]) {
      loadedThreeTextures[resourceName].dispose();
      delete loadedThreeTextures[resourceName];
    }
    const matchingMaterials = Object.keys(loadedThreeMaterials).filter(key =>
      key.startsWith(resourceName)
    );
    if (matchingMaterials.length > 0) {
      matchingMaterials.forEach(key => {
        loadedThreeMaterials[key].dispose();
        delete loadedThreeMaterials[key];
      });
    }
  }
  /**
   * (Re)load the PIXI texture represented by the given resources.
   */
  static async loadTextures(
    project: gdProject,
    resourceNames: Array<string>
  ): Promise<void> {
    const resourcesManager = project.getResourcesManager();

    const imageResources = resourceNames
      .map(resourceName => {
        if (!resourcesManager.hasResource(resourceName)) {
          return null;
        }
        const resource = resourcesManager.getResource(resourceName);
        if (resource.getKind() !== 'image') {
          return null;
        }
        return resource;
      })
      .filter(Boolean);
    const videoResources = resourceNames
      .map(resourceName => {
        if (!resourcesManager.hasResource(resourceName)) {
          return null;
        }
        const resource = resourcesManager.getResource(resourceName);
        if (resource.getKind() !== 'video') {
          return null;
        }
        return resource;
      })
      .filter(Boolean);

    // TODO use a PromisePool to be able to abort the previous reload of resources.
    await Promise.all([
      ...imageResources.map(async resource => {
        const resourceName = resource.getName();
        try {
          const url = ResourcesLoader.getResourceFullUrl(
            project,
            resourceName,
            {
              isResourceForPixi: true,
            }
          );
          PIXI.Assets.setPreferences({
            preferWorkers: false,
            preferCreateImageBitmap: false,
            crossOrigin: determineCrossOrigin(url),
          });
          const loadedTexture = await PIXI.Assets.load(url);
          loadedTextures[resourceName] = loadedTexture;
          // TODO What if 2 assets share the same file with different settings?
          applyPixiTextureSettings(resource, loadedTexture);
        } catch (error) {
          console.error(
            `Unable to load file ${resource.getFile()} for image resource ${resourceName}:`,
            error ? error : '(unknown error)'
          );
        }
      }),
      ...videoResources.map(async resource => {
        const resourceName = resource.getName();
        try {
          const url = ResourcesLoader.getResourceFullUrl(
            project,
            resourceName,
            {
              isResourceForPixi: true,
            }
          );

          loadedTextures[resourceName] = PIXI.Texture.from(url, {
            scaleMode: PIXI.SCALE_MODES.LINEAR,
            resourceOptions: {
              autoPlay: false,
              // If autoLoad is set to false (instinctive choice given that the code
              // calls the load method on the base texture), the video is displayed
              // as a black rectangle.
              autoLoad: true,
              // crossorigin does not have a typo (with regards to PIXI.Assets.setPreferences that
              // uses a crossOrigin parameter). See https://pixijs.download/dev/docs/PIXI.html#autoDetectResource.
              crossorigin: determineCrossOrigin(url),
            },
          });
          if (!loadedTextures[resourceName]) {
            console.error(`Texture loading for ${url} returned nothing`);
            loadedTextures[resourceName] = invalidTexture;
          }

          loadedTextures[resourceName].baseTexture.resource
            .load()
            .catch(error => {
              console.error(
                `Unable to load video texture from url ${url}:`,
                error
              );
              loadedTextures[resourceName] = invalidTexture;
            });
        } catch (error) {
          console.error(
            `Unable to load file ${resource.getFile()} for video resource ${resourceName}:`,
            error ? error : '(unknown error)'
          );
        }
      }),
    ]);
  }

  /**
   * Return the PIXI texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXITexture(project: gdProject, resourceName: string) {
    if (loadedTextures[resourceName]) {
      // TODO: we never consider textures as not valid anymore. When we
      // update the IDE to unload textures, we should handle loading them again
      // here (and also be careful to return the same texture if it's not valid
      // but still loading, when multiple objects are rapidly asking for the same texture).
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'image') return invalidTexture;

    const url = ResourcesLoader.getResourceFullUrl(project, resourceName, {
      isResourceForPixi: true,
    });
    loadedTextures[resourceName] = PIXI.Texture.from(url, {
      resourceOptions: {
        crossorigin: determineCrossOrigin(url),
        autoLoad: false,
      },
    });
    if (!loadedTextures[resourceName]) {
      console.error(`Texture loading for ${url} returned nothing`);
      loadedTextures[resourceName] = invalidTexture;
      return loadedTextures[resourceName];
    }
    loadedTextures[resourceName].baseTexture.resource.load().catch(error => {
      console.error(`Unable to load texture from url ${url}:`, error);
      loadedTextures[resourceName] = invalidTexture;
    });

    applyPixiTextureSettings(resource, loadedTextures[resourceName]);
    return loadedTextures[resourceName];
  }

  /**
   * Return the three.js texture associated to the specified resource name.
   * Returns a placeholder texture if not found.
   * @param project The project
   * @param resourceName The name of the resource
   * @returns The requested texture, or a placeholder if not found.
   */
  static getThreeTexture(
    project: gdProject,
    resourceName: string
  ): THREE.Texture {
    const loadedThreeTexture = loadedThreeTextures[resourceName];
    if (loadedThreeTexture) return loadedThreeTexture;

    // Texture is not loaded, load it now from the PixiJS texture.
    // TODO (3D) - optimization: don't load the PixiJS Texture if not used by PixiJS.
    // TODO (3D) - optimization: Ideally we could even share the same WebGL texture.
    const pixiTexture = PixiResourcesLoader.getPIXITexture(
      project,
      resourceName
    );

    // @ts-ignore - source does exist on resource.
    const image = pixiTexture.baseTexture.resource.source;
    if (!(image instanceof HTMLImageElement)) {
      throw new Error(
        `Can't load texture for resource "${resourceName}" as it's not an image.`
      );
    }

    const threeTexture = new THREE.Texture(image);
    threeTexture.magFilter = THREE.LinearFilter;
    threeTexture.minFilter = THREE.LinearFilter;
    threeTexture.wrapS = THREE.RepeatWrapping;
    threeTexture.wrapT = THREE.RepeatWrapping;
    threeTexture.colorSpace = THREE.SRGBColorSpace;
    threeTexture.needsUpdate = true;

    const resource = project.getResourcesManager().getResource(resourceName);
    applyThreeTextureSettings(resource, threeTexture);

    loadedThreeTextures[resourceName] = threeTexture;

    return threeTexture;
  }

  /**
   * Return the three.js material associated to the specified resource name.
   * @param project The project
   * @param resourceName The name of the resource
   * @param options Set if the material should be transparent or not.
   * @returns The requested material.
   */
  static getThreeMaterial(
    project: gdProject,
    resourceName: string,
    { useTransparentTexture }: {| useTransparentTexture: boolean |}
  ) {
    const cacheKey = `${resourceName}|transparent:${useTransparentTexture.toString()}`;
    const loadedThreeMaterial = loadedThreeMaterials[cacheKey];
    if (loadedThreeMaterial) return loadedThreeMaterial;

    const material = new THREE.MeshBasicMaterial({
      map: this.getThreeTexture(project, resourceName),
      side: useTransparentTexture ? THREE.DoubleSide : THREE.FrontSide,
      transparent: useTransparentTexture,
    });

    loadedThreeMaterials[cacheKey] = material;
    return material;
  }

  /**
   * Return the three.js material associated to the specified resource name.
   * @param project The project
   * @param resourceName The name of the resource
   * @param options
   * @returns The requested material.
   */
  static get3DModel(
    project: gdProject,
    resourceName: string
  ): Promise<THREE.THREE_ADDONS.GLTF> {
    const promise = loadedOrLoading3DModelPromises[resourceName];
    if (promise) return promise;

    const loadingPromise = load3DModel(project, resourceName);
    loadedOrLoading3DModelPromises[resourceName] = loadingPromise;
    return loadingPromise;
  }

  /**
   * Return the Pixi spine data to the specified resource names.
   * @param project The project
   * @param spineName The name of the spine json resource
   * @param atlasImageName The name of the atlas image resource
   * @param atlasTextName The name of the atlas text resource
   * @returns The requested material.
   */
  static async getSpineData(
    project: gdProject,
    spineName: string,
    atlasImageName: string,
    atlasTextName: string
  ): Promise<PIXI_SPINE.ISkeleton> {
    const loader = PIXI.Assets.loader;
    const resourceManager = project.getResourcesManager();
    const resourcesData = [
      [spineName, 'json'],
      [atlasImageName, 'image'],
      [atlasTextName, 'atlas'],
    ];

    for (const [resName, resKind] of resourcesData) {
      if (!resourceManager.hasResource(resName)) {
        return Promise.reject(`Unknown ${resKind} file ${resName}.`);
      }
      if (resourceManager.getResource(resName).getKind() !== resKind) {
        return Promise.reject(
          `The resource called ${resName} is not of appropriate file type ${resKind}.`
        );
      }
    }

    // https://github.com/pixijs/spine/blob/master/examples/preload_atlas_text.md
    if (!atlasPromises[atlasTextName]) {
      atlasPromises[atlasTextName] = new Promise(resolve => {
        const atlasUrl = ResourcesLoader.getResourceFullUrl(project, atlasTextName, {
          isResourceForPixi: true,
        });
        PIXI.Assets.setPreferences({
          preferWorkers: false,
          crossOrigin: checkIfCredentialsRequired(atlasUrl)
            ? 'use-credentials'
            : 'anonymous',
        });
        PIXI.Assets.add(atlasTextName, atlasUrl, { image: this.getPIXITexture(project, atlasImageName) });
        PIXI.Assets.load(atlasTextName).then((atlas) => {
          resolve(atlas);
        });
      });
    }

    if (!spineDataPromises[spineName]) {
      spineDataPromises[spineName] = new Promise(resolve => {
        atlasPromises[atlasTextName].then(spineAtlas => {
          const jsonUrl = ResourcesLoader.getResourceFullUrl(project, spineName, {
            isResourceForPixi: true,
          });
          PIXI.Assets.setPreferences({
            preferWorkers: false,
            crossOrigin: checkIfCredentialsRequired(jsonUrl)
              ? 'use-credentials'
              : 'anonymous',
          });
          PIXI.Assets.add(spineName, jsonUrl, { spineAtlas })
          PIXI.Assets.load(jsonUrl).then((jsonData) => {
            resolve(jsonData.spineData)
          });
        });
      });
    }

    return spineDataPromises[spineName];
  }

  /**
   * Return the PIXI video texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXIVideoTexture(project: gdProject, resourceName: string) {
    if (loadedTextures[resourceName]) {
      // TODO: we never consider textures as not valid anymore. When we
      // update the IDE to unload textures, we should handle loading them again
      // here (and also be careful to return the same texture if it's not valid
      // but still loading, when multiple objects are rapidly asking for the same texture).
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'video') return invalidTexture;

    const url = ResourcesLoader.getResourceFullUrl(project, resourceName, {
      isResourceForPixi: true,
    });

    loadedTextures[resourceName] = PIXI.Texture.from(url, {
      scaleMode: PIXI.SCALE_MODES.LINEAR,
      resourceOptions: {
        autoPlay: false,
        // If autoLoad is set to false (instinctive choice given that the code
        // calls the load method on the base texture), the video is displayed
        // as a black rectangle.
        autoLoad: true,
        crossorigin: determineCrossOrigin(url),
      },
    });
    if (!loadedTextures[resourceName]) {
      console.error(`Texture loading for ${url} returned nothing`);
      loadedTextures[resourceName] = invalidTexture;
      return loadedTextures[resourceName];
    }

    loadedTextures[resourceName].baseTexture.resource.load().catch(error => {
      console.error(`Unable to load video texture from url ${url}:`, error);
      loadedTextures[resourceName] = invalidTexture;
    });

    return loadedTextures[resourceName];
  }

  /**
   * Load the given font from its url/filename.
   * @returns a Promise that resolves with the font-family to be used
   * to render a text with the font.
   */
  static loadFontFamily(
    project: gdProject,
    resourceName: string
  ): Promise<string> {
    // Avoid reloading a font if it's already cached
    if (loadedFontFamilies[resourceName]) {
      return Promise.resolve(loadedFontFamilies[resourceName]);
    }

    const fontFamily = slugs(resourceName);
    let fullFilename = null;
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resource = project.getResourcesManager().getResource(resourceName);
      if (resource.getKind() === 'font') {
        fullFilename = ResourcesLoader.getResourceFullUrl(
          project,
          resourceName,
          {
            isResourceForPixi: true,
          }
        );
      }
    } else {
      // Compatibility with GD <= 5.0-beta56
      // Assume resourceName is just the filename to the font
      fullFilename = ResourcesLoader.getFullUrl(project, resourceName, {
        isResourceForPixi: true,
      });
      // end of compatibility code
    }

    if (!fullFilename) {
      // If no resource is found/resource is not a font, default to Arial,
      // as done by the game engine too.
      return Promise.resolve('Arial');
    }

    return loadFontFace(fontFamily, fullFilename).then(loadedFace => {
      loadedFontFamilies[resourceName] = fontFamily;

      return fontFamily;
    });
  }

  /**
   * Get the font family name for the given font resource.
   * The font won't be loaded.
   * @returns The font-family to be used to render a text with the font.
   */
  static getFontFamily(project: gdProject, resourceName: string) {
    if (loadedFontFamilies[resourceName]) {
      return loadedFontFamilies[resourceName];
    }

    const fontFamily = slugs(resourceName);
    return fontFamily;
  }

  /**
   * Get the data from a bitmap font file (fnt/xml) resource in the IDE.
   */
  static getBitmapFontData(
    project: gdProject,
    resourceName: string
  ): Promise<any> {
    if (loadedBitmapFonts[resourceName]) {
      return Promise.resolve(loadedBitmapFonts[resourceName].data);
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return Promise.reject(
        new Error(`Can't find resource called ${resourceName}.`)
      );

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'bitmapFont')
      return Promise.reject(
        new Error(
          `The resource called ${resourceName} is not a bitmap font file. Require .fnt or .xml format.`
        )
      );

    const fullUrl = ResourcesLoader.getResourceFullUrl(project, resourceName, {
      isResourceForPixi: true,
    });
    if (!fullUrl) {
      return Promise.reject(
        new Error(
          `The resource called ${resourceName} was no found.\nThe default bitmap font will be used.`
        )
      );
    }

    return axios
      .get(fullUrl, {
        withCredentials: checkIfCredentialsRequired(fullUrl),
      })
      .then(response => {
        loadedBitmapFonts[resourceName] = response;
        return response.data;
      });
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }

  /**
   * Get the data from a json resource in the IDE.
   */
  static getResourceJsonData(
    project: gdProject,
    resourceName: string
  ): Promise<any> {
    if (!project.getResourcesManager().hasResource(resourceName))
      return Promise.reject(
        new Error(`Can't find resource called ${resourceName}.`)
      );

    const resource = project.getResourcesManager().getResource(resourceName);
    if (
      resource.getKind() !== 'json' &&
      resource.getKind() !== 'tilemap' &&
      resource.getKind() !== 'tileset'
    )
      return Promise.reject(
        new Error(`The resource called ${resourceName} is not a json file.`)
      );

    const fullUrl = ResourcesLoader.getResourceFullUrl(project, resourceName, {
      isResourceForPixi: true,
    });
    return axios
      .get(fullUrl, {
        withCredentials: checkIfCredentialsRequired(fullUrl),
      })
      .then(response => response.data);
  }
}
