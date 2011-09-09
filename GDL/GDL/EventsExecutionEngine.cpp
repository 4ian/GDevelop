/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "EventsExecutionEngine.h"
#include <llvm/ExecutionEngine/GenericValue.h>
#include <llvm/ExecutionEngine/ExecutionEngine.h>
#include <llvm/ExecutionEngine/JIT.h>
#include <llvm/Support/DynamicLibrary.h>
#include <llvm/Config/config.h>
#include <llvm/Module.h>
#include <llvm/Target/TargetRegistry.h>
#include <llvm/Target/TargetSelect.h>
#include <llvm/Bitcode/ReaderWriter.h>
#include <llvm/Support/MemoryBuffer.h>
#include <llvm/Support/TypeBuilder.h>
#undef _ //llvm/Support/system_error.h does not support wxWidgets "_" macro
#include <llvm/Support/system_error.h>
#include <SFML/System.hpp>
#include "GDL/RuntimeContext.h"

#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#include <wx/log.h>
#endif

bool EventsExecutionEngine::llvmTargetsInitialized = false;

void EventsExecutionEngine::EnsureLLVMTargetsInitialization()
{
    if ( !llvmTargetsInitialized )
    {
        llvm::InitializeNativeTarget();
        llvmTargetsInitialized = true;
    }
}

void EventsExecutionEngine::LoadDynamicLibraries()
{
    #if defined(WINDOWS) //Other system uses by default standard library as a shared library
    std::string error;
    llvm::sys::DynamicLibrary::LoadLibraryPermanently("libstdc++-6.dll", &error);
    if ( !error.empty() ) std::cout << error;
    #endif
}

EventsExecutionEngine::EventsExecutionEngine() :
    engineReady(false)
{
    llvmRuntimeContext = new RuntimeContext(NULL);
}

EventsExecutionEngine::~EventsExecutionEngine()
{
    if ( llvmRuntimeContext != NULL ) delete llvmRuntimeContext;
}

bool EventsExecutionEngine::LoadFromLLVMBitCode(const char * src, unsigned int size)
{
    llvm::StringRef input_data(src);
    llvm::StringRef buffer_name("src");
    llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
    eventsBuffer.reset(llvm::MemoryBuffer::getNewMemBuffer(size, "src"));
    memcpy((char*)eventsBuffer->getBufferStart(), src, size);

    return LoadFromLLVMBitCode(eventsBuffer.get());
}

bool EventsExecutionEngine::LoadFromLLVMBitCode(llvm::MemoryBuffer * eventsBuffer)
{
    std::string parseError;
    llvm::Module * llvmModule = ParseBitcodeFile(eventsBuffer, llvmContext, &parseError);
    std::cout << parseError;

    if (!llvmModule)
    {
        std::cout << "Module creation failed\n";
        return false;
    }

    engineReady = false;

    std::string error;
    llvmExecutionEngine.reset( llvm::ExecutionEngine::createJIT(llvmModule, &error, 0, llvm::CodeGenOpt::None)); //No optimisation during machine code generation
    if (!llvmExecutionEngine)
    {
        std::cout << "unable to make execution engine: " << error << "\n";
        return false;
    }

    llvm::Function * eventsEntryFunction = llvmModule->getFunction("main");
    if (!eventsEntryFunction)
    {
        std::cout << "'main' function not found in module.\n";
        return false;
    }

    std::cout << "Mapping objects of execution engine...\n";
    llvm::GlobalValue *globalValue = llvm::cast<llvm::GlobalValue>(llvmModule->getOrInsertGlobal("pointerToRuntimeContext", llvm::TypeBuilder<void*, false>::get(llvmModule->getContext())));
    llvmExecutionEngine->addGlobalMapping(globalValue, &llvmRuntimeContext);

    // Using this, warnAboutUnknownFunctions is called if we need to generate code for an unknown function.
    // As each function should normally be provided by extensions or gd, no such unknown function should exists.
    // If warnAboutUnknownFunctions is called, it will prevent LLVM from crashing by returning a dummy function, and
    // will warn the user about this problem.
    llvmExecutionEngine->InstallLazyFunctionCreator(UseSubstituteForUnknownFunctions);

    std::cout << "JIT Compilation to machine code...\n";
    sf::Clock jitTimer;
    compiledRawFunction = llvmExecutionEngine->getPointerToFunction(eventsEntryFunction);
    std::cout << "JIT Compilation duration: " << jitTimer.GetElapsedTime()/1000.0f <<"s"<<std::endl;

    engineReady = true;
    return true;
}

void GDEmptyFunctionDoingNothing()
{
    //Let me empty please.
}

void* UseSubstituteForUnknownFunctions(const std::string& name)
{
    std::cout << "WARNING: Call to unknown function \"" << name << "\" redirected to GDEmptyFunctionDoingNothing." << std::endl;
    #if defined(GD_IDE_ONLY)
    wxLogError(_("Une extension ou fonctionnalité de Game Develop présente une erreur. Veuillez rapporter ce problème au développeur de Game Develop en indiquant ce message d'erreur :\n")+name+_("\nDes actions/conditions du jeu ne s'executeront pas correctement."));
    #endif
    return (void*)(intptr_t)GDEmptyFunctionDoingNothing;
}
