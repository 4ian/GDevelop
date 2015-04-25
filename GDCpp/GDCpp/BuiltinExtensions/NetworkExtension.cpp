/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/NetworkExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/NetworkExtension.cpp"
#endif

NetworkExtension::NetworkExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsNetworkExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["EnvoiDataNet"].SetFunctionName("SendDataToPhpWebPage").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    GetAllActions()["SendRequest"].SetFunctionName("SendHttpRequest").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    GetAllActions()["DownloadFile"].SetFunctionName("DownloadFile").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    GetAllActions()["JSONToVariableStructure"].SetFunctionName("JSONToVariableStructure").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");

    GetAllStrExpressions()["ToJSON"].SetFunctionName("VariableStructureToJSON").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    #endif
}

