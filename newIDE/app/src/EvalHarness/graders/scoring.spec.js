// @flow
import { combineGraderResults } from './scoring';

const g = (passed, score, weight = 1): any => ({
  graderId: 'g',
  kind: 'objective',
  passed,
  score,
  weight,
  message: '',
});

describe('combineGraderResults', () => {
  test('not a pass when there are no graders', () => {
    expect(combineGraderResults([])).toEqual({ passed: false, score: 0 });
  });

  test('passes only when every grader passes', () => {
    expect(combineGraderResults([g(true, 1), g(true, 1)]).passed).toBe(true);
    expect(combineGraderResults([g(true, 1), g(false, 0)]).passed).toBe(false);
  });

  test('score is the weighted mean', () => {
    const result = combineGraderResults([g(true, 1, 3), g(false, 0, 1)]);
    expect(result.score).toBeCloseTo((3 * 1 + 1 * 0) / 4);
  });
});
