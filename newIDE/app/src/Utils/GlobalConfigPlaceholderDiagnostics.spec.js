// @flow
import {
  findGlobalConfigPlaceholderInSerializedData,
  getMissingGlobalConfigPlaceholderPath,
} from './GlobalConfigPlaceholderDiagnostics';

const makeProjectWithGlobalConfig = (globalConfig: Object): gdProject =>
  // $FlowFixMe[incompatible-cast] - The resolver only needs getGlobalConfigJson.
  (({
    getGlobalConfigJson: () => JSON.stringify(globalConfig),
  }: any): gdProject);

describe('GlobalConfigPlaceholderDiagnostics', () => {
  describe('getMissingGlobalConfigPlaceholderPath', () => {
    it('returns null when all placeholders exist', () => {
      const project = makeProjectWithGlobalConfig({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
        labels: ['First'],
      });

      expect(
        getMissingGlobalConfigPlaceholderPath(
          '"{{signals.triangle.s1}} {{labels[0]}}"',
          project
        )
      ).toBe(null);
    });

    it('returns the first missing placeholder path', () => {
      const project = makeProjectWithGlobalConfig({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
      });

      expect(
        getMissingGlobalConfigPlaceholderPath(
          '"{{signals.triangle.s3}}"',
          project
        )
      ).toBe('signals.triangle.s3');
    });

    it('returns an empty path for empty placeholders', () => {
      const project = makeProjectWithGlobalConfig({});

      expect(getMissingGlobalConfigPlaceholderPath('"{{}}"', project)).toBe('');
    });
  });

  describe('findGlobalConfigPlaceholderInSerializedData', () => {
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

      expect(findGlobalConfigPlaceholderInSerializedData(serializedData)).toBe(
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

      expect(findGlobalConfigPlaceholderInSerializedData(serializedData)).toBe(
        null
      );
    });
  });
});
