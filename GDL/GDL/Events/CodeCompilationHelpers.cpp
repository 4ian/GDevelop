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
#include "llvm/ADT/OwningPtr.h"
#include "llvm/Support/MemoryBuffer.h"
#include "llvm/Support/system_error.h"
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/datetime.h>

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDCore/Events/Event.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/IDE/BaseProfiler.h"
#include "GDL/CommonTools.h"
#include "GDL/SourceFile.h"

using namespace std;
using namespace GDpriv;

bool EventsCodeCompilerPreWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated scene or game." << std::endl;
        return false;
    }

    Game gameCopy = *game;
    Scene sceneCopy = *scene;
    if ( executionEngine != boost::shared_ptr<CodeExecutionEngine>() ) executionEngine->SetNotReady();

    cout << "Generating C++ code...\n";
    if ( sceneCopy.profiler != NULL ) sceneCopy.profiler->profileEventsInformation.clear();
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    sceneCopy.externalSourcesDependList.clear(); //Empty the list which will contains the source file used by the scene
    //Generate the code
    std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), false /*Compilation for edittime*/);
    scene->externalSourcesDependList = sceneCopy.externalSourcesDependList;

    //Check that every dependence of the scene is ready.
    for (unsigned int i = 0;i<scene->externalSourcesDependList.size();++i)
    {
        vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
            find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), scene->externalSourcesDependList[i]));

        if (sourceFile != game->externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
        {
            //Check if the source file need to be recompiled
            bool launchSourceFileCompilation = false;
            if ( !wxFileExists(string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString((*sourceFile).get())+"LLVMIR.bc") ))
                launchSourceFileCompilation = true;
            else
            {
                wxFileName sourceFileInfo((*sourceFile)->GetFileName() );
                sourceFileInfo.MakeAbsolute(wxFileName::FileName(game->GetProjectFile()).GetPath());

                if (!wxFileExists(sourceFileInfo.GetFullPath()))
                    launchSourceFileCompilation = true;
                else
                {
                    wxFileName bitcodeFileInfo(string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString((*sourceFile).get())+"LLVMIR.bc"));
                    if ( bitcodeFileInfo.GetModificationTime().GetTicks() < sourceFileInfo.GetModificationTime().GetTicks() )
                        launchSourceFileCompilation = true;
                }
            }

            if (launchSourceFileCompilation)
            {
                CodeCompilationHelpers::CreateExternalSourceFileCompilationTask(gameCopy, *(*sourceFile), scene);
                requestRelaunchCompilationLater = true; //The scene compilation has to be made when all its dependencies are compiled ( When the dependencies bitcode are available precisely ).
            }
        }
        else
        {
            std::cout << "WARNING: Source file used by the scene not found ("<<scene->externalSourcesDependList[i]<<").";
        }
    }

    //Write the generated code if the scene code will be really compiled.
    if ( !requestRelaunchCompilationLater )
    {
        std::ofstream myfile;
        myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"events.cpp").c_str() );
        myfile << eventsOutput;
        myfile.close();
    }

    return true;
}

bool EventsCodeCompilerRuntimePreWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated scene or game." << std::endl;
        return false;
    }

    Game gameCopy = *game;
    Scene sceneCopy = *scene;

    if ( sceneCopy.profiler != NULL ) sceneCopy.profiler->profileEventsInformation.clear();
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.GetEvents());
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.GetEvents());

    sceneCopy.externalSourcesDependList.clear(); //Empty the list which will contains the source file used by the scene
    //Generate the code
    std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.GetEvents(), true /*Compilation for runtime*/);
    scene->externalSourcesDependList = sceneCopy.externalSourcesDependList;

    //Check that every dependence of the scene is ready.
    for (unsigned int i = 0;i<scene->externalSourcesDependList.size();++i)
    {
        vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
            find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), scene->externalSourcesDependList[i]));

        if (sourceFile != game->externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
        {
            std::string file = string(CodeCompiler::GetInstance()->GetOutputDirectory()+"GDpriv"+ToString((*sourceFile).get())+".ir");

            //Check if the source file need to be recompiled
            bool launchSourceFileCompilation = false;
            if ( !wxFileExists(file))
                launchSourceFileCompilation = true;
            else
            {
                wxFileName sourceFileInfo((*sourceFile)->GetFileName() );
                wxFileName bitcodeFileInfo(file);
                if ( bitcodeFileInfo.GetModificationTime().GetTicks() < sourceFileInfo.GetModificationTime().GetTicks() )
                    launchSourceFileCompilation = true;
            }

            if (launchSourceFileCompilation)
            {
                CodeCompilerTask task;
                task.compilationForRuntime = true;
                task.optimize = false;
                task.eventsGeneratedCode = false;

                wxFileName inputFile((*sourceFile)->GetFileName());
                inputFile.MakeAbsolute(wxFileName::FileName(game->GetProjectFile()).GetPath());
                task.inputFile = ToString(inputFile.GetFullPath());
                task.outputFile = file;
                task.additionalHeaderDirectories.push_back(ToString(wxFileName::FileName(game->GetProjectFile()).GetPath()));
                task.scene = NULL;
                task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(scene));

                task.userFriendlyName = "Compilation of file "+task.inputFile;

                CodeCompiler::GetInstance()->AddTask(task);
            }
            resourceWorker.ExposeResource(file);
        }
        else
        {
            std::cout << "WARNING: Source file used by the scene not found ("<<scene->externalSourcesDependList[i]<<").";
        }

        scene->externalSourcesDependList[i] = "GDpriv"+ToString((*sourceFile).get())+".ir";
    }

    //Write the generated code if the scene code will be really compiled.
    if ( !requestRelaunchCompilationLater )
    {
        std::ofstream myfile;
        myfile.open ( string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"events.cpp").c_str() );
        myfile << eventsOutput;
        myfile.close();
    }

    return true;
}

