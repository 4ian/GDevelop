// @flow

import * as PIXI from 'pixi.js-legacy';
import ViewPosition from './ViewPosition';
import { type TileMapTileSelection } from './TileSetVisualizer';

type Coordinates = {| x: number, y: number |};

type Props = {|
  viewPosition: ViewPosition,
  getTileMapTileSelection: () => ?TileMapTileSelection,
  onClick: (scenePathCoordinates: Array<Coordinates>) => void,
|};

class ClickInterceptor {
  viewPosition: ViewPosition;
  getTileMapTileSelection: () => ?TileMapTileSelection;
  onClick: (scenePathCoordinates: Array<Coordinates>) => void;
  pointerPathCoordinates: ?Array<Coordinates>;
  _shouldCancelClick: boolean = false;
  _isIntercepting: boolean = false;
  _touchingPointerIds: Set<number> = new Set();
  _cancelUntilNoMoreTouches: boolean = false;

  pixiContainer: PIXI.Container;
  interceptingSprite: PIXI.sprite;

  constructor({ viewPosition, getTileMapTileSelection, onClick }: Props) {
    this.viewPosition = viewPosition;
    this.onClick = onClick;
    this.getTileMapTileSelection = getTileMapTileSelection;
    this.interceptingSprite = new PIXI.Sprite();
    this.interceptingSprite.alpha = 0;
    this.interceptingSprite.interactive = true;
    this.pointerPathCoordinates = null;
    this.interceptingSprite.addEventListener(
      'pointerdown',
      (e: PIXI.FederatedPointerEvent) => {
        if (e.pointerType === 'touch') {
          this._touchingPointerIds.add(e.pointerId);
          if (this._touchingPointerIds.size >= 2) {
            this._cancelUntilNoMoreTouches = true;
            this.pointerPathCoordinates = null;
            return;
          }
        }
        this._startClickInterception(
          e.originalEvent.globalX,
          e.originalEvent.globalY
        );
      }
    );
    this.interceptingSprite.addEventListener(
      'pointerup',
      (e: PIXI.FederatedMouseEvent) => {
        if (e.pointerType === 'touch') {
          this._touchingPointerIds.delete(e.pointerId);
          if (this._touchingPointerIds.size === 0) {
            this._cancelUntilNoMoreTouches = false;
          }
        }
        this._endClickInterception();
      }
    );
    this.interceptingSprite.addEventListener(
      'pointermove',
      (e: PIXI.FederatedPointerEvent) => {
        this._interceptPointerMove(
          e.originalEvent.globalX,
          e.originalEvent.globalY
        );
      }
    );
    this.pixiContainer = new PIXI.Container();
    this.pixiContainer.addChild(this.interceptingSprite);
  }

  _startClickInterception(deviceX: number, deviceY: number) {
    this._shouldCancelClick = false;
    this._isIntercepting = true;
    const sceneCoordinates = this.viewPosition.toSceneCoordinates(
      deviceX,
      deviceY
    );
    this.pointerPathCoordinates = [
      { x: sceneCoordinates[0], y: sceneCoordinates[1] },
    ];
  }

  _endClickInterception() {
    this._isIntercepting = false;
    if (!this.pointerPathCoordinates) return;
    if (this._shouldCancelClick) {
      this._shouldCancelClick = false;
      return;
    }
    this.onClick(this.pointerPathCoordinates);
    this.pointerPathCoordinates = null;
  }

  _interceptPointerMove(deviceX: number, deviceY: number) {
    if (this._shouldCancelClick || this._cancelUntilNoMoreTouches) return;
    const pointerPathCoordinates = this.pointerPathCoordinates;
    if (!pointerPathCoordinates) return;

    const sceneCoordinates = this.viewPosition.toSceneCoordinates(
      deviceX,
      deviceY
    );

    if (pointerPathCoordinates[1]) {
      pointerPathCoordinates[1] = {
        x: sceneCoordinates[0],
        y: sceneCoordinates[1],
      };
    } else {
      pointerPathCoordinates.push({
        x: sceneCoordinates[0],
        y: sceneCoordinates[1],
      });
    }
  }

  getPixiObject(): PIXI.Container {
    return this.pixiContainer;
  }

  getPointerPathCoordinates(): ?Array<Coordinates> {
    return this.pointerPathCoordinates;
  }

  isIntercepting(): boolean {
    return this._isIntercepting;
  }

  cancelClickInterception() {
    this._shouldCancelClick = true;
    if (this.pointerPathCoordinates) {
      this.pointerPathCoordinates = null;
    }
  }

  render() {
    this.pixiContainer.removeChildren(0);
    const tileMapTileSelection = this.getTileMapTileSelection();
    if (!tileMapTileSelection) return;
    this.pixiContainer.position.x = 0;
    this.pixiContainer.position.y = 0;
    this.interceptingSprite.width = this.viewPosition.getWidth();
    this.interceptingSprite.height = this.viewPosition.getHeight();
    this.pixiContainer.addChild(this.interceptingSprite);
  }
}
export default ClickInterceptor;
