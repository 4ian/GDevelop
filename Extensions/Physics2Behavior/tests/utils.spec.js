// @ts-check

describe('computeCurrentContactsFromStartedAndEndedContacts', () => {
  it('returns same current contacts if nothing happened', () => {
    const contacts = ['A', 'B', 'C'];
    const startedContacts = [];
    const endedContacts = [];
    const expectedResolvedContacts = [...contacts];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns current contacts with started contacts added', () => {
    const contacts = ['A', 'B', 'C'];
    const startedContacts = ['Z', 'Q'];
    const endedContacts = [];
    const expectedResolvedContacts = [...contacts, ...startedContacts];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns current contacts with ended contacts removed', () => {
    const contacts = ['A', 'B', 'C'];
    const startedContacts = [];
    const endedContacts = ['A', 'C'];
    const expectedResolvedContacts = ['B'];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns same current contacts if all started contacts also ended', () => {
    const contacts = ['A', 'B', 'C'];
    const startedContacts = ['Z', 'X'];
    const endedContacts = ['Z', 'X'];
    const expectedResolvedContacts = [...contacts];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns current contacts without started contacts that also ended', () => {
    const contacts = ['A', 'B', 'C'];
    const startedContacts = ['Z', 'X', 'W'];
    const endedContacts = ['Z', 'A', 'X'];
    const expectedResolvedContacts = ['B', 'C', 'W'];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns current contacts with a contact that started and also jittered', () => {
    // Should handle cases when this happens during the frame:
    // - contact Z starts
    // - contact Z ends
    // - contact Z starts
    // Contact Z should appear in the current contacts.
    // We consider a contact shouldn't be able to do that but it should be handled
    // in case it happens.
    const contacts = ['A', 'B', 'C'];
    const startedContacts = ['Z', 'Z'];
    const endedContacts = ['Z'];
    const expectedResolvedContacts = [...contacts, 'Z'];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });

  it('returns current contacts without a contact that ended and also jittered', () => {
    // Should handle cases where contact C was here and, during the frame:
    // - contact C ends
    // - contact C starts
    // - contact C ends
    // Contact C should not appear in the current contacts
    // We consider a contact shouldn't be able to do that but it should be handled
    // in case it happens.
    const contacts = ['A', 'B', 'C'];
    const startedContacts = ['C'];
    const endedContacts = ['C', 'C'];
    const expectedResolvedContacts = ['A', 'B'];
    gdjs.physics2.computeCurrentContactsFromStartedAndEndedContacts(
      contacts,
      startedContacts,
      endedContacts
    );
    expect(contacts).to.eql(expectedResolvedContacts);
  });
});
