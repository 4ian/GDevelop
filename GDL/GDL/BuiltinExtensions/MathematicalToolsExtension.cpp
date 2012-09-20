/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "MathematicalToolsExtension.h"

MathematicalToolsExtension::MathematicalToolsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinMathematicalTools",
                          _("Mathematical tools"),
                          _("Builtin extension providing mathematical tools"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_EXPRESSION("AngleDifference", _("Difference between two angles"), _("Difference between two angles"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("First angle"), "", false);
        instrInfo.AddParameter("expression", _("Second angle"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::angleDifference").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("mod", _("Modulo"), _("x mod y"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("x ( as in x mod y )"), "", false);
        instrInfo.AddParameter("expression", _("y ( as in x mod y )"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::mod").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("min", _("Minimum of two numbers"), _("Minimum of two numbers"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("First expression"), "", false);
        instrInfo.AddParameter("expression", _("Second expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Minimal").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("max", _("Maximum of two numbers"), _("Maximum of two numbers"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("First expression"), "", false);
        instrInfo.AddParameter("expression", _("Second expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Maximal").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("abs", _("Absolute value"), _("Absolute value"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::abs").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("acos", _("Arccosine"), _("Arccosine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::acos").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("acosh", _("Hyperbolic arccosine"), _("Hyperbolic arccosine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::acosh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("asin", _("Arcsine"), _("Arcsine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::asin").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("asinh", _("Arcsine"), _("Arcsine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::asinh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atan", _("Arctangent"), _("Arctangent"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atan").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atan2", _("2 argument arctangent"), _("2 argument arctangent ( atan2 )"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Y"), "", false);
        instrInfo.AddParameter("expression", _("X"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atan2").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atanh", _("Hyperbolic arctangent"), _("Hyperbolic arctangent"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atanh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cbrt", _("Cube root"), _("Cube root"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cbrt").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ceil", _("Ceil ( Integer part )"), _("Ceil ( Integer part )"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::ceil").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("floor", _("Floor ( integer part )"), _("Floor ( integer part )"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::floor").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cos", _("Cosine"), _("Cosine of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cos").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cosh", _("Hyperbolic cosine"), _("Hyperbolic cosine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cosh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cot", _("Cotangent"), _("Cotangent of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cot").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("csc", _("Cosecant"), _("Cosecant of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::csc").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("int", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("rint", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("round", _("Round"), _("Round a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("exp", _("Exponential"), _("Exponential of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::exp").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log", _("Logarithm"), _("Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ln", _("Logarithm"), _("Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log2", _("Base-2 logarithm"), _("Base 2 Logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log2").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log10", _("Base-10 logarithm"), _("Base-10 logarithm"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log10").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("nthroot", _("Nth root"), _("Nth root of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Number"), "", false);
        instrInfo.AddParameter("expression", _("N"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::nthroot").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("pow", _("Power"), _("Raise a number to power n"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Number"), "", false);
        instrInfo.AddParameter("expression", _("N"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::pow").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sec", _("Secant"), _("Secant"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sec").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sign", _("Sign of a number"), _("Return the sign of a number ( 1,-1 or 0 )"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sign").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sin", _("Sine"), _("Sine of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sin").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sinh", _("Hyperbolic sine"), _("Hyperbolic sine"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sinh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sqrt", _("Square root of a number"), _("Square root of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sqrt").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("tan", _("Tangent"), _("Tangent of a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::tan").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("tanh", _("Hyperbolic tangent"), _("Hyperbolic tangent"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::tanh").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("trunc", _("Truncation"), _("Troncate a number"), _("Mathematical tools"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::trunc").SetIncludeFile("GDL/BuiltinExtensions/MathematicalTools.h");
    DECLARE_END_EXPRESSION()
    #endif
}

