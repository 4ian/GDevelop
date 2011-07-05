#include "MathematicalTools.h"
#include <algorithm>

double GD_API Minimal(double expression1, double expression2)
{
    return std::min(expression1, expression2);
}

double GD_API Maximal(double expression1, double expression2)
{
    return std::max(expression1, expression2);
}
