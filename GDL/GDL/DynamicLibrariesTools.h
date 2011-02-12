/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DYNAMICLIBRARIESTOOLS_H
#define DYNAMICLIBRARIESTOOLS_H

#if defined(WINDOWS)
    #include <windows.h>
    typedef HINSTANCE Handle;
#elif defined(LINUX)
    typedef void* Handle;
#else
    #warning No system supported for dynamic libraries loading
    typedef void* Handle;
#endif

namespace GDpriv
{

Handle OpenLibrary(const char* path);
void* GetSymbol(Handle library, const char* name);
void CloseLibrary(Handle library);

};

#endif // DYNAMICLIBRARIESTOOLS_H
