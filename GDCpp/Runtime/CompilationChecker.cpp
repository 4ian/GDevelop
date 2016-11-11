#include "CompilationChecker.h"
#include "GDCore/Tools/VersionPriv.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCpp/Runtime/String.h"
#include <iostream>

using namespace std;

bool CompilationChecker::EnsureCorrectGDVersion()
{
    gd::String versionString =  gd::String::From(gd::VersionWrapper::Major()) + "." + gd::String::From(gd::VersionWrapper::Minor()) + "." +
                            gd::String::From(gd::VersionWrapper::Build()) + "-" + gd::String::From(gd::VersionWrapper::Revision());

    if (versionString != gd::String(GD_VERSION_STRING).substr(0, versionString.size()))
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- WARNING ! --" << beep << std::endl;
        std::cout << "Compiled with a different version of GDCpp." << std::endl;
        std::cout << "GDCpp DLL Version :" << versionString << std::endl;
        std::cout << "Compiled with version :" << GD_VERSION_STRING << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    if ( gd::VersionWrapper::CompiledForEdittime() )
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- ERROR ! --" << beep << std::endl;
        std::cout << "GDCpp build mismatch:" << std::endl;
        std::cout << "Executable is using an edittime version of GDCpp!" << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    return true;
}
