/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/IDE/PlatformLoader.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/String.h"
#include "GDCore/Tools/DynamicLibrariesTools.h"
// Compiler specific include, for listing files of directory (see below)
#if defined(__GNUC__)
#include <dirent.h>
#elif defined(_MSC_VER)
#include <windows.h>
#endif

typedef gd::Platform* (*CreatePlatformFunPtr)();
typedef void (*DestroyPlatformFunPtr)(gd::Platform*);

using namespace std;

namespace gd {

PlatformLoader::PlatformLoader() {}

std::shared_ptr<gd::Platform> PlatformLoader::LoadPlatformInManager(
    gd::String fullpath) {
  std::cout << "Loading platform " << fullpath << "..." << std::endl;
  Handle platformHdl = OpenLibrary(
      fullpath.ToLocale().c_str());  // Use the system locale for filepath
  if (platformHdl == NULL) {
    gd::String error = DynamicLibraryLastError();

    cout << "Loading of " << fullpath << " failed." << endl;
    cout << "Error returned : \"" << error << "\"" << endl;
  } else {
    CreatePlatformFunPtr createFunPtr =
        (CreatePlatformFunPtr)GetSymbol(platformHdl, "CreateGDPlatform");
    DestroyPlatformFunPtr destroyFunPtr =
        (DestroyPlatformFunPtr)GetSymbol(platformHdl, "DestroyGDPlatform");

    if (createFunPtr == NULL || destroyFunPtr == NULL) {
      cout << "Loading of " << fullpath
           << " failed (no valid create/destroy functions)." << endl;

      CloseLibrary(platformHdl);
    } else {
      std::shared_ptr<gd::Platform> platform(createFunPtr(), destroyFunPtr);
      std::cout << "Loading of " << fullpath << " done." << std::endl;

      gd::PlatformManager::Get()->AddPlatform(platform);
      std::cout << "Registration in platform manager of " << fullpath
                << " done." << std::endl;
      return platform;
    }
  }

  return std::shared_ptr<gd::Platform>();
}

}  // namespace gd
