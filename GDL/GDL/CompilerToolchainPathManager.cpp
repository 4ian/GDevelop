
#if defined(GD_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include <wx/config.h>
#include "CompilerToolchainPathManager.h"

CompilerToolchainPathManager::CompilerToolchainPathManager()
{
    {
        wxString result;
        wxConfigBase::Get()->Read("gccCompilerExecutablePath", &result, "C:/Mingw/bin/mingw32-g++");
        gccCompilerExecutablePath = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("wxwidgetsLibDir", &result, "C:/Libs/wxwidgets/lib/gcc_dll");
        wxwidgetsLibDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("wxwidgetsLibDir2", &result, "C:/Libs/wxwidgets/lib/gcc_dll/msw");
        wxwidgetsLibDir2 = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("wxwidgetsIncludeDir", &result, "C:/Libs/wxwidgets/include/");
        wxwidgetsIncludeDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("wxwidgetsIncludeDir2", &result, "C:/Libs/wxwidgets/lib/gcc_dll/msw");
        wxwidgetsIncludeDir2 = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("sfmlLibDir", &result, "C:/Libs/SFML/bin-mingw-release/lib");
        sfmlLibDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("sfmlIncludeDir", &result, "C:/Libs/SFML/include/");
        sfmlIncludeDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("boostIncludeDir", &result, "C:/Libs/boost_1_43_0");
        boostIncludeDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("gdlIncludeDir", &result, "D:/Florian/Programmation/GameDevelop/GDL");
        gdlIncludeDir = result;
    }
    {
        wxString result;
        wxConfigBase::Get()->Read("gdlLibDir", &result, "D:/Florian/Programmation/GameDevelop/IDE/bin/dev");
        gdlLibDir = result;
    }

}

CompilerToolchainPathManager::~CompilerToolchainPathManager()
{
    //dtor
}

#endif
#endif
