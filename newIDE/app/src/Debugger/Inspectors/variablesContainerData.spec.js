// @flow
import {
  getPlainVariables,
  tooDeeplyNestedMessage,
} from './variablesContainerData';

/**
 * The dump the game sends is cut short where it is too deep, circular or too
 * large: the missing parts come back as placeholder strings, which the
 * inspector must show instead of reading them as variables.
 */
describe('variablesContainerData', () => {
  const makeContainer = (items: Object): any => ({ _variables: { items } });

  it('reads the variables of a container', () => {
    expect(
      getPlainVariables(
        makeContainer({
          Score: { _type: 'number', _value: 12 },
          Name: { _type: 'string', _str: 'Player' },
          Won: { _type: 'boolean', _bool: true },
          List: {
            _type: 'array',
            _childrenArray: [{ _type: 'number', _value: 1 }],
          },
          Settings: {
            _type: 'structure',
            _children: { Volume: { _type: 'number', _value: 0.5 } },
          },
        })
      )
    ).toEqual({
      Score: 12,
      Name: 'Player',
      Won: true,
      List: [1],
      Settings: { Volume: 0.5 },
    });
  });

  it('shows a truncated array instead of crashing on it', () => {
    expect(
      getPlainVariables(
        makeContainer({
          List: { _type: 'array', _childrenArray: '[Max depth reached]' },
        })
      )
    ).toEqual({ List: tooDeeplyNestedMessage });
  });

  it('shows a truncated structure instead of crashing on it', () => {
    expect(
      getPlainVariables(
        makeContainer({
          Settings: { _type: 'structure', _children: '[Max depth reached]' },
        })
      )
    ).toEqual({ Settings: tooDeeplyNestedMessage });
  });

  it('shows a truncated variable instead of crashing on it', () => {
    expect(
      getPlainVariables(
        makeContainer({
          Anything: '[Dump too large: not sent to the debugger]',
        })
      )
    ).toEqual({ Anything: tooDeeplyNestedMessage });
  });

  it('shows a variable whose type was truncated', () => {
    expect(
      getPlainVariables(
        makeContainer({ Deep: { _type: '[Max depth reached]' } })
      )
    ).toEqual({ Deep: tooDeeplyNestedMessage });
  });

  it('reads nothing from a truncated container', () => {
    expect(getPlainVariables((('[Max depth reached]': any): any))).toBe(null);
    expect(
      getPlainVariables((({ _variables: '[Max depth reached]' }: any): any))
    ).toBe(null);
    expect(getPlainVariables(makeContainer('[Max depth reached]'))).toBe(null);
  });
});
