//@flow
export const delay = (ms: number): Promise<void> =>
  new Promise(res => setTimeout(res, ms));
