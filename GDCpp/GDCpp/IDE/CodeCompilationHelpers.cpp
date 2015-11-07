/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "CodeCompilationHelpers.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/datetime.h>

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCpp/Project/Layout.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Events/Event.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCpp/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCpp/CodeExecutionEngine.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/SceneNameMangler.h"
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCore/Project/SourceFile.h"

using namespace std;
using namespace gd;

//Tool functions
namespace
{
    bool SourceFileNeedRecompilation(gd::Project & game, SourceFile & sourceFile)
    {
        if ( !wxFileExists(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&sourceFile)+"ObjectFile.o") ))
            return true;
        else
        {
            wxFileName sourceFileInfo(sourceFile.GetFileName() );
            sourceFileInfo.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());

            if (!wxFileExists(sourceFileInfo.GetFullPath()))
                return true;
            else
            {
                wxFileName bitcodeFileInfo(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&sourceFile)+"ObjectFile.o"));
                if ( bitcodeFileInfo.GetModificationTime().GetTicks() < sourceFileInfo.GetModificationTime().GetTicks() )
                    return true;
            }
        }

        return false;
    }

    bool ExternalEventsNeedRecompilation(gd::Project & game, gd::ExternalEvents & events)
    {
        DependenciesAnalyzer analyzer(game, events);
        if ( analyzer.ExternalEventsCanBeCompiledForAScene().empty() )
            return false; //No need to recompile events as they cannot be compiled for any specific scene.

        if ( !wxFileExists(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"ObjectFile.o") ))
            return true;
        else
        {
            wxFileName bitcodeFileInfo(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"ObjectFile.o"));
            if ( bitcodeFileInfo.GetModificationTime().GetTicks() < events.GetLastChangeTimeStamp() )
                return true;
        }

        return false;
    }

    /**
     * Check each dependencies listed in a DependencyAnalyzer and make sure that they are compiled into bitcode.
     * If it is not the case, a compilation is requested and the function return false.
     *
     * \return true if each dependency is already compiled.
     */
    bool EnsureDependenciesAreOrWillBeCompiled(gd::Project & game, const DependenciesAnalyzer & analyzer, gd::Layout * optionalScene = NULL)
    {
        bool aDependencyIsNotCompiled = false;
        for (std::set<gd::String>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            if (!game.HasSourceFile(*i, "C++")) continue;
            gd::SourceFile & sourceFile = game.GetSourceFile(*i);

            if (SourceFileNeedRecompilation(game, sourceFile))
            {
                CodeCompilationHelpers::CreateExternalSourceFileCompilationTask(game, sourceFile, optionalScene);
                aDependencyIsNotCompiled = true;
            }
        }
        for (std::set<gd::String>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i))
            {
                if (ExternalEventsNeedRecompilation(game, game.GetExternalEvents(*i)))
                {
                    CodeCompilationHelpers::CreateExternalEventsCompilationTask(game, game.GetExternalEvents(*i));
                    aDependencyIsNotCompiled = true;
                }
            }
        }

        return !aDependencyIsNotCompiled;
    }

    bool EnsureDependenciesAreOrWillBeCompiledForRuntime(gd::Project & game, const DependenciesAnalyzer & analyzer, gd::Layout * optionalScene, gd::ArbitraryResourceWorker & resourceWorker)
    {
        bool aDependencyIsNotCompiled = false;
        for (std::set<gd::String>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            if (!game.HasSourceFile(*i, "C++")) continue;
            gd::SourceFile & sourceFile = game.GetSourceFile(*i);

            CodeCompilerTask task;
            task.compilerCall.compilationForRuntime = true;
            task.compilerCall.optimize = false;
            task.compilerCall.eventsGeneratedCode = false;

            wxFileName inputFile(sourceFile.GetFileName());
            inputFile.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());
            task.compilerCall.inputFile = inputFile.GetFullPath();
            task.compilerCall.outputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&sourceFile)+"RuntimeObjectFile.o");
            task.compilerCall.extraHeaderDirectories.push_back(wxFileName::FileName(game.GetProjectFile()).GetPath());
            task.scene = NULL;
            task.postWork = std::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(optionalScene));
            task.userFriendlyName = "Compilation of file "+task.compilerCall.inputFile;

            CodeCompiler::Get()->AddTask(task);
        }
        for (std::set<gd::String>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i))
            {
                gd::ExternalEvents & events = game.GetExternalEvents(*i);

                DependenciesAnalyzer analyzer(game, events);
                if ( !analyzer.ExternalEventsCanBeCompiledForAScene().empty() )
                {
                    CodeCompilerTask task;
                    task.compilerCall.compilationForRuntime = true;
                    task.compilerCall.optimize = false;
                    task.compilerCall.eventsGeneratedCode = true;

                    task.compilerCall.inputFile = CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"RuntimeEventsSource.cpp";
                    task.compilerCall.outputFile = CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"RuntimeObjectFile.o";
                    task.preWork = std::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerRuntimePreWork(&game, &events, resourceWorker));
                    task.userFriendlyName = "Compilation of external events "+events.GetName();

                    CodeCompiler::Get()->AddTask(task);
                }
            }
        }

        return !aDependencyIsNotCompiled;
    }

    /**
     * Automatically create and submit a task to the code compiler for linking scene events.
     * Compiled code is then loaded into scene CodeExecutionEngine.
     *
     * \param game Game associated with the scene
     * \param scene Scene with events to compile
     */
    void CreateSceneEventsLinkingTask(gd::Project & game, gd::Layout & scene)
    {
        std::cout << "Preparing linking task for scene " << scene.GetName() << "..." << std::endl;
        CodeCompilerTask task;
        task.compilerCall.link = true;
        task.compilerCall.compilationForRuntime = false;
        task.compilerCall.optimize = false;
        task.compilerCall.eventsGeneratedCode = true;
        task.compilerCall.inputFile = CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&scene)+"ObjectFile.o";
        task.compilerCall.outputFile = CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&scene)+"Code.dll";
        task.postWork = std::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerLinkingPostWork(&game, &scene));
        task.scene = &scene;
        task.userFriendlyName = "Linking code for scene "+scene.GetName();

        //Also add scene dependencies to the files to be linked.
        DependenciesAnalyzer analyzer(game, scene);
        if ( !analyzer.Analyze() )
        {
            std::cout << "WARNING: Circular dependency for scene " << scene.GetName() << std::endl;
        }

        for (std::set<gd::String>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            if (!game.HasSourceFile(*i, "C++")) continue;
            gd::SourceFile & sourceFile = game.GetSourceFile(*i);

            std::cout << "Added GD" << gd::String::From(&sourceFile) << "ObjectFile.o (Created from a Source file) to the linking." << std::endl;
            task.compilerCall.extraObjectFiles.push_back(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&sourceFile)+"ObjectFile.o");
        }
        for (std::set<gd::String>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if ( !game.HasExternalEventsNamed(*i) ) continue;

            DependenciesAnalyzer externalEventsAnalyzer(game, game.GetExternalEvents(*i));
            if (externalEventsAnalyzer.ExternalEventsCanBeCompiledForAScene() == scene.GetName())
            {
                gd::ExternalEvents & externalEvents = game.GetExternalEvents(*i);
                std::cout << "Added GD" << gd::String::From(&externalEvents) << "ObjectFile.o (Created from external events) to the linking." << std::endl;
                task.compilerCall.extraObjectFiles.push_back(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&externalEvents)+"ObjectFile.o");
            }
        }

        //Construct the list of the external shared libraries files to be used
        for (std::size_t i = 0;i<game.GetUsedExtensions().size();++i)
        {
            std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game.GetUsedExtensions()[i]);
            std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);
            if ( extension == std::shared_ptr<ExtensionBase>() ) continue;

            if ( wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetName()+".a") ||
                 wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetName()+".dll.a") ||
                 wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetName()+".dylib") )
                task.compilerCall.extraLibFiles.push_back(extension->GetName());

            for (std::size_t j =0;j<extension->GetSupplementaryLibFiles().size();++j)
            {
                if ( wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetSupplementaryLibFiles()[j]+".a") ||
                     wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetSupplementaryLibFiles()[j]+".dll.a") ||
                     wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+extension->GetSupplementaryLibFiles()[j]+".dylib"))
                    task.compilerCall.extraLibFiles.push_back(extension->GetSupplementaryLibFiles()[j]);
            }
        }

        CodeCompiler::Get()->AddTask(task);
    }
}

