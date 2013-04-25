/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/IDE/PlatformLoader.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/Tools/DynamicLibrariesTools.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/CommonTools.h"
#include <wx/msgdlg.h>
#include <wx/filename.h>
//Compiler specific include, for listing files of directory ( see below )
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
    boost::shared_ptr<gd::Platform> platform = LoadPlatformInManager("gdl.dll");
    if (platform) gd::ExtensionsLoader::LoadAllExtensions("./CppPlatform/Extensions/", *platform);
}

boost::shared_ptr<gd::Platform> PlatformLoader::LoadPlatformInManager(std::string fullpath)
{
    std::cout << "Loading platform " << fullpath << "...";
    Handle platformHdl = OpenLibrary(fullpath.c_str());
    if (platformHdl == NULL)
    {
        std::string error = DynamicLibraryLastError();

        cout << "fail." << endl;
        cout << "Error returned : \"" << error << "\"" << endl;
        wxString userMsg = string(_("Platform "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more informations.\n\nDetailed log:\n") + error);
        wxMessageBox(userMsg, _("Platform not compatible"), wxOK | wxICON_EXCLAMATION);
    }
    else
    {
        CreatePlatformFunPtr createFunPtr = (CreatePlatformFunPtr)GetSymbol(platformHdl, "CreateGDPlatform");
        DestroyPlatformFunPtr destroyFunPtr = (DestroyPlatformFunPtr)GetSymbol(platformHdl, "DestroyGDPlatform");

        if ( createFunPtr == NULL || destroyFunPtr == NULL )
        {
            cout << "fail ( no valid create/destroy functions )." << endl;

            CloseLibrary(platformHdl);
            wxString userMsg = string(_("Platform "))+ fullpath + string(_(" could not be loaded.\nContact the developer for more informations.\n\nDetailed log:\nNo valid create/destroy functions." ));
            wxMessageBox(userMsg, _("Platform not compatible"), wxOK | wxICON_EXCLAMATION);
        }
        else
        {
            std::cout << ".";
            gd::LocaleManager::GetInstance()->AddCatalog(ToString(wxFileName(fullpath).GetName())); //In editor, load catalog associated with extension, if any.

            std::cout << ".";
            boost::shared_ptr<gd::Platform> platform(createFunPtr(), destroyFunPtr);
            std::cout << ".done." << std::endl;
            gd::PlatformManager::GetInstance()->AddPlatform(platform);
            return platform;
        }
    }

    return boost::shared_ptr<gd::Platform>();
}


}
