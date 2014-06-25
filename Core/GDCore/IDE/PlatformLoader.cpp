/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include <string>
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/IDE/PlatformLoader.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/Tools/DynamicLibrariesTools.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/CommonTools.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/msgdlg.h>
#include <wx/filename.h>
#endif
//Compiler specific include, for listing files of directory (see below)
#if defined(__GNUC__)
#include <dirent.h>
#elif defined(_MSC_VER)
#include <windows.h>
#endif

typedef gd::Platform* (*CreatePlatformFunPtr)();
typedef void (*DestroyPlatformFunPtr)(gd::Platform*);

using namespace std;

namespace gd
{

PlatformLoader::PlatformLoader()
{
}

void PlatformLoader::LoadAllPlatformsInManager(std::string dir)
{
    {
        #if defined(WINDOWS)
        boost::shared_ptr<gd::Platform> platform = LoadPlatformInManager("GDCpp.dll");
        #elif defined(LINUX)
        boost::shared_ptr<gd::Platform> platform = LoadPlatformInManager("libGDCpp.so");
        #else
        #warning Add the appropriate filename here for the C++ Platform!
        boost::shared_ptr<gd::Platform> platform;
        #endif
        if (platform) gd::ExtensionsLoader::LoadAllExtensions("./CppPlatform/Extensions/", *platform);
        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        gd::LocaleManager::Get()->AddPath("./CppPlatform/Extensions/locale");
        #endif
    }

    {
        #if defined(WINDOWS)
        boost::shared_ptr<gd::Platform> platform = LoadPlatformInManager("./JsPlatform/GDJS.dll");
        #elif defined(LINUX)
        boost::shared_ptr<gd::Platform> platform = LoadPlatformInManager("./JsPlatform/libGDJS.so");
        #else
        #warning Add the appropriate filename here for the Js Platform!
        boost::shared_ptr<gd::Platform> platform;
        #endif
        if (platform) gd::ExtensionsLoader::LoadAllExtensions("./JsPlatform/Extensions/", *platform);
        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        gd::LocaleManager::Get()->AddPath("./JsPlatform/Extensions/locale");
        #endif
    }

    gd::ExtensionsLoader::ExtensionsLoadingDone("./CppPlatform/Extensions/");
}

boost::shared_ptr<gd::Platform> PlatformLoader::LoadPlatformInManager(std::string fullpath)
{
    std::cout << "Loading platform " << fullpath << "..." << std::endl;
    Handle platformHdl = OpenLibrary(fullpath.c_str());
    if (platformHdl == NULL)
    {
        std::string error = DynamicLibraryLastError();

        cout << "Loading of "<< fullpath <<" failed." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        wxString userMsg = string(_("Platform "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more information.\n\nDetailed log:\n") + error);
        wxMessageBox(userMsg, _("Platform not compatible"), wxOK | wxICON_EXCLAMATION);
        #endif
    }
    else
    {
        CreatePlatformFunPtr createFunPtr = (CreatePlatformFunPtr)GetSymbol(platformHdl, "CreateGDPlatform");
        DestroyPlatformFunPtr destroyFunPtr = (DestroyPlatformFunPtr)GetSymbol(platformHdl, "DestroyGDPlatform");

        if ( createFunPtr == NULL || destroyFunPtr == NULL )
        {
            cout << "Loading of "<< fullpath <<" failed (no valid create/destroy functions)." << endl;

            CloseLibrary(platformHdl);

            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            wxString userMsg = string(_("Platform "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more information.\n\nDetailed log:\nNo valid create/destroy functions." ));
            wxMessageBox(userMsg, _("Platform not compatible"), wxOK | wxICON_EXCLAMATION);
            #endif
        }
        else
        {
            #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
            gd::LocaleManager::Get()->AddCatalog(ToString(wxFileName(fullpath).GetName())); //In editor, load catalog associated with extension, if any.
            #endif

            boost::shared_ptr<gd::Platform> platform(createFunPtr(), destroyFunPtr);
            std::cout << "Loading of " << fullpath << " done." << std::endl;

            gd::PlatformManager::Get()->AddPlatform(platform);
            std::cout << "Registration in platform manager of " << fullpath << " done." << std::endl;
            return platform;
        }
    }

    return boost::shared_ptr<gd::Platform>();
}


}