//Scene events workers
bool EventsCodeCompilerPreWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated scene or game." << std::endl;
        return false;
    }

    DependenciesAnalyzer analyzer(*game, *scene);
    if ( !analyzer.Analyze() )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for scene " << scene->GetName() << std::endl;
        return false;
    }

    //Bail out now if others task must be completed before:
    //The scene compilation has to be made when all its dependencies are compiled ( When the dependencies bitcode are available precisely ).
    if ( !EnsureDependenciesAreOrWillBeCompiled(*game, analyzer, scene) )
    {
        requestRelaunchCompilationLater = true;
        return true;
    }

    gd::Project gameCopy = *game;
    Scene sceneCopy = *scene;

    //Generate the code
    cout << "Generating C++ code...\n";
    if ( sceneCopy.GetProfiler() != NULL ) sceneCopy.GetProfiler()->profileEventsInformation.clear();
    gd::EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    gd::String eventsOutput = ::EventsCodeGenerator::GenerateSceneEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), false /*Compilation for edittime*/);
    std::ofstream myfile;
    myfile.open ( (CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(scene)+"EventsSource.cpp").ToLocale().c_str() );
    myfile << eventsOutput.c_str();
    myfile.close();

    return true;
}

bool EventsCodeCompilerRuntimePreWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated scene or game." << std::endl;
        return false;
    }

    DependenciesAnalyzer analyzer(*game, *scene);
    if ( !analyzer.Analyze() )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for scene " << scene->GetName() << std::endl;
        return false;
    }

    //Bail out now if others task must be completed before:
    //The scene compilation has to be made when all its dependencies are compiled ( When the dependencies bitcode are available precisely ).
    if ( !EnsureDependenciesAreOrWillBeCompiledForRuntime(*game, analyzer, scene, resourceWorker) )
    {
        requestRelaunchCompilationLater = true;
        return true;
    }

    gd::Project gameCopy = *game;
    Scene sceneCopy = *scene;

    //Generate the code
    cout << "Generating C++ code...\n";
    gd::EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    gd::String eventsOutput = ::EventsCodeGenerator::GenerateSceneEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), true /*Compilation for runtime*/);
    std::ofstream myfile;
    myfile.open ( gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(scene)+"RuntimeEventsSource.cpp").ToLocale().c_str() );
    myfile << eventsOutput.c_str();
    myfile.close();

    return true;
}

bool EventsCodeCompilerPostWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute post task: No valid associated scene or game." << std::endl;
        return false;
    }
    if ( !compilationSucceeded )
    {
        std::cout << "Scene compilation failed." << std::endl;
        return false;
    }

    CreateSceneEventsLinkingTask(*game, *scene);

    //Make some clean up
    if ( CodeCompiler::Get()->MustDeleteTemporaries() )
        wxRemoveFile(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(scene)+"EventsSource.cpp");

    //The final job will be made by EventsCodeCompilerLinkingPostWork

    return true;
}

bool EventsCodeCompilerLinkingPostWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute post task: No valid associated scene or game." << std::endl;
        return false;
    }
    if ( !compilationSucceeded || !wxFileExists(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(scene)+"Code.dll") )
    {
        std::cout << "Scene linking failed." << std::endl;
        return false;
    }

    scene->SetCompiledEventsFile(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(scene)+"Code.dll");
    scene->SetCompilationNotNeeded();
    return true;
}

//External source files workers
bool SourceFileCodeCompilerPostWork::Execute()
{
    if (!compilationSucceeded && scene != NULL)
    {
        CodeCompiler::Get()->RemovePendingTasksRelatedTo(*scene);
        std::cout << "Compilation failed for a source file, scene compilation task removed." << std::endl;
    }

    return true;
}

//External events workers
bool ExternalEventsCodeCompilerPreWork::Execute()
{
    if ( game == NULL || externalEvents == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated game or external events." << std::endl;
        return false;
    }

    DependenciesAnalyzer analyzer(*game, *externalEvents);
    if ( !analyzer.Analyze() )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for external events " << externalEvents->GetName() << std::endl;
        return false;
    }
    gd::String associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene();
    if ( associatedScene.empty() )
    {
        std::cout << "ERROR: Cannot compile an external event: No unique associated scene." << std::endl;
        return false;
    }

    //Bail out now if others task must be completed before:
    if ( !EnsureDependenciesAreOrWillBeCompiled(*game, analyzer) )
    {
        requestRelaunchCompilationLater = true;
        return true;
    }

    gd::Project gameCopy = *game;
    gd::ExternalEvents eventsCopy = *externalEvents;

    //Generate the code
    cout << "Generating C++ code...\n";
    gd::EventsCodeGenerator::DeleteUselessEvents(eventsCopy.GetEvents());

    gd::String eventsOutput = ::EventsCodeGenerator::GenerateExternalEventsCompleteCode(gameCopy, eventsCopy, false /*Compilation for edittime*/);
    std::ofstream myfile;
    myfile.open ( gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(externalEvents)+"EventsSource.cpp").ToLocale().c_str() );
    myfile << eventsOutput.c_str();
    myfile.close();

    return true;
}

