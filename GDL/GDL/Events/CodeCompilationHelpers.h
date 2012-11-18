/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef CodeCompilationHelpers_H
#define CodeCompilationHelpers_H

#include <map>
#include <string>
#include <iostream>
#include <vector>
#include <set>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
#include "GDL/IDE/CodeCompiler.h"
namespace gd {class ArbitraryResourceWorker;}
class CodeExecutionEngine;
class Scene;
class ExternalEvents;
class Game;
namespace GDpriv
{
class SourceFile;
}

/**
 * \brief Class containing helper functions for using CodeCompiler
 * See CreateSceneEventsCompilationTask to automatically launch a compilation for a scene from the editor
 *
 * 3 classes represents thing that can be compiled:
 * Scenes, as they provide the context to the events they own.
 * External source files, which can be used through C++ code events.
 * External events, which can be also compiled separately.
 */
class GD_API CodeCompilationHelpers
{
public:
    /**
     * Automatically create and submit a task to the code compiler for compiling scene events.
     * Compiled code is then loaded into scene CodeExecutionEngine.
     *
     * \param game Game associated with the scene
     * \param scene Scene with events to compile
     */
    static void CreateSceneEventsCompilationTask(Game & game, Scene & scene);

    /**
     * Automatically create and submit a task to the code compiler for compiling external source file
     *
     * \param game Game owning the source file. ( Used to add the game directory to headers directories list )
     * \param file Source file to compile
     * \param scene If the task is related to the compilation of a scene, pass the scene as parameter. It will allow to stop the scene compilation if the source file compiled fail.
     */
    static void CreateExternalSourceFileCompilationTask(Game & game, GDpriv::SourceFile & file, Scene * scene = NULL);

    /**
     * Automatically create and submit a task to the code compiler for compiling external events
     *
     * \param game Game owning the source file. ( Used to add the game directory to headers directories list )
     * \param events External events to compile.
     */
    static void CreateExternalEventsCompilationTask(Game & game, ExternalEvents & events);
};

/**
 * \brief Define the work to be done after events compilation
 *
 * This code compiler extra worker loads the generated bitcode file into the execution engine provided.
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API EventsCodeCompilerPostWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    Scene * scene;

    EventsCodeCompilerPostWork(Game * game_, Scene * scene_) : game(game_), scene(scene_) {};
    virtual ~EventsCodeCompilerPostWork() {};
};

/**
 * \brief Define the work to be done before events compilation
 *
 * This code compiler extra worker generates code from the scene events
 * and also set executionEngine as not ready
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API EventsCodeCompilerPreWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    Scene * scene;

    EventsCodeCompilerPreWork(Game * game_, Scene * scene_) : game(game_), scene(scene_) {};
    virtual ~EventsCodeCompilerPreWork() {};
};

/**
 * \brief Define the work to be done before events compilation.
 *
 * This code compiler extra worker generates code from the scene events for runtime
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API EventsCodeCompilerRuntimePreWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    Scene * scene;
    gd::ArbitraryResourceWorker & resourceWorker;

    EventsCodeCompilerRuntimePreWork(Game * game_, Scene * scene_, gd::ArbitraryResourceWorker & resourceWorker_) : game(game_), scene(scene_), resourceWorker(resourceWorker_) {};
    virtual ~EventsCodeCompilerRuntimePreWork() {};
};

/**
 * \brief Define the work to be done before external events compilation
 *
 * This code compiler extra worker generates code from the external events
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API ExternalEventsCodeCompilerPreWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    ExternalEvents * externalEvents;

    ExternalEventsCodeCompilerPreWork(Game * game_, ExternalEvents * events_) : game(game_), externalEvents(events_) {};
    virtual ~ExternalEventsCodeCompilerPreWork() {};
};

/**
 * \brief Define the work to be done before external events compilation
 *
 * This code compiler extra worker asks the scene using the external events compiled code to
 * reload its bitcode.
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API ExternalEventsCodeCompilerPostWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    ExternalEvents * externalEvents;

    ExternalEventsCodeCompilerPostWork(Game * game_, ExternalEvents * events_) : game(game_), externalEvents(events_) {};
    virtual ~ExternalEventsCodeCompilerPostWork() {};
};

/**
 * \brief Define the work to be done before external events compilation
 *
 * This code compiler extra worker generates code from the external events
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API ExternalEventsCodeCompilerRuntimePreWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Game * game;
    ExternalEvents * externalEvents;
    gd::ArbitraryResourceWorker & resourceWorker;

    ExternalEventsCodeCompilerRuntimePreWork(Game * game_, ExternalEvents * events_, gd::ArbitraryResourceWorker & resourceWorker_) : game(game_), externalEvents(events_), resourceWorker(resourceWorker_) {};
    virtual ~ExternalEventsCodeCompilerRuntimePreWork() {};
};

/**
 * \brief Define the work to be done after source file compilation
 *
 * This code compiler extra worker stops scene compilation if source file compilation failed.
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API SourceFileCodeCompilerPostWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    Scene * scene;

    SourceFileCodeCompilerPostWork(Scene * scene_) : scene(scene_) {};
    virtual ~SourceFileCodeCompilerPostWork() {};
};

#endif // CodeCompilationHelpers_H
#endif
