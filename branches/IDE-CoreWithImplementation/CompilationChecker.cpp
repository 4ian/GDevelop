#include "CompilationChecker.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/CommonTools.h"
#include <iostream>

using namespace std;
using namespace gd;

bool CompilationChecker::EnsureCorrectGDLVersion()
{
    string versionString =  ToString(VersionWrapper::Major()) + ", " + ToString(VersionWrapper::Minor()) + ", " +
                            ToString(VersionWrapper::Build()) + ", " + ToString(VersionWrapper::Revision());

    if (versionString != GDCore_RC_FILEVERSION_STRING)
    {
        char beep = 7;
        cout << endl;
        cout << "-- WARNING ! --" << beep << endl;
        cout << "Compiled with a different version of GDL." << endl;
        cout << "GDL DLL Version :" << versionString << endl;
        cout << "Compiled with version :" << GDCore_RC_FILEVERSION_STRING << endl;
        cout << "---------------" << endl;

        return false;
    }

    if ( !VersionWrapper::CompiledForEdittime() )
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- ERROR ! --" << beep << std::endl;
        std::cout << "GDL build mismatch:" << std::endl;
        std::cout << "IDE is using GDL without edittime support!" << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    return true;
}

