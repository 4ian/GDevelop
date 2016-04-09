#include "CompilationChecker.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCpp/Runtime/String.h"
#include <iostream>

using namespace std;

bool CompilationChecker::EnsureCorrectGDVersion()
{
    std::string versionString =  gd::String::From(gd::VersionWrapper::Major()).ToUTF8() + ", " + gd::String::From(gd::VersionWrapper::Minor()).ToUTF8() + ", " +
                            gd::String::From(gd::VersionWrapper::Build()).ToUTF8() + ", " + gd::String::From(gd::VersionWrapper::Revision()).ToUTF8();

    if (versionString != GDCore_RC_FILEVERSION_STRING)
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- WARNING ! --" << beep << std::endl;
        std::cout << "Compiled with a different version of GDCpp." << std::endl;
        std::cout << "GDCpp DLL Version :" << versionString << std::endl;
        std::cout << "Compiled with version :" << GDCore_RC_FILEVERSION_STRING << std::endl;
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
