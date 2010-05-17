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

std::vector < std::string > GDMathParser::GetAllMathFunctions()
{
    static std::vector < std::string > mathFunctions;
    if ( mathFunctions.empty() )
    {
        mathFunctions.push_back("abs");
        mathFunctions.push_back("acos");
        mathFunctions.push_back("acosh");
        mathFunctions.push_back("asin");
        mathFunctions.push_back("asinh");
        mathFunctions.push_back("atan");
        mathFunctions.push_back("atan2");
        mathFunctions.push_back("atanh");
        mathFunctions.push_back("avg");
        mathFunctions.push_back("cbrt");
        mathFunctions.push_back("ceil");
        mathFunctions.push_back("cos");
        mathFunctions.push_back("cosh");
        mathFunctions.push_back("cot");
        mathFunctions.push_back("csc");
        mathFunctions.push_back("eval");
        mathFunctions.push_back("exp");
        mathFunctions.push_back("floor");
        mathFunctions.push_back("if");
        mathFunctions.push_back("else");
        mathFunctions.push_back("then");
        mathFunctions.push_back("int");
        mathFunctions.push_back("log");
        mathFunctions.push_back("log2");
        mathFunctions.push_back("log10");
        mathFunctions.push_back("ln");
        mathFunctions.push_back("max");
        mathFunctions.push_back("min");
        mathFunctions.push_back("pow");
        mathFunctions.push_back("rint");
        mathFunctions.push_back("sec");
        mathFunctions.push_back("sign");
        mathFunctions.push_back("sin");
        mathFunctions.push_back("sinh");
        mathFunctions.push_back("sqrt");
        mathFunctions.push_back("sum");
        mathFunctions.push_back("tan");
        mathFunctions.push_back("tanh");
        mathFunctions.push_back("trunc");

        /*
        mathFunctions.push_back("cos");
        mathFunctions.push_back("tan");
        mathFunctions.push_back("asin");
        mathFunctions.push_back("atan");
        mathFunctions.push_back("sqrt");
        mathFunctions.push_back("int");
        mathFunctions.push_back("log");
        mathFunctions.push_back("exp");
        mathFunctions.push_back("nthroot");
        mathFunctions.push_back("E");*/
    }

    return mathFunctions;
}

std::string GDMathParser::GetAllMathSeparator()
{
    return " ,+-*/%.<>=&|;()#^![]{}~:";
}
