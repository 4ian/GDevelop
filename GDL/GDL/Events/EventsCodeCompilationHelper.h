/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EVENTSCODECOMPILATIONHELPER_H
#define EVENTSCODECOMPILATIONHELPER_H

#include <map>
#include <string>
#include <iostream>
#include <vector>
#include <set>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
#include "GDL/IDE/CodeCompiler.h"
class CodeExecutionEngine;
class Scene;
class Game;

/**
 * \brief Define the work to be done after events compilation
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
 * \brief Define the work to be done after events compilation
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
 * \brief Class containing helper functions for using CodeCompiler with scene events
 */
class GD_API EventsCodeCompilationHelper
{
public:
    /**
     * Automatically create and submit a task to the code compiler for compiling scene events
     */
    static void CreateSceneEventsCompilationTask(Game & game, Scene & scene);
};

#endif // EVENTSCODECOMPILATIONHELPER_H
#endif
