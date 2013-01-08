/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "CodeCompilationHelpers.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/datetime.h>

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/ExternalEvents.h"
#include "GDCore/Events/Event.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/IDE/DependenciesAnalyzer.h"
#include "GDL/IDE/BaseProfiler.h"
#include "GDL/CommonTools.h"
#include "GDL/SceneNameMangler.h"
#include "GDL/SourceFile.h"

using namespace std;
using namespace GDpriv;

//Tool functions
namespace
{
    bool SourceFileNeedRecompilation(Game & game, SourceFile & sourceFile)
    {
        if ( !wxFileExists(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&sourceFile)+"ObjectFile.o") ))
            return true;
        else
        {
            wxFileName sourceFileInfo(sourceFile.GetFileName() );
            sourceFileInfo.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());

            if (!wxFileExists(sourceFileInfo.GetFullPath()))
                return true;
            else
            {
                wxFileName bitcodeFileInfo(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&sourceFile)+"ObjectFile.o"));
                if ( bitcodeFileInfo.GetModificationTime().GetTicks() < sourceFileInfo.GetModificationTime().GetTicks() )
                    return true;
            }
        }

        return false;
    }

    bool ExternalEventsNeedRecompilation(Game & game, ExternalEvents & events)
    {
        DependenciesAnalyzer analyzer(game);
        if ( analyzer.ExternalEventsCanBeCompiledForAScene(events.GetName()).empty() )
            return false; //No need to recompile events as they cannot be compiled for any specific scene.

        if ( !wxFileExists(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&events)+"ObjectFile.o") ))
            return true;
        else
        {
            wxFileName bitcodeFileInfo(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&events)+"ObjectFile.o"));
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
    bool EnsureDependenciesAreOrWillBeCompiled(Game & game, const DependenciesAnalyzer & analyzer, Scene * optionalScene = NULL)
    {
        bool aDependencyIsNotCompiled = false;
        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
                find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), *i));

            if (sourceFile != game.externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
            {
                if (SourceFileNeedRecompilation(game, *(*sourceFile)))
                {
                    CodeCompilationHelpers::CreateExternalSourceFileCompilationTask(game, *(*sourceFile), optionalScene);
                    aDependencyIsNotCompiled = true;
                }
            }
            else
            {
                std::cout << "WARNING: Source file not found:" << *i <<".";
            }
        }
        for (std::set<std::string>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i))
            {
                boost::shared_ptr<ExternalEvents> externalEvents = game.GetExternalEvents()[game.GetExternalEventsPosition(*i)];
                if (ExternalEventsNeedRecompilation(game, *externalEvents))
                {
                    CodeCompilationHelpers::CreateExternalEventsCompilationTask(game, *externalEvents);
                    aDependencyIsNotCompiled = true;
                }
            }
        }

        return !aDependencyIsNotCompiled;
    }

    bool EnsureDependenciesAreOrWillBeCompiledForRuntime(Game & game, const DependenciesAnalyzer & analyzer, Scene * optionalScene, gd::ArbitraryResourceWorker & resourceWorker)
    {
        bool aDependencyIsNotCompiled = false;
        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
                find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), *i));

            if (sourceFile != game.externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
            {
                CodeCompilerTask task;
                task.compilationForRuntime = true;
                task.optimize = false;
                task.eventsGeneratedCode = false;

                wxFileName inputFile((*sourceFile)->GetFileName());
                inputFile.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());
                task.inputFile = ToString(inputFile.GetFullPath());
                task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDpriv"+ToString((*sourceFile).get())+".ir");
                task.additionalHeaderDirectories.push_back(ToString(wxFileName::FileName(game.GetProjectFile()).GetPath()));
                task.scene = NULL;
                task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(optionalScene));
                task.userFriendlyName = "Compilation of file "+task.inputFile;

                std::string outputFile = task.outputFile; //Be careful, we need to do a copy as ExposeResource will modify the string
                resourceWorker.ExposeResource(outputFile);

                CodeCompiler::GetInstance()->AddTask(task);
            }
            else
            {
                std::cout << "WARNING: Source file not found:" << *i <<".";
            }
        }
        for (std::set<std::string>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i))
            {
                boost::shared_ptr<ExternalEvents> events = game.GetExternalEvents()[game.GetExternalEventsPosition(*i)];

                DependenciesAnalyzer analyzer(game);
                if ( !analyzer.ExternalEventsCanBeCompiledForAScene(events->GetName()).empty() )
                {
                    CodeCompilerTask task;
                    task.compilationForRuntime = true;
                    task.optimize = false;
                    task.eventsGeneratedCode = true;
                    task.inputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDPriv"+ToString(events.get())+".cpp");
                    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDPriv"+ToString(events.get())+".ir");
                    task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerRuntimePreWork(&game, events.get(), resourceWorker));
                    task.userFriendlyName = "Compilation of external events "+events->GetName();

                    std::string outputFile = task.outputFile; //Be careful, we need to do a copy as ExposeResource will modify the string
                    resourceWorker.ExposeResource(outputFile);

                    CodeCompiler::GetInstance()->AddTask(task);
                }
            }
        }

        return !aDependencyIsNotCompiled;
    }

    /**
     * Load the bitcode of a scene and its dependencies into the execution engine of the scene.
     *
     * \return true if execution engine of the scene is properly setup.
     */
    /*bool LoadSceneBitCodes(Game & game, Scene & scene)
    {
        std::vector < llvm::MemoryBuffer * > codeBuffers;

        //Open scene bitcode in a buffer
        llvm::OwningPtr<llvm::MemoryBuffer> codeBufferOPtr;
        llvm::error_code err = llvm::MemoryBuffer::getFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&scene)+"LLVMIR.bc", codeBufferOPtr);
        if ( err.value() != 0 )
        {
            std::cout << "Failed to load "+CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&scene)+"LLVMIR.bc: " << err.message() << std::endl << char(7);
            return false;
        }
        codeBuffers.push_back(codeBufferOPtr.take());

        //Also open scene dependencies' bitcode.
        DependenciesAnalyzer analyzer(game);
        analyzer.Analyze(scene.GetEvents());

        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
                find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), *i));

            if (sourceFile != game.externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
            {
                llvm::OwningPtr<llvm::MemoryBuffer> codeBufferOPtr;
                llvm::error_code err = llvm::MemoryBuffer::getFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString((*sourceFile).get())+"LLVMIR.bc", codeBufferOPtr);
                if ( err.value() != 0 )
                {
                    std::cout << "Failed to load "+CodeCompiler::GetInstance()->GetOutputDirectory()+ToString((*sourceFile).get())+"LLVMIR.bc: " << err.message() << std::endl << char(7);

                    for (unsigned int j = 0;j<codeBuffers.size();++j) delete codeBuffers[j];
                    return false;
                }
                codeBuffers.push_back(codeBufferOPtr.take());
                std::cout << "Loaded " << ToString((*sourceFile).get())+"LLVMIR.bc (Source file bitcode) " << std::endl;
            }
            else
            {
                std::cout << "ERROR: Dependency bitcode used by the scene not found ("<<*i<<").";
                return false;
            }
        }
        for (std::set<std::string>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i) && analyzer.ExternalEventsCanBeCompiledForAScene(*i) == scene.GetName())
            {
                ExternalEvents & externalEvents = game.GetExternalEvents(*i);

                llvm::OwningPtr<llvm::MemoryBuffer> codeBufferOPtr;
                llvm::error_code err = llvm::MemoryBuffer::getFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&externalEvents)+"LLVMIR.bc", codeBufferOPtr);
                if ( err.value() != 0 )
                {
                    std::cout << "Failed to load "+CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&externalEvents)+"LLVMIR.bc: " << err.message() << std::endl << char(7);

                    for (unsigned int j = 0;j<codeBuffers.size();++j) delete codeBuffers[j];
                    return false;
                }
                codeBuffers.push_back(codeBufferOPtr.take());
                std::cout << "Loaded " << ToString(&externalEvents)+"LLVMIR.bc (External events bitcode) " << std::endl;
            }
        }

        if ( !scene.GetCodeExecutionEngine()->LoadFromLLVMBitCode(codeBuffers, "GDSceneEvents"+SceneNameMangler::GetMangledSceneName(scene.GetName())) )
        {
            cout << "Failed to load bitcode into executionEngine." << endl << char(7);
            return false;
        }

        return true;
    }*/

    /**
     * Automatically create and submit a task to the code compiler for linking scene events.
     * Compiled code is then loaded into scene CodeExecutionEngine.
     *
     * \param game Game associated with the scene
     * \param scene Scene with events to compile
     */
    void CreateSceneEventsLinkingTask(Game & game, Scene & scene)
    {
        std::cout << "Preparing linking task for scene " << scene.GetName() << "..." << std::endl;
        CodeCompilerTask task;
        task.link = true;
        task.compilationForRuntime = false;
        task.optimize = false;
        task.eventsGeneratedCode = true;
        task.inputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&scene)+"ObjectFile.o");
        task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&scene)+"Code.dll");
        task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerLinkingPostWork(&game, &scene));
        task.scene = &scene;
        task.userFriendlyName = "Linking code for scene "+scene.GetName();

        //Also add scene dependencies to the files to be linked.
        DependenciesAnalyzer analyzer(game);
        analyzer.Analyze(scene.GetEvents());

        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
                find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), *i));

            if (sourceFile != game.externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
            {
                std::cout << "Added " << ToString((*sourceFile).get()) << "ObjectFile.o (Created from a Source file) to the linking." << std::endl;
                task.extraObjectFiles.push_back(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString((*sourceFile).get())+"ObjectFile.o"));
            }
        }
        for (std::set<std::string>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i) && analyzer.ExternalEventsCanBeCompiledForAScene(*i) == scene.GetName())
            {
                ExternalEvents & externalEvents = game.GetExternalEvents(*i);
                std::cout << "Added " << ToString(&externalEvents) << "ObjectFile.o (Created from external events) to the linking." << std::endl;
                task.extraObjectFiles.push_back(string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&externalEvents)+"ObjectFile.o"));
            }
        }

        //Construct the list of the external shared libraries files to be used
        for (unsigned int i = 0;i<game.GetUsedPlatformExtensions().size();++i)
        {
            if ( wxFileExists(CodeCompiler::GetInstance()->GetBaseDirectory()+"CppPlatform/Extensions/"+"lib"+game.GetUsedPlatformExtensions()[i]+".a") )
                task.extraLibFiles.push_back(game.GetUsedPlatformExtensions()[i]);
        }

        CodeCompiler::GetInstance()->AddTask(task);
    }

    /**
     * Register in a scene the bitcode filenames it depends on.
     */
    void RegisterSceneBitCodesFilenamesForRuntime(Game & game, Scene & scene)
    {
        scene.GetExternalBitCodeDependList().clear();
        DependenciesAnalyzer analyzer(game);
        analyzer.Analyze(scene.GetEvents());

        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
                find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), *i));

            if (sourceFile != game.externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
                scene.GetExternalBitCodeDependList().push_back("GDPriv"+ToString((*sourceFile).get())+".ir");
            else
            {
                std::cout << "ERROR: Dependency bitcode used by the scene not found ("<<*i<<").";
            }
        }
        for (std::set<std::string>::const_iterator i = analyzer.GetExternalEventsDependencies().begin();i!=analyzer.GetExternalEventsDependencies().end();++i)
        {
            if (game.HasExternalEventsNamed(*i) && analyzer.ExternalEventsCanBeCompiledForAScene(*i) == scene.GetName())
            {
                ExternalEvents & externalEvents = game.GetExternalEvents(*i);
                scene.GetExternalBitCodeDependList().push_back("GDPriv"+ToString(&externalEvents)+".ir");
            }
        }

        return;
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

    DependenciesAnalyzer analyzer(*game);
    if ( !analyzer.Analyze(scene->GetEvents()) )
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

    Game gameCopy = *game;
    Scene sceneCopy = *scene;
    if ( scene->GetCodeExecutionEngine() != boost::shared_ptr<CodeExecutionEngine>() ) scene->GetCodeExecutionEngine()->Unload();

    //Generate the code
    cout << "Generating C++ code...\n";
    if ( sceneCopy.GetProfiler() != NULL ) sceneCopy.GetProfiler()->profileEventsInformation.clear();
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), false /*Compilation for edittime*/);
    std::ofstream myfile;
    myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(scene)+"EventsSource.cpp").c_str() );
    myfile << eventsOutput;
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

    DependenciesAnalyzer analyzer(*game);
    if ( !analyzer.Analyze(scene->GetEvents()) )
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

    Game gameCopy = *game;
    Scene sceneCopy = *scene;

    //Generate the code
    cout << "Generating C++ code...\n";
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), true /*Compilation for runtime*/);
    std::ofstream myfile;
    myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDPriv"+ToString(scene)+".cpp").c_str() );
    myfile << eventsOutput;
    myfile.close();

    RegisterSceneBitCodesFilenamesForRuntime(*game, *scene);

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
    if ( CodeCompiler::GetInstance()->MustDeleteTemporaries() )
    {
        wxRemoveFile(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(scene)+"ObjectFile.o");
        wxRemoveFile(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(scene)+"EventsSource.cpp");
    }

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
    if ( !compilationSucceeded )
    {
        std::cout << "Scene linking failed." << std::endl;
        return false;
    }

    if ( !scene->GetCodeExecutionEngine()->LoadFromDynamicLibrary(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(scene)+"Code.dll",
                                                                  "GDSceneEvents"+SceneNameMangler::GetMangledSceneName(scene->GetName())) )
        return false;

    scene->SetCompilationNotNeeded();
    return true;
}

