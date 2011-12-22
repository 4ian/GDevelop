#include "CompilationChecker.h"
#include "GDL/Version.h"
#include "GDL/VersionWrapper.h"
#include "GDL/CommonTools.h"

bool CompilationChecker::EnsureCorrectGDLVersion()
{
    std::string versionString =  ToString(GDLVersionWrapper::Major()) + ", " + ToString(GDLVersionWrapper::Minor()) + ", " +
                            ToString(GDLVersionWrapper::Build()) + ", " + ToString(GDLVersionWrapper::Revision());

    if (versionString != RC_FILEVERSION_STRING)
    {
        char beep = 7;
        std::cout << std::endl;
        std::cout << "-- WARNING ! --" << beep << std::endl;
        std::cout << "Compiled with a different version of GDL." << std::endl;
        std::cout << "GDL DLL Version :" << versionString << std::endl;
        std::cout << "Compiled with version :" << RC_FILEVERSION_STRING << std::endl;
        std::cout << "---------------" << std::endl;

        return false;
    }

    if ( GDLVersionWrapper::CompiledForEdittime() )
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
