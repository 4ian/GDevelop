import {
  EditableTileMap,
  EditableTileMapLayer,
} from "../../model/TileMapModel";
import { TiledTileMap } from "./TiledFormat";
import { TiledTileMapLoader } from "./TiledTileMapLoader";

describe("TiledTileMapLoader", function () {
  describe("without a collision mask", function () {
    // Built from an actual json file exported by Tiled.
    const tiledMap: TiledTileMap = {
      compressionlevel: -1,
      height: 2,
      infinite: false,
      layers: [
        {
          data: [1, 0, 2, 0, 0, 1, 0, 2],
          height: 2,
          id: 1,
          name: "Tile Layer 1",
          opacity: 1,
          type: "tilelayer",
          visible: true,
          width: 4,
          x: 0,
          y: 0,
        },
      ],
      nextlayerid: 2,
      nextobjectid: 1,
      orientation: "orthogonal",
      renderorder: "right-down",
      tiledversion: "1.7.2",
      tileheight: 8,
      tilesets: [
        {
          firstgid: 1,
          columns: 2,
          image: "MiniTiledSet.png",
          imageheight: 8,
          imagewidth: 16,
          margin: 0,
          name: "new tileset",
          spacing: 0,
          tilecount: 2,
          tiledversion: "1.7.2",
          tileheight: 8,
          tilewidth: 8,
          type: "tileset",
          version: "1.6",
        },
      ],
      tilewidth: 8,
      type: "map",
      version: "1.6",
      width: 4,
    };

    const tileMap: EditableTileMap = TiledTileMapLoader.load(tiledMap, null);

    it("can load map dimensions", function () {
      expect(tileMap.getDimensionX()).to.be(4);
      expect(tileMap.getDimensionY()).to.be(2);
      expect(tileMap.getTileHeight()).to.be(8);
      expect(tileMap.getTileWidth()).to.be(8);
      expect(tileMap.getWidth()).to.be(32);
      expect(tileMap.getHeight()).to.be(16);
    });

    it("can load a tile set", function () {
      expect(tileMap.getTileDefinition(0)).to.be.ok();
      expect(tileMap.getTileDefinition(1)).to.be.ok();

      expect(tileMap.getTileDefinition(2)).not.to.be.ok();
    });

    it("can load a tile map content", function () {
      const layers = new Array(...tileMap.getLayers());
      expect(layers.length).to.be(1);
      // TODO Change the model to avoid casts?
      const layer = layers[0] as EditableTileMapLayer;
      // TODO Add the layer name as it can be useful for events?
      expect(layer.id).to.be(1);
      expect(layer.isVisible()).to.be(true);

      expect(layer.getTileId(0, 0)).to.be(0);
      expect(layer.getTileId(1, 0)).to.be(undefined);
      expect(layer.getTileId(2, 0)).to.be(1);
      expect(layer.getTileId(3, 0)).to.be(undefined);

      expect(layer.getTileId(0, 1)).to.be(undefined);
      expect(layer.getTileId(1, 1)).to.be(0);
      expect(layer.getTileId(2, 1)).to.be(undefined);
      expect(layer.getTileId(3, 1)).to.be(1);
    });
  });

  describe("with a collision mask", function () {
    // Built from an actual json file exported by Tiled.
    const tiledMap: TiledTileMap = {
      compressionlevel: -1,
      height: 2,
      infinite: false,
      layers: [
        {
          data: [1, 3, 4, 5, 3, 2, 0, 1073741829],
          height: 2,
          id: 1,
          name: "Tile Layer 1",
          opacity: 1,
          type: "tilelayer",
          visible: true,
          width: 4,
          x: 0,
          y: 0,
        },
      ],
      nextlayerid: 2,
      nextobjectid: 1,
      orientation: "orthogonal",
      renderorder: "right-down",
      tiledversion: "1.7.2",
      tileheight: 8,
      tilesets: [
        {
          firstgid: 1,
          columns: 2,
          image: "MiniTiledSet.png",
          imageheight: 16,
          imagewidth: 16,
          margin: 0,
          name: "new tileset",
          spacing: 0,
          tilecount: 4,
          tiledversion: "1.7.2",
          tileheight: 8,
          tiles: [
            // Contains a rectangle
            {
              id: 0,
              objectgroup: {
                draworder: "index",
                name: "",
                objects: [
                  {
                    height: 8,
                    id: 1,
                    name: "",
                    rotation: 0,
                    type: "",
                    visible: true,
                    width: 8,
                    x: 0,
                    y: 0,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
              type: "obstacle",
            },

            // The tile with id == 1 is missing
            // because it doesn't have any collision mask.

            // Contains a polygon.
            {
              id: 2,
              objectgroup: {
                draworder: "index",
                name: "",
                objects: [
                  {
                    height: 0,
                    id: 1,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 8,
                        y: -8,
                      },
                      {
                        x: 0,
                        y: -8,
                      },
                    ],
                    rotation: 0,
                    type: "",
                    visible: true,
                    width: 0,
                    x: 0,
                    y: 8,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
              type: "obstacle",
            },
            // Contains 2 polygons, one is a rotated.
            {
              id: 3,
              objectgroup: {
                draworder: "index",
                id: 2,
                name: "",
                objects: [
                  {
                    height: 0,
                    id: 1,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 4,
                        y: 4,
                      },
                      {
                        x: 8,
                        y: 0,
                      },
                    ],
                    rotation: 0,
                    type: "",
                    visible: true,
                    width: 0,
                    x: 0,
                    y: 0,
                  },
                  {
                    height: 0,
                    id: 3,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 4,
                        y: 4,
                      },
                      {
                        x: 8,
                        y: 0,
                      },
                    ],
                    rotation: 180,
                    type: "",
                    visible: true,
                    width: 0,
                    x: 8,
                    y: 8,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
              type: "obstacle",
            },
            // Contains hitboxes for obstacle and lava.
            {
              id: 4,
              objectgroup: {
                draworder: "index",
                id: 2,
                name: "",
                objects: [
                  {
                    height: 0,
                    id: 1,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 0,
                        y: 8,
                      },
                      {
                        x: 8,
                        y: 0,
                      },
                    ],
                    rotation: 0,
                    type: "obstacle",
                    visible: true,
                    width: 0,
                    x: 0,
                    y: 0,
                  },
                  {
                    height: 0,
                    id: 2,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 0,
                        y: 8,
                      },
                      {
                        x: 8,
                        y: 0,
                      },
                    ],
                    rotation: 180,
                    type: "lava",
                    visible: true,
                    width: 0,
                    x: 8,
                    y: 8,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
            },
            // Contains hitboxes for lava only
            {
              id: 5,
              objectgroup: {
                draworder: "index",
                id: 2,
                name: "",
                objects: [
                  {
                    height: 8,
                    id: 1,
                    name: "",
                    rotation: 0,
                    type: "lava",
                    visible: true,
                    width: 8,
                    x: 0,
                    y: 0,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
              type: "lava",
            },
          ],
          tilewidth: 8,
          type: "tileset",
          version: "1.6",
        },
      ],
      tilewidth: 8,
      type: "map",
      version: "1.6",
      width: 4,
    };

    const tileMap: EditableTileMap = TiledTileMapLoader.load(tiledMap, null);

    it("can load map dimensions", function () {
      expect(tileMap.getDimensionX()).to.be(4);
      expect(tileMap.getDimensionY()).to.be(2);
      expect(tileMap.getTileHeight()).to.be(8);
      expect(tileMap.getTileWidth()).to.be(8);
      expect(tileMap.getWidth()).to.be(32);
      expect(tileMap.getHeight()).to.be(16);
    });

    it("can load a tile set with a rectangle collision mask", function () {
      const tileDefinition = tileMap.getTileDefinition(0);
      expect(tileDefinition).to.be.ok();
      expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(true);
      expect(tileDefinition.hasTaggedHitBox("lava")).to.be(false);
      expect(tileDefinition.getHitBoxes("obstacle")).to.be.eql([
        [
          [0, 0],
          [0, 8],
          [8, 8],
          [8, 0],
        ],
      ]);
    });

    it("can load a tile set with an empty collision mask", function () {
      const tileDefinition = tileMap.getTileDefinition(1);
      expect(tileDefinition).to.be.ok();
      expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(false);
      expect(tileDefinition.hasTaggedHitBox("lava")).to.be(false);
    });

    it("can load a tile set with a polygon collision mask", function () {
      {
        const tileDefinition = tileMap.getTileDefinition(2);
        expect(tileDefinition).to.be.ok();
        expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(true);
        expect(tileDefinition.hasTaggedHitBox("lava")).to.be(false);
        expect(tileDefinition.getHitBoxes("obstacle")).to.be.eql([
          [
            [0, 8],
            [8, 0],
            [0, 0],
          ],
        ]);
      }
    });

    it("can load a tile set with a 2 polygons collision mask", function () {
      const tileDefinition = tileMap.getTileDefinition(3);
      expect(tileDefinition).to.be.ok();
      expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(true);
      expect(tileDefinition.hasTaggedHitBox("lava")).to.be(false);
      expect(tileDefinition.getHitBoxes("obstacle")).to.be.eql([
        [
          [0, 0],
          [4, 4],
          [8, 0],
        ],
        [
          [8, 8],
          [4, 4],
          [0, 8],
        ],
      ]);
    });

    it("can load a tile set with several collision mask filter tags", function () {
      const tileDefinition = tileMap.getTileDefinition(4);
      expect(tileDefinition).to.be.ok();
      expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(true);
      expect(tileDefinition.hasTaggedHitBox("lava")).to.be(true);
      expect(tileDefinition.getHitBoxes("obstacle")).to.be.eql([
        [
          [0, 0],
          [0, 8],
          [8, 0],
        ],
      ]);
      expect(tileDefinition.getHitBoxes("lava")).to.be.eql([
        [
          [8, 8],
          [8, 0],
          [0, 8],
        ],
      ]);
    });

    it("can load a tile set with only the other filter tag", function () {
      const tileDefinition = tileMap.getTileDefinition(5);
      expect(tileDefinition).to.be.ok();
      expect(tileDefinition.hasTaggedHitBox("obstacle")).to.be(false);
      expect(tileDefinition.hasTaggedHitBox("lava")).to.be(true);
      expect(tileDefinition.getHitBoxes("lava")).to.be.eql([
        [
          [0, 0],
          [0, 8],
          [8, 8],
          [8, 0],
        ],
      ]);
    });

    it("can load a tile set", function () {
      expect(tileMap.getTileDefinition(6)).not.to.be.ok();
    });

    it("can load a tile map content", function () {
      const layers = new Array(...tileMap.getLayers());
      expect(layers.length).to.be(1);
      const layer = layers[0] as EditableTileMapLayer;
      expect(layer.id).to.be(1);
      expect(layer.isVisible()).to.be(true);

      expect(layer.getTileId(0, 0)).to.be(0);
      expect(layer.getTileId(1, 0)).to.be(2);
      expect(layer.getTileId(2, 0)).to.be(3);
      expect(layer.getTileId(3, 0)).to.be(4);

      expect(layer.getTileId(0, 1)).to.be(2);
      expect(layer.getTileId(1, 1)).to.be(1);
      expect(layer.getTileId(2, 1)).to.be(undefined);
      expect(layer.getTileId(3, 1)).to.be(4);
      expect(layer.isFlippedVertically(3, 1)).to.be(true);
      expect(layer.isFlippedHorizontally(3, 1)).to.be(false);
      expect(layer.isFlippedDiagonally(3, 1)).to.be(false);
    });

    it("can detect that a point is in a tile that contains a mask with a given tag", function () {
      // The point is in the black square with an hitbox.
      expect(tileMap.pointIsInsideTile(4, 4, "obstacle")).to.be(true);
      // The point is in wite square without any hitbox.
      expect(tileMap.pointIsInsideTile(12, 12, "obstacle")).to.be(false);
    });
  });

  describe("with a collision mask", function () {
    // Built from an actual json file exported by Tiled.
    const tiledMap: TiledTileMap = {
      compressionlevel: -1,
      height: 2,
      infinite: false,
      layers: [
        {
          data: [
            3,
            2684354563,
            536870915,
            2147483651,
            1610612739,
            3221225475,
            1073741827,
            3758096387,
          ],
          height: 2,
          id: 1,
          name: "Tile Layer 1",
          opacity: 1,
          type: "tilelayer",
          visible: true,
          width: 4,
          x: 0,
          y: 0,
        },
      ],
      nextlayerid: 2,
      nextobjectid: 1,
      orientation: "orthogonal",
      renderorder: "right-down",
      tiledversion: "1.9.0",
      tileheight: 8,
      tilesets: [
        {
          columns: 1,
          image: "MiniTiledSet.png",
          imageheight: 8,
          imagewidth: 8,
          margin: 0,
          name: "new tileset",
          spacing: 0,
          tilecount: 1,
          tiledversion: "1.9.0",
          tileheight: 8,
          tiles: [
            {
              type: "obstacle",
              id: 2,
              objectgroup: {
                draworder: "index",
                id: 2,
                name: "",
                objects: [
                  {
                    type: "",
                    height: 0,
                    id: 9,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 4,
                        y: 0,
                      },
                      {
                        x: 4,
                        y: 4,
                      },
                      {
                        x: 0,
                        y: 4,
                      },
                    ],
                    rotation: 0,
                    visible: true,
                    width: 0,
                    x: 0,
                    y: 0,
                  },
                ],
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0,
              },
            },
          ],
          tilewidth: 8,
          type: "tileset",
          version: "1.8",
        },
      ],
      tilewidth: 8,
      type: "map",
      version: "1.9",
      width: 4,
    };

    const tileMap: EditableTileMap = TiledTileMapLoader.load(tiledMap, null);

    it("can load flipped tiles", function () {
      const layers = new Array(...tileMap.getLayers());
      expect(layers.length).to.be(1);
      const layer = layers[0] as EditableTileMapLayer;
      expect(layer.id).to.be(1);
      expect(layer.isVisible()).to.be(true);

      expect(layer.getTileId(0, 0)).to.be(2);
      expect(layer.isFlippedVertically(0, 0)).to.be(false);
      expect(layer.isFlippedHorizontally(0, 0)).to.be(false);
      expect(layer.isFlippedDiagonally(0, 0)).to.be(false);

      expect(layer.getTileId(1, 0)).to.be(2);
      expect(layer.isFlippedVertically(1, 0)).to.be(false);
      expect(layer.isFlippedHorizontally(1, 0)).to.be(true);
      expect(layer.isFlippedDiagonally(1, 0)).to.be(true);

      expect(layer.getTileId(1, 1)).to.be(2);
      expect(layer.isFlippedVertically(1, 1)).to.be(true);
      expect(layer.isFlippedHorizontally(1, 1)).to.be(true);
      expect(layer.isFlippedDiagonally(1, 1)).to.be(false);

      expect(layer.getTileId(0, 1)).to.be(2);
      expect(layer.isFlippedVertically(0, 1)).to.be(true);
      expect(layer.isFlippedHorizontally(0, 1)).to.be(false);
      expect(layer.isFlippedDiagonally(0, 1)).to.be(true);

      expect(layer.getTileId(2, 0)).to.be(2);
      expect(layer.isFlippedVertically(2, 0)).to.be(false);
      expect(layer.isFlippedHorizontally(2, 0)).to.be(false);
      expect(layer.isFlippedDiagonally(2, 0)).to.be(true);

      expect(layer.getTileId(3, 0)).to.be(2);
      expect(layer.isFlippedVertically(3, 0)).to.be(false);
      expect(layer.isFlippedHorizontally(3, 0)).to.be(true);
      expect(layer.isFlippedDiagonally(3, 0)).to.be(false);

      expect(layer.getTileId(3, 1)).to.be(2);
      expect(layer.isFlippedVertically(3, 1)).to.be(true);
      expect(layer.isFlippedHorizontally(3, 1)).to.be(true);
      expect(layer.isFlippedDiagonally(3, 1)).to.be(true);

      expect(layer.getTileId(2, 1)).to.be(2);
      expect(layer.isFlippedVertically(2, 1)).to.be(true);
      expect(layer.isFlippedHorizontally(2, 1)).to.be(false);
      expect(layer.isFlippedDiagonally(2, 1)).to.be(false);
    });
  });
});
