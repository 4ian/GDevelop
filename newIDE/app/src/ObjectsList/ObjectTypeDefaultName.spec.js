// @flow
import { getDefaultObjectNameForType } from './ObjectTypeDefaultName';

describe('ObjectTypeDefaultName', () => {
  it('returns the editor-style default object name for known object types', () => {
    expect(getDefaultObjectNameForType('Sprite')).toBe('NewSprite');
    expect(getDefaultObjectNameForType('PanelSpriteObject::PanelSprite')).toBe(
      'NewPanelSprite'
    );
  });

  it('falls back to NewObject for unknown object types', () => {
    expect(getDefaultObjectNameForType('Unknown::Object')).toBe('NewObject');
  });
});
