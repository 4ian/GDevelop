import type { FrameMeasure, ProfilerStats, RuntimeGame } from '..';
import type { HotReloaderLog } from './hot-reloader';

/**
 * An client side implementation of the Debugger
 */
export interface IDebuggerClient {
  /**
   * Update a value, specified by a path starting from the {@link RuntimeGame} instance.
   * @param path - The path to the variable, starting from {@link RuntimeGame}.
   * @param newValue - The new value.
   * @return Was the operation successful?
   */
  set(path: string[], newValue: any): boolean;

  /**
   * Call a method, specified by a path starting from the {@link RuntimeGame} instance.
   * @param path - The path to the method, starting from {@link RuntimeGame}.
   * @param args - The arguments to pass the method.
   * @return Was the operation successful?
   */
  call(path: string[], args: any[]): boolean;

  /**
   * Dump all the relevant data from the {@link RuntimeGame} instance and send it to the server.
   */
  sendRuntimeGameDump(): void;

  /**
   * Send logs from the hot reloader to the server.
   * @param logs The hot reloader logs.
   */
  sendHotReloaderLogs(logs: HotReloaderLog[]): void;

  /**
   * Callback called when profiling is starting.
   */
  sendProfilerStarted(): void;

  /**
   * Callback called when profiling is ending.
   */
  sendProfilerStopped(): void;

  /**
   * Send profiling results.
   * @param framesAverageMeasures The measures made for each frames.
   * @param stats Other measures done during the profiler run.
   */
  sendProfilerOutput(
    framesAverageMeasures: FrameMeasure,
    stats: ProfilerStats
  ): void;
}

type DebuggerCtr = new (runtimeGame: RuntimeGame) => IDebuggerClient;
export let DebuggerClient: DebuggerCtr | null = null;
export const registerDebuggerClient = (client: DebuggerCtr) => {
  DebuggerClient = client;
};
