// @ts-check
describe('gdjs.pathfinding', function () {
  it('can give back an empty path', function () {
    expect(gdjs.pathfinding.simplifyPath([], 1)).to.eql([]);
  });

  it('can give back a path with only 1 vertex', function () {
    expect(gdjs.pathfinding.simplifyPath([[2, 4]], 1)).to.eql([[2, 4]]);
  });

  it('can give back a path with only 2 vertex', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [8, 1],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [8, 1],
    ]);
  });

  it('can give back a path with 3 vertex', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [8, 1],
          [16, 32],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [8, 1],
      [16, 32],
    ]);
  });

  it('can simplify a line of vertices', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [2, 5],
          [2, 9],
          [2, 9.5],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [2, 9.5],
    ]);
  });

  it('can simplify a line of vertices with some tangential noise', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [2.5, 5],
          [1.1, 9],
          [2, 9.5],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [2, 9.5],
    ]);
  });

  it('can simplify an aliased oblique line', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [3, 4],
          [4, 3],
          [5, 3],
          [6, 3],
          [7, 2],
          [8, 2],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [8, 2],
    ]);
  });

  it('can preserve a bend', function () {
    expect(
      gdjs.pathfinding.simplifyPath(
        [
          [2, 4],
          [2.5, 5],
          [2, 9],
          [3, 9.9],
          [5, 9],
        ],
        1
      )
    ).to.eql([
      [2, 4],
      [2, 9],
      [5, 9],
    ]);
  });
});
