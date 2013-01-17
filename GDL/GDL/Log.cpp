/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include <iostream>
#include "GDL/VersionWrapper.h"

void GD_API GDLogBanner()
{
    #if defined(LINUX)
        std::string sys = "Target system : GNU/Linux, ";
    #elif defined(WINDOWS)
        std::string sys = "Target system : Windows, ";
    #elif defined(MAC)
        std::string sys = "Target system : Mac OS, ";
    #endif
    if(sizeof(int*) == 4)
        sys += "32-bits";
    else if(sizeof(int*) == 8)
        sys += "64-bits";

    std::cout << "Game Develop - " << GDLVersionWrapper::FullString() << " " << GDLVersionWrapper::Status() << std::endl;
    std::cout << "Built " << GDLVersionWrapper::Date() << "/" << GDLVersionWrapper::Month() << "/" << GDLVersionWrapper::Year() << std::endl;
    std::cout << sys << std::endl;
    std::cout << std::endl;
}

