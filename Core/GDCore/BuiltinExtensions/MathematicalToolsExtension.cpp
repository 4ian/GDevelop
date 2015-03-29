/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinMathematicalTools",
                          GD_T("Mathematical tools"),
                          GD_T("Built-in extension providing mathematical tools"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)

    extension.AddExpression("AngleDifference", GD_T("Difference between two angles"), GD_T("Difference between two angles"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("First angle"))
        .AddParameter("expression", GD_T("Second angle"));


    extension.AddExpression("mod", GD_T("Modulo"), GD_T("x mod y"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("x ( as in x mod y )"))
        .AddParameter("expression", GD_T("y ( as in x mod y )"));


    extension.AddExpression("min", GD_T("Minimum of two numbers"), GD_T("Minimum of two numbers"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("First expression"))
        .AddParameter("expression", GD_T("Second expression"));


    extension.AddExpression("max", GD_T("Maximum of two numbers"), GD_T("Maximum of two numbers"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("First expression"))
        .AddParameter("expression", GD_T("Second expression"));


    extension.AddExpression("abs", GD_T("Absolute value"), GD_T("Absolute value"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("acos", GD_T("Arccosine"), GD_T("Arccosine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("acosh", GD_T("Hyperbolic arccosine"), GD_T("Hyperbolic arccosine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("asin", GD_T("Arcsine"), GD_T("Arcsine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("asinh", GD_T("Arcsine"), GD_T("Arcsine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("atan", GD_T("Arctangent"), GD_T("Arctangent"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("atan2", GD_T("2 argument arctangent"), GD_T("2 argument arctangent ( atan2 )"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Y"))
        .AddParameter("expression", GD_T("X"));


    extension.AddExpression("atanh", GD_T("Hyperbolic arctangent"), GD_T("Hyperbolic arctangent"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("cbrt", GD_T("Cube root"), GD_T("Cube root"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("ceil", GD_T("Ceil (round up)"), GD_T("Round number up to an integer"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("floor", GD_T("Floor (round down)"), GD_T("Round number down to an integer"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("cos", GD_T("Cosine"), GD_T("Cosine of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("cosh", GD_T("Hyperbolic cosine"), GD_T("Hyperbolic cosine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("cot", GD_T("Cotangent"), GD_T("Cotangent of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("csc", GD_T("Cosecant"), GD_T("Cosecant of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("int", GD_T("Round"), GD_T("Round a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", GD_T("Expression"));

    extension.AddExpression("rint", GD_T("Round"), GD_T("Round a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", GD_T("Expression"));

    extension.AddExpression("round", GD_T("Round"), GD_T("Round a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("exp", GD_T("Exponential"), GD_T("Exponential of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("log", GD_T("Logarithm"), GD_T("Logarithm"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("ln", GD_T("Logarithm"), GD_T("Logarithm"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("log2", GD_T("Base-2 logarithm"), GD_T("Base 2 Logarithm"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("log10", GD_T("Base-10 logarithm"), GD_T("Base-10 logarithm"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("nthroot", GD_T("Nth root"), GD_T("Nth root of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Number"))
        .AddParameter("expression", GD_T("N"));


    extension.AddExpression("pow", GD_T("Power"), GD_T("Raise a number to power n"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Number"))
        .AddParameter("expression", GD_T("The exponent ( n in x^n )"));


    extension.AddExpression("sec", GD_T("Secant"), GD_T("Secant"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("sign", GD_T("Sign of a number"), GD_T("Return the sign of a number ( 1,-1 or 0 )"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("sin", GD_T("Sine"), GD_T("Sine of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("sinh", GD_T("Hyperbolic sine"), GD_T("Hyperbolic sine"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("sqrt", GD_T("Square root"), GD_T("Square root of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("tan", GD_T("Tangent"), GD_T("Tangent of a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));


    extension.AddExpression("tanh", GD_T("Hyperbolic tangent"), GD_T("Hyperbolic tangent"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));

    extension.AddExpression("trunc", GD_T("Truncation"), GD_T("Troncate a number"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("Expression"));

    extension.AddExpression("lerp", GD_T("Lerp (Linear interpolation)"), GD_T("Linearly interpolate a to b by x"), GD_T("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", GD_T("a (in a+(b-a)*x)"))
        .AddParameter("expression", GD_T("b (in a+(b-a)*x)"))
        .AddParameter("expression", GD_T("x (in a+(b-a)*x)"));

    #endif
}

}
