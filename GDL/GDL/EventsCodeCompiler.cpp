/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/EventsCodeCompiler.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>

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

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Event.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsExecutionEngine.h"
#include "GDL/CommonTools.h"

using namespace std;
using namespace clang;
using namespace clang::driver;

EventsCodeCompiler *EventsCodeCompiler::_singleton = NULL;
sf::Mutex EventsCodeCompiler::openSaveDialogMutex;

bool EventsCodeCompiler::CompileEventsCppFileToBitCode(std::string eventsFile, std::string bitCodeFile, bool compilationForRuntime)
{
    std::cout << "C++ events file to bitcode compilation started\n" << std::endl;
    std::cout << "Creating Clang compiler job...\n" << std::endl;

    TextDiagnosticPrinter *DiagClient = new TextDiagnosticPrinter(llvm::errs(), DiagnosticOptions());

    llvm::IntrusiveRefCntPtr<DiagnosticIDs> DiagID(new DiagnosticIDs());
    Diagnostic Diags(DiagID, DiagClient);
    Driver TheDriver("" /* "Clang executable path" */, llvm::sys::getHostTriple(), "a.out", /*IsProduction=*/false, /*CXXIsProduction=*/false,  Diags);

    // FIXME: This is a hack to try to force the driver to do something we can
    // recognize. We need to extend the driver library to support this use model
    // (basically, exactly one input, and the operation mode is hard wired).
    llvm::SmallVector<const char *, 128> Args;
    Args.push_back("GDEditor.exe");
    Args.push_back("-include-pch");
    Args.push_back("include/GDL/GDL/RuntimePrecompiledHeader.h.pch");
    Args.push_back(eventsFile.c_str());
    Args.push_back("-fsyntax-only");
    Args.push_back("-w");
    //Headers
    for (std::set<std::string>::const_iterator header = headersDirectories.begin();header != headersDirectories.end();++header)
        Args.push_back((*header).c_str());

    if ( !compilationForRuntime )
    {
        Args.push_back("-DGD_IDE_ONLY"); //TODO : Use appropriate PCH.
        //Args.push_back("-O3");
    }

    #if defined(WINDOWS)
    Args.push_back("-DWINDOWS");
    Args.push_back("-DGD_API=__declspec(dllimport)");
    Args.push_back("-DGD_EXTENSION_API=__declspec(dllimport)");
    #elif defined(LINUX)
    Args.push_back("-DLINUX");
    Args.push_back("-DGD_API=\"\"");
    Args.push_back("-DGD_EXTENSION_API=\"\"");
    #elif defined(MAC)
    Args.push_back("-DMAC");
    Args.push_back("-DGD_API=\"\"");
    Args.push_back("-DGD_EXTENSION_API=\"\"");
    #endif

    #if defined(RELEASE)
    Args.push_back("-DRELEASE");
    #elif defined(DEV)
    Args.push_back("-DDEV");
    #elif defined(DEBUG)
    Args.push_back("-DDEBUG");
    #endif


    llvm::OwningPtr<Compilation> C(TheDriver.BuildCompilation(Args));
    if (!C) return false;

    // FIXME: This is copied from ASTUnit.cpp; simplify and eliminate.
    // We expect to get back exactly one command job, if we didn't something
    // failed. Extract that job from the compilation.
    const driver::JobList &Jobs = C->getJobs();
    if (Jobs.size() != 1 || !isa<driver::Command>(Jobs.begin()))
    {
        llvm::SmallString<256> Msg;
        llvm::raw_svector_ostream OS(Msg);
        C->PrintJob(OS, C->getJobs(), ";\n", true);
        Diags.Report(diag::err_fe_expected_compiler_job) << OS.str();
        return false;
    }

    const driver::Command *Cmd = cast<driver::Command>(*Jobs.begin());
    if (llvm::StringRef(Cmd->getCreator().getName()) != "clang")
    {
        Diags.Report(diag::err_fe_expected_clang_command);
        return false;
    }

    // Initialize a compiler invocation object from the clang (-cc1) arguments.
    const driver::ArgStringList &CCArgs = Cmd->getArguments();
    llvm::OwningPtr<CompilerInvocation> CI(new CompilerInvocation);
    CompilerInvocation::CreateFromArgs(*CI,
                                       const_cast<const char **>(CCArgs.data()),
                                       const_cast<const char **>(CCArgs.data()) +
                                       CCArgs.size(),
                                       Diags);

    if (false)
    {
        llvm::errs() << "clang invocation:\n";
        C->PrintJob(llvm::errs(), C->getJobs(), "\n", true);
        llvm::errs() << "\n";
    }

    std::cout << "Creating compiler instance...\n";
    // FIXME: This is copied from cc1_main.cpp; simplify and eliminate.
    // Create a compiler instance to handle the actual work.
    CompilerInstance Clang;
    Clang.setInvocation(CI.take());

    // Create the compilers actual diagnostics engine.
    Clang.createDiagnostics(int(CCArgs.size()),const_cast<char**>(CCArgs.data()));
    if (!Clang.hasDiagnostics())
        return false;

    std::cout << "Compiling...\n";
    // Create and execute the frontend to generate an LLVM bitcode module.
    llvm::OwningPtr<CodeGenAction> Act(new EmitLLVMOnlyAction());
    if (!Clang.ExecuteAction(*Act))
        return false;

    std::cout << "Writing bitcode...\n";
    sf::Lock lock(openSaveDialogMutex);

    llvm::Module *Module = Act->takeModule();

    std::string error;
    llvm::raw_fd_ostream file(bitCodeFile.c_str(), error, llvm::raw_fd_ostream::F_Binary);
    llvm::WriteBitcodeToFile(Module, file);
    std::cout << error;

    std::cout << "Events C++ file to bitcode compilation ended.\n";

    return true;
}

