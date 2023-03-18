namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Performance Event Tools.
       * @namespace
       */
      export namespace performance {
        const logger = new gdjs.Logger('Firebase Performance Measuring');
        const tracers = new Map<string, firebase.performance.Trace>();

        /**
         * Get a tracer (custom event) by name, if it doesn't exists create it.
         * @param tracerName - The name of the tracer.
         * @returns The tracer instance.
         */
        export const getTracer = (
          tracerName: string
        ): firebase.performance.Trace => {
          if (!tracers.has(tracerName))
            tracers.set(tracerName, firebase.performance().trace(tracerName));
          return tracers.get(tracerName) as firebase.performance.Trace;
        };

        /**
         * Start measuring performance for a custom event (tracer).
         * @param tracerName - The name of the tracer.
         */
        export const startTracer = (tracerName: string) => {
          try {
            getTracer(tracerName).start();
          } catch {
            logger.error(
              `Could not start tracer "${tracerName}". Make sure it is not already running!`
            );
          }
        };

        /**
         * Stop measuring performance for a custom event (tracer).
         * @param tracerName - The name of the tracer.
         */
        export const stopTracer = (tracerName: string) => {
          getTracer(tracerName).stop();
          tracers.delete(tracerName);
        };

        /**
         * Record performance for a specific time.
         * @param tracerName - The name of the tracer.
         * @param delay - The delay before starting measuring.
         * @param duration - The duration of the measuring.
         */
        export const recordPerformance = (
          tracerName: string,
          delay: float,
          duration: number
        ) => {
          getTracer(tracerName).record(Date.now() + delay, duration);
        };
      }
    }
  }
}
