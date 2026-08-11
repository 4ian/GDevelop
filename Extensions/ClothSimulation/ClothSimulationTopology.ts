/**
 * Adapted from the three.js webgpu_compute_cloth example:
 * https://github.com/mrdoob/three.js/blob/cd3aa0d/examples/webgpu_compute_cloth.html
 * Copyright 2010-2026 three.js authors
 * SPDX-License-Identifier: MIT
 */
namespace gdjs {
  export interface ClothSimulationTopology {
    segmentsX: number;
    segmentsY: number;
    columns: number;
    rows: number;
    particleCount: number;
    springCount: number;
    restPositions: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    springEndpoints: Uint32Array;
    springRestLengths: Float32Array;
    adjacencyOffsets: Uint32Array;
    adjacencySpringIndices: Uint32Array;
    adjacencySigns: Int8Array;
  }

  const setSpring = (
    topology: ClothSimulationTopology,
    springIndex: number,
    first: number,
    second: number
  ): void => {
    topology.springEndpoints[springIndex * 2] = first;
    topology.springEndpoints[springIndex * 2 + 1] = second;
    const firstOffset = first * 3;
    const secondOffset = second * 3;
    const deltaX =
      topology.restPositions[secondOffset] -
      topology.restPositions[firstOffset];
    const deltaY =
      topology.restPositions[secondOffset + 1] -
      topology.restPositions[firstOffset + 1];
    const deltaZ =
      topology.restPositions[secondOffset + 2] -
      topology.restPositions[firstOffset + 2];
    topology.springRestLengths[springIndex] = Math.fround(
      Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ)
    );
  };

  export const buildClothSimulationTopology = (
    segmentsX: number,
    segmentsY: number,
    width: number,
    height: number
  ): ClothSimulationTopology => {
    const columns = segmentsX + 1;
    const rows = segmentsY + 1;
    const particleCount = columns * rows;
    const springCount =
      segmentsX * rows + columns * segmentsY + 2 * segmentsX * segmentsY;
    const topology: ClothSimulationTopology = {
      segmentsX,
      segmentsY,
      columns,
      rows,
      particleCount,
      springCount,
      restPositions: new Float32Array(particleCount * 3),
      uvs: new Float32Array(particleCount * 2),
      indices: new Uint16Array(segmentsX * segmentsY * 6),
      springEndpoints: new Uint32Array(springCount * 2),
      springRestLengths: new Float32Array(springCount),
      adjacencyOffsets: new Uint32Array(particleCount + 1),
      adjacencySpringIndices: new Uint32Array(springCount * 2),
      adjacencySigns: new Int8Array(springCount * 2),
    };

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const particleIndex = row * columns + column;
        const positionOffset = particleIndex * 3;
        topology.restPositions[positionOffset] = Math.fround(
          (column / segmentsX - 0.5) * width
        );
        topology.restPositions[positionOffset + 1] = Math.fround(
          (0.5 - row / segmentsY) * height
        );
        topology.restPositions[positionOffset + 2] = 0;
        topology.uvs[particleIndex * 2] = Math.fround(column / segmentsX);
        topology.uvs[particleIndex * 2 + 1] = Math.fround(1 - row / segmentsY);
      }
    }

    let triangleOffset = 0;
    for (let row = 0; row < segmentsY; row++) {
      for (let column = 0; column < segmentsX; column++) {
        const topLeft = row * columns + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + columns;
        const bottomRight = bottomLeft + 1;
        topology.indices[triangleOffset++] = topLeft;
        topology.indices[triangleOffset++] = bottomLeft;
        topology.indices[triangleOffset++] = topRight;
        topology.indices[triangleOffset++] = topRight;
        topology.indices[triangleOffset++] = bottomLeft;
        topology.indices[triangleOffset++] = bottomRight;
      }
    }

    let springIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < segmentsX; column++) {
        const first = row * columns + column;
        setSpring(topology, springIndex++, first, first + 1);
      }
    }
    for (let row = 0; row < segmentsY; row++) {
      for (let column = 0; column < columns; column++) {
        const first = row * columns + column;
        setSpring(topology, springIndex++, first, first + columns);
      }
    }
    for (let row = 0; row < segmentsY; row++) {
      for (let column = 0; column < segmentsX; column++) {
        const first = row * columns + column;
        setSpring(topology, springIndex++, first, first + columns + 1);
      }
    }
    for (let row = 0; row < segmentsY; row++) {
      for (let column = 0; column < segmentsX; column++) {
        const topRight = row * columns + column + 1;
        setSpring(topology, springIndex++, topRight, topRight + columns - 1);
      }
    }

    const adjacencyCounts = new Uint32Array(particleCount);
    for (let index = 0; index < springCount; index++) {
      adjacencyCounts[topology.springEndpoints[index * 2]]++;
      adjacencyCounts[topology.springEndpoints[index * 2 + 1]]++;
    }
    for (let index = 0; index < particleCount; index++) {
      topology.adjacencyOffsets[index + 1] =
        topology.adjacencyOffsets[index] + adjacencyCounts[index];
    }
    const cursors = topology.adjacencyOffsets.slice(0, particleCount);
    for (let index = 0; index < springCount; index++) {
      const first = topology.springEndpoints[index * 2];
      const second = topology.springEndpoints[index * 2 + 1];
      const firstAdjacency = cursors[first]++;
      topology.adjacencySpringIndices[firstAdjacency] = index;
      topology.adjacencySigns[firstAdjacency] = 1;
      const secondAdjacency = cursors[second]++;
      topology.adjacencySpringIndices[secondAdjacency] = index;
      topology.adjacencySigns[secondAdjacency] = -1;
    }
    return topology;
  };

  export const buildClothPinMask = (
    topology: ClothSimulationTopology,
    pinMode: ClothPinMode,
    pinInterval: number
  ): Uint8Array => {
    const fixed = new Uint8Array(topology.particleCount);
    if (pinMode === 'None') return fixed;
    if (pinMode === 'TopCorners') {
      fixed[0] = 1;
      fixed[topology.segmentsX] = 1;
      return fixed;
    }
    if (pinMode === 'TopEdge') {
      fixed.fill(1, 0, topology.columns);
      return fixed;
    }
    for (let column = 0; column <= topology.segmentsX; column += pinInterval) {
      fixed[column] = 1;
    }
    fixed[topology.segmentsX] = 1;
    return fixed;
  };

  export const makeRestClothSimulationState = (
    topology: ClothSimulationTopology,
    fixed: Uint8Array
  ): ClothSimulationState => ({
    positions: topology.restPositions.slice(),
    previousPositions: topology.restPositions.slice(),
    fixed: fixed.slice(),
    pinTargets: topology.restPositions.slice(),
  });
}
