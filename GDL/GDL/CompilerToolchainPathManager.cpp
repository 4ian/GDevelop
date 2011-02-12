/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include <wx/config.h>
#include <wx/filefn.h>
#include <wx/intl.h>
#include "CompilerToolchainPathManager.h"

namespace GDpriv
{

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

bool CompilerToolchainPathManager::AllPathsAreValid(std::string & report) const
{
    bool ok = true;
    if ( !wxFileExists(gccCompilerExecutablePath) )
    {
        report += _("Le compilateur GCC est incorrectement configuré.\n");
        ok = false;
    }

    if ( !wxDirExists(wxwidgetsLibDir) )
    {
        report += _("Le chemin de la bibliothèque wxWidgets n'existe pas.\n");
        ok = false;
    }
    else if ( !wxFileExists(wxwidgetsLibDir+"/libwxbase29.a") )
    {
        report += _("La bibliothèque wxWidgets semble être incorrecte.\n");
        ok = false;
    }

    if ( !wxDirExists(sfmlLibDir) )
    {
        report += _("Le chemin de la bibliothèque SFML n'existe pas.\n");
        ok = false;
    }
    else if ( !wxFileExists(sfmlLibDir+"/libsfml-graphics.a") )
    {
        report += _("La bibliothèque SFML semble être incorrecte.\n");
        ok = false;
    }

    if ( !wxDirExists(boostIncludeDir) )
    {
        report += _("Le chemin de la bibliothèque Boost n'existe pas.\n");
        ok = false;
    }

    if ( !wxDirExists(gdlLibDir) )
    {
        report += _("Le chemin de la bibliothèque Game Develop Library n'existe pas.\n");
        ok = false;
    }
    else if ( !wxDirExists(gdlLibDir+"/libgdl.dll.a") )
    {
        report += _("La bibliothèque Game Develop library semble être incorrecte.\n");
        ok = false;
    }

    return ok;
}


}
#endif
#endif
