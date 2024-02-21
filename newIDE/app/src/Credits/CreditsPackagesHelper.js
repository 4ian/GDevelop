// @flow

export const getItemsSplitInLines = <Item>(
  items: ?(Item[]),
  isMediumScreen: boolean
): ?(Item[][]) => {
  if (!items) return null;
  const itemLines: Item[][] = [];
  // On small laptops and tablets show 3 max.
  if (isMediumScreen) {
    for (let i = 0; i < items.length; i += 3) {
      // If there are only 4 lefts, split in 2 and 2.
      if (items.length - i === 4) {
        itemLines.push(items.slice(i, i + 2));
        itemLines.push(items.slice(i + 2, i + 4));
        break;
      }
      // Otherwise, add 3.
      itemLines.push(items.slice(i, i + 3));
    }

    return itemLines;
  }

  // Otherwise, show 4 max.
  for (let i = 0; i < items.length; i += 4) {
    // If there are only 5 lefts, split in 3 and 2.
    if (items.length - i === 5) {
      itemLines.push(items.slice(i, i + 3));
      itemLines.push(items.slice(i + 3, i + 5));
      break;
    }
    // If there are only 6 lefts, split in 3 and 3.
    if (items.length - i === 6) {
      itemLines.push(items.slice(i, i + 3));
      itemLines.push(items.slice(i + 3, i + 6));
      break;
    }
    // Otherwise, add 4.
    itemLines.push(items.slice(i, i + 4));
  }

  return itemLines;
};
