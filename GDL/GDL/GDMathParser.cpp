#include "GDL/GDMathParser.h"
#include <iostream>

/**
 * Common mathematic function : Distance betwenn two point
 */
double DistanceMathFunction(const double* p)
{
    return gpl::sqrt((p[0]-p[2])*(p[0]-p[2])+(p[1]-p[3])*(p[1]-p[3]));
}

/**
 * Common mathematic function : Angle betwenn two point ( Degrees, GD Repere )
 */
double AngleMathFunction(const double* p)
{
    return -atan2(p[3]-p[1],(p[2]-p[0]))*180/3.14159265;
}

GDMathParser::GDMathParser() :
FunctionParser()
{
    AddConstant("pi", 3.14159265358979323846);
    AddConstant("e", 2.71828182845904523536);
}
