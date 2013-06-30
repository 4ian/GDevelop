/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "MathematicalToolsExtension.h"

MathematicalToolsExtension::MathematicalToolsExtension()
{
    SetExtensionInformation("BuiltinMathematicalTools",
                          _("Mathematical tools"),
                          _("Built-in extension providing mathematical tools"),
                          "Florian Rival",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddExpression("AngleDifference", _("Difference between two angles"), _("Difference between two angles"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("First angle"))
        .AddParameter("expression", _("Second angle"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::angleDifference").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("mod", _("Modulo"), _("x mod y"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("x ( as in x mod y )"))
        .AddParameter("expression", _("y ( as in x mod y )"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::mod").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("min", _("Minimum of two numbers"), _("Minimum of two numbers"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("First expression"))
        .AddParameter("expression", _("Second expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Minimal").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("max", _("Maximum of two numbers"), _("Maximum of two numbers"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("First expression"))
        .AddParameter("expression", _("Second expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Maximal").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("abs", _("Absolute value"), _("Absolute value"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::abs").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("acos", _("Arccosine"), _("Arccosine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::acos").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("acosh", _("Hyperbolic arccosine"), _("Hyperbolic arccosine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::acosh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("asin", _("Arcsine"), _("Arcsine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::asin").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("asinh", _("Arcsine"), _("Arcsine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::asinh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("atan", _("Arctangent"), _("Arctangent"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atan").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("atan2", _("2 argument arctangent"), _("2 argument arctangent ( atan2 )"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Y"))
        .AddParameter("expression", _("X"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atan2").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("atanh", _("Hyperbolic arctangent"), _("Hyperbolic arctangent"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atanh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("cbrt", _("Cube root"), _("Cube root"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cbrt").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("ceil", _("Ceil ( Integer part )"), _("Ceil ( Integer part )"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::ceil").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("floor", _("Floor ( integer part )"), _("Floor ( integer part )"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::floor").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("cos", _("Cosine"), _("Cosine of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cos").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("cosh", _("Hyperbolic cosine"), _("Hyperbolic cosine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cosh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("cot", _("Cotangent"), _("Cotangent of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cot").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("csc", _("Cosecant"), _("Cosecant of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::csc").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("int", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");

    AddExpression("rint", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");

    AddExpression("round", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("exp", _("Exponential"), _("Exponential of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::exp").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("log", _("Logarithm"), _("Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("ln", _("Logarithm"), _("Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        .SetHidden()
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("log2", _("Base-2 logarithm"), _("Base 2 Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log2").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("log10", _("Base-10 logarithm"), _("Base-10 logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log10").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("nthroot", _("Nth root"), _("Nth root of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Number"))
        .AddParameter("expression", _("N"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::nthroot").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("pow", _("Power"), _("Raise a number to power n"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Number"))
        .AddParameter("expression", _("N"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::pow").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("sec", _("Secant"), _("Secant"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sec").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("sign", _("Sign of a number"), _("Return the sign of a number ( 1,-1 or 0 )"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sign").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("sin", _("Sine"), _("Sine of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sin").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("sinh", _("Hyperbolic sine"), _("Hyperbolic sine"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sinh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("sqrt", _("Square root of a number"), _("Square root of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sqrt").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("tan", _("Tangent"), _("Tangent of a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::tan").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("tanh", _("Hyperbolic tangent"), _("Hyperbolic tangent"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::tanh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");


    AddExpression("trunc", _("Truncation"), _("Troncate a number"), _("Mathematical tools"), "res/mathfunction.png")
        .AddParameter("expression", _("Expression"))
        .codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::trunc").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");

    #endif
}

