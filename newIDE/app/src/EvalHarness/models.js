// @flow

/**
 * The matrix of models to benchmark. Each entry pins one or more agent roles to
 * a `modelUniqueId` from the backend `llm-models.js`. Edit this file to try a
 * new LLM: add an entry and re-run the suite.
 *
 * `modelUniqueId`s referenced below (kept in sync with generation-api
 * llm-models.js):
 *   - 'gpt5.4m-or-openai'  -> openai/gpt-5.4-mini   (current default-ish sub-agent)
 *   - 'gpt5.4n-or-openai'  -> openai/gpt-5.4-nano   (cheapest sub-agent)
 *   - 'g3f-g'              -> google/gemini-3-flash-preview
 *   - 'dsv4f-g-agent'      -> deepseek/deepseek-v4-flash
 */

import { type ModelUnderTest, PRODUCTION_DEFAULTS } from './EvalTypes';

/**
 * Default matrix: a production-defaults control, plus candidates pinned for the
 * two sub-agent roles the team wants to experiment with (edit + explorer).
 */
export const defaultModelMatrix: Array<ModelUnderTest> = [
  PRODUCTION_DEFAULTS,
  {
    id: 'subagents=gpt-5.4-mini',
    modelUniqueId: 'gpt5.4m-or-openai',
    usages: ['agent-edit', 'agent-explorer'],
    notes: 'Pin both sub-agents to GPT-5.4 mini.',
  },
  {
    id: 'subagents=gpt-5.4-nano',
    modelUniqueId: 'gpt5.4n-or-openai',
    usages: ['agent-edit', 'agent-explorer'],
    notes: 'Pin both sub-agents to the cheaper GPT-5.4 nano.',
  },
  {
    id: 'subagents=gemini-3-flash',
    modelUniqueId: 'g3f-g',
    usages: ['agent-edit', 'agent-explorer'],
    notes: 'Candidate replacement: Gemini 3 Flash for both sub-agents.',
  },
  {
    id: 'subagents=deepseek-v4-flash',
    modelUniqueId: 'dsv4f-g-agent',
    usages: ['agent-edit', 'agent-explorer'],
    notes: 'Candidate replacement: DeepSeek V4 Flash for both sub-agents.',
  },
];
