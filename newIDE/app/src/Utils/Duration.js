// @flow

export const formatDuration = (
  durationInSeconds: number,
  { noNullDuration }: {| noNullDuration: boolean |} = { noNullDuration: true }
): string => {
  const hours = Math.floor(durationInSeconds / 3600);
  if (hours > 0) {
    const minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
    const seconds = Math.ceil(durationInSeconds - hours * 3600 - minutes * 60);
    return `${hours}:${minutes.toFixed(0).padStart(2, '0')}:${seconds
      .toFixed(0)
      .padStart(2, '0')}`;
  }
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = (noNullDuration ? Math.ceil : Math.round)(
    durationInSeconds - minutes * 60
  );
  return `${minutes}:${seconds.toFixed(0).padStart(2, '0')}`;
};
