#include "CompilationChecker.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDL/CommonTools.h"
#include <iostream>

using namespace std;

bool CompilationChecker::EnsureCorrectGDLVersion()
{
    std::string versionString =  ToString(gd::VersionWrapper::Major()) + ", " + ToString(gd::VersionWrapper::Minor()) + ", " +
                            ToString(gd::VersionWrapper::Build()) + ", " + ToString(gd::VersionWrapper::Revision());

    if (versionString != GDCore_RC_FILEVERSION_STRING)
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- WARNING ! --" << beep << std::endl;
        std::cout << "Compiled with a different version of GDL." << std::endl;
        std::cout << "GDL DLL Version :" << versionString << std::endl;
        std::cout << "Compiled with version :" << GDCore_RC_FILEVERSION_STRING << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    if ( gd::VersionWrapper::CompiledForEdittime() )
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- ERROR ! --" << beep << std::endl;
        std::cout << "GDL build mismatch:" << std::endl;
        std::cout << "Executable is using an edittime version of GDL!" << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    return true;
}
