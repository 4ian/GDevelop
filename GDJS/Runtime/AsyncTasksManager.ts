/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A manager for all asynchronous tasks.
   * @see {@link RuntimeScene.getAsyncTasksManager}.
   */
  export class AsyncTasksManager {
    /**
     * Maps a task to the callback to be executed once it is finished.
     */
    private tasksWithCallback = new Array<{
      asyncTask: AsyncTask;
      callback: (runtimeScene: gdjs.RuntimeScene) => void;
    }>();

    /**
     * Run all pending asynchronous tasks.
     */
    processTasks(runtimeScene: RuntimeScene): void {
      for (const taskWithCallback of this.tasksWithCallback) {
        if (taskWithCallback.asyncTask.update(runtimeScene)) {
          // The task has finished, run the callback and remove it.
          taskWithCallback.callback(runtimeScene);
          this.tasksWithCallback.splice(
            this.tasksWithCallback.indexOf(taskWithCallback),
            1
          );
        }
      }
    }

    /**
     * Adds a task to be processed between frames and a callback for when it is done to the manager.
     * @param asyncTask The {@link AsyncTask} to run.
     * @param callback The callback to execute once the task is finished.
     */
    addTask(
      asyncTask: AsyncTask,
      callback: (runtimeScene: RuntimeScene) => void
    ): void {
      this.tasksWithCallback.push({ asyncTask, callback });
    }

    /**
     * For testing only - removes all tasks.
     * @internal
     */
    clearTasks() {
      this.tasksWithCallback.length = 0;
    }
  }

  /**
   * An asynchronous task to be run between frames.
   */
  export abstract class AsyncTask {
    /**
     * Called every frame where the scene is active.
     * @param runtimeScene - The scene the task runs on.
     * @return True if the task is finished, false if it needs to continue running.
     */
    abstract update(runtimeScene: RuntimeScene): boolean;
  }

  const logger = new gdjs.Logger('Internal PromiseTask');

  /**
   * A task that resolves with a promise.
   */
  export class PromiseTask extends AsyncTask {
    private isResolved: boolean = false;
    promise: Promise<any>;

    constructor(promise: Promise<any>) {
      super();
      this.promise = promise
        .catch((error) => {
          logger.error(
            `A promise error has not been handled, this should never happen! 
If you are using JavaScript promises in an asynchronous action, make sure to add a .catch(). 
Otherwise, report this as a bug on the GDevelop forums! 
${error ? 'The following error was thrown: ' + error : ''}`
          );
        })
        .then(() => {
          this.isResolved = true;
        });
    }

    update() {
      return this.isResolved;
    }
  }
}
