/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#include "CodeCompiler.h"
#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filefn.h>
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"

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
#include "llvm/Support/TargetSelect.h"
#include "clang/Driver/Arg.h"
#include "clang/Driver/ArgList.h"
#include "clang/Driver/CC1Options.h"
#include "clang/Driver/DriverDiagnostic.h"
#include "clang/Driver/OptTable.h"
#include "clang/FrontendTool/Utils.h"
#include "llvm/ADT/Statistic.h"
#include "llvm/Bitcode/ReaderWriter.h"
#include "clang/Basic/FileManager.h"

using namespace std;
using namespace clang;
using namespace clang::driver;

CodeCompiler *CodeCompiler::_singleton = NULL;
sf::Mutex CodeCompiler::openSaveDialogMutex;
const wxEventType CodeCompiler::refreshEventType = wxNewEventType();

void CodeCompiler::ProcessTasks()
{
    while(true)
    {
        //Check if there is a task to be made
        {
            sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

            bool newTaskFound = false;
            for (unsigned int i = 0;i<pendingTasks.size();++i)
            {
                //Be sure that the task is not disabled
                if ( find(compilationDisallowed.begin(), compilationDisallowed.end(), pendingTasks[i].scene) == compilationDisallowed.end() )
                {
                    currentTask = pendingTasks[i];
                    pendingTasks.erase(pendingTasks.begin()+i);

                    newTaskFound = true;
                    break;
                }
            }
            if ( !newTaskFound ) //Bail out if no task can be made
            {
                if ( pendingTasks.empty() )
                    std::cout << "No more task to be processed." << std::endl;
                else
                    std::cout << "No more task to be processed ( But "+ToString(pendingTasks.size())+" disabled task(s) waiting for being enabled )." << std::endl;

                threadLaunched = false;
                NotifyControls();
                return;
            }

        }

        std::cout << "Processing task " << currentTask.userFriendlyName << "..." << std::endl;
        lastTaskFailed = false;
        NotifyControls();
        bool skip = false; ///Set to true if the preworker of the task asked to relaunch the task later.

        if ( currentTask.preWork != boost::shared_ptr<CodeCompilerExtraWork>() )
        {
            std::cout << "Launching pre work..." << std::endl;
            currentTask.preWork->Execute();

            if ( currentTask.preWork->requestRelaunchCompilationLater )
            {
                std::cout << "Preworker asked to launch the task later" << std::endl;
                sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.
                pendingTasks.push_back(currentTask);
                pendingTasks.back().preWork->requestRelaunchCompilationLater = false;

                skip = true;
            }
        }

        bool compilationSucceeded = false; //Some post worker want to be informed of the compilation success/fail.
        if (!skip)
        {
            lastTaskMessages.clear();

            //Define compilation arguments for Clang.
            llvm::SmallVector<const char *, 128> args;

            args.push_back(currentTask.inputFile.c_str());

            if ( currentTask.eventsGeneratedCode ) //Define special arguments for events generated code
            {
                /*#if defined(WINDOWS)
                if ( !currentTask.optimize ) //Don't use precompiled header when optimizing, as they are built without optimizations
                {
                    args.push_back("-include-pch");
                    args.push_back(!currentTask.compilationForRuntime ? "include/GDL/GDL/Events/PrecompiledHeader.h.pch" : "include/GDL/GDL/Events/PrecompiledHeaderRuntime.h.pch");
                }
                #endif*/

                args.push_back("-fsyntax-only");
                args.push_back("-fcxx-exceptions");
                args.push_back("-fexceptions");
                args.push_back("-w"); //No warnings
            }

            //Headers
            for (std::set<std::string>::const_iterator header = headersDirectories.begin();header != headersDirectories.end();++header)
                args.push_back((*header).c_str());

            //Additional headers
            args.push_back("-nostdsysteminc"); //Disable standard include directories. All includes files are provided by Game Develop to ensure compatibility. Note: Arguments used with Clang prior to version 3.0:  -nobuiltininc, -nostdinc, -nostdinc++
            args.push_back("-nostdinc++");
            std::vector<std::string> additionalHeadersArgs;
            for (unsigned int i = 0;i<currentTask.additionalHeaderDirectories.size();++i)
                additionalHeadersArgs.push_back("-I"+currentTask.additionalHeaderDirectories[i]);
            for (unsigned int i = 0;i<additionalHeadersArgs.size();++i)
                args.push_back(additionalHeadersArgs[i].c_str());

            if ( !currentTask.compilationForRuntime ) args.push_back("-DGD_IDE_ONLY"); //Already set in PCH
            if ( currentTask.optimize ) args.push_back("-O1");

            //GD library related defines.
            #if defined(WINDOWS)
            args.push_back("-DGD_CORE_API=__declspec(dllimport)");
            args.push_back("-DGD_API=__declspec(dllimport)");
            args.push_back("-DGD_EXTENSION_API=__declspec(dllimport)");
            #elif defined(LINUX)
            args.push_back("-DGD_CORE_API= ");
            args.push_back("-DGD_API= ");
            args.push_back("-DGD_EXTENSION_API= ");
            #elif defined(MAC)
            args.push_back("-DGD_CORE_API= ");
            args.push_back("-DGD_API= ");
            args.push_back("-DGD_EXTENSION_API= ");
            #endif

            //Other common defines.
            #if defined(RELEASE)
            args.push_back("-DRELEASE");
            args.push_back("-DNDEBUG");
            args.push_back("-DBOOST_DISABLE_ASSERTS");
            #elif defined(DEV)
            args.push_back("-DDEV");
            args.push_back("-DNDEBUG");
            args.push_back("-DBOOST_DISABLE_ASSERTS");
            #elif defined(DEBUG)
            args.push_back("-DDEBUG");
            #endif

            //The clang compiler instance
            std::cout << "Creating compiler instance...\n";
            CompilerInstance Clang;

            // Infer the builtin include path if unspecified.
            if (Clang.getHeaderSearchOpts().UseBuiltinIncludes && Clang.getHeaderSearchOpts().ResourceDir.empty())
            {
                Clang.getHeaderSearchOpts().ResourceDir = wxGetCwd();
                std::cout << "Set res dir to " << Clang.getHeaderSearchOpts().ResourceDir << std::endl;
            }

            //Diagnostic classes
            std::string compilationErrorFileErrors;
            llvm::raw_fd_ostream errorFile(std::string(workingDir+"compilationErrors.txt").c_str(), compilationErrorFileErrors);
            if ( !compilationErrorFileErrors.empty() ) std::cout << "Unable to create compilation errors report file!\n";

            TextDiagnosticPrinter * clangDiagClient = new TextDiagnosticPrinter(errorFile, DiagnosticOptions());
            llvm::IntrusiveRefCntPtr<DiagnosticIDs> clangDiagID(new DiagnosticIDs());
            DiagnosticsEngine * clangDiags = new DiagnosticsEngine(clangDiagID, clangDiagClient);

            CompilerInvocation::CreateFromArgs(Clang.getInvocation(), args.begin(),  args.end(), *clangDiags);

            Clang.setDiagnostics(clangDiags);
            if (!Clang.hasDiagnostics())
            {
                std::cout << "Unable to create clang diagnostic engine!" << std::endl;
                return;
            }

            std::cout << "Compiling...\n";
            // Create and execute the frontend to generate an LLVM bitcode module.
            llvm::OwningPtr<CodeGenAction> Act(new EmitLLVMOnlyAction());
            if (!Clang.ExecuteAction(*Act))
            {
                std::cout << "Compilation failed.\n";
                lastTaskFailed = true;
            }
            else
            {
                std::cout << "Compilation succeeded. Writing bitcode to file...\n";
                sf::Lock lock(openSaveDialogMutex); //On windows, GD is crashing if we write bitcode while an open/save file dialog is displayed.

                llvm::OwningPtr<llvm::Module> module(Act->takeModule());

                std::string error;
                llvm::raw_fd_ostream file(currentTask.outputFile.c_str(), error, llvm::raw_fd_ostream::F_Binary);
                llvm::WriteBitcodeToFile(module.get(), file);
                std::cout << error;

                compilationSucceeded = true;
            }

            //Compilation ended, loading diagnostics
            {
                std::ifstream t(std::string(workingDir+"compilationErrors.txt").c_str());
                lastTaskMessages.assign(std::string((std::istreambuf_iterator<char>(t)), std::istreambuf_iterator<char>()));
            }
        }

        if (!skip && currentTask.postWork != boost::shared_ptr<CodeCompilerExtraWork>() )
        {
            std::cout << "Launching post task" << std::endl;
            currentTask.postWork->compilationSucceeded = compilationSucceeded;
            currentTask.postWork->Execute();

            if ( currentTask.postWork->requestRelaunchCompilationLater )
            {
                std::cout << "Postworker asked to launch again the task later" << std::endl;

                sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.
                pendingTasks.push_back(currentTask);
                pendingTasks.back().postWork->requestRelaunchCompilationLater = false;
            }
        }

        std::cout << "Task ended." << std::endl;
        NotifyControls();
    }
}

