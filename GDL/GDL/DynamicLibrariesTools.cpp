/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/DynamicLibrariesTools.h"
#if defined(WINDOWS)
    #include <windows.h>
#elif defined(LINUX) || defined (MAC)
    #include <dlfcn.h>
#endif

namespace GDpriv
{

#if defined(WINDOWS)
    Handle OpenLibrary(const char* path) {return LoadLibrary(path);}
    void* GetSymbol(Handle library, const char* name) { return (void*)GetProcAddress(library, name);}
    void CloseLibrary(Handle library) {FreeLibrary(library);}
#elif defined(LINUX) || defined (MAC)
    Handle OpenLibrary(const char* path) {return dlopen(path, RTLD_LAZY);}
    void* GetSymbol(Handle library, const char* name) { return dlsym(library, name);}
    void CloseLibrary(Handle library) {dlclose(library);}
#else
    #warning System not supported for dynamic libraries loading
#endif

}