//External source files workers
bool SourceFileCodeCompilerPostWork::Execute()
{
    if (!compilationSucceeded && scene != NULL)
    {
        CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(*scene);
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

    DependenciesAnalyzer analyzer(*game);
    if ( !analyzer.Analyze(externalEvents->GetEvents()) )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for external events " << externalEvents->GetName() << std::endl;
        return false;
    }
    std::string associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene(externalEvents->GetName());
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

    Game gameCopy = *game;
    Scene sceneCopy = *game->GetLayouts()[game->GetLayoutPosition(associatedScene)];

    //Generate the code
    cout << "Generating C++ code...\n";
    if ( sceneCopy.GetProfiler() != NULL ) sceneCopy.GetProfiler()->profileEventsInformation.clear();
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(externalEvents->GetEvents());

    std::string eventsOutput = EventsCodeGenerator::GenerateExternalEventsCompleteCode(gameCopy, *externalEvents, false /*Compilation for edittime*/);
    std::ofstream myfile;
    myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(externalEvents)+"EventsSource.cpp").c_str() );
    myfile << eventsOutput;
    myfile.close();

    return true;
}

bool ExternalEventsCodeCompilerPostWork::Execute()
{
    //Find the scene using the compiled external events and ask it
    //to reload its bitcodes
    DependenciesAnalyzer analyzer(*game);
    std::string associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene(externalEvents->GetName());
    if ( associatedScene.empty() || !game->HasLayoutNamed(associatedScene) )
    {
        std::cout << "ERROR: Unable to find the scene associated with external events "<< externalEvents->GetName()<<"!"<<std::endl;
        return false;
    }
    Scene & scene = *game->GetLayouts()[game->GetLayoutPosition(associatedScene)];

    if ( !compilationSucceeded )
    {
        CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(scene);
        std::cout << "Compilation failed for an external event, scene compilation task removed." << std::endl;
        return false;
    }

    if ( !scene.CompilationNeeded() ) //Check that a recompilation for the scene is NOT needed
                                      //If a recompilation is needed, the scene will relink objects files by itself at the end.
    {
        if ( scene.GetCodeExecutionEngine() != boost::shared_ptr<CodeExecutionEngine>() ) scene.GetCodeExecutionEngine()->Unload();
        CreateSceneEventsLinkingTask(*game, scene);
    }

    return true;
}

