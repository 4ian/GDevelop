// @flow
import slugs from 'slugs';
import axios from 'axios';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import ResourcesLoader from '../ResourcesLoader';
import { loadFontFace } from '../Utils/FontFaceLoader';
import { checkIfCredentialsRequired } from '../Utils/CrossOrigin';
const gd: libGDevelop = global.gd;

const loadedBitmapFonts = {};
const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.from('res/error48.png');
const loadedThreeTextures = {};
const loadedThreeMaterials = {};
const loaded3DModels = {};
const invalidModel = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: '#ff00ff' })
);

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

const convertToBasicMaterial = (
  material: THREE.Material
): THREE.MeshBasicMaterial => {
  const basicMaterial = new THREE.MeshBasicMaterial();
  if (material.color) {
    basicMaterial.color = material.color;
  }
  if (material.map) {
    basicMaterial.map = material.map;
  }
  return basicMaterial;
};

const setBasicMaterialTo = (node: THREE.Object3D<THREE.Event>): void => {
  const mesh = (node: THREE.Mesh);
  if (!mesh.material) {
    return;
  }

  if (Array.isArray(mesh.material)) {
    for (let index = 0; index < mesh.material.length; index++) {
      mesh.material[index] = convertToBasicMaterial(mesh.material[index]);
    }
  } else {
    mesh.material = convertToBasicMaterial(mesh.material);
  }
};

const traverseToSetBasicMaterialFromMeshes = (
  node: THREE.Object3D<THREE.Event>
) => node.traverse(setBasicMaterialTo);

/**
 * Expose functions to load PIXI textures or fonts, given the names of
 * resources and a gd.Project.
 *
 * This internally uses ResourcesLoader to get the URL of the resources.
 */
export default class PixiResourcesLoader {
  /**
   * (Re)load the PIXI texture represented by the given resources.
   */
  static loadTextures(
    project: gdProject,
    resourceNames: Array<string>,
    onProgress: (number, number) => void,
    onComplete: () => void
  ) {
    const resourcesManager = project.getResourcesManager();
    const loader = PIXI.Loader.shared;
    loader.reset();

    const allResources = {};
    resourceNames.forEach(resourceName => {
      if (!resourcesManager.hasResource(resourceName)) return;

      const resource = resourcesManager.getResource(resourceName);
      if (resource.getKind() !== 'image') return;

      const url = ResourcesLoader.getResourceFullUrl(project, resourceName, {
        isResourceForPixi: true,
      });
      loader.add({
        name: resourceName,
        url: url,
        loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE,
        crossOrigin: determineCrossOrigin(url),
      });
      allResources[resourceName] = resource;
    });

    const totalCount = Object.keys(allResources).length;
    if (!totalCount) {
      onComplete();
      return;
    }

    let loadingCount = 0;
    const progressCallbackId = loader.onProgress.add(function() {
      loadingCount++;
      onProgress(loadingCount, totalCount);
    });

    loader.load((loader, loadedResources) => {
      loader.onProgress.detach(progressCallbackId);

      //Store the loaded textures so that they are ready to use.
      for (const resourceName in loadedResources) {
        if (loadedResources.hasOwnProperty(resourceName)) {
          const resource = resourcesManager.getResource(resourceName);
          if (resource.getKind() !== 'image') continue;

          const texture = loadedResources[resourceName].texture;
          if (texture) {
            loadedTextures[resourceName] = texture;
            applyPixiTextureSettings(resource, loadedTextures[resourceName]);
          }
        }
      }

      onComplete();
    });
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
      },
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
  ): Promise<THREE.Object3D> {
    const loaded3DModel = loaded3DModels[resourceName];
    if (loaded3DModel) return Promise.resolve(loaded3DModel);

    if (!project.getResourcesManager().hasResource(resourceName))
      return Promise.resolve(invalidModel);

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'model3D') return Promise.resolve(invalidModel);

    const url = ResourcesLoader.getResourceFullUrl(project, resourceName, {
      isResourceForPixi: true,
    });

    const gltfLoader = getOrCreateGltfLoader();
    gltfLoader.withCredentials = checkIfCredentialsRequired(url);
    // TODO Cache promises that are not yet resolved to void `load` being
    // called more than once for the same resource.
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        url,
        gltf => {
          traverseToSetBasicMaterialFromMeshes(gltf.scene);
          loaded3DModels[resourceName] = gltf.scene;
          resolve(gltf.scene);
        },
        undefined,
        error => {
          reject(error);
        }
      );
    });
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
      disableCacheBurst: true, // Disable cache bursting for video because it prevents the video to be recognized as such (for a local file)
      isResourceForPixi: true,
    });

    loadedTextures[resourceName] = PIXI.Texture.from(url, {
      scaleMode: PIXI.SCALE_MODES.LINEAR,
      resourceOptions: {
        autoPlay: false,
        crossorigin: determineCrossOrigin(url),
      },
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
