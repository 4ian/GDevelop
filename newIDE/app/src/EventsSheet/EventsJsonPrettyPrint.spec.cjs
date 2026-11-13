'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  prettyPrintEventsJson,
  eventsListToClipboardText,
} = require('./EventsJsonPrettyPrint.js');

// Slice modeled on EventScriptRenderer.fixtures.json (comment + standard event).
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

test('pretty-printed output parses with JSON.parse', () => {
  const text = prettyPrintEventsJson(fixtureEvents);
  assert.equal(text, JSON.stringify(fixtureEvents, null, 2));
  const parsed = JSON.parse(text);
  assert.deepEqual(parsed, fixtureEvents);
  assert.ok(text.includes('\n  '));
});

test('fixture round-trip keeps comment text and instructions', () => {
  const text = prettyPrintEventsJson(fixtureEvents);
  const parsed = JSON.parse(text);
  assert.equal(parsed[0].type, 'BuiltinCommonInstructions::Comment');
  assert.equal(parsed[0].comment, 'Setup\nwith a second line');
  assert.equal(parsed[1].conditions[0].type.value, 'Timer');
  assert.equal(parsed[1].actions[0].type.value, 'ResetTimer');
  assert.equal(parsed[1].actions[0].parameters[1], '"SpawnTimer"');
  console.log('--- pretty JSON ---');
  console.log(text);
  console.log('--- end pretty JSON ---');
});

test('output does not contain clipboard mangling', () => {
  const text = prettyPrintEventsJson(fixtureEvents);
  assert.equal(text.includes('GDEVELOP_'), false);
  assert.equal(text.includes('CLIPBOARD_KIND'), false);
  assert.equal(text.includes('jsBdHbLy912y8Rc'), false);
  assert.equal(text.includes('eventsCount'), false);
  assert.equal(text.includes('actionsList'), false);
  assert.equal(text.includes('conditionsList'), false);
});

test('empty selection does not copy', () => {
  assert.equal(eventsListToClipboardText([]), null);
  assert.equal(eventsListToClipboardText(null), null);
  assert.equal(eventsListToClipboardText(undefined), null);
});

test('non-empty events list is pretty-printed shareable JSON', () => {
  const text = eventsListToClipboardText(fixtureEvents);
  assert.equal(typeof text, 'string');
  assert.deepEqual(JSON.parse(text), fixtureEvents);
  assert.equal(text, JSON.stringify(fixtureEvents, null, 2));
});
