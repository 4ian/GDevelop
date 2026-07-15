// @flow
import {
  findStaticDataPlaceholderInSerializedData,
  getMissingStaticDataPlaceholderPath,
} from './StaticDataPlaceholderDiagnostics';

const makeProjectWithStaticData = (staticData: Object): gdProject =>
  // $FlowFixMe[incompatible-cast] - The resolver only needs getStaticDataJson.
  (({
    getStaticDataJson: () => JSON.stringify(staticData),
  }: any): gdProject);

describe('StaticDataPlaceholderDiagnostics', () => {
  describe('getMissingStaticDataPlaceholderPath', () => {
    it('returns null when all placeholders exist', () => {
      const project = makeProjectWithStaticData({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
        labels: ['First'],
      });

      expect(
        getMissingStaticDataPlaceholderPath(
          '"{{signals.triangle.s1}} {{labels[0]}}"',
          project
        )
      ).toBe(null);
    });

    it('returns the first missing placeholder path', () => {
      const project = makeProjectWithStaticData({
        signals: {
          triangle: {
            s1: 'TriangleSignal',
          },
        },
      });

      expect(
        getMissingStaticDataPlaceholderPath(
          '"{{signals.triangle.s3}}"',
          project
        )
      ).toBe('signals.triangle.s3');
    });

    it('returns an empty path for empty placeholders', () => {
      const project = makeProjectWithStaticData({});

      expect(getMissingStaticDataPlaceholderPath('"{{}}"', project)).toBe('');
    });
  });

  describe('findStaticDataPlaceholderInSerializedData', () => {
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

      expect(findStaticDataPlaceholderInSerializedData(serializedData)).toBe(
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

      expect(findStaticDataPlaceholderInSerializedData(serializedData)).toBe(
        null
      );
    });
  });
});
