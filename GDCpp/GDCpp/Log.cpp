/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include <iostream>
#include "GDCore/Tools/VersionWrapper.h"

void GD_API GDLogBanner()
{
    #if defined(LINUX)
        std::string sys = "Target system : GNU/Linux, ";
    #elif defined(WINDOWS)
        std::string sys = "Target system : Windows, ";
    #elif defined(MAC)
        std::string sys = "Target system : Mac OS, ";
    #else
        std::string sys = "Target system : Unknown, ";
    #endif
    if(sizeof(int*) == 4)
        sys += "32-bits";
    else if(sizeof(int*) == 8)
        sys += "64-bits";

    std::cout << "Game Develop - " << gd::VersionWrapper::FullString() << " " << gd::VersionWrapper::Status() << std::endl;
    std::cout << "Built " << gd::VersionWrapper::Date() << "/" << gd::VersionWrapper::Month() << "/" << gd::VersionWrapper::Year() << std::endl;
    std::cout << sys << std::endl;
    std::cout << std::endl;
}

