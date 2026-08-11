// @ts-check

describe('Cloth simulation topology and normalization', function () {
  const makeData = (content) => ({
    name: 'Cloth',
    type: 'ClothSimulation::Cloth3DObject',
    variables: [],
    behaviors: [],
    effects: [],
    content,
  });

  it('builds exact non-square topology counts and valid render indices', function () {
    const topology = gdjs.buildClothSimulationTopology(3, 5, 120, 80);
    expect(topology.particleCount).to.be(24);
    expect(topology.springCount).to.be(68);
    expect(topology.indices.length).to.be(90);
    expect(topology.uvs.length).to.be(48);
    for (let index = 0; index < topology.indices.length; index++) {
      expect(topology.indices[index]).to.be.lessThan(topology.particleCount);
    }
    expect(topology.indices).to.contain(23);
  });

  it('emits each spring into adjacency exactly twice with opposite signs', function () {
    const topology = gdjs.buildClothSimulationTopology(5, 3, 100, 60);
    const visits = new Uint8Array(topology.springCount);
    const signs = new Int8Array(topology.springCount);
    for (
      let index = 0;
      index < topology.adjacencySpringIndices.length;
      index++
    ) {
      const springIndex = topology.adjacencySpringIndices[index];
      visits[springIndex]++;
      signs[springIndex] += topology.adjacencySigns[index];
    }
    for (let index = 0; index < topology.springCount; index++) {
      expect(visits[index]).to.be(2);
      expect(signs[index]).to.be(0);
      expect(topology.springRestLengths[index]).to.be.greaterThan(0);
    }
  });

  it('normalizes before calculating maximum counts', function () {
    const input = makeData({
      width: Number.NaN,
      height: -4,
      depth: Number.POSITIVE_INFINITY,
      segmentsX: 100000,
      segmentsY: -12.8,
      simulationFrequency: 999,
      maxSubsteps: 0,
      pinInterval: 999,
      backendPreference: 'Unknown',
      pinMode: 'Unknown',
      stiffness: 2,
      damping: -1,
      color: 'not-a-color',
    });
    const normalized = gdjs.normalizeCloth3DObjectData(input);
    expect(normalized).not.to.be(input);
    expect(input.content.segmentsX).to.be(100000);
    expect(normalized.content.width).to.be(200);
    expect(normalized.content.height).to.be(1);
    expect(normalized.content.depth).to.be(100);
    expect(normalized.content.segmentsX).to.be(64);
    expect(normalized.content.segmentsY).to.be(2);
    expect(normalized.content.pinInterval).to.be(65);
    expect(normalized.content.backendPreference).to.be('Auto');
    expect(normalized.content.pinMode).to.be('TopEveryN');
    expect(normalized.content.stiffness).to.be(1);
    expect(normalized.content.damping).to.be(0);
    const topology = gdjs.buildClothSimulationTopology(
      normalized.content.segmentsX,
      normalized.content.segmentsY,
      normalized.content.width,
      normalized.content.height
    );
    expect(topology.particleCount).to.be(195);
  });

  it('creates exact authored pin masks including the far corner', function () {
    const topology = gdjs.buildClothSimulationTopology(6, 2, 60, 20);
    const everyFour = gdjs.buildClothPinMask(topology, 'TopEveryN', 4);
    expect(Array.from(everyFour)).to.eql([
      1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const corners = gdjs.buildClothPinMask(topology, 'TopCorners', 1);
    expect(corners[0]).to.be(1);
    expect(corners[6]).to.be(1);
  });
});
