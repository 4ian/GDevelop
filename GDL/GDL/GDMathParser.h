#ifndef GDMATHPARSER_H
#define GDMATHPARSER_H

#include "GDL/fparser/fparser.hh"
#include <cmath>
#include <vector>
#include <string>

double DistanceMathFunction(const double* p);
double AngleMathFunction(const double* p);

/**
 * \brief Game Develop mathematical expression parser.
 * Used by GDExpressions to evaluate mathematical expressions.
 * See FunctionParser class to more information about how using this class.
 */
class GDMathParser: public FunctionParser
{
 public:
    GDMathParser();
    virtual ~GDMathParser() {};

    static std::vector < std::string > GetAllMathFunctions();
    static std::string GetAllMathSeparator();
};


#endif // GDMATHPARSER_H
