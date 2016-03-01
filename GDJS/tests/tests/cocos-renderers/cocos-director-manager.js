
describe('gdjs.CocosDirectorManager', function() {
    var mockDirector = {
        scenes: [],
        pushSceneJustCalled: false,
        runScene: function(scene) {
            if (this.scenes.length !== 0) this.scenes.pop();
            this.scenes.push(scene);
            this.pushSceneJustCalled = false;
        },
        pushScene: function(scene) {
            this.scenes.push(scene);
            this.pushSceneJustCalled = true;
        },
        popScene: function() {
            this.scenes.pop();
        }
    }

    var mockScene1 = {};
    var mockScene2 = {};
    var mockScene3 = {};

    it('should support pushing a scene on the director', function() {
        var directorManager = new gdjs.CocosDirectorManager(mockDirector);

        expect(mockDirector.scenes.length).to.be(0);
        expect(mockDirector.pushSceneJustCalled).to.be(false);

        directorManager.onSceneLoaded(mockScene1);
        expect(mockDirector.scenes.length).to.be(1);
        expect(mockDirector.pushSceneJustCalled).to.be(false);

        directorManager.onSceneLoaded(mockScene2);
        expect(mockDirector.scenes.length).to.be(2);
        expect(mockDirector.pushSceneJustCalled).to.be(true);

        expect(directorManager.onSceneUnloaded.bind(directorManager, mockScene1))
            .to.throwError()
        expect(mockDirector.scenes.length).to.be(2);
        expect(mockDirector.scenes[0]).to.be(mockScene1);
        expect(mockDirector.scenes[1]).to.be(mockScene2);

        directorManager.onSceneUnloaded(mockScene2);
        expect(mockDirector.scenes.length).to.be(1);
        expect(mockDirector.scenes[0]).to.be(mockScene1);

        directorManager.onSceneUnloaded(mockScene1);
        expect(mockDirector.scenes.length).to.be(1);
        expect(mockDirector.scenes[0]).to.be(mockScene1);

        directorManager.onSceneLoaded(mockScene3);
        expect(mockDirector.scenes.length).to.be(1);
        expect(mockDirector.scenes[0]).to.be(mockScene3);

        expect(directorManager.onSceneUnloaded.bind(directorManager, mockScene1))
            .to.throwError()
    });
});
