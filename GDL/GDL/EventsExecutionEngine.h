/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSEXECUTIONENGINE_H
#define EVENTSEXECUTIONENGINE_H

#include <string>
#include <llvm/ADT/OwningPtr.h>
#include <llvm/LLVMContext.h>
namespace llvm
{
    class Function;
    class Module;
    class ExecutionEngine;
    class MemoryBuffer;
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

    /**
     * Initialize execution engine from bitCode.
     */
    bool LoadFromLLVMBitCode(const std::string & bitCode);

    /**
     * Initialize execution engine from bitCode loaded in memory.
     */
    bool LoadFromLLVMBitCode(llvm::MemoryBuffer * eventsBuffer);

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

/**
 * Blank function doing nothing used as a substitute for functions which were not found by JIT when generating machine code
 */
void GDEmptyFunctionDoingNothing();

/**
 * Called by llvm JIT when an unknown function is needed: As it should not happen, this function will warn the user about the error
 * and will return a pointer to a blank function to prevent crash.
 */
void* UseSubstituteForUnknownFunctions(const std::string& name);

#endif // EVENTSEXECUTIONENGINE_H
