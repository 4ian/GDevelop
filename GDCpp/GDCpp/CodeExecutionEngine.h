/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef CODEEXECUTIONENGINE_H
#define CODEEXECUTIONENGINE_H
#include "GDCpp/Tools/DynamicLibrariesTools.h"
#include "GDCpp/RuntimeContext.h"
#include <vector>
#include <string>

/**
 * \brief Wrapper allowing to load a dynamic library and launch a specific function.
 *
 * RuntimeScene uses this class to launch compiled events. In particular, the signature of the function
 * of the dynamic library must be :
 \code
void functionName(RuntimeContext *);
 \endcode
 *
 * \see CodeCompilationHelpers
 * \see CodeCompiler
 *
 * \ingroup CodeExecutionEngine
 */
class GD_API CodeExecutionEngine
{
public:

    /**
     * Construct an empty engine.
     */
    CodeExecutionEngine();

    /**
     * Create an engine from another: The new execution engine will load the same library as the source execution engine.
     */
    CodeExecutionEngine(const CodeExecutionEngine & other) : runtimeContext(other.runtimeContext) { Init(other); };

    /**
     * Create an engine from another: The new execution engine will load the same library as the source execution engine.
     */
    CodeExecutionEngine& operator=(const CodeExecutionEngine & other) {if( (this) != &other ) Init(other); return *this; }

    /**
     * Destructor: Unload if necessary the dynamic library.
     */
    virtual ~CodeExecutionEngine();

    /**
     * Execute the function specified during the call to LoadFromDynamicLibrary
     *
     * \warning Beware, there is no protection against calling Execute on an CodeExecutionEngine that is not (or badly) initialized.
     */
    void Execute() { ((void(*)(RuntimeContext *))function)(&runtimeContext); };

    /**
     * Return true if an initialization from a dynamic library has been made successfully and if Execute can be called.
     */
    bool Ready() const { return loaded; };

    /**
     * Unload the dynamic library from memory.
     *
     * \warning Of course, Execute() can not be called after Unload() is called.
     */
    void Unload();

    /**
     * Initialize the engine from a dynamic library, which is kept loaded in memory.
     *
     * \param filename The dynamic library to be loaded
     * \param mainFunctionName The name of the function to be executed when Execute() is called. The function signature must be void functionName(RuntimeContext *);
     *
     * \return true if the CodeExecutionEngine is successfully initialized and Execute() can be called.
     */
    bool LoadFromDynamicLibrary(const gd::String & filename, const gd::String & mainFunctionName);

    RuntimeContext runtimeContext; ///< The object passed as parameter to the function of the dynamic library.

private:

    bool loaded; ///< True if a dynamic library is loaded and a function is ready to be executed.
    gd::String dynamicLibraryFilename; ///< The filename of the dynamic library loaded in memory.
    Handle dynamicLibrary; ///< The dynamic library loaded in memory.
    gd::String functionName; ///< The name of the function of the dynamic library to be executed.
    void * function; ///< Pointer to function to be executed.

    void Init(const CodeExecutionEngine & other);
};


#endif // CODEEXECUTIONENGINE_H
