/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include "GDL/DynamicLibrariesTools.h"
#if defined(WINDOWS)
    #include <windows.h>
    #include "CommonTools.h"
#elif defined(LINUX) || defined (MAC)
    #include <dlfcn.h>
#endif

namespace GDpriv
{

#if defined(WINDOWS)
    Handle OpenLibrary(const char* path) {return LoadLibrary(path);}
    void* GetSymbol(Handle library, const char* name) { return (void*)GetProcAddress(library, name);}
    void CloseLibrary(Handle library) {FreeLibrary(library);}
    std::string DynamicLibraryLastError()
    {
        LPSTR lpMsgBuf;
        DWORD dw = GetLastError();

        FormatMessage(
            FORMAT_MESSAGE_ALLOCATE_BUFFER |
            FORMAT_MESSAGE_FROM_SYSTEM |
            FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,
            dw,
            MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
            (LPTSTR) &lpMsgBuf,
            0, NULL );

        std::string errorMsg = "Error ("+ToString(dw)+"): "+std::string(lpMsgBuf);
        return errorMsg;
    }
#elif defined(LINUX) || defined (MAC)
    Handle OpenLibrary(const char* path) {return dlopen(path, RTLD_LAZY);}
    void* GetSymbol(Handle library, const char* name) { return dlsym(library, name);}
    void CloseLibrary(Handle library) {dlclose(library);}
    std::string DynamicLibraryLastError() {return std::string(dlerror());}
    Handle SetLibraryGlobal(const char* path) {return dlopen(path, RTLD_NOLOAD|RTLD_GLOBAL);}
#else
    #warning System not supported for dynamic libraries loading
#endif

}
