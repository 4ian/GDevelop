/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "NetworkExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

NetworkExtension::NetworkExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsNetworkExtension(*this);

    SetExtensionInformation("BuiltinNetwork",
                          GD_T("Basic internet features"),
                          GD_T("Built-in extension providing network features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["SendRequest"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.sendHttpRequest").SetIncludeFile("networktools.js");
    GetAllActions()["JSONToVariableStructure"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.jsonToVariableStructure").SetIncludeFile("networktools.js");

    GetAllStrExpressions()["ToJSON"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.variableStructureToJSON").SetIncludeFile("networktools.js");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddAction("EnvoiDataNet",
                   GD_T("Send datas to a website"),
                   GD_T("Send datas to a specified web site.\nYou need to set up a .php page on your web site so as to receive this datas.\nEnter here a password, and enter the same in the configuration of your .php page.\nRead the help file to get more informations."),
                   GD_T("Send to _PARAM0_ the following datas : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
                   GD_T("Network"),
                   "res/actions/net24.png",
                   "res/actions/net.png")
        .AddParameter("string", GD_T(".php page URL ( Don't forget the protocol http:// ) "), "",false)
        .AddParameter("password", GD_T("Password"), "",false)
        .AddParameter("string", GD_T("Data 1"), "",false)
        .AddParameter("string", GD_T("Data 2"), "",true)
        .AddParameter("string", GD_T("Data 3"), "",true)
        .AddParameter("string", GD_T("Data 4"), "",true)
        .AddParameter("string", GD_T("Data 5"), "",true)
        .AddParameter("string", GD_T("Data 6"), "",true)
        .codeExtraInformation.SetFunctionName("SendDataToPhpWebPage").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");

    AddAction("DownloadFile",
                   GD_T("Download a file"),
                   GD_T("Download a file from a web site"),
                   GD_T("Download file _PARAM1_ from _PARAM0_ under the name of _PARAM2_"),
                   GD_T("Network"),
                   "res/actions/net24.png",
                   "res/actions/net.png")
        .AddParameter("string", GD_T("Host ( For example : http://www.website.com )"), "",false)
        .AddParameter("string", GD_T("Path to file ( For example : /folder/file.txt )"), "",false)
        .AddParameter("string", GD_T("Save as"), "",false)
        .codeExtraInformation.SetFunctionName("DownloadFile").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    */
}

}
