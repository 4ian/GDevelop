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
    private tasks = new Array<{
      asyncTask: AsyncTask;
      callback: (runtimeScene: gdjs.RuntimeScene) => void;
    }>();

    /**
     * Run all pending asynchronous tasks.
     */
    processTasks(runtimeScene: RuntimeScene): void {
      for (const task of this.tasks) {
        if (task.asyncTask.update(runtimeScene)) {
          // The task has finished, run the callback and remove it.
          task.callback(runtimeScene);
          this.tasks.splice(this.tasks.indexOf(task), 1);
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
      this.tasks.push({ asyncTask, callback });
    }

    /**
     * For testing only - removes all tasks.
     * @internal
     */
    clearTasks() {
      this.tasks.length = 0;
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

  /**
   * A task that resolves with a promise.
   */
  export class PromiseTask extends AsyncTask {
    private isResolved: boolean = false;

    constructor(promise: Promise<any>) {
      super();
      promise
        .then(() => {
          this.isResolved = true;
        })
        .catch(() => {});
    }

    update() {
      return this.isResolved;
    }
  }
}
