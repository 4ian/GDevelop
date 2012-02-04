/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "EventsCodeCompilationHelper.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filefn.h>
#include "llvm/ADT/OwningPtr.h"
#include "llvm/Support/MemoryBuffer.h"
#include "llvm/Support/system_error.h"

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Event.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/EventsExecutionEngine.h"
#include "GDL/IDE/BaseProfiler.h"
#include "GDL/CommonTools.h"

using namespace std;

bool EventsCodeCompilerPreWork::Execute()
{
    if ( scene == NULL || game == NULL )
    {
        std::cout << "WARNING: Cannot execute pre work: No valid associated scene or game." << std::endl;
        return false;
    }

    Game gameCopy = *game;
    Scene sceneCopy = *scene;
    if ( executionEngine != boost::shared_ptr<EventsExecutionEngine>() ) executionEngine->SetNotReady();
    cout << "Game and scene copy made" << endl;

    cout << "Generating C++ code...\n";
    if ( sceneCopy.profiler != NULL ) sceneCopy.profiler->profileEventsInformation.clear();
    EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.events);
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.events);

    std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.events);

    std::ofstream myfile;
    myfile.open ( string(CodeCompiler::GetInstance()->GetWorkingDirectory()+ToString(scene)+"events.cpp").c_str() );
    myfile << eventsOutput;
    myfile.close();

    return true;
}

bool EventsCodeCompilerPostWork::Execute()
{
    if ( scene == NULL )
    {
        std::cout << "WARNING: Cannot execute post task: No valid associated scene." << std::endl;
        return false;
    }
    if ( executionEngine == boost::shared_ptr<EventsExecutionEngine>() )
    {
        std::cout << "WARNING: Cannot execute post task: No valid EventsExecutionEngine." << std::endl;
        return false;
    }

    llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
    llvm::error_code err = llvm::MemoryBuffer::getFile(CodeCompiler::GetInstance()->GetWorkingDirectory()+ToString(scene)+"LLVMIR.bc", eventsBuffer);
    if ( err.value() != 0 )
    {
        std::cout << "Failed to load "+CodeCompiler::GetInstance()->GetWorkingDirectory()+ToString(scene)+"LLVMIR.bc: " << err.message() << std::endl << char(7);
        return false;
    }

    if ( !executionEngine->LoadFromLLVMBitCode(eventsBuffer.get()) )
    {
        cout << "Failed to load bitcode into executionEngine." << endl << char(7);
        return false;
    }

    scene->eventsModified = false;
        return true;
}

void GD_API EventsCodeCompilationHelper::CreateSceneEventsCompilationTask(Game & game, Scene & scene)
{
    CodeCompilerTask task;
    task.compilationForRuntime = false;
    task.optimize = false;
    task.eventsGeneratedCode = true;
    task.inputFile = string(CodeCompiler::GetInstance()->GetWorkingDirectory()+ToString(&scene)+"events.cpp");
    task.outputFile = string(CodeCompiler::GetInstance()->GetWorkingDirectory()+ToString(&scene)+"LLVMIR.bc");
    task.scene = &scene;
    task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPreWork(&game, &scene, scene.compiledEventsExecutionEngine));
    task.postWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerPostWork(&game, &scene, scene.compiledEventsExecutionEngine));
    task.userFriendlyName = "Compilation of events of scene "+scene.GetName();

    CodeCompiler::GetInstance()->AddTask(task);
}

#endif
