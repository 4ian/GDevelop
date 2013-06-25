#include "ExternalLayoutsExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    SetExtensionInformation("BuiltinExternalLayouts",
                          _("External layouts"),
                          _("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinExternalLayouts");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddAction("CreateObjectsFromExternalLayout",
                   _("Create objects from an external layout"),
                   _("Create objects from an external layout."),
                   _("Create objects from the external layout _PARAM1_"),
                   _("External layouts"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the external layout"), "",false)
        .AddParameter("expression", _("X position of the origin"), "",true).SetDefaultValue("0")
        .AddParameter("expression", _("Y position of the origin"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("ExternalLayoutsTools::CreateObjectsFromExternalLayout").SetIncludeFile("GDL/BuiltinExtensions/ExternalLayoutsTools.h");
    */
}
