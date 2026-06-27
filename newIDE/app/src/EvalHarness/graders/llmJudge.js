// @flow

/**
 * Optional LLM-as-judge grader. Given a scenario rubric and the run transcript,
 * a judge model returns a structured verdict. This catches the "did it actually
 * do something sensible" dimension that deterministic checks miss (e.g. are the
 * generated events reasonable, is the explanation correct), without hand-writing
 * an expected output for every scenario.
 *
 * The judge function is injectable so the grading logic is testable without a
 * network. The default judge calls the Anthropic Messages API; pin the model
 * with ANTHROPIC_JUDGE_MODEL (defaults to a current Claude Sonnet).
 */

import {
  type GraderResult,
  type RunResult,
  type AiRequest,
} from '../EvalTypes';
import {
  getAssistantText,
  getAllFunctionCalls,
  getResolvedCallIds,
} from '../AiRequestUtils';

export type JudgeVerdict = {| pass: boolean, score: number, reasoning: string |};
export type JudgeFn = (params: {|
  rubric: string,
  transcript: string,
|}) => Promise<JudgeVerdict>;

/** Render a compact, judge-friendly transcript of a whole run. */
export const renderTranscript = (runResult: RunResult): string => {
  const lines = [];
  runResult.requests.forEach((request: AiRequest, index) => {
    const role = request.parentAiRequestId
      ? `sub-agent (${request.mode})`
      : `main (${request.mode})`;
    lines.push(`\n=== Request #${index + 1}: ${role} ===`);
    const resolved = getResolvedCallIds(request);
    const text = getAssistantText(request);
    if (text) lines.push(`Assistant said: ${text}`);
    getAllFunctionCalls(request).forEach(call => {
      lines.push(
        `Tool call: ${call.name}(${call.arguments})${
          resolved.has(call.call_id) ? '' : ' [no result]'
        }`
      );
    });
  });
  return lines.join('\n');
};

/** Default judge backed by the Anthropic Messages API. */
export const makeAnthropicJudge = (
  options: ?{| apiKey?: string, model?: string |}
): JudgeFn => {
  const apiKey = (options && options.apiKey) || process.env.ANTHROPIC_API_KEY;
  const model =
    (options && options.model) ||
    process.env.ANTHROPIC_JUDGE_MODEL ||
    'claude-sonnet-4-6';
  if (!apiKey) {
    throw new Error(
      'Missing ANTHROPIC_API_KEY for the LLM judge. Provide one or disable LLM judging.'
    );
  }

  return async ({ rubric, transcript }) => {
    const system =
      'You are a strict evaluator of an AI game-building agent for the GDevelop engine. ' +
      'Given a rubric and a transcript of what the agent did, decide if the run meets the rubric. ' +
      'Respond with ONLY a JSON object: {"pass": boolean, "score": number between 0 and 1, "reasoning": string}.';
    const userContent = `RUBRIC:\n${rubric}\n\nTRANSCRIPT:\n${transcript}\n\nReturn only the JSON verdict.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Judge API error ${response.status}: ${await response.text()}`
      );
    }
    const data = await response.json();
    const textBlock =
      data.content &&
      data.content.find(block => block.type === 'text');
    const raw = textBlock ? textBlock.text : '';
    return parseJudgeVerdict(raw);
  };
};

/** Parse a judge model's reply into a verdict, tolerating code fences. */
export const parseJudgeVerdict = (raw: string): JudgeVerdict => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return { pass: false, score: 0, reasoning: `Unparseable judge reply: ${raw}` };
  }
  try {
    const parsed = JSON.parse(match[0]);
    return {
      pass: !!parsed.pass,
      score:
        typeof parsed.score === 'number'
          ? Math.max(0, Math.min(1, parsed.score))
          : parsed.pass
          ? 1
          : 0,
      reasoning: String(parsed.reasoning || ''),
    };
  } catch (error) {
    return {
      pass: false,
      score: 0,
      reasoning: `Invalid judge JSON: ${(error && error.message) || error}`,
    };
  }
};

/** Run the LLM judge for a scenario rubric, returning a GraderResult. */
export const runLlmJudge = async ({
  rubric,
  runResult,
  judge,
  weight,
}: {|
  rubric: string,
  runResult: RunResult,
  judge: JudgeFn,
  weight?: number,
|}): Promise<GraderResult> => {
  const transcript = renderTranscript(runResult);
  let verdict: JudgeVerdict;
  try {
    verdict = await judge({ rubric, transcript });
  } catch (error) {
    verdict = {
      pass: false,
      score: 0,
      reasoning: `Judge call failed: ${(error && error.message) || error}`,
    };
  }
  return {
    graderId: 'llm-judge',
    kind: 'llm-judge',
    passed: verdict.pass,
    score: verdict.score,
    weight: weight || 1,
    message: verdict.reasoning,
  };
};