void CodeCompiler::NotifyControls()
{
    wxCommandEvent refreshEvent( refreshEventType );
    for (std::set<wxEvtHandler*>::iterator it = notifiedControls.begin();it != notifiedControls.end();++it)
    {
        if ( (*it) != NULL) wxPostEvent((*it), refreshEvent);
    }
}

void CodeCompiler::AddTask(CodeCompilerTask task)
{
    {
        sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

        //Check if an equivalent task is not waiting in the pending list
        for (unsigned int i = 0;i<pendingTasks.size();++i)
        {
            if ( task.IsSameTaskAs(pendingTasks[i]) ) return;
        }

        pendingTasks.push_back(task);
        std::cout << "New task added (" << task.userFriendlyName << ")" << std::endl;
    }

    if ( !threadLaunched )
    {
        std::cout << "Launching compilation thread..." << std::endl;
        threadLaunched = true;
        currentTaskThread.Launch();
    }
}

std::vector < CodeCompilerTask > CodeCompiler::GetCurrentTasks() const
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    std::vector < CodeCompilerTask > allTasks = pendingTasks;
    if (threadLaunched) allTasks.insert(allTasks.begin(), currentTask);

    return allTasks;
}

bool CodeCompiler::HasTaskRelatedTo(Scene & scene) const
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    if ( threadLaunched && currentTask.scene == &scene ) return true;

    for (unsigned int i = 0;i<pendingTasks.size();++i)
    {
        if ( pendingTasks[i].scene == &scene ) return true;
    }

    return false;
}

