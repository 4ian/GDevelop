/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Extensions/Builtin/CommonInstructionsTools.h"
#include "GDCpp/profile.h"
#include <SFML/Graphics.hpp>
#include <chrono>
#include <random>
#include <sstream>

namespace GDpriv
{

namespace CommonInstructions
{

namespace
{
    /**
     * Create and initialize the random engine.
     * If the system provides a undeterministic random_device, it's used to get
     * a totally random seed for the pseudo-random engine. Otherwise, the time
     * since epoch is used
     */
    std::mt19937 InitializeRandomEngine()
    {
        std::random_device randomDevice;
        return std::mt19937(randomDevice.entropy() > 0 ? randomDevice() : std::chrono::high_resolution_clock::now().time_since_epoch().count());
    }

    // Global variable storing the current seed
    std::mt19937 randomEngine = InitializeRandomEngine();
}

double GD_API Random(int end)
{
    if ( end <= 0 ) return 0;

    std::uniform_int_distribution<int> randomDist(0, end);
    return randomDist(randomEngine);
}

bool GD_API LogicalNegation(bool param)
{
    return !param;
}

double GD_API ToDouble( const gd::String & str )
{
    return str.To<double>();
}

gd::String GD_API ToString( double number )
{
    return gd::String::From(number);
}

gd::String GD_API LargeNumberToString( double number )
{
    std::ostringstream oss;
    oss.setf(std::ios::fixed);
    oss << number;
    std::string formattedStr = oss.str();

    //Delete trailing zero if needed
    size_t pointPos = formattedStr.find('.');
    if ( pointPos < formattedStr.length() )
    {
        size_t searchPos = formattedStr.length()-1;
        while (formattedStr[searchPos] == '0') searchPos--;
        if ( formattedStr[searchPos] == '.') searchPos--;

        formattedStr.resize(searchPos+1);
    }

    return gd::String::FromUTF8(formattedStr);
}

double GD_API ToRad( double angle )
{
    return angle*3.1415926/180.0;
}

double GD_API ToDeg( double angle )
{
    return angle*180.0/3.1415926;
}

}

}
