// @flow
import {
  computeEventsDiff,
  renderEventsDiffAsText,
  isEventsDiffEmpty,
} from './ComputeEventsDiff';

const gd: libGDevelop = global.gd;

const standard = (
  objectName: string,
  extra?: {| aiGeneratedEventId?: string, events?: Array<Object> |}
) => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [{ type: { value: 'Hide' }, parameters: [objectName] }],
  ...(extra || {}),
});

const comment = (text: string) => ({
  type: 'BuiltinCommonInstructions::Comment',
  comment: text,
});

describe('computeEventsDiff', () => {
  it('reports no changes when before and after are identical', () => {
    const events = [standard('A'), standard('B')];
    const diff = computeEventsDiff({
      beforeEventsJson: events,
      afterEventsJson: JSON.parse(JSON.stringify(events)),
    });
    expect(diff.added).toEqual([]);
    expect(diff.deleted).toEqual([]);
    expect(diff.modified).toEqual([]);
    expect(diff.moved).toEqual([]);
    expect(diff.unchangedCount).toBe(2);
    expect(isEventsDiffEmpty(diff)).toBe(true);
  });

  it('detects a pure insert at the start without noise on the rest', () => {
    const before = [standard('A'), standard('B')];
    const after = [standard('NEW'), standard('A'), standard('B')];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].path).toBe('0');
    expect(diff.added[0].afterJson.actions[0].parameters[0]).toBe('NEW');
    expect(diff.deleted).toEqual([]);
    expect(diff.modified).toEqual([]);
    expect(diff.moved).toEqual([]); // same-parent shuffle is folded into unchanged
    expect(diff.unchangedCount).toBe(2);
  });

  it('detects a pure delete in the middle', () => {
    const before = [standard('A'), standard('B'), standard('C')];
    const after = [standard('A'), standard('C')];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    expect(diff.deleted).toHaveLength(1);
    expect(diff.deleted[0].beforeJson.actions[0].parameters[0]).toBe('B');
    expect(diff.added).toEqual([]);
    expect(diff.modified).toEqual([]);
    expect(diff.moved).toEqual([]);
    expect(diff.unchangedCount).toBe(2);
  });

  it('detects a modified event at the same path', () => {
    const before = [standard('A'), standard('B')];
    const after = [
      standard('A'),
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [{ type: { value: 'Show' }, parameters: ['B'] }],
      },
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].path).toBe('1');
    expect(diff.modified[0].beforeJson.actions[0].type.value).toBe('Hide');
    expect(diff.modified[0].afterJson.actions[0].type.value).toBe('Show');
    expect(diff.added).toEqual([]);
    expect(diff.deleted).toEqual([]);
    expect(diff.unchangedCount).toBe(1);
  });

  it('detects a cross-parent move as a "moved" entry (same content hash, different parent)', () => {
    const before = [
      standard('A', {
        events: [standard('INNER')],
      }),
      standard('B'),
    ];
    const after = [
      standard('A'),
      standard('B', {
        events: [standard('INNER')],
      }),
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    // "INNER" is still identical by content hash but moved under a different
    // parent (different parent path).
    expect(diff.moved).toHaveLength(1);
    expect(diff.moved[0].fromPath).toBe('0.0');
    expect(diff.moved[0].toPath).toBe('1.0');
    // "A" and "B" are each modified (sub-events differ) at their own paths.
    expect(diff.modified.map(m => m.path).sort()).toEqual(['0', '1']);
    expect(diff.added).toEqual([]);
    expect(diff.deleted).toEqual([]);
  });

  it('matches events by aiGeneratedEventId even if content and path differ', () => {
    const before = [
      standard('A', { aiGeneratedEventId: 'id-1' }),
      standard('B', { aiGeneratedEventId: 'id-2' }),
    ];
    const after = [
      standard('B', { aiGeneratedEventId: 'id-2' }),
      // Same id-1, but its action target changed from "A" to "A_renamed":
      {
        type: 'BuiltinCommonInstructions::Standard',
        aiGeneratedEventId: 'id-1',
        conditions: [],
        actions: [{ type: { value: 'Hide' }, parameters: ['A_renamed'] }],
      },
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    // id-1 should be a modification (content differs), id-2 is unchanged
    // despite being at a different path — matched by id first.
    const modifiedPaths = diff.modified.map(m => m.path).sort();
    expect(modifiedPaths).toEqual(['1']);
    expect(diff.modified[0].beforeJson.aiGeneratedEventId).toBe('id-1');
    // id-2 is unchanged content, same-parent shuffle ⇒ folded into unchanged.
    expect(diff.moved).toEqual([]);
    expect(diff.added).toEqual([]);
    expect(diff.deleted).toEqual([]);
    expect(diff.unchangedCount).toBe(1);
  });

  it('handles a mix of insert + delete + modify in one pass (aiId-guided)', () => {
    // aiGeneratedEventId ties each logical event to its modification, so Pass 1
    // recognises the modified event even after its path shifts.
    const before = [
      standard('A', { aiGeneratedEventId: 'a' }),
      standard('B', { aiGeneratedEventId: 'b' }),
      standard('C', { aiGeneratedEventId: 'c' }),
    ];
    const after = [
      standard('NEW'),
      standard('A', { aiGeneratedEventId: 'a' }),
      {
        type: 'BuiltinCommonInstructions::Standard',
        aiGeneratedEventId: 'b',
        conditions: [],
        actions: [{ type: { value: 'Show' }, parameters: ['B'] }], // changed
      },
      // C deleted
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    expect(diff.added.map(a => a.afterJson.actions[0].parameters[0])).toEqual([
      'NEW',
    ]);
    expect(
      diff.deleted.map(d => d.beforeJson.actions[0].parameters[0])
    ).toEqual(['C']);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].afterJson.actions[0].type.value).toBe('Show');
    expect(diff.modified[0].beforeJson.aiGeneratedEventId).toBe('b');
    expect(diff.moved).toEqual([]);
    // "A" is unchanged (content match + aiId match, same parent ⇒ folded).
    expect(diff.unchangedCount).toBe(1);
  });

  it('uses sibling-position fallback when aiId and hash do not match', () => {
    // Same type at the same path, different content and no aiId ⇒ Pass 3.
    const before = [
      { type: 'BuiltinCommonInstructions::Comment', comment: 'hello' },
    ];
    const after = [
      { type: 'BuiltinCommonInstructions::Comment', comment: 'world' },
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].path).toBe('0');
    expect(diff.added).toEqual([]);
    expect(diff.deleted).toEqual([]);
  });
});

