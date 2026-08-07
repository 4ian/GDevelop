// @flow
import * as PIXI from 'pixi.js-legacy';
import transformRect from '../Utils/TransformRect';
import { type InstanceMeasurer } from './InstancesRenderer';
import Rectangle from '../Utils/Rectangle';

const gd: libGDevelop = global.gd;

/**
 * Displays a crossed-eye icon on every instance that is hidden when the
 * scene starts. Those instances are still shown in the editor, and the icon
 * makes their state visible at a glance.
 */
export default class HiddenInstancesDecorations {
  instances: gdInitialInstancesContainer;
  layersContainer: gdLayersContainer;
  instanceMeasurer: InstanceMeasurer;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  // $FlowFixMe[value-as-type]
  decorations: PIXI.Container;
  // $FlowFixMe[value-as-type]
  iconTexture: PIXI.Texture;
  instancesFunctor: gdInitialInstanceJSFunctor;
  _temporaryRectangle: Rectangle = new Rectangle();
  _shownIconsCount = 0;

  constructor({
    instances,
    layersContainer,
    instanceMeasurer,
    toCanvasCoordinates,
  }: {
    instances: gdInitialInstancesContainer,
    layersContainer: gdLayersContainer,
    instanceMeasurer: InstanceMeasurer,
    toCanvasCoordinates: (x: number, y: number) => [number, number],
  }) {
    this.instances = instances;
    this.layersContainer = layersContainer;
    this.instanceMeasurer = instanceMeasurer;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.decorations = new PIXI.Container();
    // The same icon as the one shown by the in-game editor on hidden
    // instances (see `HiddenInstanceIcon.svg`), rasterized at 8x its
    // intrinsic size so it stays crisp at the biggest icon sizes.
    this.iconTexture = PIXI.Texture.from('res/hidden-instance-icon.svg', {
      resourceOptions: { scale: 8 },
    });

    // $FlowFixMe[invalid-constructor] - JSFunctor is a class-like.
    this.instancesFunctor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[cannot-write]
    this.instancesFunctor.invoke = instancePtr => {
      const instance: gdInitialInstance = gd.wrapPointer(
        // $FlowFixMe[incompatible-type]
        instancePtr,
        gd.InitialInstance
      );
      if (!instance.isHidden()) return;
      if (!this._isOnVisibleLayer(instance)) return;

      const canvasRectangle = transformRect(
        this.toCanvasCoordinates,
        this.instanceMeasurer.getInstanceAABB(
          instance,
          this._temporaryRectangle
        )
      );
      // The icon size follows the on-screen size of the instance (so it
      // never dwarfs a small or zoomed-out instance, and stays legible on a
      // big one), within limits - like in the 3D editor.
      const width = canvasRectangle.width();
      const height = canvasRectangle.height();
      const onScreenRadius = Math.sqrt(width * width + height * height) / 2;
      // The 10px legibility floor never exceeds the size of the instance
      // itself: when zoomed far out, the icon shrinks with the instance
      // instead of dwarfing it.
      const iconSize = Math.min(
        Math.max(onScreenRadius * 0.4, 10),
        24,
        onScreenRadius
      );
      // Too small to be readable: don't show a smudge.
      if (iconSize < 4) return;

      // Centered on the instance, like in the 3D editor.
      this._showIcon(
        canvasRectangle.left + width / 2,
        canvasRectangle.top + height / 2,
        iconSize
      );
    };
  }

  _isOnVisibleLayer(instance: gdInitialInstance): boolean {
    const layerName = instance.getLayer();
    if (!this.layersContainer.hasLayerNamed(layerName)) return true;
    return this.layersContainer.getLayer(layerName).getVisibility();
  }

  /**
   * Show an icon centered on the given canvas position, with the given size
   * (in canvas pixels), reusing the sprites of the previous renders.
   */
  _showIcon(x: number, y: number, size: number) {
    let sprite = this.decorations.children[this._shownIconsCount];
    if (!sprite) {
      sprite = new PIXI.Sprite(this.iconTexture);
      sprite.anchor.set(0.5, 0.5);
      this.decorations.addChild(sprite);
    }
    sprite.visible = true;
    sprite.position.set(x, y);
    // Set on every render: this also fixes the size of the sprites created
    // before the texture finished loading.
    sprite.width = size;
    sprite.height = size;
    this._shownIconsCount++;
  }

  // $FlowFixMe[value-as-type]
  getPixiObject(): PIXI.Container {
    return this.decorations;
  }

  render() {
    this._shownIconsCount = 0;
    // $FlowFixMe[incompatible-type]
    this.instances.iterateOverInstances(this.instancesFunctor);

    // Hide the pooled sprites that were not used by this render.
    for (
      let i = this._shownIconsCount;
      i < this.decorations.children.length;
      i++
    ) {
      this.decorations.children[i].visible = false;
    }
  }

  delete() {
    this.instancesFunctor.delete();
  }
}
