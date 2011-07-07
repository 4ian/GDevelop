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
#undef _
#include <llvm/Support/system_error.h>
#include "GDL/RuntimeContext.h"

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
