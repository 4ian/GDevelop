// @flow

type InstanceCounter = {
  updateCount: number,
  totalUpdateTime: number,
};

export type BasicProfilingCounters = {
  instanceCounters: { [string]: InstanceCounter },
  totalInstancesUpdateCount: number,
  totalInstancesUpdateTime: number,
  totalPixiRenderingTime: number,
  totalPixiUiRenderingTime: number,
  totalThreeRenderingTime: number,
};

export const makeBasicProfilingCounters = (): BasicProfilingCounters => {
  return {
    instanceCounters: {},
    totalInstancesUpdateCount: 0,
    totalInstancesUpdateTime: 0,
    totalPixiRenderingTime: 0,
    totalPixiUiRenderingTime: 0,
    totalThreeRenderingTime: 0,
  };
};

export const resetBasicProfilingCounters = (
  basicProfilingCounters: BasicProfilingCounters
): BasicProfilingCounters => {
  basicProfilingCounters.instanceCounters = {};
  basicProfilingCounters.totalInstancesUpdateCount = 0;
  basicProfilingCounters.totalInstancesUpdateTime = 0;
  basicProfilingCounters.totalPixiRenderingTime = 0;
  basicProfilingCounters.totalPixiUiRenderingTime = 0;
  basicProfilingCounters.totalThreeRenderingTime = 0;
  return basicProfilingCounters;
};

export const increaseInstanceUpdate = (
  basicProfilingCounters: BasicProfilingCounters,
  objectName: string,
  updateDuration: number
) => {
  let instanceCounter = basicProfilingCounters.instanceCounters[objectName];
  if (!instanceCounter) {
    basicProfilingCounters.instanceCounters[objectName] = {
      updateCount: 1,
      totalUpdateTime: updateDuration,
    };
  } else {
    instanceCounter.updateCount++;
    instanceCounter.totalUpdateTime += updateDuration;
  }
  basicProfilingCounters.totalInstancesUpdateCount++;
  basicProfilingCounters.totalInstancesUpdateTime += updateDuration;
};

export const increasePixiRenderingTime = (
  basicProfilingCounters: BasicProfilingCounters,
  pixiRenderingTime: number
) => {
  basicProfilingCounters.totalPixiRenderingTime += pixiRenderingTime;
};

export const increasePixiUiRenderingTime = (
  basicProfilingCounters: BasicProfilingCounters,
  pixiUiRenderingTime: number
) => {
  basicProfilingCounters.totalPixiUiRenderingTime += pixiUiRenderingTime;
};

export const increaseThreeRenderingTime = (
  basicProfilingCounters: BasicProfilingCounters,
  threeRenderingTime: number
) => {
  basicProfilingCounters.totalThreeRenderingTime += threeRenderingTime;
};

export const mergeBasicProfilingCounters = (
  destination: BasicProfilingCounters,
  source: BasicProfilingCounters
): BasicProfilingCounters => {
  for (const objectName in source.instanceCounters) {
    if (source.instanceCounters.hasOwnProperty(objectName)) {
      const instanceCounter = source.instanceCounters[objectName];
      let destinationInstanceCounter = destination.instanceCounters[objectName];
      if (!destinationInstanceCounter) {
        destinationInstanceCounter = destination.instanceCounters[
          objectName
        ] = {
          updateCount: 0,
          totalUpdateTime: 0,
        };
      }
      destinationInstanceCounter.updateCount += instanceCounter.updateCount;
      destinationInstanceCounter.totalUpdateTime +=
        instanceCounter.totalUpdateTime;
    }
  }
  destination.totalInstancesUpdateCount += source.totalInstancesUpdateCount;
  destination.totalInstancesUpdateTime += source.totalInstancesUpdateTime;
  destination.totalPixiRenderingTime += source.totalPixiRenderingTime;
  destination.totalPixiUiRenderingTime += source.totalPixiUiRenderingTime;
  destination.totalThreeRenderingTime += source.totalThreeRenderingTime;
  return destination;
};

export const getBasicProfilingCountersText = (
  basicProfilingCounters: BasicProfilingCounters
): string => {
  const texts = [];
  texts.push(
    `Instances update count: ${
      basicProfilingCounters.totalInstancesUpdateCount
    }`
  );
  texts.push(
    `Instances update time: ${basicProfilingCounters.totalInstancesUpdateTime.toFixed(
      2
    )}ms`
  );
  texts.push(
    `Pixi rendering time: ${basicProfilingCounters.totalPixiRenderingTime.toFixed(
      2
    )}ms`
  );
  texts.push(
    `Three rendering time: ${basicProfilingCounters.totalThreeRenderingTime.toFixed(
      2
    )}ms`
  );
  texts.push(
    `Pixi UI rendering time: ${basicProfilingCounters.totalPixiUiRenderingTime.toFixed(
      2
    )}ms`
  );
  texts.push(' ');
  for (const objectName in basicProfilingCounters.instanceCounters) {
    const instanceCounters =
      basicProfilingCounters.instanceCounters[objectName];
    texts.push(
      `${objectName}: ${
        instanceCounters.updateCount
      } updates, ${instanceCounters.totalUpdateTime.toFixed(2)}ms`
    );
  }

  return texts.join('\n');
};