bool ExternalEventsCodeCompilerPostWork::Execute()
{
    //Find the scene using the compiled external events and ask it
    //to reload its bitcodes
    DependenciesAnalyzer analyzer(*game, *externalEvents);
    gd::String associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene();
    if ( associatedScene.empty() || !game->HasLayoutNamed(associatedScene) )
    {
        std::cout << "ERROR: Unable to find the scene associated with external events "<< externalEvents->GetName()<<"!"<<std::endl;
        return false;
    }
    gd::Layout & scene = game->GetLayout(game->GetLayoutPosition(associatedScene));

    if ( !compilationSucceeded )
    {
        CodeCompiler::Get()->RemovePendingTasksRelatedTo(scene);
        std::cout << "Compilation failed for an external event, scene compilation task removed." << std::endl;
        return false;
    }

    if ( !scene.CompilationNeeded() ) //Check that a recompilation for the scene is NOT needed
                                      //If a recompilation is needed, the scene will relink objects files by itself at the end.
    {
        CreateSceneEventsLinkingTask(*game, scene);
    }

    return true;
}

bool ExternalEventsCodeCompilerRuntimePreWork::Execute()
{
    std::cout << "AVEC:" << externalEvents << std::endl;
    if ( game == NULL || externalEvents == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated game or external events." << std::endl;
        return false;
    }

    DependenciesAnalyzer analyzer(*game, *externalEvents);
    if ( !analyzer.Analyze() )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for external events " << externalEvents->GetName() << std::endl;
        return false;
    }
    gd::String associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene();
    if ( associatedScene.empty() )
    {
        std::cout << "ERROR: Cannot compile an external event: No unique associated scene." << std::endl;
        return false;
    }

    //Bail out now if others task must be completed before:
    if ( !EnsureDependenciesAreOrWillBeCompiledForRuntime(*game, analyzer, NULL, resourceWorker) )
    {
        requestRelaunchCompilationLater = true;
        return true;
    }

    gd::Project gameCopy = *game;
    gd::ExternalEvents eventsCopy = *externalEvents;

    //Generate the code
    cout << "Generating C++ code...\n";
    gd::EventsCodeGenerator::DeleteUselessEvents(eventsCopy.GetEvents());

    gd::String eventsOutput = ::EventsCodeGenerator::GenerateExternalEventsCompleteCode(gameCopy, eventsCopy, true /*Compilation for runtime*/);
    std::ofstream myfile;
    myfile.open ( gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(externalEvents)+"RuntimeEventsSource.cpp").ToLocale().c_str() );
    myfile << eventsOutput.c_str();
    myfile.close();

    return true;
}

void GD_API CodeCompilationHelpers::CreateSceneEventsCompilationTask(gd::Project & game, gd::Layout & scene)
{
    CodeCompilerTask task;
    task.compilerCall.compilationForRuntime = false;
    task.compilerCall.optimize = false;
    task.compilerCall.eventsGeneratedCode = true;
    task.compilerCall.inputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&scene)+"EventsSource.cpp");
    task.compilerCall.outputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&scene)+"ObjectFile.o");
    task.scene = &scene;
    task.preWork = std::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPreWork(&game, &scene));
    task.postWork = std::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPostWork(&game, &scene));
    task.userFriendlyName = "Compilation of events of scene "+scene.GetName();

    CodeCompiler::Get()->AddTask(task);
}

void GD_API CodeCompilationHelpers::CreateExternalSourceFileCompilationTask(gd::Project & game, SourceFile & file, gd::Layout * scene)
{
    CodeCompilerTask task;

    wxFileName inputFile(file.GetFileName());
    inputFile.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());
    task.compilerCall.inputFile = inputFile.GetFullPath();
    task.compilerCall.outputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&file)+"ObjectFile.o");
    task.compilerCall.compilationForRuntime = false;
    task.compilerCall.optimize = false;
    task.compilerCall.eventsGeneratedCode = false;
    task.compilerCall.extraHeaderDirectories.push_back(wxFileName::FileName(game.GetProjectFile()).GetPath());

    task.scene = scene;
    if ( scene ) task.postWork = std::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(scene));

    task.userFriendlyName = "Compilation of file "+file.GetFileName();

    CodeCompiler::Get()->AddTask(task);
}

void  GD_API CodeCompilationHelpers::CreateExternalEventsCompilationTask(gd::Project & game, gd::ExternalEvents & events)
{
    CodeCompilerTask task;
    task.compilerCall.compilationForRuntime = false;
    task.compilerCall.optimize = false;
    task.compilerCall.eventsGeneratedCode = true;
    task.compilerCall.inputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"EventsSource.cpp");
    task.compilerCall.outputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&events)+"ObjectFile.o");

    task.preWork = std::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerPreWork(&game, &events));
    task.postWork = std::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerPostWork(&game, &events));
    task.userFriendlyName = "Compilation of external events "+events.GetName();

    CodeCompiler::Get()->AddTask(task);
}

#endif
