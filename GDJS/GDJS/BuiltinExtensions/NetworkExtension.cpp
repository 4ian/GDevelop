/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Basic internet features"),
                          _("Built-in extension providing network features."),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllActions()["SendRequest"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.sendHttpRequest").SetIncludeFile("networktools.js");
    GetAllActions()["JSONToVariableStructure"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.jsonToVariableStructure").SetIncludeFile("networktools.js");

    GetAllStrExpressions()["ToJSON"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.network.variableStructureToJSON").SetIncludeFile("networktools.js");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddAction("EnvoiDataNet",
                   _("Send datas to a website"),
                   _("Send datas to a specified web site.\nYou need to set up a .php page on your web site so as to receive this datas.\nEnter here a password, and enter the same in the configuration of your .php page.\nRead the help file to get more informations."),
                   _("Send to _PARAM0_ the following datas : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
                   _("Network"),
                   "res/actions/net24.png",
                   "res/actions/net.png")
        .AddParameter("string", _(".php page URL ( Don't forget the protocol http:// ) "), "",false)
        .AddParameter("password", _("Password"), "",false)
        .AddParameter("string", _("Data 1"), "",false)
        .AddParameter("string", _("Data 2"), "",true)
        .AddParameter("string", _("Data 3"), "",true)
        .AddParameter("string", _("Data 4"), "",true)
        .AddParameter("string", _("Data 5"), "",true)
        .AddParameter("string", _("Data 6"), "",true)
        .codeExtraInformation.SetFunctionName("SendDataToPhpWebPage").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");

    AddAction("DownloadFile",
                   _("Download a file"),
                   _("Download a file from a web site"),
                   _("Download file _PARAM1_ from _PARAM0_ under the name of _PARAM2_"),
                   _("Network"),
                   "res/actions/net24.png",
                   "res/actions/net.png")
        .AddParameter("string", _("Host ( For example : http://www.website.com )"), "",false)
        .AddParameter("string", _("Path to file ( For example : /folder/file.txt )"), "",false)
        .AddParameter("string", _("Save as"), "",false)
        .codeExtraInformation.SetFunctionName("DownloadFile").SetIncludeFile("GDCpp/BuiltinExtensions/NetworkTools.h");
    */
}

}
