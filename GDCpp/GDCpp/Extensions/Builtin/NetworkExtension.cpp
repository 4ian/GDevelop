/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/NetworkExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/NetworkExtension.cpp"
#endif

NetworkExtension::NetworkExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsNetworkExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["EnvoiDataNet"].SetFunctionName("SendDataToPhpWebPage").SetIncludeFile("GDCpp/Extensions/Builtin/NetworkTools.h");
    GetAllActions()["SendRequest"].SetFunctionName("SendHttpRequest").SetIncludeFile("GDCpp/Extensions/Builtin/NetworkTools.h");
    GetAllActions()["DownloadFile"].SetFunctionName("DownloadFile").SetIncludeFile("GDCpp/Extensions/Builtin/NetworkTools.h");
    GetAllActions()["JSONToVariableStructure"].SetFunctionName("JSONToVariableStructure").SetIncludeFile("GDCpp/Extensions/Builtin/NetworkTools.h");

    GetAllStrExpressions()["ToJSON"].SetFunctionName("VariableStructureToJSON").SetIncludeFile("GDCpp/Extensions/Builtin/NetworkTools.h");
    #endif
}

