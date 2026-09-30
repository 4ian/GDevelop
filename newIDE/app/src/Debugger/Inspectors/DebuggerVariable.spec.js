// @flow
import { transformVariable, tooDeeplyNestedMessage } from './DebuggerVariable';

// Mirrors what the runtime debugger client sends for a gdjs.Variable.
const makeVariable = (fields: Object) => ({
  _type: 'number',
  _value: 0,
  _str: '0',
  _bool: false,
  _children: {},
  _childrenArray: [],
  ...fields,
});
const number = (value: number) =>
  makeVariable({ _type: 'number', _value: value });
const string = (value: string) =>
  makeVariable({ _type: 'string', _str: value });
const boolean = (value: boolean) =>
  makeVariable({ _type: 'boolean', _bool: value });
const structure = (children: Object) =>
  makeVariable({ _type: 'structure', _children: children });
const array = (children: Array<Object>) =>
  makeVariable({ _type: 'array', _childrenArray: children });

// Sent by the runtime when the depth limit of the serialization is reached.
const maxDepthReached = '[Max depth reached]';

describe('DebuggerVariable', () => {
  describe('transformVariable', () => {
    it('transforms primitives and collections', () => {
      expect(
        transformVariable(
          structure({
            count: number(3),
            name: string('Hello'),
            flag: boolean(true),
            list: array([number(1), string('two')]),
          })
        )
      ).toEqual({
        type: 'structure',
        value: {
          count: { type: 'number', value: 3 },
          name: { type: 'string', value: 'Hello' },
          flag: { type: 'boolean', value: true },
          list: {
            type: 'array',
            value: [
              { type: 'number', value: 1 },
              { type: 'string', value: 'two' },
            ],
          },
        },
      });
    });

    it('shows a message for a variable entirely replaced by the depth placeholder', () => {
      expect(
        transformVariable(
          structure({
            deep: maxDepthReached,
            shallow: number(1),
          })
        )
      ).toEqual({
        type: 'structure',
        value: {
          deep: tooDeeplyNestedMessage,
          shallow: { type: 'number', value: 1 },
        },
      });
    });

    it('shows a message for a variable whose fields were replaced by the depth placeholder', () => {
      expect(
        transformVariable(
          makeVariable({
            _type: maxDepthReached,
            _value: maxDepthReached,
            _str: maxDepthReached,
            _bool: maxDepthReached,
            _children: maxDepthReached,
            _childrenArray: maxDepthReached,
          })
        )
      ).toEqual(tooDeeplyNestedMessage);
    });

    it('does not iterate the depth placeholder as structure children', () => {
      expect(
        transformVariable(
          makeVariable({ _type: 'structure', _children: maxDepthReached })
        )
      ).toEqual({ type: 'structure', value: tooDeeplyNestedMessage });
    });

    it('does not crash on the depth placeholder in place of array children', () => {
      expect(
        transformVariable(
          makeVariable({ _type: 'array', _childrenArray: maxDepthReached })
        )
      ).toEqual({ type: 'array', value: tooDeeplyNestedMessage });
    });
  });
});
