/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "MathematicalToolsExtension.h"

MathematicalToolsExtension::MathematicalToolsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinMathematicalTools",
                          _("Outils mathématiques"),
                          _("Extension proposant des outils mathématiques, integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_EXPRESSION("mod", _("Modulo"), _("x mod y"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("x ( dans x mod y )"), "", false);
        instrInfo.AddParameter("expression", _("y ( dans x mod y )"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::mod").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("min", _("Minimum de deux nombres"), _("Minimum de deux nombres"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Première expression"), "", false);
        instrInfo.AddParameter("expression", _("Deuxième expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Minimal").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("max", _("Maximum de deux nombres"), _("Maximum de deux nombres"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Première expression"), "", false);
        instrInfo.AddParameter("expression", _("Deuxième expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Maximal").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("abs", _("Valeur absolue"), _("Valeur absolue d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::abs").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("acos", _("Arccosinus"), _("Arccosinus d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::acos").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("acosh", _("Arccosinus hyperbolique"), _("Arccosinus hyperbolique d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::acosh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("asin", _("Arcsinus"), _("Arcsinus d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::asin").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("asinh", _("Arcsinus"), _("Arcsinus d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::asinh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atan", _("Arctangente"), _("Arctangente d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atan").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atan2", _("Arctangente à deux arguments"), _("Arctangente à deux arguments ( atan2 )"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Y"), "", false);
        instrInfo.AddParameter("expression", _("X"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atan2").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("atanh", _("Arctangente hyperbolique"), _("Arctangente hyperbolique"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::atanh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cbrt", _("Racine cubique"), _("Racine cubique"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cbrt").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ceil", _("Partie entière par excès"), _("Partie entière par excès ( ceil )"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::ceil").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("floor", _("Partie entière par défaut"), _("Partie entière par défaut ( floor )"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::floor").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cos", _("Cosinus"), _("Cosinus d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cos").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cosh", _("Cosinus hyperbolique"), _("Cosinus hyperbolique d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cosh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cot", _("Cotangente"), _("Cotangente d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::cot").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("csc", _("cosécante "), _("Cosécante d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::csc").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("int", _("Arrondi"), _("Arrondi d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("rint", _("Arrondi"), _("Arrondi d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("round", _("Arrondi"), _("Arrondi d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("exp", _("Exponentiel"), _("Exponentiel d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::exp").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log", _("Logarithme"), _("Logarithme ( Base e ) d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ln", _("Logarithme"), _("Logarithme ( Base e ) d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDL/MathematicalTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log2", _("Logarithme en base 2"), _("Logarithme ( Base 2 ) d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log2").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("log10", _("Logarithme en base 10"), _("Logarithme ( Base 10 ) d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::log10").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("nthroot", _("Racine n-ième"), _("Racine n-ième d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Nombre"), "", false);
        instrInfo.AddParameter("expression", _("N"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::nthroot").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("pow", _("Puissance"), _("Elever un nombre à la puissance n"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Nombre"), "", false);
        instrInfo.AddParameter("expression", _("N"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::pow").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sec", _("Sécante"), _("Sécante d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sec").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sign", _("Signe d'un nombre"), _("Renvoie le signe d'un nombre (sous la forme 1, -1 ou 0 )"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sign").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sin", _("Sinus"), _("Sinus d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sin").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sinh", _("Sinus hyperbolique"), _("Sinus hyperbolique d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sinh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("sqrt", _("Racine d'un nombre"), _("Racine d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::sqrt").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("tan", _("Tangente"), _("Tangente d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::tan").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("tanh", _("Tangente hyperbolique"), _("Tangente hyperbolique d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::tanh").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("trunc", _("Troncature"), _("Troncature d'un nombre"), _("Outils mathématiques"), "res/mathfunction.png")
        instrInfo.AddParameter("expression", _("Expression"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::MathematicalTools::trunc").SetIncludeFile("GDL/MathematicalTools.h");
    DECLARE_END_EXPRESSION()
    #endif
}
