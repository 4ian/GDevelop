/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsNetworkExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinNetwork",
          _("Network"),
          _("Features to send web requests, communicate with external \"APIs\" "
            "and other network related tasks."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/network")
      .SetCategory("Network");
  extension.AddInstructionOrExpressionGroupMetadata(_("Network"))
      .SetIcon("res/actions/net24.png");

  extension
      .AddAction(
          "SendRequest",
          "Send a request to a web page",
          "Send a request to the specified web page.\n\nPlease note that for "
          "the web games, the game must be hosted on the same host "
          "as specified below, except if the server is configured to answer "
          "to all requests (cross-domain requests).",
          "Send _PARAM3_ request to _PARAM0__PARAM1_ with body: _PARAM2_",
          "",
          "res/actions/net24.png",
          "res/actions/net.png")
      .AddParameter("string", "Host, with protocol")
      .SetParameterLongDescription("Example: \"http://example.com/\".")
      .AddParameter("string", "Path")
      .SetParameterLongDescription(
          "Example: \"/user/123\" or \"/some-page.php\".")
      .AddParameter("string", "Request body content")
      .AddParameter("string", "Method: \"POST\" or \"GET\"", "", true)
      .SetParameterLongDescription("If empty, \"GET\" will be used.")
      .SetDefaultValue("\"GET\"")
      .AddParameter("string", "Content type", "", true)
      .SetParameterLongDescription(
          "If empty, \"application/x-www-form-urlencoded\" will be used.")
      .AddParameter("scenevar", "Response scene variable", "", true)
      .SetParameterLongDescription(
          "The response of the server will be stored, as a string, in this "
          "variable. If the server returns *JSON*, you may want to use the "
          "action \"Convert JSON to a scene variable\" afterwards, to "
          "explore the results with a *structure variable*.")
      .MarkAsComplex()
      .SetHidden();

  extension
      .AddAction(
          "SendAsyncRequest",
          _("Send a request to a web page"),
          _("Send an asynchronous request to the specified web page.\n\nPlease "
            "note that for "
            "the web games, the game must be hosted on the same host "
            "as specified below, except if the server is configured to answer "
            "to all requests (cross-domain requests)."),
          _("Send a _PARAM2_ request to _PARAM0_ with body: _PARAM1_, and "
            "store the result in _PARAM4_ (or in _PARAM5_ in case of error)"),
          "",
          "res/actions/net24.png",
          "res/actions/net.png")
      .AddParameter("string", _("URL (API or web-page address)"))
      .SetParameterLongDescription(
          _("Example: \"https://example.com/user/123\". Using *https* is "
            "highly recommended."))
      .AddParameter("string", _("Request body content"))
      .AddParameter("stringWithSelector",
                    _("Request method"),
                    "[\"GET\", \"POST\", \"PUT\", \"HEAD\", \"DELETE\", "
                    "\"PATCH\", \"OPTIONS\"]",
                    false)
      .SetParameterLongDescription(_("If empty, \"GET\" will be used."))
      .SetDefaultValue("\"GET\"")
      .AddParameter("string", _("Content type"), "", true)
      .SetParameterLongDescription(
          _("If empty, \"application/x-www-form-urlencoded\" will be used."))
      .AddParameter(
          "scenevar", _("Variable where to store the response"), "", true)
      .SetParameterLongDescription(
          _("The response of the server will be stored, as a string, in this "
            "variable. If the server returns *JSON*, you may want to use the "
            "action \"Convert JSON to a scene variable\" afterwards, to "
            "explore the results with a *structure variable*."))
      .AddParameter(
          "scenevar", _("Variable where to store the error message"), "", true)
      .SetParameterLongDescription(_(
          "Optional, only used if an error occurs. This will contain the "
          "[\"status "
          "code\"](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) "
          "if the server returns a status >= 400. If the request was not sent "
          "at all (e.g. no internet or CORS issues), the variable will be set "
          "to "
          "\"REQUEST_NOT_SENT\"."))
      .MarkAsComplex();

  extension
      .AddAction("LaunchFile",
                 _("Open a URL (web page) or a file"),
                 _("This action launches the specified file or URL, in a "
                   "browser (or in a new tab if the game is using the Web "
                   "platform and is launched inside a browser)."),
                 _("Open URL _PARAM0_ in a browser (or new tab)"),
                 "",
                 "res/actions/net24.png",
                 "res/actions/net.png")
      .AddParameter("string", _("URL (or filename)"))
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction(
          "DownloadFile",
          _("Download a file"),
          _("Download a file from a web site"),
          _("Download file _PARAM1_ from _PARAM0_ under the name of _PARAM2_"),
          "",
          "res/actions/net24.png",
          "res/actions/net.png")
      .AddParameter("string", _("Host (for example : http://www.website.com)"))
      .AddParameter("string",
                    _("Path to file (for example : /folder/file.txt)"))
      .AddParameter("string", _("Save as"));

  extension
      .AddAction(
          "EnableMetrics",
          _("Enable (or disable) metrics collection"),
          _("Enable, or disable, the sending of anonymous data used to compute "
            "the number of sessions and other metrics from your game "
            "players.\nBe sure to only send metrics if in accordance with the "
            "terms of service of your game and if they player gave their "
            "consent, depending on how your game/company handles this."),
          _("Enable analytics metrics: _PARAM1_"),
          "",
          "res/actions/net24.png",
          "res/actions/net.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno", _("Enable the metrics?"));
}

}  // namespace gd
