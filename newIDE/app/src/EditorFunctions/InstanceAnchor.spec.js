// @flow
import { getAnchorOffset } from './InstanceAnchor';
import { type ObjectSizeInfo } from './Utils';

// A 3D model 80x40x20 whose origin is in the middle of its width, a quarter
// down its height and at the bottom of its depth: what a model authored around
// its own middle gives.
const modelSizeInfo: ObjectSizeInfo = {
  width: 80,
  height: 40,
  depth: 20,
  originX: 40,
  originY: 10,
  originZ: 0,
  centerX: 40,
  centerY: 10,
  centerZ: 10,
};

// A 2D object positioned by the corner of its box, like a sprite with no
// origin point of its own.
const cornerSizeInfo: ObjectSizeInfo = {
  width: 100,
  height: 50,
  depth: null,
  originX: 0,
  originY: 0,
  originZ: null,
  centerX: 50,
  centerY: 25,
  centerZ: null,
};

describe('getAnchorOffset', () => {
  it('moves nothing for the origin anchor', () => {
    expect(getAnchorOffset('origin', [80, 40, 20], modelSizeInfo)).toEqual([
      0,
      0,
      0,
    ]);
    // Even without knowing anything of the object.
    expect(getAnchorOffset('origin', [80, 40], null)).toEqual([0, 0]);
  });

  it('puts the box of an object on the position by its center', () => {
    // The origin is 40;10;0 in the box, its middle is 40;20;10.
    expect(getAnchorOffset('center', [80, 40, 20], modelSizeInfo)).toEqual([
      0,
      -10,
      -10,
    ]);
    expect(getAnchorOffset('center', [100, 50], cornerSizeInfo)).toEqual([
      -50,
      -25,
    ]);
  });

  it('rests a 3D object on the position by the bottom of its box', () => {
    expect(
      getAnchorOffset('bottom_center', [80, 40, 20], modelSizeInfo)
    ).toEqual([0, -10, 0]);
  });

  it('puts the minimum corner of the box on the position', () => {
    expect(getAnchorOffset('min_corner', [80, 40, 20], modelSizeInfo)).toEqual([
      40,
      10,
      0,
    ]);
    // An object positioned by that corner already does not move.
    expect(getAnchorOffset('min_corner', [100, 50], cornerSizeInfo)).toEqual([
      0,
      0,
    ]);
  });

  it('scales the origin of the object to the size the instance has', () => {
    // Half the default size on X, twice it on Y: the origin follows.
    expect(getAnchorOffset('min_corner', [40, 80, 20], modelSizeInfo)).toEqual([
      20,
      20,
      0,
    ]);
    expect(getAnchorOffset('center', [40, 80, 20], modelSizeInfo)).toEqual([
      0,
      -20,
      -10,
    ]);
  });

  it('leaves an axis the object has no extent on alone', () => {
    // A 2D object placed in 3D: its box is its position on Z.
    expect(getAnchorOffset('center', [100, 50, 30], cornerSizeInfo)).toEqual([
      -50,
      -25,
      0,
    ]);
  });

  it('gives no offset when the box of the object is unknown', () => {
    expect(getAnchorOffset('center', [80, 40, 20], null)).toBe(null);
    // A text has no size of its own: its origin cannot be scaled.
    const noSizeInfo: ObjectSizeInfo = {
      ...modelSizeInfo,
      width: null,
      height: null,
    };
    expect(getAnchorOffset('center', [80, 40, 20], noSizeInfo)).toBe(null);
    expect(getAnchorOffset('center', [Number.NaN, 40, 20], modelSizeInfo)).toBe(
      null
    );
  });
});