bool ExternalEventsCodeCompilerRuntimePreWork::Execute()
{
    if ( game == NULL || externalEvents == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated game or external events." << std::endl;
        return false;
    }

    DependenciesAnalyzer analyzer(*game);
    if ( !analyzer.Analyze(externalEvents->GetEvents()) )
    {
        //Circular dependency exists
        std::cout << "WARNING: Circular dependency for external events " << externalEvents->GetName() << std::endl;
        return false;
    }
    std::string associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene(externalEvents->GetName());
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

    Game gameCopy = *game;
    Scene sceneCopy = *game->GetLayouts()[game->GetLayoutPosition(associatedScene)];

    //Generate the code
    cout << "Generating C++ code...\n";
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(externalEvents->GetEvents());

    std::string eventsOutput = EventsCodeGenerator::GenerateExternalEventsCompleteCode(gameCopy, *externalEvents, true /*Compilation for runtime*/);
    std::ofstream myfile;
    myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDPriv"+ToString(externalEvents)+".cpp").c_str() );
    myfile << eventsOutput;
    myfile.close();

    return true;
}

void GD_API CodeCompilationHelpers::CreateSceneEventsCompilationTask(Game & game, Scene & scene)
{
    CodeCompilerTask task;
    task.compilationForRuntime = false;
    task.optimize = false;
    task.eventsGeneratedCode = true;
    task.inputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&scene)+"EventsSource.cpp");
    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&scene)+"ObjectFile.o");
    task.scene = &scene;
    task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPreWork(&game, &scene));
    task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPostWork(&game, &scene));
    task.userFriendlyName = "Compilation of events of scene "+scene.GetName();

    CodeCompiler::GetInstance()->AddTask(task);
}

