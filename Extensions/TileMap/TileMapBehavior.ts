/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** @category Objects > Tile Map */
  export interface TileMap {
    getSceneXCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float;

    getSceneYCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float;

    getColumnIndexAtPosition(x: float, y: float): integer;

    getRowIndexAtPosition(x: float, y: float): integer;

    getTileAtPosition(x: float, y: float): integer;

    getTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): integer;

    setTileAtPosition(tileId: number, x: float, y: float): void;

    setTileAtGridCoordinates(
      tileId: number,
      columnIndex: integer,
      rowIndex: integer
    ): void;

    flipTileOnYAtPosition(x: float, y: float, flip: boolean): void;

    flipTileOnXAtPosition(x: float, y: float, flip: boolean): void;

    flipTileOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ): void;

    flipTileOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ): void;

    isTileFlippedOnXAtPosition(x: float, y: float): boolean;

    isTileFlippedOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer
    ): boolean;

    isTileFlippedOnYAtPosition(x: float, y: float): boolean;

    isTileFlippedOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer
    ): boolean;

    removeTileAtPosition(x: float, y: float): void;

    removeTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): void;

    setGridRowCount(targetRowCount: integer): void;

    setGridColumnCount(targetColumnCount: integer): void;

    getGridRowCount(): integer;

    getGridColumnCount(): integer;
  }

  /**
   * A behavior that forwards the Resizable interface to its object.
   * @category Behaviors > Default behaviors
   */
  export class TileMapBehavior extends gdjs.RuntimeBehavior implements TileMap {
    private object: gdjs.RuntimeObject & TileMap;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & TileMap
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    usesLifecycleFunction(): boolean {
      return false;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    getSceneXCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      return this.object.getSceneXCoordinateOfTileCenter(columnIndex, rowIndex);
    }

    getSceneYCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      return this.object.getSceneYCoordinateOfTileCenter(columnIndex, rowIndex);
    }

    getColumnIndexAtPosition(x: float, y: float): integer {
      return this.object.getColumnIndexAtPosition(x, y);
    }

    getRowIndexAtPosition(x: float, y: float): integer {
      return this.object.getRowIndexAtPosition(x, y);
    }

    getTileAtPosition(x: float, y: float): integer {
      return this.object.getTileAtPosition(x, y);
    }

    getTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): integer {
      return this.object.getTileAtGridCoordinates(columnIndex, rowIndex);
    }

    setTileAtPosition(tileId: number, x: float, y: float): void {
      this.object.setTileAtPosition(tileId, x, y);
    }

    setTileAtGridCoordinates(
      tileId: number,
      columnIndex: integer,
      rowIndex: integer
    ): void {
      this.object.setTileAtGridCoordinates(tileId, columnIndex, rowIndex);
    }

    flipTileOnYAtPosition(x: float, y: float, flip: boolean): void {
      this.object.flipTileOnYAtPosition(x, y, flip);
    }

    flipTileOnXAtPosition(x: float, y: float, flip: boolean): void {
      this.object.flipTileOnXAtPosition(x, y, flip);
    }

    flipTileOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ): void {
      this.object.flipTileOnYAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    flipTileOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ): void {
      this.object.flipTileOnXAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    isTileFlippedOnXAtPosition(x: float, y: float): boolean {
      return this.object.isTileFlippedOnXAtPosition(x, y);
    }

    isTileFlippedOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer
    ): boolean {
      return this.object.isTileFlippedOnXAtGridCoordinates(
        columnIndex,
        rowIndex
      );
    }

    isTileFlippedOnYAtPosition(x: float, y: float): boolean {
      return this.object.isTileFlippedOnYAtPosition(x, y);
    }

    isTileFlippedOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer
    ): boolean {
      return this.object.isTileFlippedOnYAtGridCoordinates(
        columnIndex,
        rowIndex
      );
    }

    removeTileAtPosition(x: float, y: float): void {
      this.object.removeTileAtPosition(x, y);
    }

    removeTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): void {
      this.object.removeTileAtGridCoordinates(columnIndex, rowIndex);
    }

    setGridRowCount(targetRowCount: integer): void {
      this.object.setGridRowCount(targetRowCount);
    }

    setGridColumnCount(targetColumnCount: integer): void {
      this.object.setGridColumnCount(targetColumnCount);
    }

    getGridRowCount(): integer {
      return this.object.getGridRowCount();
    }

    getGridColumnCount(): integer {
      return this.object.getGridColumnCount();
    }
  }

  gdjs.registerBehavior('TileMap::TileMapBehavior', gdjs.TileMapBehavior);
}
