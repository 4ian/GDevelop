// @flow
import * as React from 'react';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';
import { type ExpressionEvaluation } from './EventsExecutionTrackingStore';
import { usePollingRequest } from '../Utils/UsePollingRequest';

const gd: libGDevelop = global.gd;

/** How often the values are refreshed while a preview runs. */
const REFRESH_INTERVAL_MS = 300;

/** An expression whose value in the running preview is followed. */
export type LiveExpression = {|
  /** Identifies the expression among the others: the evaluations are keyed by it. */
  key: string,
  expression: string,
  /** How the expression is read ("number", "string", "variable", "scenevar"...). */
  parameterType: string,
  /** The object owning the variable, for object variables. */
  objectName?: string,
  /**
   * Evaluate it on every instance of the object it reads, not only on the
   * first one: a bigger answer at each refresh, to ask for only when shown.
   */
  isEvaluatedForAllInstances?: boolean,
|};

/**
 * Whether the values can be read: a preview runs with the debugger opened, a
 * preview runs without it (and is left alone), or nothing runs.
 */
export type LivePreviewStatus = 'running' | 'withoutDebugger' | 'none';

export type LiveExpressionEvaluations = {|
  /** The last value answered for each expression, by its key. */
  evaluations: { [key: string]: ExpressionEvaluation | null },
  previewStatus: LivePreviewStatus,
|};

const noEvaluations = {};

/**
 * Generate the code evaluating each expression in the game. An expression
 * whose code cannot be generated gets none, and is not sent to the game.
 */
const generateEvaluationCodes = (
  project: gdProject,
  layout: gdLayout,
  liveExpressions: Array<LiveExpression>
): Array<string | null> => {
  const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
  try {
    return liveExpressions.map(liveExpression => {
      try {
        layoutCodeGenerator.setEvaluateForAllInstances(
          !!liveExpression.isEvaluatedForAllInstances
        );
        return layoutCodeGenerator.generateExpressionEvaluationCode(
          layout,
          liveExpression.parameterType,
          liveExpression.expression,
          liveExpression.objectName || ''
        );
      } catch (error) {
        console.error(
          `Unable to generate the code evaluating "${
            liveExpression.expression
          }" (${liveExpression.parameterType}):`,
          error
        );
        return null;
      }
    });
  } finally {
    layoutCodeGenerator.delete();
  }
};

/**
 * Follow the values that expressions take in the running preview, refreshed
 * while it runs, all of them in a single round trip to the game.
 *
 * `liveExpressions` must be memoized: the code of the expressions depends on
 * the events, not on the state of the game, and is only generated again when
 * it changes. `maxInstancesCount` caps the instances sent for the expressions
 * evaluated on every instance; it is read at each refresh, without restarting
 * it.
 *
 * The values already shown are kept when the game does not answer (busy, or
 * just closed): a value that blinks can't be read. They are forgotten once
 * nothing is followed anymore.
 */
export const useLiveExpressionEvaluations = ({
  project,
  layout,
  liveExpressions,
  maxInstancesCount,
}: {|
  project: gdProject,
  /** The scene the expressions belong to. Values can't be read without one. */
  layout: ?gdLayout,
  liveExpressions: Array<LiveExpression>,
  maxInstancesCount?: number,
|}): LiveExpressionEvaluations => {
  const store = React.useContext(EventsExecutionTrackingContext);
  const [evaluations, setEvaluations] = React.useState<{
    [key: string]: ExpressionEvaluation | null,
  }>(noEvaluations);
  const [previewStatus, setPreviewStatus] = React.useState<LivePreviewStatus>(
    () => (store.hasRunningPreview() ? 'running' : 'none')
  );
  const maxInstancesCountRef = React.useRef(maxInstancesCount);
  maxInstancesCountRef.current = maxInstancesCount;

  const codes: Array<string | null> | null = React.useMemo(
    () =>
      layout && liveExpressions.length > 0
        ? generateEvaluationCodes(project, layout, liveExpressions)
        : null,
    [project, layout, liveExpressions]
  );
  // An answer to codes that were replaced since is not shown.
  const latestCodesRef = React.useRef(codes);
  latestCodesRef.current = codes;
  const codesKey = React.useMemo(
    () => (codes ? codes.map(code => code || '').join('\n') : ''),
    [codes]
  );

  React.useEffect(
    () => {
      if (!codes) setEvaluations(noEvaluations);
    },
    [codes]
  );

  const refresh = React.useCallback(
    async () => {
      if (!codes) return;
      if (!store.hasRunningPreview()) {
        setPreviewStatus(
          store.hasConnectedPreview() ? 'withoutDebugger' : 'none'
        );
        return;
      }
      setPreviewStatus('running');

      const sentCodes: Array<string> = [];
      codes.forEach(code => {
        if (code !== null) sentCodes.push(code);
      });
      const results = await store.evaluateExpressions(sentCodes, {
        maxInstancesCount: maxInstancesCountRef.current,
      });
      if (!results || latestCodesRef.current !== codes) return;

      const newEvaluations: { [key: string]: ExpressionEvaluation | null } = {};
      let sentCodeIndex = 0;
      codes.forEach((code, index) => {
        newEvaluations[liveExpressions[index].key] =
          code === null ? null : results[sentCodeIndex++] || null;
      });
      setEvaluations(newEvaluations);
    },
    [store, codes, liveExpressions]
  );

  usePollingRequest(refresh, codes ? REFRESH_INTERVAL_MS : null, codesKey);

  return { evaluations, previewStatus };
};
