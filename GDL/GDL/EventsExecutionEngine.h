#ifndef EVENTSEXECUTIONENGINE_H
#define EVENTSEXECUTIONENGINE_H

#include <llvm/ADT/OwningPtr.h>
#include <llvm/LLVMContext.h>
namespace llvm
{
    class Function;
    class Module;
    class ExecutionEngine;
}
class RuntimeContext;

/**
 * \brief Manage all llvm related stuff to launch compiled events.
 * RuntimeScene uses this class to launch events.
 * This class is setup by EventsCodeCompiler.
 */
class GD_API EventsExecutionEngine
{
public:
    EventsExecutionEngine();
    virtual ~EventsExecutionEngine();

    /**
     * Execute compiled events.
     */
    void Execute();

    bool beingExecuted; ///< Runtime scene has to set this to true when the scene is being played, so as to prevent compiled events to be replaced during a preview, which would result in a crash.
    llvm::LLVMContext llvmContext;
    llvm::Function * eventsEntryFunction;
    llvm::Module * llvmModule;
    llvm::OwningPtr<llvm::ExecutionEngine> llvmExecutionEngine;
    RuntimeContext * llvmRuntimeContext; ///<Pointer is needed here.

    /**
     * To be called during program startup, or at least before launching events.
     */
    static void EnsureLLVMTargetsInitialization();

private:
    static bool llvmTargetsInitialized;
};

#endif // EVENTSEXECUTIONENGINE_H
