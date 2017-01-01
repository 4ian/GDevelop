/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/StringInstructionsExtension.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/StringInstructionsExtension.cpp"
#endif

StringInstructionsExtension::StringInstructionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllStrExpressions()["NewLine"].SetFunctionName("GDpriv::StringTools::NewLine").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["FromCodePoint"].SetFunctionName("GDpriv::StringTools::FromCodePoint").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["ToUpperCase"].SetFunctionName("GDpriv::StringTools::ToUpperCase").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["ToLowerCase"].SetFunctionName("GDpriv::StringTools::ToLowerCase").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["SubStr"].SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["StrAt"].SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllExpressions()["StrLength"].SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllExpressions()["StrFind"].SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllExpressions()["StrRFind"].SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllExpressions()["StrFindFrom"].SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllExpressions()["StrRFindFrom"].SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    
    GetAllStrExpressions()["Format"].SetFunctionName("GDpriv::StringTools::Format").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllStrExpressions()["_"].SetFunctionName("GDpriv::StringTools::Translate").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");
    GetAllActions()["LoadTranslation"].SetFunctionName("GDpriv::StringTools::LoadTranslation").SetIncludeFile("GDCpp/Extensions/Builtin/StringTools.h");

    #endif
}

#if defined(GD_IDE_ONLY)

void StringInstructionsExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "LoadTranslation" )
    {
        gd::String parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeFile(parameter);
        action.SetParameter(1, parameter);
    }
}

#endif
