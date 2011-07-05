#include "GDL/EventsCodeCompiler.h"

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
#include "llvm/Config/config.h"
#include "llvm/ExecutionEngine/ExecutionEngine.h"
#include "llvm/ExecutionEngine/JIT.h"
#include "llvm/Support/ManagedStatic.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/Support/TypeBuilder.h"
#include "llvm/Support/Host.h"
#include "llvm/Support/Path.h"
#include "llvm/Target/TargetSelect.h"
#include "llvm/GlobalVariable.h"
#include "llvm/ADT/ArrayRef.h"
#include "llvm/ADT/SmallString.h"
#include "llvm/ADT/SmallVector.h"
#include "llvm/ADT/OwningPtr.h"
#include "llvm/Config/config.h"
#include "llvm/Support/ErrorHandling.h"
#include "llvm/Support/FileSystem.h"
#include "llvm/Support/ManagedStatic.h"
#include "llvm/Support/MemoryBuffer.h"
#include "llvm/Support/PrettyStackTrace.h"
#include "llvm/Support/Regex.h"
#include "llvm/Support/Timer.h"
#include "llvm/Support/raw_ostream.h"
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
#include "clang/Frontend/CompilerInstance.h"
#include "clang/Frontend/CompilerInvocation.h"
#include "clang/Frontend/FrontendDiagnostic.h"
#include "clang/Frontend/TextDiagnosticBuffer.h"
#include "clang/Frontend/TextDiagnosticPrinter.h"
#include "clang/FrontendTool/Utils.h"
#include "llvm/ADT/Statistic.h"
#include "llvm/Support/ErrorHandling.h"
#include "llvm/Support/ManagedStatic.h"
#include "llvm/Support/Timer.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/Target/TargetSelect.h"
#include "llvm/Support/DynamicLibrary.h" // Important
#include "llvm/Bitcode/ReaderWriter.h" // Important
#include <iostream>
#include <fstream>
#include <string>

using namespace clang;
using namespace clang::driver;

bool EventsCodeCompiler::CompileEventsFileToBitCode(std::string eventsFile, std::string bitCodeFile)
{
    TextDiagnosticPrinter *DiagClient = new TextDiagnosticPrinter(llvm::errs(), DiagnosticOptions());

    llvm::IntrusiveRefCntPtr<DiagnosticIDs> DiagID(new DiagnosticIDs());
    Diagnostic Diags(DiagID, DiagClient);
    //TODO : Hardcoded path. Maybe useless ?
    Driver TheDriver("D:/Florian/Programmation/GameDevelop2/IDE/bin/dev", llvm::sys::getHostTriple(), "a.out", /*IsProduction=*/false, /*CXXIsProduction=*/false,  Diags);
    std::cout << "Compiling " << eventsFile << "to BitCode" << std::endl;

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
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include");
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++");
    Args.push_back("-IHeaders/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32");
    Args.push_back("-IHeaders/llvm/tools/clang/lib/Headers");
    Args.push_back("-IHeaders/GDL");
    Args.push_back("-IHeaders/boost");
    Args.push_back("-IHeaders/SFML/include");
    Args.push_back("-IHeaders/wxwidgets/include");
    Args.push_back("-IHeaders/wxwidgets/lib/gcc_dll/msw");
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

    // Show the invocation, with -v.
    //if (CI->getHeaderSearchOpts().Verbose)
    {
        llvm::errs() << "clang invocation:\n";
        C->PrintJob(llvm::errs(), C->getJobs(), "\n", true);
        llvm::errs() << "\n";
    }

    std::cout << "e";
    // FIXME: This is copied from cc1_main.cpp; simplify and eliminate.
    // Create a compiler instance to handle the actual work.
    CompilerInstance Clang;
    Clang.setInvocation(CI.take());

    std::cout << "d";
    // Create the compilers actual diagnostics engine.
    Clang.createDiagnostics(int(CCArgs.size()),const_cast<char**>(CCArgs.data()));
    if (!Clang.hasDiagnostics())
        return false;

    std::cout << "c";
    // Infer the builtin include path if unspecified.

   /* if (Clang.getHeaderSearchOpts().UseBuiltinIncludes &&
            Clang.getHeaderSearchOpts().ResourceDir.empty())
        Clang.getHeaderSearchOpts().ResourceDir =
            CompilerInvocation::GetResourcesPath("D:\Florian\Programmation\GameDevelop2\IDE\bin\dev", MainAddr); //TODO : Hardcoded path. Maybe useless ?*/

    std::cout << "b";
    llvm::InitializeNativeTarget();
    // Create and execute the frontend to generate an LLVM bitcode module.
    llvm::OwningPtr<CodeGenAction> Act(new EmitLLVMOnlyAction());
    if (!Clang.ExecuteAction(*Act))
        return false;

    std::cout << "a";

    std::string error;
    std::cout << "f";

    llvm::Module *Module = Act->takeModule();
    llvm::raw_fd_ostream file(bitCodeFile.c_str(), error, llvm::raw_fd_ostream::F_Binary);
    llvm::WriteBitcodeToFile(Module, file);

    std::cout << "g";
    std::cout << error;

    std::cout << "h";

    return true;
}
