/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(WINDOWS)
#include <windows.h>
#include "GDCore/CommonTools.h"
#elif defined(LINUX) || defined(MACOS)
#include <dlfcn.h>
#endif
#include <string>
#include "GDCore/Tools/DynamicLibrariesTools.h"

namespace gd {

#if defined(WINDOWS)
Handle OpenLibrary(const char* path) { return LoadLibrary(path); }
void* GetSymbol(Handle library, const char* name) {
  return (void*)GetProcAddress(library, name);
}
void CloseLibrary(Handle library) { FreeLibrary(library); }
gd::String DynamicLibraryLastError() {
  LPSTR lpMsgBuf;
  DWORD dw = GetLastError();

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM |
                    FORMAT_MESSAGE_IGNORE_INSERTS,
                NULL,
                dw,
                MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
                (LPTSTR)&lpMsgBuf,
                0,
                NULL);

  gd::String errorMsg = "Error (" + gd::String::From(dw) +
                        "): " + gd::String::FromLocale(std::string(lpMsgBuf));
  return errorMsg;
}
#elif defined(LINUX) || defined(MACOS)
Handle OpenLibrary(const char* path) { return dlopen(path, RTLD_LAZY); }
void* GetSymbol(Handle library, const char* name) {
  return dlsym(library, name);
}
void CloseLibrary(Handle library) { dlclose(library); }
gd::String DynamicLibraryLastError() {
  return gd::String::FromLocale(std::string(dlerror()));
}
Handle SetLibraryGlobal(const char* path) {
  // RTLD_NOLOAD has the library is already opened.
  // RTLD_NOW to be sure that all symbols are existing (Otherwise, could get
  // strange "symbol lookup error"!) RTLD_GLOBAL to make the symbols available
  // to all shared library (in particular, compiled events code).
  return dlopen(path, RTLD_NOLOAD | RTLD_NOW | RTLD_GLOBAL);
}
#else
#warning System not supported for dynamic libraries loading
Handle OpenLibrary(const char* path) { return nullptr; }
void* GetSymbol(Handle library, const char* name) { return nullptr; }
void CloseLibrary(Handle library) {}
gd::String DynamicLibraryLastError() { return ""; }
Handle SetLibraryGlobal(const char* path) { return nullptr; }
#endif

}  // namespace gd
