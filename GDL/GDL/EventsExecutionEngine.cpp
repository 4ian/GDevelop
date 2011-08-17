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

EventsExecutionEngine::EventsExecutionEngine()
{
    llvmRuntimeContext = new RuntimeContext(NULL);
}

EventsExecutionEngine::~EventsExecutionEngine()
{
    if ( llvmRuntimeContext != NULL ) delete llvmRuntimeContext;
}

void EventsExecutionEngine::Execute()
{
    const std::vector< llvm::GenericValue > args;
    llvmExecutionEngine->runFunction(eventsEntryFunction, args);
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
