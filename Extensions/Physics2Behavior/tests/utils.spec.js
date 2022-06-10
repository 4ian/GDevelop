// @ts-check

describe('computeCurrentContactsFromStartedAndEndedContacts', () => {
  it('It returns same current items is nothing happened', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = [];
    const endedItems = [];
    const expectedResolvedItems = items;
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns current items with started items added', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = ['Z', 'Q'];
    const endedItems = [];
    const expectedResolvedItems = [...items, ...startedItems];
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns current items with ended items removed', () => {
    const items = ['A', 'B', 'C', 'Z'];
    const startedItems = [];
    const endedItems = ['Z', 'B', 'R'];
    const expectedResolvedItems = ['A', 'C'];
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns same current items if all started items also ended', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = ['Z', 'X'];
    const endedItems = ['Z', 'X'];
    const expectedResolvedItems = items;
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns current items without started items that also ended', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = ['Z', 'X', 'W'];
    const endedItems = ['Z', 'A', 'X'];
    const expectedResolvedItems = ['B', 'C', 'W'];
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns current items with item started twice', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = ['Z', 'Z'];
    const endedItems = ['Z'];
    const expectedResolvedItems = [...items, 'Z'];
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });

  it('It returns current items without item ended twice', () => {
    const items = ['A', 'B', 'C'];
    const startedItems = ['C'];
    const endedItems = ['C', 'C'];
    const expectedResolvedItems = ['A', 'B'];
    const resolvedItems =
      gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
        items,
        startedItems,
        endedItems
      );
    for (let i = 0; i < resolvedItems.length; i++) {
      expect(resolvedItems[i]).to.be(expectedResolvedItems[i]);
    }
  });
});
