/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "GDL/EventsCodeCompiler.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filefn.h>

//Long list of llvm and clang headers
#include "clang/CodeGen/CodeGenAction.h"
#include "clang/Driver/Compilation.h"
#include "clang/Driver/Driver.h"
#include "clang/Driver/Tool.h"
#include "clang/Frontend/CompilerInvocation.h"
#include "clang/Frontend/CompilerInstance.h"
#include "clang/Frontend/DiagnosticOptions.h"
#include "clang/Frontend/FrontendDiagnostic.h"
#include "clang/Frontend/TextDiagnosticPrinter.h"
#include "llvm/LLVMContext.h"
#include "llvm/Module.h"
#include "llvm/Config/config.h"
#include "llvm/ADT/OwningPtr.h"
#include "llvm/ADT/SmallString.h"
#include "llvm/ExecutionEngine/ExecutionEngine.h"
#include "llvm/ExecutionEngine/JIT.h"
#include "llvm/Support/ManagedStatic.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/Support/TypeBuilder.h"
#include "llvm/Support/Host.h"
#include "llvm/Support/Path.h"
#include "llvm/GlobalVariable.h"
#include "llvm/ADT/ArrayRef.h"
#include "llvm/ADT/SmallVector.h"
#include "llvm/Support/ErrorHandling.h"
#include "llvm/Support/FileSystem.h"
#include "llvm/Support/MemoryBuffer.h"
#include "llvm/Support/PrettyStackTrace.h"
#include "llvm/Support/Regex.h"
#include "llvm/Support/Timer.h"
#include "llvm/Support/Host.h"
#include "llvm/Support/Path.h"
#include "llvm/Support/Program.h"
#include "llvm/Support/Signals.h"
#include "llvm/Support/system_error.h"
#include "llvm/Target/TargetRegistry.h"
#include "llvm/Target/TargetSelect.h"
#include "clang/Driver/Arg.h"
#include "clang/Driver/ArgList.h"
#include "clang/Driver/CC1Options.h"
#include "clang/Driver/DriverDiagnostic.h"
#include "clang/Driver/OptTable.h"
#include "clang/FrontendTool/Utils.h"
#include "llvm/ADT/Statistic.h"
#include "llvm/Bitcode/ReaderWriter.h" // Important
#include "clang/Basic/FileManager.h"

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Event.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsExecutionEngine.h"
#include "GDL/BaseProfiler.h"
#include "GDL/CommonTools.h"

using namespace std;
using namespace clang;
using namespace clang::driver;

EventsCodeCompiler *EventsCodeCompiler::_singleton = NULL;
sf::Mutex EventsCodeCompiler::openSaveDialogMutex;