bool EventsCodeCompilerPostWork::Execute()
{
    if ( scene == NULL )
    {
        std::cout << "WARNING: Cannot execute post task: No valid associated scene." << std::endl;
        return false;
    }
    if ( executionEngine == boost::shared_ptr<CodeExecutionEngine>() )
    {
        std::cout << "WARNING: Cannot execute post task: No valid CodeExecutionEngine." << std::endl;
        return false;
    }
    if ( !compilationSucceeded )
    {
        std::cout << "Scene compilation failed." << std::endl;
        return false;
    }

    std::vector < llvm::MemoryBuffer * > codeBuffers;

    //Open scene bitcode in a buffer
    llvm::OwningPtr<llvm::MemoryBuffer> codeBufferOPtr;
    llvm::error_code err = llvm::MemoryBuffer::getFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"LLVMIR.bc", codeBufferOPtr);
    if ( err.value() != 0 )
    {
        std::cout << "Failed to load "+CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"LLVMIR.bc: " << err.message() << std::endl << char(7);
        return false;
    }
    codeBuffers.push_back(codeBufferOPtr.take());

    //Also open scene dependencies' bitcode.
    for (unsigned int i = 0;i<scene->externalSourcesDependList.size();++i)
    {
        vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
            find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), scene->externalSourcesDependList[i]));

        if (sourceFile != game->externalSourceFiles.end() && *sourceFile != boost::shared_ptr<SourceFile>())
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
        }
        else
        {
            std::cout << "ERROR: Dependency bitcode used by the scene not found ("<<scene->externalSourcesDependList[i]<<").";
            return false;
        }
    }

    if ( !executionEngine->LoadFromLLVMBitCode(codeBuffers) )
    {
        cout << "Failed to load bitcode into executionEngine." << endl << char(7);
        return false;
    }

    //Make some clean up
    if ( CodeCompiler::GetInstance()->MustDeleteTemporaries() )
    {
        wxRemoveFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"LLVMIR.bc");
        wxRemoveFile(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(scene)+"events.cpp");
    }

    scene->SetCompilationNotNeeded();
    return true;
}

bool SourceFileCodeCompilerPostWork::Execute()
{
    if (!compilationSucceeded && scene != NULL)
    {
        CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(*scene);
        std::cout << "Compilation failed for a source file, scene compilation task removed." << std::endl;
    }

    return true;
}

void GD_API CodeCompilationHelpers::CreateSceneEventsCompilationTask(Game & game, Scene & scene)
{
    CodeCompilerTask task;
    task.compilationForRuntime = false;
    task.optimize = false;
    task.eventsGeneratedCode = true;
    task.inputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&scene)+"events.cpp");
    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&scene)+"LLVMIR.bc");
    task.scene = &scene;
    task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPreWork(&game, &scene, scene.codeExecutionEngine));
    task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPostWork(&game, &scene, scene.codeExecutionEngine));
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
    task.outputFile = string(CodeCompiler::GetInstance()->GetOutputDirectory()+ToString(&file)+"LLVMIR.bc");

    task.additionalHeaderDirectories.push_back(ToString(wxFileName::FileName(game.GetProjectFile()).GetPath()));
    task.scene = scene;
    if ( scene ) task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new SourceFileCodeCompilerPostWork(scene));

    task.userFriendlyName = "Compilation of file "+file.GetFileName();

    CodeCompiler::GetInstance()->AddTask(task);
}

#endif

