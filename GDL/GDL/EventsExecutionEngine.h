/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
     * Beware, there is no protection against calling Execute on an EventsExecutionEngine that is not initalized with bitcode
     */
    void Execute() { ((void(*)())compiledRawFunction)(); };

    /**
     * Return true if loading from bitcode has been made successfully and if Execute can be called.
     */
    bool const Ready() { return engineReady; };

    void SetNotReady() { engineReady = false; };

    /**
     * Initialize execution engine from bitCode stored in memory.
     */
    bool LoadFromLLVMBitCode(const char * src, unsigned int size);

    /**
     * Initialize execution engine from bitCode loaded in memory.
     */
    bool LoadFromLLVMBitCode(llvm::MemoryBuffer * eventsBuffer);

    void * compiledRawFunction; ///< Pointer to compiled events entry function.
    llvm::LLVMContext llvmContext;
    llvm::OwningPtr<llvm::ExecutionEngine> llvmExecutionEngine;
    RuntimeContext * llvmRuntimeContext; ///<Pointer is needed here.

    /**
     * To be called during program startup, or at least before launching events.
     */
    static void EnsureLLVMTargetsInitialization();

    /**
     * Load dynamic libraries needed by gd events generated code ( libstdc++ basically )
     */
    static void LoadDynamicLibraries();

private:
    bool engineReady;
    std::string error;

    static bool llvmTargetsInitialized;
};

/**
 * Blank function doing nothing used as a substitute for functions which were not found by JIT when generating machine code
 */
void GDEmptyFunctionDoingNothing();

/**
 * Called by llvm JIT when an unknown function is needed: As it should not happen, this function will warn the user about the error
 * and will return a pointer to a blank function to prevent crash.
 *
 * \see GDEmptyFunctionDoingNothing
 */
void* UseSubstituteForUnknownFunctions(const std::string& name);

#endif // EVENTSEXECUTIONENGINE_H