bool EventsCodeCompiler::CompileEventsCppFileToBitCode(std::string eventsFile, std::string bitCodeFile, bool compilationForRuntime, bool optimize)
{
    std::cout << "C++ events file to bitcode compilation started\n" << std::endl;

    //Defines compilation arguments for Clang.
    llvm::SmallVector<const char *, 128> Args;
    #if defined(WINDOWS)
    if ( !optimize ) //Don't use precompiled header when optimizing, as they are built without optimizations
    {
        Args.push_back("-include-pch");
        Args.push_back(!compilationForRuntime ? "include/GDL/GDL/PrecompiledHeader.h.pch" : "include/GDL/GDL/PrecompiledHeaderRuntime.h.pch");
    }
    #endif
    Args.push_back(eventsFile.c_str());
    Args.push_back("-fsyntax-only");
    Args.push_back("-fcxx-exceptions");
    Args.push_back("-fexceptions");
    Args.push_back("-fgnu-runtime");
    Args.push_back("-fdeprecated-macro");
    Args.push_back("-w"); //No warning
    //Headers
    for (std::set<std::string>::const_iterator header = headersDirectories.begin();header != headersDirectories.end();++header)
        Args.push_back((*header).c_str());

    if ( !compilationForRuntime )
        Args.push_back("-DGD_IDE_ONLY"); //Already set in PCH

    if ( optimize ) Args.push_back("-O1");

    //Already set in PCH :
    #if defined(WINDOWS)
    Args.push_back("-DGD_API=__declspec(dllimport)");
    Args.push_back("-DGD_EXTENSION_API=__declspec(dllimport)");
    #elif defined(LINUX)
    Args.push_back("-DGD_API= ");
    Args.push_back("-DGD_EXTENSION_API= ");
    #elif defined(MAC)
    Args.push_back("-DGD_API= ");
    Args.push_back("-DGD_EXTENSION_API= ");
    #endif

    //Already set in PCH :
    #if defined(RELEASE)
    Args.push_back("-DRELEASE");
    Args.push_back("-DNDEBUG");
    Args.push_back("-DBOOST_DISABLE_ASSERTS");
    #elif defined(DEV)
    Args.push_back("-DDEV");
    Args.push_back("-DNDEBUG");
    Args.push_back("-DBOOST_DISABLE_ASSERTS");
    #elif defined(DEBUG)
    Args.push_back("-DDEBUG");
    #endif

    //The clang compiler instance
    std::cout << "Creating compiler instance...\n";
    CompilerInstance Clang;

    // Infer the builtin include path if unspecified.
    if (Clang.getHeaderSearchOpts().UseBuiltinIncludes && Clang.getHeaderSearchOpts().ResourceDir.empty())
    {
        Clang.getHeaderSearchOpts().ResourceDir = wxGetCwd();
        std::cout << "Set res dir to " << Clang.getHeaderSearchOpts().ResourceDir;
    }

    //Diagnostic classes
    std::string compilationErrorFileErrors;
    llvm::raw_fd_ostream errorFile(std::string(workingDir+"compilationErrors.txt").c_str(), compilationErrorFileErrors);
    errorFile << "Please send this file to CompilGames@gmail.com, or include this content when reporting the problem to Game Develop's developer.\n";
    errorFile << "Veuillez envoyer ce fichier à CompilGames@gmail.com, ou l'inclure lorsque vous rapportez ce problème au développeur de Game Develop.\n";
    errorFile << "\n";
    errorFile << "Clang output:\n";
    if ( !compilationErrorFileErrors.empty() ) std::cout << "Unable to create compilation errors report file!\n";

    TextDiagnosticPrinter * clangDiagClient = new TextDiagnosticPrinter(errorFile, DiagnosticOptions());
    llvm::IntrusiveRefCntPtr<DiagnosticIDs> clangDiagID(new DiagnosticIDs());
    Diagnostic * clangDiags = new Diagnostic(clangDiagID, clangDiagClient);

    CompilerInvocation::CreateFromArgs(Clang.getInvocation(), Args.begin(),  Args.end(), *clangDiags);

    Clang.setDiagnostics(clangDiags);
    if (!Clang.hasDiagnostics())
    {
        std::cout << "Unable to create clang diagnostic engine!" << std::endl;
        return false;
    }

    std::cout << "Compiling...\n";
    // Create and execute the frontend to generate an LLVM bitcode module.
    llvm::OwningPtr<CodeGenAction> Act(new EmitLLVMOnlyAction());
    if (!Clang.ExecuteAction(*Act))
        return false;

    std::cout << "Writing bitcode...\n";
    sf::Lock lock(openSaveDialogMutex); //On windows, GD is crashing if we write bitcode while an open/save file dialog is displayed.

    llvm::OwningPtr<llvm::Module> module(Act->takeModule());

    std::string error;
    llvm::raw_fd_ostream file(bitCodeFile.c_str(), error, llvm::raw_fd_ostream::F_Binary);
    llvm::WriteBitcodeToFile(module.get(), file);
    std::cout << error;

    std::cout << "Events C++ file to bitcode compilation ended.\n";

    return true;
}

EventsCodeCompiler::Worker::~Worker() {std::cout << "Compilation worker deleted." << std::endl;};

