#if defined(GD_IDE_ONLY)

#ifndef EVENTSCODECOMPILER_H
#define EVENTSCODECOMPILER_H
#include <map>
#include <string>
#include <iostream>
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
    void EventsCompilationNeeded(Game & game, Scene & scene);

    void NotifyASceneIsDestroyed(const Scene & scene);

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
private:

    class Worker
    {
    public:
        Worker(Game & game_, Scene & scene_) :
            abort(false),
            workEnded(false),
            game(game_),
            scene(scene_),
            thread(&EventsCodeCompiler::Worker::DoCompleteCompilation, this)
        {
        }
        virtual ~Worker() {};

        void Launch() { thread.Launch(); }
        const Scene& GetScene() { return scene; }

        bool abort;
        bool workEnded;

    private:
        Game & game;
        Scene & scene;
        sf::Thread thread;
        void DoCompleteCompilation();
    };

    /**
     * Compile C++ events file to bitcode file.
     */
    static bool CompileEventsCppFileToBitCode(std::string eventsFile, std::string bitCodeFile);

    std::map <Scene*, boost::shared_ptr<Worker> > currentTasks;

    static sf::Mutex mutexPreventingSceneDestruction;

    friend class Worker;
    EventsCodeCompiler();
    virtual ~EventsCodeCompiler();
    static EventsCodeCompiler *_singleton;
};

#endif // EVENTSCODECOMPILER_H
#endif
