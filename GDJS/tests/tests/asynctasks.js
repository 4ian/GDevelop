(() => {
  function createMockCallback() {
    let callCount = 0;
    function call() {
      callCount++;
    }
    call.expectToHaveBeenCalled = () => {
      expect(callCount).to.not.be(0);
    };
    call.expectToHaveBeenCalledOnce = () => {
      expect(callCount).to.be(1);
    };
    call.expectToNotHaveBeenCalled = () => {
      expect(callCount).to.be(0);
    };
    return call;
  }

  describe('gdjs.AsyncTaskManager', function () {
    class NeverResolvingTask extends gdjs.AsyncTask {
      update() {
        return false;
      }
    }

    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    const asyncTasksManager = runtimeScene.getAsyncTasksManager();

    this.beforeEach(() => asyncTasksManager.clearTasks());

    it('should call a resolved callback', function () {
      const cb = createMockCallback();
      asyncTasksManager.addTask(new gdjs.ResolveTask(), cb);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToHaveBeenCalled();
    });

    it('should not call callbacks twice', function () {
      const cb = createMockCallback();
      asyncTasksManager.addTask(new gdjs.ResolveTask(), cb);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToHaveBeenCalledOnce();
    });

    it('should not call an unresolved callback', function () {
      const cb = createMockCallback();
      asyncTasksManager.addTask(new NeverResolvingTask(), cb);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToNotHaveBeenCalled();
    });
  });

  describe('gdjs.PromiseTask', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    const asyncTasksManager = runtimeScene.getAsyncTasksManager();

    it('Should resolve with Promise', async () => {
      const task = new gdjs.PromiseTask(new Promise((r) => queueMicrotask(r)));
      const cb = createMockCallback();
      asyncTasksManager.addTask(task, cb);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToNotHaveBeenCalled();
      await task.promise;
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToHaveBeenCalled();
    });
  });

  describe('gdjs.WaitTask', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    const asyncTasksManager = runtimeScene.getAsyncTasksManager();
    const timeManager = runtimeScene.getTimeManager();

    it('Should resolve when the time has elapsed', async () => {
      const cb = createMockCallback();
      asyncTasksManager.addTask(
        new gdjs.evtTools.runtimeScene.WaitTask(1000),
        cb
      );
      cb.expectToNotHaveBeenCalled();
      timeManager.update(500, 0);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToNotHaveBeenCalled();
      timeManager.update(500, 0);
      cb.expectToNotHaveBeenCalled();
      asyncTasksManager.processTasks(runtimeScene);
      cb.expectToHaveBeenCalled();
    });
  });
})();
