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
     * Called every frame where the scene is active and the task still unresolved.
     * @param runtimeScene - The scene the task runs on.
     * @return True if the task is finished, false if it needs to continue running.
     */
    abstract update(runtimeScene: RuntimeScene): boolean;
  }

  /**
   * A task that requires the usage of an object.
   *
   * If the object comes to be deleted, the task will automatically
   * get rid of the object reference and resolve to avoid memory leaks.
   */
  export abstract class ObjectBoundTask extends AsyncTask {
    public readonly objectInstance: RuntimeObject;

    constructor(objectInstance: RuntimeObject) {
      super();
      this.objectInstance = objectInstance;
      objectInstance.registerDestroyCallback(() => {
        this.onObjectDeleted();

        // @ts-ignore At this point, the subclass code will not be called again,
        //            so we may allow this type contract transgression to avoid
        //            potentially leaking a reference to the object.
        this.objectInstance = null;
      });
    }

    /** The update method is handled by `ObjectBoundTask` - override `shouldResolve` instead. */
    update(runtimeScene: RuntimeScene) {
      // Force resolve if the object has been deleted from the scene
      if (this.objectInstance === null) return true;
      // Else, delegate the resolve check to the subclass
      return this.shouldResolve(runtimeScene);
    }

    /**
     * Called every frame where the scene is active and the task still unresolved.
     * @param runtimeScene - The scene the task runs on.
     * @return True if the task is finished, false if it needs to continue running.
     */
    abstract shouldResolve(runtimeScene: RuntimeScene): boolean;

    /**
     * Ran once when the bound object is deleted. Use this to clean up any
     * object references to the object that should not be leaked!
     *
     * The object reference will be deleted and the task will automatically
     * resolve after this method has been called.
     */
    abstract onObjectDeleted(): void;
  }

  /**
   * A task that represents the execution of a collection of tasks.
   */
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

  /**
   * An instantly resolving task.
   */
  export class ResolveTask extends AsyncTask {
    update() {
      return true;
    }
  }

  const logger = new gdjs.Logger('Internal PromiseTask');

  /**
   * A task that resolves when a promise resolves.
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
