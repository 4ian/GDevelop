/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef CodeCompilationHelpers_H
#define CodeCompilationHelpers_H

#include <map>
#include <string>
#include "GDCpp/Runtime/String.h"
#include <iostream>
#include <vector>
#include <set>
#include <memory>
#include <SFML/System.hpp>
#include "GDCpp/IDE/CodeCompiler.h"
namespace gd {class ArbitraryResourceWorker;}
class CodeExecutionEngine;
namespace gd { class Layout; }
namespace gd { class SourceFile; }
namespace gd { class ExternalEvents; }
namespace gd { class Project; }

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
    static void CreateSceneEventsCompilationTask(gd::Project & game, gd::Layout & scene);

    /**
     * Automatically create and submit a task to the code compiler for compiling external source file
     *
     * \param game Game owning the source file. ( Used to add the game directory to headers directories list )
     * \param file Source file to compile
     * \param scene If the task is related to the compilation of a scene, pass the scene as parameter. It will allow to stop the scene compilation if the source file compiled fail.
     */
    static void CreateExternalSourceFileCompilationTask(gd::Project & game, gd::SourceFile & file, gd::Layout * scene = NULL);

    /**
     * Automatically create and submit a task to the code compiler for compiling external events
     *
     * \param game Game owning the source file. ( Used to add the game directory to headers directories list )
     * \param events External events to compile.
     */
    static void CreateExternalEventsCompilationTask(gd::Project & game, gd::ExternalEvents & events);
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

    gd::Project * game;
    gd::Layout * scene;

    EventsCodeCompilerPostWork(gd::Project * game_, gd::Layout * scene_) : game(game_), scene(scene_) {};
    virtual ~EventsCodeCompilerPostWork() {};
};

/**
 * \brief Define the work to be done after events linking
 *
 * This code compiler extra worker loads the generated code into the execution engine of the scene.
 *
 * \see CodeCompiler
 * \see CodeCompilerExtraWork
 */
class GD_API EventsCodeCompilerLinkingPostWork : public CodeCompilerExtraWork
{
public:
    virtual bool Execute();

    gd::Project * game;
    gd::Layout * scene;

    EventsCodeCompilerLinkingPostWork(gd::Project * game_, gd::Layout * scene_) : game(game_), scene(scene_) {};
    virtual ~EventsCodeCompilerLinkingPostWork() {};
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

    gd::Project * game;
    gd::Layout * scene;

    EventsCodeCompilerPreWork(gd::Project * game_, gd::Layout * scene_) : game(game_), scene(scene_) {};
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

    gd::Project * game;
    gd::Layout * scene;
    gd::ArbitraryResourceWorker & resourceWorker;

    EventsCodeCompilerRuntimePreWork(gd::Project * game_, gd::Layout * scene_, gd::ArbitraryResourceWorker & resourceWorker_) : game(game_), scene(scene_), resourceWorker(resourceWorker_) {};
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

    gd::Project * game;
    gd::ExternalEvents * externalEvents;

    ExternalEventsCodeCompilerPreWork(gd::Project * game_, gd::ExternalEvents * events_) : game(game_), externalEvents(events_) {};
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

    gd::Project * game;
    gd::ExternalEvents * externalEvents;

    ExternalEventsCodeCompilerPostWork(gd::Project * game_, gd::ExternalEvents * events_) : game(game_), externalEvents(events_) {};
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

    gd::Project * game;
    gd::ExternalEvents * externalEvents;
    gd::ArbitraryResourceWorker & resourceWorker;

    ExternalEventsCodeCompilerRuntimePreWork(gd::Project * game_, gd::ExternalEvents * events_, gd::ArbitraryResourceWorker & resourceWorker_) : game(game_), externalEvents(events_), resourceWorker(resourceWorker_) {};
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

    gd::Layout * scene;

    SourceFileCodeCompilerPostWork(gd::Layout * scene_) : scene(scene_) {};
    virtual ~SourceFileCodeCompilerPostWork() {};
};

#endif // CodeCompilationHelpers_H
#endif
