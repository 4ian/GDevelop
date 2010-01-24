#include "CompilationChecker.h"
#include "GDL/Version.h"
#include "GDL/VersionWrapper.h"
#include "GDL/StdAlgo.h"

void CompilationChecker::EnsureCorrectGDLVersion()
{
    string versionString =  toString(GDLVersionWrapper::Major()) + ", " + toString(GDLVersionWrapper::Minor()) + ", " +
                            toString(GDLVersionWrapper::Build()) + ", " + toString(GDLVersionWrapper::Revision());

    if (versionString != RC_FILEVERSION_STRING)
    {
        char beep = 7;
        cout << endl;
        cout << "-- WARNING ! --" << beep << endl;
        cout << "Compiled with a different version of GDL." << endl;
        cout << "GDL DLL Version :" << versionString << endl;
        cout << "Compiled with version :" << RC_FILEVERSION_STRING << endl;
        cout << "---------------" << endl;
    }
}