void GD_API CodeCompilationHelpers::CreateExternalSourceFileCompilationTask(Game & game, SourceFile & file, Scene * scene)
{
    CodeCompilerTask task;
    task.compilationForRuntime = false;
    task.optimize = false;
    task.eventsGeneratedCode = false;

    wxFileName inputFile(file.GetFileName());
    inputFile.MakeAbsolute(wxFileName::FileName(game.GetProjectFile()).GetPath());
    task.inputFile = ToString(inputFile.GetFullPath());
    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&file)+"ObjectFile.o");

    task.additionalHeaderDirectories.push_back(ToString(wxFileName::FileName(game.GetProjectFile()).GetPath()));
    task.scene = scene;
    if ( scene ) task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(scene));

    task.userFriendlyName = "Compilation of file "+file.GetFileName();

    CodeCompiler::GetInstance()->AddTask(task);
}

void  GD_API CodeCompilationHelpers::CreateExternalEventsCompilationTask(Game & game, ExternalEvents & events)
{
    CodeCompilerTask task;
    task.compilationForRuntime = false;
    task.optimize = false;
    task.eventsGeneratedCode = true;
    task.inputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&events)+"EventsSource.cpp");
    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(&events)+"ObjectFile.o");
    task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerPreWork(&game, &events));
    task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new ExternalEventsCodeCompilerPostWork(&game, &events));
    task.userFriendlyName = "Compilation of external events "+events.GetName();

    CodeCompiler::GetInstance()->AddTask(task);
}

#endif
