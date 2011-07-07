#include "GDL/EventsCodeCompiler.h"

#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>

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

using namespace clang;
using namespace std;
using namespace clang::driver;

EventsCodeCompiler *EventsCodeCompiler::_singleton = NULL;
sf::Mutex EventsCodeCompiler::mutexPreventingSceneDestruction;

bool EventsCodeCompiler::CompileEventsCppFileToBitCode(std::string eventsFile, std::string bitCodeFile)
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
    Args.push_back("Headers/GDL/GDL/RuntimePrecompiledHeader.h.pch");
    Args.push_back(eventsFile.c_str());
    Args.push_back("-fsyntax-only");
    Args.push_back("-w");
    //Args.push_back("-O3");
    //Headers
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include");
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++");
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32");
    Args.push_back("-IHeaders/llvm/tools/clang/lib/Headers");
    Args.push_back("-IHeaders/GDL");
    Args.push_back("-IHeaders/boost");
    Args.push_back("-IHeaders/SFML/include");
    Args.push_back("-IHeaders/wxwidgets/include");
    Args.push_back("-IHeaders/wxwidgets/lib/gcc_dll/msw");
    //Defines
    Args.push_back("-DGD_API=__declspec(dllimport)");
    Args.push_back("-DWINDOWS");
    Args.push_back("-DDEV");
    Args.push_back("-DGD_IDE_ONLY");

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
    cout << "Compilation: Worker started compilation job." << endl;
    sf::Clock compilationTimer;

    boost::shared_ptr<EventsExecutionEngine> executionEngine; //Execution engine that compilation will setup. Using a shared_ptr to ensure that execution engine is not destroyed during compilation
    Game gameCopy;
    Scene sceneCopy;

    //Be sure execution engine is not being used ( i.e. being used by a scene being previewed )
    {
        sf::Lock lock(mutexPreventingSceneDestruction); //Does not allow scene to be destroyed
        while ( scene.compiledEventsExecutionEngine->beingExecuted )
            ;
        scene.eventsBeingCompiled = true; //Ensure scene is notified that its events are being compiled. Scene will then not attempt to execute its execution engine.

        cout << "Compilation: Ok - Execution engine is not being executed" << endl;

        gameCopy = game; //We're making a copy of game and scene to ensure compilation will not crash if scene/game is destroyed during compilation.
        sceneCopy = scene;
        executionEngine = scene.compiledEventsExecutionEngine;
        cout << "Game and scene copy made, executionEngine shared_ptr ok." << endl;
    }

    if ( abort || executionEngine == boost::shared_ptr<EventsExecutionEngine>() )
    {
        cout << "Compilation aborted." << endl;
        return;
    }

    cout << "Generating C++ code...\n";
    EventsCodeGenerator::DeleteUselessEvents(sceneCopy.events);
    std::string eventsOutput = EventsCodeGenerator::GenerateEventsCompleteCode(gameCopy, sceneCopy, sceneCopy.events);
    std::ofstream myfile;
    myfile.open ( string("Temporaries/"+ToString(executionEngine.get())+"events.cpp").c_str());
    myfile << eventsOutput;
    myfile.close();

    CompileEventsCppFileToBitCode("Temporaries/"+ToString(executionEngine.get())+"events.cpp", "Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc");
    cout << "Compilation duration: " << compilationTimer.GetElapsedTime()<<"s"<<endl;

    {
        llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
        llvm::error_code err = llvm::MemoryBuffer::getFile("Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc", eventsBuffer);
        if ( err.value() != 0 )
            std::cout << "Failed to load Temporaries/"+ToString(executionEngine.get())+"LLVMIR.bc: " << err.message() << std::endl;
        else
        {
            std::string parseError;
            executionEngine->llvmModule = ParseBitcodeFile(eventsBuffer.get(), executionEngine->llvmContext, &parseError);
            std::cout << parseError;
        }
    }

    if ( abort )
    {
        cout << "Compilation aborted." << endl;
        return;
    }

    if (!executionEngine->llvmModule)
    {
        cout << "Module creation failed\n";
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
        }
        else
        {
            executionEngine->eventsEntryFunction = executionEngine->llvmModule->getFunction("main");
            if (!executionEngine->eventsEntryFunction)
                cout << "'main' function not found in module.\n";

            cout << "Mapping objects...\n";
            {
                llvm::GlobalValue *globalValue = llvm::cast<llvm::GlobalValue>(executionEngine->llvmModule->getOrInsertGlobal("pointerToRuntimeContext", llvm::TypeBuilder<void*, false>::get(executionEngine->llvmModule->getContext())));
                executionEngine->llvmExecutionEngine->addGlobalMapping(globalValue, &executionEngine->llvmRuntimeContext);
            }

            cout << "JIT Compilation to machine code...\n";
            sf::Clock jitTimer;
            executionEngine->llvmExecutionEngine->getPointerToFunction(executionEngine->eventsEntryFunction);
            cout << "JIT Compilation duration: " << jitTimer.GetElapsedTime()<<"s"<<endl;
        }
    }

    cout << "Total duration: " << compilationTimer.GetElapsedTime()<<"s"<<endl;

    if ( abort )
    {
        cout << "Compilation aborted." << endl;
        return;
    }
    {
        sf::Lock lock(mutexPreventingSceneDestruction);

        scene.eventsBeingCompiled = false; //Notify scene its events are compiled
        scene.eventsModified = false;
        workEnded = true;
    }
}

void GD_API EventsCodeCompiler::EventsCompilationNeeded(Game & game, Scene & scene)
{
    //First clean up old finished threads
    for (std::map <Scene*, boost::shared_ptr<Worker> >::iterator it = currentTasks.begin();it != currentTasks.end();++it)
    {
        if ( it->second != boost::shared_ptr<Worker>() )
        {
            if ( it->second->workEnded )
                it->second.reset();
        }
    }

    if ( currentTasks[&scene] == boost::shared_ptr<Worker>() )
    {
        std::cout << "New worker launched" << std::endl;
        currentTasks[&scene] = boost::shared_ptr<Worker>(new Worker(game, scene));
        currentTasks[&scene]->Launch();
    }

}

void EventsCodeCompiler::NotifyASceneIsDestroyed(const Scene & scene)
{
    cout << "NOTIFYASCENEISDESTROYED!" << endl;
    sf::Lock lock(mutexPreventingSceneDestruction);
    cout << "LockSet" << endl;

    for (std::map <Scene*, boost::shared_ptr<Worker> >::iterator it = currentTasks.begin();it != currentTasks.end();++it)
    {
        if ( it->second != boost::shared_ptr<Worker>() )
        {
            if ( &it->second->GetScene() == &scene )
                it->second->abort = true;
        }
    }
    cout << "NotifyAsceneIsDestroyedEND" << endl;
}

EventsCodeCompiler::EventsCodeCompiler()
{
}

EventsCodeCompiler::~EventsCodeCompiler()
{
}
