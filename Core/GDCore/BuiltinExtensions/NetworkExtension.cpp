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
                          _("Basic internet features"),
                          _("Built-in extension providing network features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("EnvoiDataNet",
            _("Send datas to a website"),
            _("Send datas to a specified web site.\nYou need to set up a .php page on your web site so as to receive this datas.\nEnter here a password, and enter the same in the configuration of your .php page.\nRead the help file to get more informations."),
            _("Send to _PARAM0_ the following datas : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _(".php page URL (don't forget the protocol http://)"))
        .AddParameter("password", _("Password"))
        .AddParameter("string", _("Data 1"))
        .AddParameter("string", _("Data 2"), "", true)
        .AddParameter("string", _("Data 3"), "", true)
        .AddParameter("string", _("Data 4"), "", true)
        .AddParameter("string", _("Data 5"), "", true)
        .AddParameter("string", _("Data 6"), "", true)
        .SetHidden();

    extension.AddAction("SendRequest",
            _("Send a request to a web page"),
            _("Send a request to the specified web page.\n\nPlease note that for the web platform games, the game must be hosted on the same host as specified below, except if the server is configured to answer to all requests (cross-domain requests)."),
            _("Send _PARAM3_ request to _PARAM0__PARAM1_ with body: _PARAM2_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("Host (example: http://www.some-server.org/)"))
        .AddParameter("string", _("Path to page (Example: /page.php)"))
        .AddParameter("string", _("Request body content"))
        .AddParameter("string", _("Method: \"POST\" or \"GET\" (if empty, GET will be used)"), "", true ).SetDefaultValue("\"GET\"")
        .AddParameter("string", _("Content type (application/x-www-form-urlencoded by default)"), "", true )
        .AddParameter("scenevar", _("Store the response in this variable"), "", true )
        .MarkAsComplex();

    extension.AddAction("DownloadFile",
            _("Download a file"),
            _("Download a file from a web site"),
            _("Download file _PARAM1_ from _PARAM0_ under the name of _PARAM2_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("Host (for example : http://www.website.com)"))
        .AddParameter("string", _("Path to file (for example : /folder/file.txt)"))
        .AddParameter("string", _("Save as"));

    extension.AddAction("JSONToVariableStructure",
            _("Convert JSON to variable"),
            _("Parse a JSON object and store it into a variable"),
            _("Parse JSON string _PARAM0_ and store it into variable _PARAM1_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("JSON string"))
        .AddParameter("scenevar", _("Variable where store the JSON object"))
        .MarkAsAdvanced();

    extension.AddStrExpression("ToJSON",
                       _("Convert to JSON"),
                       _("Convert a variable to JSON"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("scenevar", _("The variable to be stringify"));
    #endif
}

}
