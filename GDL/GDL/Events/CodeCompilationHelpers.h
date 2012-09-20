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
class Game;
namespace GDpriv
{
class SourceFile;
}

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
    boost::shared_ptr<CodeExecutionEngine> executionEngine; ///< The execution engine where the compiled code must be loaded

    EventsCodeCompilerPostWork(Game * game_, Scene * scene_, boost::shared_ptr<CodeExecutionEngine> executionEngine_) : game(game_), scene(scene_), executionEngine(executionEngine_) {};
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
    boost::shared_ptr<CodeExecutionEngine> executionEngine; ///< The execution engine where the compiled code must be loaded. Can be NULL.

    EventsCodeCompilerPreWork(Game * game_, Scene * scene_, boost::shared_ptr<CodeExecutionEngine> executionEngine_) : game(game_), scene(scene_), executionEngine(executionEngine_) {};
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

/**
 * \brief Class containing helper functions for using CodeCompiler
 * See CreateSceneEventsCompilationTask to automatically launch a compilation for a scene from the editor
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
     * \param file Source file to compil
     * \param scene If the task is related to the compilation of a scene, pass the scene as parameter. It will allow to stop the scene compilation if the source file compiled fail.
     */
    static void CreateExternalSourceFileCompilationTask(Game & game, GDpriv::SourceFile & file, Scene * scene = NULL);
};

#endif // CodeCompilationHelpers_H
#endif

