// @flow
import { parseJudgeVerdict, runLlmJudge, renderTranscript } from './llmJudge';

describe('parseJudgeVerdict', () => {
  test('parses a clean JSON verdict', () => {
    expect(
      parseJudgeVerdict('{"pass": true, "score": 0.8, "reasoning": "ok"}')
    ).toEqual({ pass: true, score: 0.8, reasoning: 'ok' });
  });

  test('tolerates code fences and surrounding prose', () => {
    const raw = 'Here is my verdict:\n```json\n{"pass": false, "score": 0.2, "reasoning": "missed"}\n```';
    expect(parseJudgeVerdict(raw)).toEqual({
      pass: false,
      score: 0.2,
      reasoning: 'missed',
    });
  });

  test('clamps score and defaults from pass when missing', () => {
    expect(parseJudgeVerdict('{"pass": true, "score": 5}').score).toBe(1);
    expect(parseJudgeVerdict('{"pass": true}').score).toBe(1);
  });

  test('fails gracefully on unparseable input', () => {
    const verdict = parseJudgeVerdict('not json at all');
    expect(verdict.pass).toBe(false);
    expect(verdict.score).toBe(0);
  });
});

describe('runLlmJudge', () => {
  const runResult: any = {
    requests: [
      {
        id: 'parent',
        mode: 'orchestrator',
        parentAiRequestId: null,
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: 'Done.' }],
          },
        ],
      },
    ],
  };

  test('uses the injected judge and returns a GraderResult', async () => {
    const judge = async () => ({ pass: true, score: 0.9, reasoning: 'good' });
    const result = await runLlmJudge({ rubric: 'r', runResult, judge });
    expect(result.kind).toBe('llm-judge');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(0.9);
  });

  test('a throwing judge produces a failing grader, not an exception', async () => {
    const judge = async () => {
      throw new Error('boom');
    };
    const result = await runLlmJudge({ rubric: 'r', runResult, judge });
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/boom/);
  });
});

describe('renderTranscript', () => {
  test('includes assistant text and tool calls', () => {
    const transcript = renderTranscript(({
      requests: [
        {
          id: 'p',
          mode: 'orchestrator',
          parentAiRequestId: null,
          output: [
            {
              type: 'message',
              role: 'assistant',
              content: [
                { type: 'output_text', text: 'Hello' },
                { type: 'function_call', call_id: 'c1', name: 'create_object', arguments: '{}' },
              ],
            },
          ],
        },
      ],
    }: any));
    expect(transcript).toMatch(/Assistant said: Hello/);
    expect(transcript).toMatch(/Tool call: create_object/);
    expect(transcript).toMatch(/\[no result\]/);
  });
});
