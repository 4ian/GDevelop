/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
            _("Send data to a website"),
            _("Send data to a specified web site.\nYou need to set up a .php page on your web site to receive this data.\nEnter a password here, and enter the same password in the configuration of your .php page.\nRead the help file to get more information."),
            _("Send to _PARAM0_ the following data : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
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
            _("Convert JSON to a variable"),
            _("Parse a JSON object and store it into a variable"),
            _("Parse JSON string _PARAM0_ and store it into variable _PARAM1_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("JSON string"))
        .AddParameter("scenevar", _("Variable where store the JSON object"))
        .MarkAsAdvanced();

    extension.AddAction("JSONToGlobalVariableStructure",
            _("Convert JSON to global variable"),
            _("Parse a JSON object and store it into a global variable"),
            _("Parse JSON string _PARAM0_ and store it into global variable _PARAM1_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("JSON string"))
        .AddParameter("globalvar", _("Global variable where store the JSON object"))
        .MarkAsAdvanced();

    extension.AddAction("JSONToObjectVariableStructure",
            _("Convert JSON to object variable"),
            _("Parse a JSON object and store it into an object variable"),
            _("Parse JSON string _PARAM0_ and store it into variable _PARAM2_ of _PARAM1_"),
            _("Network"),
            "res/actions/net24.png",
            "res/actions/net.png")
        .AddParameter("string", _("JSON string"))
        .AddParameter("objectPtr", _("Object"))
        .AddParameter("objectvar", _("Object variable where store the JSON object"))
        .MarkAsAdvanced();

    extension.AddStrExpression("ToJSON",
                       _("Convert variable to JSON"),
                       _("Convert a variable to JSON"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("scenevar", _("The variable to be stringified"));

    extension.AddStrExpression("GlobalVarToJSON",
                       _("Convert global variable to JSON"),
                       _("Convert a global variable to JSON"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("globalvar", _("The global variable to be stringified"));

    extension.AddStrExpression("ObjectVarToJSON",
                       _("Convert object variable to JSON"),
                       _("Convert an object variable to JSON"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("objectPtr", _("The object with the variable"))
        .AddParameter("objectvar", _("The object variable to be stringified"));
    #endif
}

}
