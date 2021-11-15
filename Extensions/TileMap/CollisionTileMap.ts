namespace gdjs {
    export namespace TileMap {
        export class CollisionTileMap {
            private _tileSet: Map<integer, CollisionTileDefinition>;
            private _map: CollisionTile[][];

            constructor(dimX: integer, dimY: integer, tileSet: Map<integer, CollisionTileDefinition>) {
                this._tileSet = tileSet;
                this._map = [];
                this._map.length = dimY;
                for (let index = 0; index < this._map.length; index++) {
                    this._map[index] = [];
                    this._map.length = dimX;
                }
            }

            set(x: integer, y: integer, definitionIndex: integer) {
                const definition = this._tileSet[definitionIndex];
                if (this._map[y][x]) {
                    this._map[y][x].setDefinition(definition);
                }
                else {
                    this._map[y][x] = new CollisionTile(definition);
                }
            }

            get(x: integer, y: integer): CollisionTile | undefined {
                return this._map[y][x];
            }
        }

        export class CollisionTileDefinition {
            polygons: Polygon[];
            tag: string;

            constructor(polygons: gdjs.Polygon[], tag: string = "") {
                this.polygons = polygons;
                this.tag = tag;
            }
        }

        class CollisionTile {
            definition: CollisionTileDefinition;
            polygons: gdjs.Polygon[];
            polygonsAreUpToDate: boolean;

            constructor(definition: CollisionTileDefinition) {
                this.definition = definition;
                this.polygons = [];
                this.polygonsAreUpToDate = false;
            }

            setDefinition(definition: CollisionTileDefinition) {
                this.definition = definition;
                this.polygonsAreUpToDate = false;
            }

            getPolygons() {
                if (!this.polygonsAreUpToDate) {
                    this.polygons.length = this.definition.polygons.length;
                }
                return this.polygons;
            }
        }
    }
}