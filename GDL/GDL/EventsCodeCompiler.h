/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EVENTSCODECOMPILER_H
#define EVENTSCODECOMPILER_H

#include <map>
#include <string>
#include <iostream>
#include <vector>
#include <set>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
class EventsExecutionEngine;
class Scene;
class Game;

/**
 * \brief Launch and manage events compilation tasks.
 */
class GD_API EventsCodeCompiler
{
public:
    class Task; //Definition below
    void EventsCompilationNeeded(Task task);

    /**
     * Tell the compiler the events of the scene can be compiled:
     * ( Compiler can launch at this moment a pending task )
     */
    void EnableCompilation(Scene & scene);

    /**
     * Tell the compiler to not attempt to compile anything.
     * However, if a compilation is currently run, it will not stop:
     * That is why the scene has to wait until SceneEventsBeingCompiled return false.
     */
    void DisableCompilation(Scene & scene);

    /**
     * Return true if thread is compiling a scene's events.
     * -> In this case, scenes must not try to launch runtime scenes.
     */
    bool EventsBeingCompiled();

    /**
     * Return true if thread is ( or is going to ) compiling scene's events.
     */
    bool SceneEventsBeingCompiled(const Scene & scene);

    /**
     * A directory where headers can be found
     */
    void AddHeaderDirectory(std::string dir) { headersDirectories.insert(dir); }

    /**
     * Return a set containing pointers to scene with events which cannot be compiled for now
     */
    std::vector<Scene*> GetSceneWithCompilationDisallowed() const { return compilationDisallowed; }

    void NotifyASceneIsDestroyed(const Scene & scene);

    /**
     * Describe to compiler what is needed
     */
    class Task
    {
    public:
        Task(Game * game_, Scene* scene_) : game(game_), scene(scene_), compilationForRuntime(false), generateBitcodeFileOnly(false) {}

        Game * game;
        Scene * scene;

        bool compilationForRuntime;
        bool generateBitcodeFileOnly; ///< Please provide a bitcode filename if generateBitcodeFileOnly is set to true
        std::string bitCodeFilename; ///< Fill this string if generateBitcodeFileOnly is set to true
    };

    static EventsCodeCompiler * GetInstance()
    {
        if ( NULL == _singleton )
            _singleton = new EventsCodeCompiler;

        return ( static_cast<EventsCodeCompiler*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

    static sf::Mutex openSaveDialogMutex; ///< wxWidgets Open/Save dialog seems to cause crash when writing bitcode at the same time.

private:

    class Worker
    {
    public:
        Worker(Task task_) :
            abort(false),
            workEnded(false),
            task(task_),
            thread(&EventsCodeCompiler::Worker::DoCompleteCompilation, this)
        {
        }
        virtual ~Worker() {};

        void SetTask(Task task_) { task = task_; }

        void Launch() { thread.Launch(); }
        const Scene* GetScene() { return task.scene; }

        bool abort;
        bool workEnded;

    private:
        Task task;
        sf::Thread thread;
        void DoCompleteCompilation();
    };
    friend class Worker;

    /**
     * Compile C++ events file to bitcode file.
     */
    bool CompileEventsCppFileToBitCode(std::string eventsFile, std::string bitCodeFile, bool compilationForRuntime);

    void AddPendingTask(const Task & task);

    boost::shared_ptr<Worker> currentTask; ///< Compilation currently made.
    std::vector < Task > pendingTasks; ///< Compilation task waiting to be launched.
    std::vector < Scene* > compilationDisallowed; ///< List of scenes which disallow their events to be compiled. (However, if a compilation is being made, it will not be stopped)

    std::set<std::string> headersDirectories;
    sf::Mutex mutex;

    EventsCodeCompiler();
    virtual ~EventsCodeCompiler();
    static EventsCodeCompiler *_singleton;
};

#endif // EVENTSCODECOMPILER_H
#endif
