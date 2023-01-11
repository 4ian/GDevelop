/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * This stores all asynchronous tasks waiting to be completed,
   * for a given scene.
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
      for (let i = 0; i < this.tasksWithCallback.length; i++) {
        const taskWithCallback = this.tasksWithCallback[i];
        if (taskWithCallback.asyncTask.update(runtimeScene)) {
          // The task has finished, run the callback and remove it.
          taskWithCallback.callback(runtimeScene);
          this.tasksWithCallback.splice(i--, 1);
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

  export class TaskGroup extends AsyncTask {
    private tasks = new Array<AsyncTask>();

    addTask(task: AsyncTask) {
      this.tasks.push(task);
    }

    update(runtimeScene: gdjs.RuntimeScene) {
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i];
        if (task.update(runtimeScene)) this.tasks.splice(i--, 1);
      }

      return this.tasks.length === 0;
    }
  }

  export class ResolveTask extends AsyncTask {
    update() {
      return true;
    }
  }

  const logger = new gdjs.Logger('Internal PromiseTask');

  /**
   * A task that resolves with a promise.
   */
  export class PromiseTask extends AsyncTask {
    private isResolved: boolean = false;
    promise: Promise<void>;

    constructor(promise: Promise<void>) {
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

  export class ManuallyResolvableTask extends AsyncTask {
    private isResolved = false;

    resolve() {
      this.isResolved = true;
    }

    update(): boolean {
      return this.isResolved;
    }
  }
}