void EventsCodeCompiler::Worker::DoCompleteCompilation()
{
    cout << "Compilation: Worker started compilation task(s)." << endl;
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

            if ( abort || executionEngine == boost::shared_ptr<EventsExecutionEngine>() )
            {
                cout << "Compilation aborted." << endl;
            }
            else
            {
                cout << "Generating C++ code...\n";
                EventsCodeGenerator::PreprocessEventList(gameCopy, sceneCopy, sceneCopy.events);
                EventsCodeGenerator::DeleteUselessEvents(sceneCopy.events);
                std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.events);
                std::ofstream myfile;
                myfile.open ( string("Temporaries/"+ToString(executionEngine.get())+"events.cpp").c_str());
                myfile << eventsOutput;
                myfile.close();

                if ( !EventsCodeCompiler::GetInstance()->CompileEventsCppFileToBitCode("Temporaries/"+ToString(executionEngine.get())+"events.cpp", task.bitCodeFilename.empty() ? "Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc" : task.bitCodeFilename, task.compilationForRuntime ))
                {
                    cout << "Failed to compile Temporaries/"+ToString(executionEngine.get())+"events.cpp." << std::endl;
                    cout << "Compilation aborted." << endl << char(7);
                }
                else
                {
                    cout << "Compilation duration: " << compilationTimer.GetElapsedTime()<<"s"<<endl;

                    if ( !task.generateBitcodeFileOnly )
                    {
                        llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
                        llvm::error_code err = llvm::MemoryBuffer::getFile("Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc", eventsBuffer);
                        if ( err.value() != 0 )
                        {
                            std::cout << "Failed to load Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc: " << err.message() << std::endl;
                            cout << "Compilation aborted." << endl << char(7);
                        }
                        else
                        {
                            std::string parseError;
                            executionEngine->llvmModule = ParseBitcodeFile(eventsBuffer.get(), executionEngine->llvmContext, &parseError);
                            std::cout << parseError;

                            if ( abort )
                            {
                                cout << "Compilation aborted." << endl << char(7);
                            }
                            else
                            {
                                if (!executionEngine->llvmModule)
                                {
                                    cout << "Module creation failed\n";
                                    cout << "Compilation aborted." << endl << char(7);
                                }
                                else
                                {
                                    std::string error;
                                    executionEngine->llvmExecutionEngine.reset( llvm::ExecutionEngine::createJIT(executionEngine->llvmModule,
                                                                               &error,
                                                                               0,
                                                                               llvm::CodeGenOpt::None)); //No optimisation during machine code generation
                                    if (!executionEngine->llvmExecutionEngine)
                                    {
                                        cout << "unable to make execution engine: " << error << "\n";
                                        cout << "Compilation aborted." << endl << char(7);
                                    }
                                    else
                                    {
                                        executionEngine->eventsEntryFunction = executionEngine->llvmModule->getFunction("main");
                                        if (!executionEngine->eventsEntryFunction)
                                        {
                                            cout << "'main' function not found in module.\n";
                                            cout << "Compilation aborted." << endl << char(7);
                                        }
                                        else
                                        {
                                            cout << "Mapping objects of execution engine...\n";
                                            llvm::GlobalValue *globalValue = llvm::cast<llvm::GlobalValue>(executionEngine->llvmModule->getOrInsertGlobal("pointerToRuntimeContext", llvm::TypeBuilder<void*, false>::get(executionEngine->llvmModule->getContext())));
                                            executionEngine->llvmExecutionEngine->addGlobalMapping(globalValue, &executionEngine->llvmRuntimeContext);

                                            for (llvm::Module::iterator I = executionEngine->llvmModule->begin(), E = executionEngine->llvmModule->end(); I != E; ++I)
                                              if (I->isDeclaration())
                                                cout << &*I << "not defined (" << (*I).getNameStr() << endl;

                                            for (llvm::Module::global_iterator I = executionEngine->llvmModule->global_begin(),
                                                                         E = executionEngine->llvmModule->global_end();
                                                 I != E; ++I)
                                              if (I->isDeclaration())
                                                cout << &*I << "not defined (" << (*I).getNameStr() << endl;

                                            cout << "JIT Compilation to machine code...\n";
                                            sf::Clock jitTimer;
                                            executionEngine->llvmExecutionEngine->getPointerToFunction(executionEngine->eventsEntryFunction);
                                            cout << "JIT Compilation duration: " << jitTimer.GetElapsedTime()<<"s"<<endl;

                                            cout << "Scene compilation successful. Total duration: " << compilationTimer.GetElapsedTime()<<"s"<<endl;
                                            task.scene->eventsModified = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        compile = false; //Compilation ended.

        //Be sure there is not a pending task waiting to be done.
        {
            EventsCodeCompiler * eventsCodeCompiler = EventsCodeCompiler::GetInstance();

            sf::Lock lock(eventsCodeCompiler->mutex); //Disallow modifying pending tasks.

            for (unsigned int i = 0;i<eventsCodeCompiler->pendingTasks.size();++i)
            {
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
        cout << "SceneEventsBeingCompiled!";
        return true;
    }

    if ( !pendingTasks.empty() )
    {
        //Pending task but no current task: Launch the first pending task so.
        EventsCompilationNeeded(pendingTasks[0]);
        pendingTasks.erase(pendingTasks.begin()+0);

        cout << "SceneEventsBeingCompiled!";
        return true; //There is already a task to compile scene events
    }

    cout << "OK, no compilation";
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

EventsCodeCompiler::EventsCodeCompiler()
{
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include");
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++");
    headersDirectories.insert("-Iinclude/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32");
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