void EventsCodeCompiler::Worker::DoCompleteCompilation()
{
    cout << "Compilation: Worker started compilation task(s)." << endl;
    std::string outputDir = EventsCodeCompiler::GetInstance()->GetWorkingDirectory();
    bool compile = true;

    while ( compile )
    {
        sf::Clock compilationTimer;

        if ( task.game == NULL || task.scene == NULL)
        {
            cout << "Game or scene invalid." << std::endl;
            cout << "Compilation aborted." << endl << char(7);
        }
        else
        {
            Game gameCopy = *task.game; //We're making a copy of game and scene to ensure compilation will not crash if scene/game is destroyed during compilation.
            Scene sceneCopy = *task.scene;
            boost::shared_ptr<EventsExecutionEngine> executionEngine = task.scene->compiledEventsExecutionEngine; //Execution engine that compilation will setup. Using a shared_ptr to ensure that execution engine is not destroyed during compilation
            cout << "Game and scene copy made, executionEngine shared_ptr ok." << endl;
            if ( !task.generateBitcodeFileOnly ) executionEngine->SetNotReady();

            if ( abort || executionEngine == boost::shared_ptr<EventsExecutionEngine>() )
            {
                cout << "Compilation aborted." << endl;
            }
            else
            {
                cout << "Generating C++ code...\n";
                if ( sceneCopy.profiler != NULL ) sceneCopy.profiler->profileEventsInformation.clear();
                EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.events);
                EventsCodeGenerator::DeleteUselessEvents(sceneCopy.events);
                std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.events);
                std::ofstream myfile;
                myfile.open ( string(outputDir+ToString(executionEngine.get())+"events.cpp").c_str() );
                myfile << eventsOutput;
                myfile.close();

                if ( abort )
                {
                    cout << "Compilation aborted." << endl;
                }
                else
                {
                    if ( !EventsCodeCompiler::GetInstance()->CompileEventsCppFileToBitCode(outputDir+ToString(executionEngine.get())+"events.cpp", task.bitCodeFilename.empty() ? outputDir+ToString(executionEngine.get())+"LLVMIR.bc" : task.bitCodeFilename, task.compilationForRuntime, task.optimize ))
                    {
                        cout << "Failed to compile "+outputDir+ToString(executionEngine.get())+"events.cpp." << std::endl;
                        cout << "Compilation aborted." << endl << char(7);
                    }
                    else
                    {
                        cout << "Compilation duration: " << compilationTimer.GetElapsedTime()/1000.0f<<"s"<<endl;

                        if ( abort )
                        {
                            cout << "Compilation aborted." << endl;
                        }
                        else if ( !task.generateBitcodeFileOnly && !abort )
                        {
                            llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
                            llvm::error_code err = llvm::MemoryBuffer::getFile(outputDir+ToString(executionEngine.get())+"LLVMIR.bc", eventsBuffer);
                            if ( err.value() != 0 )
                            {
                                std::cout << "Failed to load "+outputDir+ToString(executionEngine.get())+"LLVMIR.bc: " << err.message() << std::endl;
                                cout << "Compilation aborted." << endl << char(7);
                            }
                            else
                            {

                                if ( !executionEngine->LoadFromLLVMBitCode(eventsBuffer.get()) )
                                {
                                    cout << "Compilation aborted: Bitcode loading and compiling failed." << endl << char(7);
                                }
                                else
                                {
                                    cout << "Scene compilation successful. Total duration: " << compilationTimer.GetElapsedTime()/1000.0f<<"s"<<endl;
                                    task.scene->eventsModified = false;
                                }
                            }
                            if ( EventsCodeCompiler::GetInstance()->MustDeleteTemporaries() ) remove(std::string(outputDir+ToString(executionEngine.get())+"LLVMIR.bc").c_str());
                        }
                    }
                }
                if ( EventsCodeCompiler::GetInstance()->MustDeleteTemporaries() ) remove(std::string(outputDir+ToString(executionEngine.get())+"events.cpp").c_str());
            }
        }

        compile = false; //Compilation ended.
        abort = false;

        //Be sure there is not a pending task waiting to be done.
        {
            EventsCodeCompiler * eventsCodeCompiler = EventsCodeCompiler::GetInstance();

            sf::Lock lock(eventsCodeCompiler->mutex); //Disallow modifying pending tasks.


            for (unsigned int i = 0;i<eventsCodeCompiler->pendingTasks.size();++i)
            {
                cout << "Testing pending task of scene " << eventsCodeCompiler->pendingTasks[i].scene->GetName() << endl;
                if ( find(eventsCodeCompiler->compilationDisallowed.begin(), eventsCodeCompiler->compilationDisallowed.end(), eventsCodeCompiler->pendingTasks[i].scene) == eventsCodeCompiler->compilationDisallowed.end() )
                {
                    //A Pending task is waiting:
                    cout << "Pending task waiting : Relaunching compilation..." << endl;
                    compile = true; //Relaunch compilation.
                    SetTask(eventsCodeCompiler->pendingTasks[i]);

                    eventsCodeCompiler->pendingTasks.erase(eventsCodeCompiler->pendingTasks.begin()+i);
                    break;
                }
            }
        }
    }

    //All tasks are completed or tasks waiting are disallowed for now.
    workEnded = true;
}

void GD_API EventsCodeCompiler::EventsCompilationNeeded(Task task)
{
    //First clean up old finished thread
    if ( currentTask != boost::shared_ptr<Worker>() && currentTask->workEnded)
        currentTask.reset();

    //Compilation allowed : Be sure there is not a scene compilation currently and that compilation is not prevented
    if ( find(compilationDisallowed.begin(), compilationDisallowed.end(), task.scene) == compilationDisallowed.end() && currentTask == boost::shared_ptr<Worker>() )
    {
        std::cout << "New worker launched" << std::endl;
        currentTask = boost::shared_ptr<Worker>(new Worker(task));
        currentTask->Launch();
    }
    else
    {
        AddPendingTask(task); //Add a pending task;
        return;
    }

}
void EventsCodeCompiler::AddPendingTask(const Task & task)
{
    for (unsigned int i = 0;i<pendingTasks.size();++i)
    {
        if ( pendingTasks[i].scene == task.scene)
            return; //There is already a pending task to compile scene events
    }

    if ( currentTask != boost::shared_ptr<Worker>() && currentTask->GetScene() == task.scene )
    {
        std::cout << "Trying to abort as soon as possible compilation." << endl;
        currentTask->abort = true;
    }

    std::cout << "Pending task effectively added" << std::endl;
    pendingTasks.push_back(task); //Add a pending task;
}

