// @flow

/**
 * Pure combination of grader verdicts into an overall pass/score. No `gd`, no
 * network - see scoring.spec.js.
 */

import { type GraderResult } from '../EvalTypes';

/**
 * Combine grader results into a single verdict.
 *  - `score` is the weighted mean of each grader's 0..1 score.
 *  - `passed` requires every grader to pass (a benchmark sample is only a pass
 *    if all hard objective checks AND the judge agree). With no graders, it is
 *    not a pass (nothing was verified).
 */
export const combineGraderResults = (
  graderResults: Array<GraderResult>
): {| passed: boolean, score: number |} => {
  if (graderResults.length === 0) {
    return { passed: false, score: 0 };
  }
  const totalWeight = graderResults.reduce(
    (acc, g) => acc + (g.weight || 1),
    0
  );
  const weightedScore = graderResults.reduce(
    (acc, g) => acc + (g.weight || 1) * g.score,
    0
  );
  return {
    passed: graderResults.every(g => g.passed),
    score: totalWeight ? weightedScore / totalWeight : 0,
  };
};
