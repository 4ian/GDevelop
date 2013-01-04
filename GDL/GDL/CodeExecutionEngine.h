/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CODEEXECUTIONENGINE_H
#define CODEEXECUTIONENGINE_H

#include <vector>
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
 * \brief Manage all llvm related stuff to launch compiled events code.
 *
 * RuntimeScene uses this class to launch compiled events.
 * Set up this class by loading bitcode compiled by CodeCompiler.
 *
 * \see CodeCompilationHelpers
 * \see CodeCompiler
 *
 * \ingroup CodeExecutionEngine
 */
class GD_API CodeExecutionEngine
{
public:
    CodeExecutionEngine();
    virtual ~CodeExecutionEngine();

    /**
     * Execute compiled events.
     * Beware, there is no protection against calling Execute on an CodeExecutionEngine that is not initialized with bitcode
     */
    void Execute() { ((void(*)(RuntimeContext *))compiledRawFunction)(llvmRuntimeContext); };

    /**
     * Return true if loading from bitcode has been made successfully and if Execute can be called.
     */
    bool const Ready() { return engineReady; };

    void SetNotReady() { engineReady = false; };

    /**
     * Initialize execution engine from bitcode stored in memory.
     * Buffers passed as parameter are internally copied.
     *
     * \param data vector containing std::pair : The first member is the raw memory buffer, and the second member is the size of the buffer.
     */
    bool LoadFromLLVMBitCode(std::vector< std::pair<const char * /*src*/, unsigned int /*size*/> > data, const std::string & functionToCallName);

    /**
     * Initialize execution engine from bitcode loaded in llvm::MemoryBuffer.
     * The first bitcode buffer will be used to generate the main llvm module, and the other will be linked to the first one.
     *
     * \param bitcodeBuffers vector containing one or more pointers to memory buffers containing bitcode. These buffers won't be modified or freed by the function.
     * \param functionToCallName The name of the function to be called.
     */
    bool LoadFromLLVMBitCode(std::vector<llvm::MemoryBuffer *> bitcodeBuffers, const std::string & functionToCallName);

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


#endif // CODEEXECUTIONENGINE_H