void GD_API EventsCodeCompiler::EnableCompilation(Scene & scene)
{
    sf::Lock lock(mutex); //Disallow modifying pending tasks.

    vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
    if ( it != compilationDisallowed.end())
        compilationDisallowed.erase(it);

    //Launch pending tasks if needed
    if ( !pendingTasks.empty() )
    {
        //Pending task but no current task: Lauch the first pending task so.
        EventsCompilationNeeded(pendingTasks[0]);
        pendingTasks.erase(pendingTasks.begin()+0);
    }
}

void GD_API EventsCodeCompiler::DisableCompilation(Scene & scene)
{
    sf::Lock lock(mutex); //Disallow modifying pending tasks.

    std::cout << "Disabling compilation for scene:" << scene.GetName() << endl;

    vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
    if ( it == compilationDisallowed.end())
        compilationDisallowed.push_back(&scene);
}

bool EventsCodeCompiler::EventsBeingCompiled()
{
    //First clean up old finished thread
    if ( currentTask != boost::shared_ptr<Worker>() && currentTask->workEnded)
            currentTask.reset();

    sf::Lock lock(mutex);

    if ( currentTask != boost::shared_ptr<Worker>() )
    {
        return true;
    }

    if ( !pendingTasks.empty() )
    {
        //Pending task but no current task: Launch the first pending task so.
        EventsCompilationNeeded(pendingTasks[0]);
        pendingTasks.erase(pendingTasks.begin()+0);

        return true; //There is already a task to compile scene events
    }

    return false;
}

bool EventsCodeCompiler::SceneEventsBeingCompiled(const Scene & scene)
{
    if ( currentTask != boost::shared_ptr<Worker>() && currentTask->workEnded)
            currentTask.reset();

    sf::Lock lock(mutex); //Disallow modifying pending tasks.

    if ( currentTask != boost::shared_ptr<Worker>() && !currentTask->workEnded && currentTask->GetScene() == &scene)
        return true; //Scene is being compiled

    for (unsigned int i = 0;i<pendingTasks.size();++i)
    {
        if ( pendingTasks[i].scene == &scene )
        {
            //A pending task is waiting to compile the scene
            return true;
        }
    }

    return false; //No task waiting to compile scene events
}

void EventsCodeCompiler::NotifyASceneIsDestroyed(const Scene & scene)
{
    sf::Lock lock(mutex); //Disallow modifying pending tasks.

    if ( currentTask != boost::shared_ptr<Worker>() && currentTask->GetScene() == &scene )
        currentTask->abort = true;

    for (unsigned int i = 0;i<pendingTasks.size();++i)
    {
        if ( pendingTasks[i].scene == &scene)
        {
            pendingTasks.erase(pendingTasks.begin()+i);
            --i;

            cout << "Pending task deleted: The scene is being deleted." << endl;
        }
    }
}

void EventsCodeCompiler::SetWorkingDirectory(std::string workingDir_)
{
    workingDir = workingDir_;
    if ( workingDir.empty() || (workingDir[workingDir.length()-1] != '/' && workingDir[workingDir.length()-1] != '\\' ) )
        workingDir += "/";

    if (!wxDirExists(workingDir.c_str()))
        wxMkdir(workingDir);
};

EventsCodeCompiler::EventsCodeCompiler() :
    workingDir("Temporaries/"),
    mustDeleteTemporaries(true)
{
    #if defined(WINDOWS)
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/include");
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++");
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32");
    #elif defined(LINUX)
    headersDirectories.insert("-Iinclude/linux/usr/include/i386-linux-gnu/");
    headersDirectories.insert("-Iinclude/linux/usr/include");
    headersDirectories.insert("-Iinclude/linux/usr/include/c++/4.6/");
    headersDirectories.insert("-Iinclude/linux/usr/include/c++/4.6/i686-linux-gnu");
    headersDirectories.insert("-Iinclude/linux/usr/include/c++/4.6/backward");
    #elif defined(MAC)

    #endif

    headersDirectories.insert("-Iinclude/llvm/tools/clang/lib/Headers");
    headersDirectories.insert("-Iinclude/GDL");
    headersDirectories.insert("-Iinclude/boost");
    headersDirectories.insert("-Iinclude/SFML/include");
    headersDirectories.insert("-Iinclude/wxwidgets/include");
    headersDirectories.insert("-Iinclude/wxwidgets/lib/gcc_dll/msw");
    headersDirectories.insert("-IExtensions/include");
}

EventsCodeCompiler::~EventsCodeCompiler()
{
}

#endif
