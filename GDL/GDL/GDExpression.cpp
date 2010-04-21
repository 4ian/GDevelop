#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/gpl.h"
#include <cmath>

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

GDExpression::GDExpression(std::string plainString_) : plainString(plainString_), oIDcomputed(false), isPreprocessed(false)
{
    if (plainString == "=" ) compOperator = Equal;
    else if (plainString == "<" ) compOperator = Inferior;
    else if (plainString == ">" ) compOperator = Superior;
    else if (plainString == "<=" ) compOperator = InferiorOrEqual;
    else if (plainString == ">=" ) compOperator = SuperiorOrEqual;
    else if (plainString == "!=" ) compOperator = Different;
    else compOperator = Undefined;

    if (plainString == "=" ) modOperator = Set;
    else if (plainString == "+" ) modOperator = Add;
    else if (plainString == "-" ) modOperator = Substract;
    else if (plainString == "*" ) modOperator = Multiply;
    else if (plainString == "/" ) modOperator = Divide;
    else modOperator = UndefinedModification;

    mathExpression.AddFunction("distance", DistanceMathFunction, 4);
    mathExpression.AddFunction("angle", AngleMathFunction, 4);
}

GDExpression::~GDExpression()
{
}
