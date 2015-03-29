/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsNetworkExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinNetwork",
                          GD_T("Basic internet features"),
                          GD_T("Built-in extension providing network features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("EnvoiDataNet",
            GD_T("Send datas to a website"),
            GD_T("Send datas to a specified web site.\nYou need to set up a .php page on your web site so as to receive this datas.\nEnter here a password, and enter the same in the configuration of your .php page.\nRead the help file to get more informations."),
            GD_T("Send to _PARAM0_ the following datas : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
            GD_T("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", GD_T(".php page URL ( Don't forget the protocol http:// ) "), "",false)
        .AddParameter("password", GD_T("Password"), "", false)
        .AddParameter("string", GD_T("Data 1"), "", false)
        .AddParameter("string", GD_T("Data 2"), "", true)
        .AddParameter("string", GD_T("Data 3"), "", true)
        .AddParameter("string", GD_T("Data 4"), "", true)
        .AddParameter("string", GD_T("Data 5"), "", true)
        .AddParameter("string", GD_T("Data 6"), "", true)
        .SetHidden();

    extension.AddAction("SendRequest",
            GD_T("Send a request to a web page"),
            GD_T("Send a request to the specified web page.\n\nPlease note that for the web platform games, the game must be hosted on the same host as specified below, except if the server is configured to answer to all requests ( Cross-domain requests ). "),
            GD_T("Send _PARAM3_ request to _PARAM0__PARAM1_ with body: _PARAM2_"),
            GD_T("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", GD_T("Host (Example: http://www.some-server.org/)"), "", false )
        .AddParameter("string", GD_T("Path to page (Example: /page.php)"), "", false )
        .AddParameter("string", GD_T("Request body content"), "", false )
        .AddParameter("string", GD_T("Method: \"POST\" or \"GET\" (if empty, GET will be used)"), "", true ).SetDefaultValue("\"GET\"")
        .AddParameter("string", GD_T("Content type (application/x-www-form-urlencoded by default)"), "", true )
        .AddParameter("scenevar", GD_T("Store the response in this variable"), "", true )
        .MarkAsComplex();

    extension.AddAction("DownloadFile",
            GD_T("Download a file"),
            GD_T("Download a file from a web site"),
            GD_T("Download file _PARAM1_ from _PARAM0_ under the name of _PARAM2_"),
            GD_T("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", GD_T("Host ( For example : http://www.website.com )"), "",false)
        .AddParameter("string", GD_T("Path to file ( For example : /folder/file.txt )"), "",false)
        .AddParameter("string", GD_T("Save as"), "",false);

    extension.AddAction("JSONToVariableStructure",
            GD_T("Convert JSON to variable"),
            GD_T("Parse a JSON object and store it into a variable"),
            GD_T("Parse JSON string _PARAM0_ and store it into variable _PARAM1_"),
            GD_T("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", GD_T("JSON string"), "",false)
        .AddParameter("scenevar", GD_T("Variable where store the JSON object"), "",false)
        .MarkAsAdvanced();

    extension.AddStrExpression("ToJSON",
                       GD_T("Convert to JSON"),
                       GD_T("Convert a variable to JSON"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("scenevar", GD_T("The variable to be stringify"), "",false);
    #endif
}

}
