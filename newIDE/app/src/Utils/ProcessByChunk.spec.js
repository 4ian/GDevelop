// @flow

import { processByChunk } from "./ProcessByChunk";

describe('ProcessByChunk', () => {
  test('empty array', async () => {
    const processChunk = jest.fn().mockImplementation(async (chunk) => console.log(chunk))
    await processByChunk([], {
      transformItem: async item => item,
      isChunkTooBig: () => true,
      processChunk,
    });

    expect(processChunk).not.toHaveBeenCalled();
  });

  test('chunk never too big', async () => {
    const processChunk = jest.fn().mockImplementation(async (chunk) => console.log(chunk))
    await processByChunk(['fake-item'], {
      transformItem: async item => item,
      isChunkTooBig: () => false,
      processChunk,
    });

    console.log(processChunk.mock.calls);
    expect(processChunk).toHaveBeenCalledWith(['fake-item']);


    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => item,
      isChunkTooBig: () => false,
      processChunk,
    });

    expect(processChunk).toHaveBeenCalledWith(['fake-item-1', 'fake-item-2', 'fake-item-3']);
  });

  test('chunks of 2', async () => {
    const processChunk = jest.fn().mockImplementation(async (chunk) => console.log(chunk))
    await processByChunk(['fake-item'], {
      transformItem: async item => item,
      isChunkTooBig: (chunk) => chunk.length >= 2,
      processChunk,
    });

    console.log(processChunk.mock.calls);
    expect(processChunk).toHaveBeenCalledWith(['fake-item']);


    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => item,
      isChunkTooBig: (chunk) => chunk.length >= 2,
      processChunk,
    });

    expect(processChunk).toHaveBeenCalledWith(['fake-item-1', 'fake-item-2']);
    expect(processChunk).toHaveBeenCalledWith(['fake-item-3']);
  });

  test('chunks of 2, transformed items', async () => {
    const processChunk = jest.fn().mockImplementation(async (chunk) => console.log(chunk))
    await processByChunk(['fake-item'], {
      transformItem: async item => 'mapped-' + item,
      isChunkTooBig: (chunk) => chunk.length > 2,
      processChunk,
    });

    expect(processChunk).toHaveBeenCalledWith(['mapped-fake-item']);


    await processByChunk(['fake-item-1', 'fake-item-2', 'fake-item-3'], {
      transformItem: async item => item,
      isChunkTooBig: (chunk) => chunk.length > 2,
      processChunk,
    });

    expect(processChunk).toHaveBeenCalledWith(['mapped-fake-item-1', 'mapped-fake-item-2']);
    expect(processChunk).toHaveBeenCalledWith(['mapped-fake-item-3']);
  });
});
