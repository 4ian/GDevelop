/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include <vector>
#include "GDL/Version.h"

using namespace std;
using namespace AutoVersion;

bool GD_API EcrireLog(string localisation, string texte)
{
    string txt = localisation +" : "+ texte + "\n";

    printf(txt.c_str());

    return true;
}

bool GD_API InitLog()
{
    string nbversion = FULLVERSION_STRING;
    string status = STATUS;
    string version ="Game Develop - "+nbversion+" "+status+"\n";

    string date = DATE;
    string month = MONTH;
    string year = YEAR;
    string fulldate = "Built "+date+"/"+month+"/"+year+"\n";

    #ifdef LINUX
        string sys = "Target system : Linux, ";
    #endif
    #ifdef WINDOWS
        string sys = "Target system : Windows, ";
    #endif
    if(sizeof(int*) == 4)
        sys += "32-bits\n";
    else if(sizeof(int*) == 8)
        sys += "64-bits\n";

    printf(version.c_str());
    printf(fulldate.c_str());
    printf(sys.c_str());
    printf("\n");

    return true;
}
