/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
    GetAllStrExpressions()["NewLine"].SetFunctionName("GDpriv::StringTools::NewLine").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["FromCodePoint"].SetFunctionName("GDpriv::StringTools::FromCodePoint").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["ToUpperCase"].SetFunctionName("GDpriv::StringTools::ToUpperCase").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["ToLowerCase"].SetFunctionName("GDpriv::StringTools::ToLowerCase").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["SubStr"].SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllStrExpressions()["StrAt"].SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrLength"].SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrFind"].SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrRFind"].SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrFindFrom"].SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    GetAllExpressions()["StrRFindFrom"].SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");
    #endif
}