describe('renderEventsDiffAsText', () => {
  let project: gdProject;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
  });
  afterEach(() => {
    project.delete();
  });

  it('renders a "no changes" message when the diff is empty', () => {
    const events = [standard('A')];
    const diff = computeEventsDiff({
      beforeEventsJson: events,
      afterEventsJson: JSON.parse(JSON.stringify(events)),
    });
    const text = renderEventsDiffAsText(diff, {
      project,
      sceneName: 'MyScene',
    });
    expect(text).toContain('No event changes in scene "MyScene"');
    expect(text).toContain('1 events unchanged');
  });

  it('renders added / deleted / modified markers in the TextRenderer format', () => {
    const before = [standard('A'), standard('B'), comment('old comment')];
    const after = [
      standard('NEW'), // [+] at 0
      standard('A'), // unchanged (same-parent shuffle)
      comment('new comment'), // [~] at 2 (same path, same Comment type)
      // "B" is deleted
    ];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    const text = renderEventsDiffAsText(diff, {
      project,
      sceneName: 'MyScene',
    });
    expect(text).toContain('=== Changes to events of scene "MyScene" ===');
    expect(text).toMatch(/\[\+\] Added event-0:/);
    expect(text).toMatch(/\[-\] Deleted event-1:/);
    expect(text).toMatch(/\[~\] Modified event-2:/);
    // The text renderer output for each event must be wrapped inside the
    // diff body (so downstream readers see the same format as
    // TextRenderer.spec.js).
    expect(text).toContain('Conditions:');
    expect(text).toContain('Actions:');
    // Modified events show Before/After blocks.
    expect(text).toContain('Before:');
    expect(text).toContain('After:');
    expect(text).toContain('(1 events unchanged)');
  });

  it('truncates sections when maxEventsPerSection is exceeded', () => {
    const before: Array<Object> = [];
    const after: Array<Object> = [];
    for (let i = 0; i < 5; i++) {
      after.push(standard(`new_${i}`));
    }
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    const text = renderEventsDiffAsText(diff, {
      project,
      sceneName: 'MyScene',
      maxEventsPerSection: 2,
    });
    expect(text).toContain('[+] Added event-0:');
    expect(text).toContain('[+] Added event-1:');
    expect(text).not.toContain('[+] Added event-2:');
    expect(text).toContain('(+ 3 more [+] added change(s) omitted)');
  });

  it('truncates total output when maxLines is exceeded', () => {
    const before: Array<Object> = [];
    const after: Array<Object> = [standard('A'), standard('B'), standard('C')];
    const diff = computeEventsDiff({
      beforeEventsJson: before,
      afterEventsJson: after,
    });
    const text = renderEventsDiffAsText(diff, {
      project,
      sceneName: 'MyScene',
      maxLines: 5,
    });
    const outputLines = text.split('\n');
    // 5 kept lines + 1 "omitted" summary line.
    expect(outputLines).toHaveLength(6);
    expect(outputLines[outputLines.length - 1]).toMatch(
      /more lines omitted to stay under 5 lines/
    );
  });
});
