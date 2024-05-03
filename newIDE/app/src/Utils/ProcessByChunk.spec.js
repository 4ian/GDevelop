// @flow

import { processByChunk } from './ProcessByChunk';

describe('ProcessByChunk', () => {
  test('empty array', async () => {
    const processChunk = jest.fn().mockImplementation(async () => {});
    await processByChunk([], {
      transformItem: async item => item,
      isChunkTooBig: () => true,
      processChunk,
    });

    expect(processChunk).not.toHaveBeenCalled();
  });

  test('chunk never too big', async () => {
    let results = [];
    const processChunk = async chunk => {
      results = [...results, ...chunk];
    };
    await processByChunk(['fake-item'], {
      transformItem: async item => item,
      isChunkTooBig: () => false,
      processChunk,
    });

    expect(results).toEqual(['fake-item']);

    results = [];
    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => item,
      isChunkTooBig: () => false,
      processChunk,
    });

    expect(results).toEqual(['fake-item-1', 'fake-item-2', 'fake-item-3']);
  });

  test('chunks of 2', async () => {
    let results = [];
    const processChunk = async chunk => {
      results = [...results, ...chunk];
    };
    await processByChunk(['fake-item'], {
      transformItem: async item => item,
      isChunkTooBig: chunk => chunk.length >= 2,
      processChunk,
    });

    expect(results).toEqual(['fake-item']);

    results = [];
    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => item,
      isChunkTooBig: chunk => chunk.length >= 2,
      processChunk,
    });

    expect(results).toEqual(['fake-item-1', 'fake-item-2', 'fake-item-3']);
  });

  test('chunks of 2, transformed items', async () => {
    let results = [];
    const processChunk = async chunk => {
      expect(chunk.length <= 2).toBe(true);
      results = [...results, ...chunk];
    };
    await processByChunk(['fake-item'], {
      transformItem: async item => 'mapped-' + item,
      isChunkTooBig: chunk => chunk.length > 2,
      processChunk,
    });

    expect(results).toEqual(['mapped-fake-item']);

    results = [];
    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => 'mapped-' + item,
      isChunkTooBig: chunk => chunk.length > 2,
      processChunk,
    });

    expect(results).toEqual([
      'mapped-fake-item-1',
      'mapped-fake-item-2',
      'mapped-fake-item-3',
    ]);
  });
});
