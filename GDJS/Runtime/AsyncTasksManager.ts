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
    private tasks = new Map<AsyncTask, (runtimeScene: RuntimeScene) => void>();

    /**
     * Run all pending asynchronous tasks.
     */
    processTasks(runtimeScene: RuntimeScene): void {
      for (const task of this.tasks.keys()) {
        if (task.update(runtimeScene)) {
          // The task has finished, run the callback and remove it.
          this.tasks.get(task)!(runtimeScene);
          this.tasks.delete(task);
        }
      }
    }

    /**
     * Adds a task to be processed between frames and a callback for when it is done to the manager.
     * @param task The {@link AsyncTask} to run.
     * @param then The callback to execute once the task is finished.
     */
    addTask(task: AsyncTask, then: (runtimeScene: RuntimeScene) => void): void {
      this.tasks.set(task, then);
    }

    /**
     * For testing only - removes all tasks.
     * @internal
     */
    clearTasks() {
      this.tasks.clear();
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
