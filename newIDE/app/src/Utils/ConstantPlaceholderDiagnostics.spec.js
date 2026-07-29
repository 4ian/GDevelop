// @flow
import {
  findConstantPlaceholderInSerializedData,
  getMissingConstantPlaceholderPath,
} from './ConstantPlaceholderDiagnostics';

const makeProjectWithConstants = (constants: Object): gdProject =>
  // $FlowFixMe[incompatible-cast] - The resolver only needs getConstantsJson.
  (({
    getConstantsJson: () => JSON.stringify(constants),
  }: any): gdProject);

describe('ConstantPlaceholderDiagnostics', () => {
  describe('getMissingConstantPlaceholderPath', () => {
    it('returns null when all placeholders exist', () => {
      const project = makeProjectWithConstants({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
        labels: ['First'],
      });

      expect(
        getMissingConstantPlaceholderPath(
          '"{{signals.triangle.s1}} {{labels[0]}}"',
          project
        )
      ).toBe(null);
    });

    it('returns the first missing placeholder path', () => {
      const project = makeProjectWithConstants({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
      });

      expect(
        getMissingConstantPlaceholderPath('"{{signals.triangle.s3}}"', project)
      ).toBe('signals.triangle.s3');
    });

    it('returns an empty path for empty placeholders', () => {
      const project = makeProjectWithConstants({});

      expect(getMissingConstantPlaceholderPath('"{{}}"', project)).toBe('');
    });
  });

  describe('findConstantPlaceholderInSerializedData', () => {
    it('returns the first placeholder path in serialized data', () => {
      const serializedData = {
        events: [
          {
            conditions: [
              {
                parameters: ['SignalName', '=', '"{{signals.triangle.s1}}"'],
              },
            ],
            actions: [
              {
                parameters: [
                  '',
                  '"{{signals.triangle.s1}}"',
                  '"Payload: {{labels[0]}}"',
                ],
              },
            ],
          },
        ],
      };

      expect(findConstantPlaceholderInSerializedData(serializedData)).toBe(
        'signals.triangle.s1'
      );
      expect(serializedData.events[0].conditions[0].parameters[2]).toBe(
        '"{{signals.triangle.s1}}"'
      );
    });

    it('returns null when serialized data has no placeholder', () => {
      const serializedData = {
        events: [
          {
            conditions: [
              {
                parameters: ['SignalName', '=', '"TriangleSignal"'],
              },
            ],
          },
        ],
      };

      expect(findConstantPlaceholderInSerializedData(serializedData)).toBe(
        null
      );
    });
  });
});
