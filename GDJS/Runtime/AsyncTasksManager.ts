/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export type WaitTaskNetworkSyncData = {
    type: 'wait';
    duration: float;
    timeElapsedOnScene: float;
  };
  export type ResolveTaskNetworkSyncData = null;
  export type PromiseTaskNetworkSyncData = null;
  export type ManuallyResolvableTaskNetworkSyncData = null;
  export type TaskGroupNetworkSyncData = {
    type: 'group';
    tasks: AsyncTaskNetworkSyncData[];
  };
  export type AsyncTaskNetworkSyncData =
    | WaitTaskNetworkSyncData
    | TaskGroupNetworkSyncData
    | PromiseTaskNetworkSyncData
    | ManuallyResolvableTaskNetworkSyncData
    | ResolveTaskNetworkSyncData;

  export type AsyncTasksManagerNetworkSyncData = {
    tasks: Array<{
      callbackId: string;
      asyncTask: AsyncTaskNetworkSyncData;
      objectsList: gdjs.LongLivedObjectsListNetworkSyncData;
    }>;
  };

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
      callback: (
        runtimeScene: gdjs.RuntimeScene,
        longLivedObjectsList: gdjs.LongLivedObjectsList
      ) => void;
      callbackId: string;
      longLivedObjectsList: gdjs.LongLivedObjectsList;
    }>();

    /**
     * Run all pending asynchronous tasks.
     */
    processTasks(runtimeScene: RuntimeScene): void {
      for (let i = 0; i < this.tasksWithCallback.length; i++) {
        const taskWithCallback = this.tasksWithCallback[i];
        if (taskWithCallback.asyncTask.update(runtimeScene)) {
          // The task has finished, run the callback and remove it.
          taskWithCallback.callback(
            runtimeScene,
            taskWithCallback.longLivedObjectsList
          );
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
      callback: (
        runtimeScene: RuntimeScene,
        longLivedObjectsList: gdjs.LongLivedObjectsList
      ) => void,
      callbackId: string,
      longLivedObjectsList: gdjs.LongLivedObjectsList
    ): void {
      this.tasksWithCallback.push({
        asyncTask,
        callback,
        callbackId,
        longLivedObjectsList,
      });
    }

    /**
     * For testing only - removes all tasks.
     * @internal
     */
    clearTasks() {
      this.tasksWithCallback.length = 0;
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): AsyncTasksManagerNetworkSyncData {
      const tasksData = this.tasksWithCallback.map(
        ({ asyncTask, callbackId, longLivedObjectsList }) => {
          return {
            callbackId,
            asyncTask: asyncTask.getNetworkSyncData(),
            objectsList: longLivedObjectsList.getNetworkSyncData(syncOptions),
          };
        }
      );

      return {
        tasks: tasksData,
      };
    }

    updateFromNetworkSyncData(
      syncData: AsyncTasksManagerNetworkSyncData,
      idToCallbackMap: Map<
        string,
        (
          runtimeScene: gdjs.RuntimeScene,
          asyncObjectsList: gdjs.LongLivedObjectsList
        ) => void
      >,
      runtimeScene: gdjs.RuntimeScene,
      syncOptions: UpdateFromNetworkSyncDataOptions
    ) {
      this.clearTasks();

      syncData.tasks.forEach(({ callbackId, asyncTask, objectsList }) => {
        if (!asyncTask) return;

        const callback = idToCallbackMap.get(callbackId);
        if (callback) {
          // Find the objectsList again from the networkIds.
          const longLivedObjectsList = new gdjs.LongLivedObjectsList();
          longLivedObjectsList.updateFromNetworkSyncData(
            objectsList,
            runtimeScene,
            syncOptions
          );

          if (asyncTask.type === 'group') {
            const task = new TaskGroup();
            task.updateFromNetworkSyncData(asyncTask);
            this.addTask(task, callback, callbackId, longLivedObjectsList);
          }
          if (asyncTask.type === 'wait') {
            const task = new gdjs.evtTools.runtimeScene.WaitTask(
              asyncTask.duration
            );
            task.updateFromNetworkSyncData(asyncTask);
            this.addTask(task, callback, callbackId, longLivedObjectsList);
          }
        }
      });
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

    abstract getNetworkSyncData(): AsyncTaskNetworkSyncData;

    abstract updateFromNetworkSyncData(
      syncData: AsyncTaskNetworkSyncData
    ): void;
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

    getNetworkSyncData(): TaskGroupNetworkSyncData {
      return {
        type: 'group',
        tasks: this.tasks.map((task) => task.getNetworkSyncData()),
      };
    }

    updateFromNetworkSyncData(syncData: TaskGroupNetworkSyncData) {
      syncData.tasks.forEach((asyncTask) => {
        if (!asyncTask) return;

        if (asyncTask.type === 'group') {
          const task = new TaskGroup();
          task.updateFromNetworkSyncData(asyncTask);
          this.addTask(task);
        }
        if (asyncTask.type === 'wait') {
          const task = new gdjs.evtTools.runtimeScene.WaitTask(
            asyncTask.duration
          );
          task.updateFromNetworkSyncData(asyncTask);
          this.addTask(task);
        }
      });
    }
  }

  export class ResolveTask extends AsyncTask {
    update() {
      return true;
    }

    getNetworkSyncData(): AsyncTaskNetworkSyncData {
      return null;
    }

    updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void {}
  }

  const logger = new gdjs.Logger('Internal PromiseTask');

  /**
   * A task that resolves with a promise.
   */
  export class PromiseTask<ResultType = void> extends AsyncTask {
    private isResolved: boolean = false;
    promise: Promise<ResultType>;

    constructor(promise: Promise<ResultType>) {
      super();
      this.promise = promise
        .catch((error) => {
          logger.error(
            `A promise error has not been handled, this should never happen!
If you are using JavaScript promises in an asynchronous action, make sure to add a .catch().
Otherwise, report this as a bug on the GDevelop forums!
${error ? 'The following error was thrown: ' + error : ''}`
          );

          // @ts-ignore
          return undefined as ResultType;
        })
        .then((result) => {
          this.isResolved = true;

          return result;
        });
    }

    update() {
      return this.isResolved;
    }

    getNetworkSyncData(): AsyncTaskNetworkSyncData {
      return null;
    }

    updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void {}
  }

  export class ManuallyResolvableTask extends AsyncTask {
    private isResolved = false;

    resolve() {
      this.isResolved = true;
    }

    update(): boolean {
      return this.isResolved;
    }

    getNetworkSyncData(): AsyncTaskNetworkSyncData {
      return null;
    }

    updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void {}
  }
}
