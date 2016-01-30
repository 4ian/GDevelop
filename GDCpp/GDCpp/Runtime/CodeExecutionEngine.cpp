/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include "GDCore/Tools/Localization.h"
#include "CodeExecutionEngine.h"
#include "GDCpp/Runtime/RuntimeContext.h"
#include "GDCpp/Runtime/Tools/DynamicLibrariesTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Tools/Log.h"
#endif

CodeExecutionEngine::CodeExecutionEngine() :
    runtimeContext(NULL),
    loaded(false),
    dynamicLibrary(NULL),
    function(NULL)
{
}

CodeExecutionEngine::~CodeExecutionEngine()
{
    if ( loaded ) Unload();
}

void CodeExecutionEngine::Unload()
{
    std::cout << "Unloaded compiled code" << dynamicLibrary << std::endl;
    loaded = false;

    if ( dynamicLibrary != NULL ) gd::CloseLibrary(dynamicLibrary);
    dynamicLibrary = NULL;
    function = NULL;
    dynamicLibraryFilename.clear();
    functionName.clear();
}

bool CodeExecutionEngine::LoadFromDynamicLibrary(const gd::String & filename, const gd::String & mainFunctionName)
{
    if ( loaded ) Unload();

    dynamicLibraryFilename = filename;
    functionName = mainFunctionName;

    dynamicLibrary = gd::OpenLibrary(dynamicLibraryFilename.ToLocale().c_str());
    if ( dynamicLibrary == NULL )
    {
        std::cout << "ERROR: Unable to load " << dynamicLibraryFilename << std::endl;
        std::cout << "Full error message: " << gd::DynamicLibraryLastError() << std::endl;
        return false;
    }

    function = gd::GetSymbol(dynamicLibrary, functionName.c_str());
    if ( function == NULL )
    {
        std::cout << "ERROR: Unable to find " << functionName << " in " << dynamicLibraryFilename << std::endl;
        std::cout << "(Dynamic library unloaded)" << std::endl;
        std::cout << "Full error message: " << gd::DynamicLibraryLastError() << std::endl;

        gd::CloseLibrary(dynamicLibrary);
        dynamicLibrary = NULL;
        return false;
    }

    std::cout << "Loaded compiled code" << dynamicLibrary << std::endl;
    loaded = true;
    return true;
}

bool CodeExecutionEngine::LoadFunction(functionType fn)
{
    if ( loaded ) Unload();

    function = (void *)fn;
    if (!function)
    {
        std::cout << "ERROR: Unable to use the specified function for a code execution engine." << std::endl;
        return false;
    }
    std::cout << "Loaded function" << function << std::endl;

    loaded = true;
    return true;
}

void CodeExecutionEngine::Init(const CodeExecutionEngine & other)
{
    runtimeContext = other.runtimeContext;

    if ( loaded ) Unload();
    if ( other.Ready() ) LoadFromDynamicLibrary(other.dynamicLibraryFilename, other.functionName);
}
