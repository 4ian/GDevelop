// @flow
type RawStepMeasure = [string, number];
type SummarizedStep = {|
  stepName: string,
  time: number,
  elapsedTime: number,
|};
type Summary = {|
  totalStartupTime: number,
  steps: Array<SummarizedStep>,
|};

export const GD_STARTUP_TIMES: Array<RawStepMeasure> = global.GD_STARTUP_TIMES;

if (!GD_STARTUP_TIMES) {
  console.error(
    'Could not find GD_STARTUP_TIMES array. Have you declared it in index.html, in a synchronous script?'
  );
}

export const getStartupTimesSummary = (): Summary => {
  let previousStep = ['<init>', 0];

  let steps = GD_STARTUP_TIMES.map(step => {
    const stepSummary = {
      stepName: step[0],
      time: step[1],
      elapsedTime: step[1] - previousStep[1],
    };

    previousStep = step;
    return stepSummary;
  });

  return {
    steps,
    totalStartupTime: previousStep[1],
  };
};
