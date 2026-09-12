// @flow
import {
  getEnumSettingValue,
  getLifecycleFunctionNames,
  getSafeUniqueName,
  isLifecycleFunctionName,
  parseBoolean,
  parseNumber,
  renamedMessage,
} from './NameHelpers';

describe('NameHelpers', () => {
  describe('getSafeUniqueName', () => {
    it('makes a name safe and free', () => {
      const takenNames = ['Health', 'Health2'];
      const isTaken = (name: string) => takenNames.includes(name);

      expect(getSafeUniqueName('Speed', isTaken)).toBe('Speed');
      expect(getSafeUniqueName('Health', isTaken)).toBe('Health3');
      // Spaces and special characters can't be used in a name.
      expect(getSafeUniqueName('My property!', isTaken)).toBe('My_property_');
    });
  });

  describe('renamedMessage', () => {
    it('says nothing when the name was kept, teaches the new one otherwise', () => {
      expect(renamedMessage('Speed', 'Speed')).toBeNull();
      expect(renamedMessage('Health', 'Health2')).toBe(
        'Requested name "Health" was already taken or not a valid name; use "Health2" from now on.'
      );
    });
  });

  describe('lifecycle functions', () => {
    it('lists the lifecycle functions of each owner', () => {
      expect(getLifecycleFunctionNames('extension')).toContain(
        'onScenePreEvents'
      );
      expect(getLifecycleFunctionNames('behavior')).toContain(
        'doStepPreEvents'
      );
      expect(getLifecycleFunctionNames('object')).toEqual([
        'onCreated',
        'doStepPostEvents',
        'onDestroy',
        'onHotReloading',
      ]);
    });

    it('recognizes a lifecycle name only on the owner that calls it', () => {
      expect(isLifecycleFunctionName('behavior', 'doStepPreEvents')).toBe(true);
      expect(isLifecycleFunctionName('object', 'doStepPreEvents')).toBe(false);
      expect(isLifecycleFunctionName('object', 'onHotReloading')).toBe(true);
      expect(isLifecycleFunctionName('extension', 'onScenePreEvents')).toBe(
        true
      );
      expect(isLifecycleFunctionName('extension', 'onCreated')).toBe(false);
      expect(isLifecycleFunctionName('behavior', 'Hit')).toBe(false);
    });
  });

  describe('parseBoolean', () => {
    it('accepts booleans and their string form', () => {
      expect(parseBoolean(true, 'isPrivate')).toEqual({
        success: true,
        value: true,
      });
      expect(parseBoolean('false', 'isPrivate')).toEqual({
        success: true,
        value: false,
      });
      expect(parseBoolean('True', 'isPrivate')).toEqual({
        success: true,
        value: true,
      });
    });

    it('teaches what to pass on anything else', () => {
      const result = parseBoolean('maybe', 'isPrivate');
      expect(result.success).toBe(false);
      expect(result.success ? '' : result.message).toBe(
        '`isPrivate` must be true or false (got "maybe").'
      );
    });
  });

  describe('parseNumber', () => {
    it('accepts numbers and their string form', () => {
      expect(parseNumber(12.5, 'areaMaxX')).toEqual({
        success: true,
        value: 12.5,
      });
      expect(parseNumber('-3', 'areaMaxX')).toEqual({
        success: true,
        value: -3,
      });
    });

    it('teaches what to pass on anything else', () => {
      const result = parseNumber('wide', 'areaMaxX');
      expect(result.success).toBe(false);
      expect(result.success ? '' : result.message).toBe(
        '`areaMaxX` must be a number (got "wide").'
      );
    });
  });

  describe('getEnumSettingValue', () => {
    it('returns the matching value', () => {
      expect(
        getEnumSettingValue('hidden', ['default', 'visible', 'hidden'], 'v')
      ).toEqual({ success: true, value: 'hidden' });
    });

    it('lists the allowed values on anything else', () => {
      const result = getEnumSettingValue(
        'sometimes',
        ['default', 'visible', 'hidden'],
        'quickCustomizationVisibility'
      );
      expect(result.success).toBe(false);
      expect(result.success ? '' : result.message).toBe(
        '`quickCustomizationVisibility` must be one of "default", "visible", "hidden" (got "sometimes").'
      );
    });
  });
});
