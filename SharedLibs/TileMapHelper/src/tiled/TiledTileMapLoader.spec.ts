import { EditableTileMap, EditableTileMapLayer } from "../model/TileMapModel";
import { TiledMap } from "./Tiled";
import { TiledTileMapLoader } from "./TiledTileMapLoader";

describe("TiledTileMapLoader", function () {
  it("can load a tile map without any collision mask", function () {
    // Built from an actual json file exported by Tiled.
    const tiledMap: TiledMap = {
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

    const tileMap: EditableTileMap = TiledTileMapLoader.load(null, tiledMap);
    expect(tileMap.getDimensionX()).to.be(4);
    expect(tileMap.getDimensionY()).to.be(2);
    expect(tileMap.getTileHeight()).to.be(8);
    expect(tileMap.getTileWidth()).to.be(8);
    expect(tileMap.getWidth()).to.be(32);
    expect(tileMap.getHeight()).to.be(16);

    expect(tileMap.getTileDefinition(0)).to.be.ok();
    expect(tileMap.getTileDefinition(1)).to.be.ok();

    // TODO the tile 0 is defined here, but undefined is use in the map.
    expect(tileMap.getTileDefinition(2)).to.be.ok();
    expect(tileMap.getTileDefinition(3)).not.to.be.ok();

    const layers = new Array(...tileMap.getLayers());
    expect(layers.length).to.be(1);
    // TODO Change the model to avoid casts.
    // TODO objects layers might not be necessary
    const layer = layers[0] as EditableTileMapLayer;
    // TODO Add the layer name as it will be useful for events
    expect(layer.id).to.be(1);
    expect(layer.isVisible()).to.be(true);

    expect(layer.get(0, 0)).to.be(0);
    expect(layer.get(1, 0)).to.be(undefined);
    expect(layer.get(2, 0)).to.be(1);
    expect(layer.get(3, 0)).to.be(undefined);

    expect(layer.get(0, 1)).to.be(undefined);
    expect(layer.get(1, 1)).to.be(0);
    expect(layer.get(2, 1)).to.be(undefined);
    expect(layer.get(3, 1)).to.be(1);
  });

  it("can load a tile map with a collision mask", function () {
    // Built from an actual json file exported by Tiled.
    const tiledMap: TiledMap = {
      compressionlevel: -1,
      height: 2,
      infinite: false,
      layers: [
        {
          data: [1, 0, 3, 0, 0, 3, 0, 2],
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
            // A rectangle
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
            },

            // The tile with id == 1 is missing
            // because it doesn't have any collision mask.

            // A polygon
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
            },
            // 2 polygons
            {
              id: 3,
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
                    id: 2,
                    name: "",
                    polygon: [
                      {
                        x: 0,
                        y: 0,
                      },
                      {
                        x: 4,
                        y: -4,
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

    const tileMap: EditableTileMap = TiledTileMapLoader.load(null, tiledMap);
    expect(tileMap.getDimensionX()).to.be(4);
    expect(tileMap.getDimensionY()).to.be(2);
    expect(tileMap.getTileHeight()).to.be(8);
    expect(tileMap.getTileWidth()).to.be(8);
    expect(tileMap.getWidth()).to.be(32);
    expect(tileMap.getHeight()).to.be(16);

    expect(tileMap.getTileDefinition(0)).to.be.ok();
    expect(tileMap.getTileDefinition(0).getHiBoxes()).to.be.eql([
      [
        [0, 0],
        [0, 8],
        [8, 8],
        [8, 0],
      ],
    ]);
    expect(tileMap.getTileDefinition(1)).to.be.ok();
    expect(tileMap.getTileDefinition(1).getHiBoxes()).to.be.eql([]);
    expect(tileMap.getTileDefinition(2)).to.be.ok();
    expect(tileMap.getTileDefinition(2).getHiBoxes()).to.be.eql([
      [
        [0, 0],
        [8, -8],
        [0, -8],
      ],
    ]);
    expect(tileMap.getTileDefinition(3)).to.be.ok();
    expect(tileMap.getTileDefinition(3).getHiBoxes()).to.be.eql([
      [
        [0, 0],
        [4, 4],
        [8, 0],
      ],
      [
        [0, 0],
        [4, -4],
        [8, 0],
      ],
    ]);
    expect(tileMap.getTileDefinition(4)).to.be.ok();

    // TODO the tile 0 is defined here, but undefined is use in the map.
    expect(tileMap.getTileDefinition(4).getHiBoxes()).to.be.eql([]);
    expect(tileMap.getTileDefinition(5)).not.to.be.ok();

    const layers = new Array(...tileMap.getLayers());
    expect(layers.length).to.be(1);
    // TODO Change the model to avoid casts.
    // TODO objects layers might not be necessary
    const layer = layers[0] as EditableTileMapLayer;
    // TODO Add the layer name as it will be useful for events
    expect(layer.id).to.be(1);
    expect(layer.isVisible()).to.be(true);

    expect(layer.get(0, 0)).to.be(0);
    expect(layer.get(1, 0)).to.be(undefined);
    expect(layer.get(2, 0)).to.be(2);
    expect(layer.get(3, 0)).to.be(undefined);

    expect(layer.get(0, 1)).to.be(undefined);
    expect(layer.get(1, 1)).to.be(2);
    expect(layer.get(2, 1)).to.be(undefined);
    expect(layer.get(3, 1)).to.be(1);
  });
});
