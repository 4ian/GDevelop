/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "CodeExecutionEngine.h"
#include "GDL/RuntimeContext.h"
#include "GDL/DynamicLibrariesTools.h"
#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#include <wx/log.h>
#endif

void CodeExecutionEngine::LoadDynamicLibraries()
{
}

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

    if ( dynamicLibrary != NULL ) GDpriv::CloseLibrary(dynamicLibrary);
    dynamicLibrary = NULL;
    function = NULL;
    dynamicLibraryFilename.clear();
    functionName.clear();
}

bool CodeExecutionEngine::LoadFromDynamicLibrary(const std::string & filename, const std::string & mainFunctionName)
{
    if ( loaded ) Unload();

    dynamicLibraryFilename = filename;
    functionName = mainFunctionName;

    dynamicLibrary = GDpriv::OpenLibrary(dynamicLibraryFilename.c_str());
    if ( dynamicLibrary == NULL )
    {
        std::cout << "ERROR: Unable to load " << dynamicLibraryFilename << std::endl;
        std::cout << "Full error message: " << GDpriv::DynamicLibraryLastError() << std::endl;
        return false;
    }

    function = GDpriv::GetSymbol(dynamicLibrary, functionName.c_str());
    if ( function == NULL )
    {
        std::cout << "ERROR: Unable to find " << functionName << " in " << dynamicLibraryFilename << std::endl;
        std::cout << "(Dynamic library unloaded)" << std::endl;
        std::cout << "Full error message: " << GDpriv::DynamicLibraryLastError() << std::endl;

        GDpriv::CloseLibrary(dynamicLibrary);
        dynamicLibrary = NULL;
        return false;
    }

    std::cout << "Loaded compiled code" << dynamicLibrary << std::endl;
    loaded = true;
    return true;
}

void CodeExecutionEngine::Init(const CodeExecutionEngine & other)
{
    runtimeContext = other.runtimeContext;

    if ( loaded ) Unload();
    if ( other.Ready() ) LoadFromDynamicLibrary(other.dynamicLibraryFilename, other.functionName);
}
