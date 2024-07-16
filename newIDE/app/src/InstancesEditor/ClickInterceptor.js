// @flow

import * as PIXI from 'pixi.js-legacy';
import ViewPosition from './ViewPosition';
import { type TileMapTileSelection } from './TileMapPainter';

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
        this._shouldCancelClick = false;
        this._isIntercepting = true;
        const sceneCoordinates = this.viewPosition.toSceneCoordinates(
          e.global.x,
          e.global.y
        );
        this.pointerPathCoordinates = [
          { x: sceneCoordinates[0], y: sceneCoordinates[1] },
        ];
      }
    );
    this.interceptingSprite.addEventListener(
      'pointerup',
      (e: PIXI.FederatedPointerEvent) => {
        this._isIntercepting = false;
        if (!this.pointerPathCoordinates) return;
        if (this._shouldCancelClick) {
          this._shouldCancelClick = false;
          return;
        }
        this.onClick(this.pointerPathCoordinates);
        this.pointerPathCoordinates = null;
      }
    );
    this.interceptingSprite.addEventListener(
      'pointermove',
      (e: PIXI.FederatedPointerEvent) => {
        if (this._shouldCancelClick) return;
        const pointerPathCoordinates = this.pointerPathCoordinates;
        if (!pointerPathCoordinates) return;

        const sceneCoordinates = this.viewPosition.toSceneCoordinates(
          e.global.x,
          e.global.y
        );

        pointerPathCoordinates.push({
          x: sceneCoordinates[0],
          y: sceneCoordinates[1],
        });
      }
    );
    this.pixiContainer = new PIXI.Container();
    this.pixiContainer.addChild(this.interceptingSprite);
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
