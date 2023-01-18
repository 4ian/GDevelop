// @flow

export const processByChunk = async <Item, MappedItem>(
  array: Array<Item>,
  {
    transformItem,
    isChunkTooBig,
    processChunk,
  }: {|
    transformItem: Item => Promise<MappedItem>,
    isChunkTooBig: (MappedItem[]) => boolean,
    processChunk: (MappedItem[]) => Promise<void>,
  |}
): Promise<void> => {
  let currentItemIndex = 0;
  const nextChunk: Array<MappedItem> = [];

  while (currentItemIndex < array.length) {
    const mappedItem = await transformItem(array[currentItemIndex]);

    if (!nextChunk.length) {
      // Existing chunk is empty - let the new item be added to it.
    } else {
      if (!isChunkTooBig([...nextChunk, mappedItem])) {
        // Item can be added to the existing chunk - let's add it.
      } else {
        // Item can't be added to the existing chunk - process the existing chunk
        await processChunk(nextChunk);
        nextChunk.length = 0;
      }
    }

    nextChunk.push(mappedItem);
    currentItemIndex++;
  }

  if (nextChunk.length) {
    await processChunk(nextChunk);
    nextChunk.length = 0;
  }

  return;
};
