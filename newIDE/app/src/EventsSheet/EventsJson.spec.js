// @flow
// $FlowFixMe[untyped-import]
const {
  prettyPrintEventsJson,
  eventsListToClipboardText,
} = require('./EventsJsonPrettyPrint');

describe('EventsJson', () => {
  const fixtureEvents = [
    {
      type: 'BuiltinCommonInstructions::Comment',
      comment: 'Setup\nwith a second line',
    },
    {
      type: 'BuiltinCommonInstructions::Standard',
      conditions: [
        {
          type: { value: 'Timer' },
          parameters: ['', '2', '"SpawnTimer"'],
        },
      ],
      actions: [
        {
          type: { value: 'ResetTimer' },
          parameters: ['', '"SpawnTimer"'],
        },
      ],
    },
  ];

  describe('prettyPrintEventsJson', () => {
    test('pretty-prints with JSON.stringify null, 2 and parses back', () => {
      const text = prettyPrintEventsJson(fixtureEvents);
      expect(text).toEqual(JSON.stringify(fixtureEvents, null, 2));
      expect(JSON.parse(text)).toEqual(fixtureEvents);
      expect(text.includes('\n  ')).toBe(true);
    });

    test('round-trips a serialized events list fixture', () => {
      const parsed = JSON.parse(prettyPrintEventsJson(fixtureEvents));
      expect(parsed[0].comment).toBe('Setup\nwith a second line');
      expect(parsed[1].actions[0].type.value).toBe('ResetTimer');
    });

    test('does not mangle the payload as a GDevelop clipboard kind', () => {
      const text = prettyPrintEventsJson(fixtureEvents);
      expect(text.includes('GDEVELOP_')).toBe(false);
      expect(text.includes('CLIPBOARD_KIND')).toBe(false);
      expect(text.includes('jsBdHbLy912y8Rc')).toBe(false);
    });
  });

  describe('eventsListToClipboardText', () => {
    test('does not copy an empty selection', () => {
      expect(eventsListToClipboardText([])).toBe(null);
      expect(eventsListToClipboardText(null)).toBe(null);
      expect(eventsListToClipboardText(undefined)).toBe(null);
    });

    test('returns pretty-printed JSON for selected events', () => {
      const text = eventsListToClipboardText(fixtureEvents);
      expect(text).toEqual(JSON.stringify(fixtureEvents, null, 2));
    });
  });
});
