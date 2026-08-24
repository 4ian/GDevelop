// @flow

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import CompactSemiControlledNumberField from '.';
import CompactTextField from '../CompactTextField';

describe('CompactSemiControlledNumberField', () => {
  describe('onChange called on value change', () => {
    // Regression: the containsMathCharacters regex /[+-/*^()%]/ used to match
    // '.' (decimal point) via the ASCII range +-/ (chars 43-47), causing
    // decimal values to be treated as math expressions and skipping onChange
    // during keyInput/wheel events. Fixed by escaping: /[+\-/*^()%]/.

    it('calls onChange when scrolling up on a field with a decimal value', () => {
      const onChange: (value: number) => void = jest.fn();
      const component = renderer.create(
        <CompactSemiControlledNumberField value={92.12} onChange={onChange} />
      );

      const compactTextField = component.root.findByType(CompactTextField);
      act(() => {
        compactTextField.props.onWheel({
          deltaY: -1,
          preventDefault: () => {},
        });
      });

      expect(onChange).toHaveBeenCalledWith(93.12);
    });

    it('calls onChange when pressing ArrowUp on a field with a decimal value', () => {
      const onChange: (value: number) => void = jest.fn();
      const component = renderer.create(
        <CompactSemiControlledNumberField value={92.12} onChange={onChange} />
      );

      const input = component.root.findByType('input');
      act(() => {
        input.props.onKeyDown({ key: 'ArrowUp', preventDefault: () => {} });
      });

      expect(onChange).toHaveBeenCalledWith(93.12);
    });

    it('calls onChange when a decimal number is typed in a field', () => {
      const onChange: (value: number) => void = jest.fn();
      const component = renderer.create(
        <CompactSemiControlledNumberField value={1.3} onChange={onChange} />
      );

      const input = component.root.findByType('input');
      act(() => {
        input.props.onChange({ currentTarget: { value: '1.35' } });
      });

      expect(onChange).toHaveBeenCalledWith(1.35);
    });
  });
});
