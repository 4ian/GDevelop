#ifndef GDMATHPARSER_H
#define GDMATHPARSER_H

#include "GDL/fparser/fparser.hh"
#include <cmath>
#include <vector>
#include <string>
#include "gpl.h"

double DistanceMathFunction(const double* p);
double AngleMathFunction(const double* p);

/**
 * Game Develop mathematical expression parser
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
