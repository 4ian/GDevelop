/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GDCpp/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/StringInstructionsExtension.cpp"
#endif

StringInstructionsExtension::StringInstructionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllStrExpressions()["NewLine"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::NewLine").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["SubStr"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["StrAt"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrLength"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrFind"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrRFind"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrFindFrom"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrRFindFrom"].codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    #endif
}

