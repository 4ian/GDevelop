// @flow
import { objectGroupEditorTabs } from './ObjectGroupEditorTabs';

describe('ObjectGroupEditorTabs', () => {
  it('only offers object group configuration tabs', () => {
    expect(objectGroupEditorTabs).toEqual(['objects', 'requiredBehaviors']);
  });
});
