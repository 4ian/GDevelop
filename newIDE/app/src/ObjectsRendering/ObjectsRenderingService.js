// @flow
import 'pixi-spine';
import RenderedUnknownInstance from './Renderers/RenderedUnknownInstance';
import RenderedSpriteInstance from './Renderers/RenderedSpriteInstance';
import RenderedTiledSpriteInstance from './Renderers/RenderedTiledSpriteInstance';
import RenderedPanelSpriteInstance from './Renderers/RenderedPanelSpriteInstance';
import RenderedTextInstance from './Renderers/RenderedTextInstance';
import RenderedShapePainterInstance from './Renderers/RenderedShapePainterInstance';
import RenderedTextEntryInstance from './Renderers/RenderedTextEntryInstance';
import RenderedParticleEmitterInstance from './Renderers/RenderedParticleEmitterInstance';
import RenderedCustomObjectInstance from './Renderers/RenderedCustomObjectInstance';
import RenderedSprite3DInstance from './Renderers/RenderedSprite3DInstance';
import PixiResourcesLoader from './PixiResourcesLoader';
import ResourcesLoader from '../ResourcesLoader';
import RenderedInstance from './Renderers/RenderedInstance';
import Rendered3DInstance from './Renderers/Rendered3DInstance';
import * as PIXI_LEGACY from 'pixi.js-legacy';
import * as PIXI_SPINE from 'pixi-spine';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import optionalRequire from '../Utils/OptionalRequire';
import { rgbOrHexToHexNumber } from '../Utils/ColorTransformer';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const gd: libGDevelop = global.gd;
const PIXI = { ...PIXI_LEGACY, ...PIXI_SPINE };

// Some PixiJS plugins like pixi-tilemap are not distributed as UMD modules,
// or still require a global PIXI object to be accessible, so we expose PIXI here.
// This can be removed if no more extension PixiJS plugin requires this.
global.PIXI = PIXI;

const requirableModules = {};

/**
 * A service containing functions that are called to render instances
 * of objects in a PIXI.Container.
 */
