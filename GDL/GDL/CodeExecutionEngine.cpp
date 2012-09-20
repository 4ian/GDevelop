/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "CodeExecutionEngine.h"
#include <llvm/ExecutionEngine/GenericValue.h>
#include <llvm/ExecutionEngine/ExecutionEngine.h>
#include <llvm/ExecutionEngine/JIT.h>
#include <llvm/Support/DynamicLibrary.h>
#include <llvm/Config/config.h>
#include <llvm/Module.h>
#include <llvm/Support/TargetSelect.h>
#include <llvm/Bitcode/ReaderWriter.h>
#include <llvm/Support/MemoryBuffer.h>
#include <llvm/Support/TypeBuilder.h>
#undef _ //llvm/Support/system_error.h does not support wxWidgets "_" macro
#include <llvm/Support/system_error.h>
#include <llvm/Linker.h>
#include <SFML/System.hpp>
#include "GDL/RuntimeContext.h"

#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#include <wx/log.h>
#endif

bool CodeExecutionEngine::llvmTargetsInitialized = false;

void CodeExecutionEngine::EnsureLLVMTargetsInitialization()
{
    if ( !llvmTargetsInitialized )
    {
        llvm::InitializeNativeTarget();
        llvmTargetsInitialized = true;
    }
}

void CodeExecutionEngine::LoadDynamicLibraries()
{
    #if defined(WINDOWS) //Other system uses by default standard library as a shared library
    std::string error;
    llvm::sys::DynamicLibrary::LoadLibraryPermanently("libstdc++-6.dll", &error);
    if ( !error.empty() ) std::cout << error;
    #endif
}

CodeExecutionEngine::CodeExecutionEngine() :
    engineReady(false)
{
    llvmRuntimeContext = new RuntimeContext(NULL);
}

CodeExecutionEngine::~CodeExecutionEngine()
{
    if ( llvmRuntimeContext != NULL ) delete llvmRuntimeContext;
}

bool CodeExecutionEngine::LoadFromLLVMBitCode(std::vector< std::pair<const char * /*src*/, unsigned int /*size*/> > data)
{
    std::vector < llvm::MemoryBuffer* > codeBuffers;
    for (unsigned int i = 0;i<data.size();++i)
    {
        llvm::StringRef input_data(data[i].first);
        llvm::StringRef buffer_name("src");
        llvm::MemoryBuffer * codeBuffer;
        codeBuffer = llvm::MemoryBuffer::getNewMemBuffer(data[i].second, "src");
        memcpy((char*)codeBuffer->getBufferStart(), data[i].first, data[i].second);

        codeBuffers.push_back(codeBuffer);
    }

    bool result = LoadFromLLVMBitCode(codeBuffers);
    for (unsigned int i = 0;i<codeBuffers.size();++i) delete codeBuffers[i];

    return result;
}

bool CodeExecutionEngine::LoadFromLLVMBitCode(std::vector<llvm::MemoryBuffer *> bitcodeBuffers)
{
    if ( bitcodeBuffers.empty() )
    {
        std::cout << "No bitcode to load." << std::endl;
        return false;
    }

    //Load the first module
    std::string parseError;
    llvm::Module * llvmMainModule = ParseBitcodeFile(bitcodeBuffers[0], llvmContext, &parseError);
    std::cout << parseError;

    if (!llvmMainModule)
    {
        std::cout << "Unable to create main module from bitcode.\n";
        return false;
    }

    engineReady = false;

    //Create the execution engine, used to generate the machine code.
    std::string error;
    llvmExecutionEngine.reset( llvm::ExecutionEngine::createJIT(llvmMainModule, &error, 0, llvm::CodeGenOpt::None)); //No optimisation during machine code generation
    if (!llvmExecutionEngine)
    {
        std::cout << "Unable to make execution engine: " << error << "\n";
        return false;
    }

    llvm::Function * eventsEntryFunction = llvmMainModule->getFunction("main");
    if (!eventsEntryFunction)
    {
        std::cout << "'main' function not found in the main module.\n";
        return false;
    }

    std::cout << "Mapping objects of execution engine...\n";
    llvm::GlobalValue *globalValue = llvm::cast<llvm::GlobalValue>(llvmMainModule->getOrInsertGlobal("pointerToRuntimeContext", llvm::TypeBuilder<void*, false>::get(llvmMainModule->getContext())));
    llvmExecutionEngine->addGlobalMapping(globalValue, &llvmRuntimeContext);

    // Using this, warnAboutUnknownFunctions is called if we need to generate code for an unknown function.
    // As each function should normally be provided by extensions or gd, no such unknown function should exists.
    // If warnAboutUnknownFunctions is called, it will prevent LLVM from crashing by returning a dummy function, and
    // will warn the user about this problem.
    llvmExecutionEngine->InstallLazyFunctionCreator(UseSubstituteForUnknownFunctions);

    //Load all supplementary bitcode files to modules and add them to the main module
    if ( bitcodeBuffers.size() > 1 ) std::cout << "Loading modules from secondary bitcode buffers..." << std::endl;
    for (unsigned int i = 1;i<bitcodeBuffers.size();++i)
    {
        std::string parseError;
        llvm::Module * llvmModule = ParseBitcodeFile(bitcodeBuffers[i], llvmContext, &parseError);
        std::cout << parseError;

        if ( llvmModule == NULL)
        {
            std::cout << "WARNING: A (secondary) bitcode buffer could not be loaded to a module." << std::endl;
            continue;
        }

        std::string linkError;
        if ( llvm::Linker::LinkModules(llvmMainModule, llvmModule, 0, &linkError) /*LinkModules return true if an error occurred. */)
        {
            std::cout << "WARNING: A (secondary) bitcode module could not be linked to the main module: " << linkError << std::endl;
            continue;
        }
    }

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
    wxLogError(_("An extension or a feature of Game Develop has an error. Please report this problem to Game Develop author, including this error message:\n")+name+_("\nActions or conditions of the game will not execute properly."));
    #endif
    return (void*)(intptr_t)GDEmptyFunctionDoingNothing;
}

