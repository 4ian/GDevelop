/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "MathematicalToolsExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/MathematicalToolsExtension.cpp"
#endif

MathematicalToolsExtension::MathematicalToolsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(*this);

    #if defined(GD_IDE_ONLY)

    GetAllExpressions()["AngleDifference"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::angleDifference").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["mod"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::mod").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["min"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Minimal").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["max"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Maximal").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["abs"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::abs").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["acos"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::acos").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["acosh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::acosh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["asin"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::asin").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["asinh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::asinh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["atan"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atan").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["atan2"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atan2").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["atanh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::atanh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["cbrt"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cbrt").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["ceil"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::ceil").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["floor"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::floor").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["cos"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cos").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["cosh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cosh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["cot"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::cot").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["csc"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::csc").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["int"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["rint"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["round"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::Round").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["exp"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::exp").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["log"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["ln"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["log2"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log2").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["log10"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::log10").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["nthroot"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::nthroot").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["pow"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::pow").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["sec"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sec").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["sign"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sign").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["sin"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sin").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["sinh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sinh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["sqrt"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::sqrt").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["tan"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::tan").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["tanh"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::tanh").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["trunc"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::trunc").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");
    GetAllExpressions()["lerp"].codeExtraInformation.SetFunctionName("GDpriv::MathematicalTools::lerp").SetIncludeFile("GDCpp/BuiltinExtensions/MathematicalTools.h");

    #endif
}