void CodeCompiler::EnableTaskRelatedTo(Scene & scene)
{
    bool mustLaunchCompilationThread = false;
    {
        sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

        std::cout << "Enabling tasks related to scene:" << scene.GetName() << endl;

        vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
        if ( it != compilationDisallowed.end())
            compilationDisallowed.erase(it);

        mustLaunchCompilationThread = !pendingTasks.empty();
    }

    //Launch pending tasks if needed
    if ( !threadLaunched && mustLaunchCompilationThread )
    {
        std::cout << "Launching compilation thread...";
        threadLaunched = true;
        currentTaskThread.Launch();
    }
}

void CodeCompiler::RemovePendingTasksRelatedTo(Scene & scene)
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    for (unsigned int i = 0;i<pendingTasks.size();)
    {
        if ( pendingTasks[i].scene == &scene )
            pendingTasks.erase(pendingTasks.begin()+i);
        else
            ++i;
    }

}

void CodeCompiler::DisableTaskRelatedTo(Scene & scene)
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    std::cout << "Disabling tasks related to scene:" << scene.GetName() << endl;

    vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
    if ( it == compilationDisallowed.end())
        compilationDisallowed.push_back(&scene);
}

bool CodeCompiler::CompilationInProcess() const
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    return (threadLaunched);
}

void CodeCompiler::SetWorkingDirectory(std::string workingDir_)
{
    workingDir = workingDir_;
    if ( workingDir.empty() || (workingDir[workingDir.length()-1] != '/' && workingDir[workingDir.length()-1] != '\\' ) )
        workingDir += "/";

    if (!wxDirExists(workingDir.c_str()))
        wxMkdir(workingDir);
}

CodeCompiler::CodeCompiler() :
    threadLaunched(false),
    currentTaskThread(&CodeCompiler::ProcessTasks, this),
    lastTaskFailed(false)
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
    headersDirectories.insert("-Iinclude/Core");
    headersDirectories.insert("-Iinclude/boost");
    headersDirectories.insert("-Iinclude/SFML/include");
    headersDirectories.insert("-Iinclude/wxwidgets/include");
    headersDirectories.insert("-Iinclude/wxwidgets/lib/gcc_dll/msw");
    headersDirectories.insert("-IExtensions/include");
}

CodeCompilerExtraWork::CodeCompilerExtraWork() :
    requestRelaunchCompilationLater(false)
{
}
CodeCompilerExtraWork::~CodeCompilerExtraWork()
{
}

CodeCompiler::~CodeCompiler()
{
}

CodeCompiler * CodeCompiler::GetInstance()
{
    if ( NULL == _singleton )
        _singleton = new CodeCompiler;

    return ( static_cast<CodeCompiler*>( _singleton ) );
}

void CodeCompiler::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}
#endif