const ObjectsRenderingService = {
  renderers: {
    unknownObjectType: RenderedUnknownInstance,
    Sprite: RenderedSpriteInstance,
    'TiledSpriteObject::TiledSprite': RenderedTiledSpriteInstance,
    'PanelSpriteObject::PanelSprite': RenderedPanelSpriteInstance,
    'TextObject::Text': RenderedTextInstance,
    'PrimitiveDrawing::Drawer': RenderedShapePainterInstance,
    'TextEntryObject::TextEntry': RenderedTextEntryInstance,
    'ParticleSystem::ParticleEmitter': RenderedParticleEmitterInstance,
  },
  renderers3D: {},
  getThumbnail: function(
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) {
    const objectType = objectConfiguration.getType();
    if (this.renderers.hasOwnProperty(objectType))
      return this.renderers[objectType].getThumbnail(
        project,
        ResourcesLoader,
        objectConfiguration
      );
    else if (project.hasEventsBasedObject(objectType)) {
      return RenderedCustomObjectInstance.getThumbnail(
        project,
        ResourcesLoader,
        objectConfiguration
      );
    } else {
      return this.renderers['unknownObjectType'].getThumbnail(
        project,
        ResourcesLoader,
        objectConfiguration
      );
    }
  },
  createNewInstanceRenderer: function(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group | null
  ): RenderedInstance | Rendered3DInstance {
    const objectType = associatedObjectConfiguration.getType();
    if (threeGroup && this.renderers3D.hasOwnProperty(objectType)) {
      return new this.renderers3D[objectType](
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        PixiResourcesLoader
      );
    } else if (this.renderers.hasOwnProperty(objectType))
      return new this.renderers[objectType](
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        PixiResourcesLoader
      );
    else {
      if (project.hasEventsBasedObject(objectType)) {
        const eventsBasedObject = project.getEventsBasedObject(objectType);
        if (
          eventsBasedObject.isRenderedIn3D() &&
          eventsBasedObject.isAnimatable() &&
          eventsBasedObject.getObjectsCount() === 0
        ) {
          return new RenderedSprite3DInstance(
            project,
            layout,
            instance,
            associatedObjectConfiguration,
            pixiContainer,
            threeGroup,
            PixiResourcesLoader
          );
        } else {
          return new RenderedCustomObjectInstance(
            project,
            layout,
            instance,
            associatedObjectConfiguration,
            pixiContainer,
            threeGroup,
            PixiResourcesLoader
          );
        }
      }

      console.warn(
        `Object with type ${objectType} has no instance renderer registered. Please use registerInstanceRenderer to register your renderer.`
      );
      return new this.renderers['unknownObjectType'](
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        PixiResourcesLoader
      );
    }
  },
  registerInstanceRenderer: function(objectType: string, renderer: any) {
    if (!renderer.getThumbnail) {
      console.warn(
        `Tried to register renderer for object "${objectType}", but getThumbnail is not defined.`
      );
      return;
    }

    if (this.renderers.hasOwnProperty(objectType)) {
      console.warn(
        `Tried to register renderer for object "${objectType}", but a renderer already exists.`
      );

      // If you want to update a renderer, this is currently unsupported.
      // To implement this, we need to add support for instance renderers to be released/destroyed
      // (some can have reference counting for some PIXI resources, etc... that would need to be properly released).
      return;
    }

    this.renderers[objectType] = renderer;
  },
  registerInstance3DRenderer: function(objectType: string, renderer: any) {
    if (this.renderers3D.hasOwnProperty(objectType)) {
      console.warn(
        `Tried to register 3D renderer for object "${objectType}", but a renderer already exists.`
      );

      // If you want to update a 3D renderer, this is currently unsupported.
      // See comment in registerInstanceRenderer.
      return;
    }

    this.renderers3D[objectType] = renderer;
  },
  renderersCacheClearingMethods: [],
  registerClearCache: function(clearCache: (project: gdProject) => void) {
    this.renderersCacheClearingMethods.push(clearCache);
  },
  /**
   * Register a module that can be then required using `requireModule`.
   * This is necessary for the web-app, as all files must be bundled.
   */
  registerModule: function(requirePath: string, module: any) {
    requirableModules[requirePath] = module;
  },
  /**
   * Require a module, that was either registered using `registerModule` (i.e: on the web-app), or from
   * the specified path (if `optionalRequire` can find the file, i.e: on the electron app).
   */
  requireModule: function(requireBasePath: string, requirePath: string): ?any {
    // On Electron, where modules can be required at runtime from files, require the
    // file, relative to the base path.
    if (electron && path) {
      const originalRequiredModulePath = path.join(
        requireBasePath,
        requirePath
      );

      // Get the "module" module from Node.js and temporarily overwrite its internal "_load"
      // method. This method is called when a module is loaded, and is used here to provide "pixi.js-legacy"
      // to extensions needing it. If we don't, "pixi.js-legacy" is found in development, because Node.js resolution
      // algorithm traverses the paths until it reaches newIDE/app/node_modules, but is not found in production,
      // because newIDE/app node_modules are now gone (compiled by Webpack).
      const module = optionalRequire('module');
      if (!module._load) {
        throw new Error(
          'module._load does not exist. This is possibly a change in Node.js that is breaking the custom loader, in ObjectsRenderingService.requireModule, that is injected to expose Pixi.js to extensions using "require".'
        );
      }
      const originalNodeModuleLoad = module._load;

      // Allow pixi.js to be required by extensions:
      const allowedModules = {
        'pixi.js-legacy': PIXI,
        'pixi.js': PIXI,
        '@pixi/core': PIXI,
        '@pixi/display': PIXI,
        '@pixi/constants': PIXI,
        '@pixi/sprite': PIXI,
        '@pixi/math': PIXI,
        '@pixi/utils': PIXI,
        '@pixi/graphics': PIXI,
      };
      module._load = function hookedLoader(request, parent, isMain) {
        const loadedModule = allowedModules[request];
        if (loadedModule) return loadedModule;

        if (
          request.indexOf('./') === 0 ||
          request === originalRequiredModulePath
        )
          return originalNodeModuleLoad(request, parent, isMain);

        console.error(
          `A module ("${request}") was required from ${originalRequiredModulePath} but is not an allowed module or a relative file path starting with "./". null will be returned instead.`
        );
        console.warn(`Allowed modules are: `, Object.keys(allowedModules));
        console.warn(
          `Please use only allowed modules or a reference a local file.`
        );
        return null;
      };

      let requiredModule = null;
      try {
        requiredModule = global.require(originalRequiredModulePath);
      } catch (ex) {
        console.error(
          `Unable to load module "${requirePath}". Only files located in ${requireBasePath} are supported. Exception was:`,
          ex
        );
        requiredModule = null;
      }

      // Whatever the result, always restore the original "_load" in Node.js "module".
      module._load = originalNodeModuleLoad;
      return requiredModule;
    } else {
      // On the web-app, modules need to be registered manually.
      if (requirableModules[requirePath]) return requirableModules[requirePath];

      console.error(
        `Unable to load module "${requirePath}". Are you sure you registered it using ObjectsRenderingService.registerModule? This is mandatory for the web-app to have the file bundled.`
      );

      return null;
    }
  },
  rgbOrHexToHexNumber, // Expose a ColorTransformer function, useful to manage different color types for the extensions
  gd, // Expose gd so that it can be used by renderers
  PIXI, // Expose PIXI so that it can be used by renderers
  THREE, // Expose THREE so that it can be used by renderers
  THREE_ADDONS: {
    SkeletonUtils,
  }, // Expose THREE so that it can be used by renderers
  RenderedInstance, // Expose the base class for renderers so that it can be used by renderers
  Rendered3DInstance, // Expose the base class for 3D renderers so that it can be used by renderers
};

export default ObjectsRenderingService;
