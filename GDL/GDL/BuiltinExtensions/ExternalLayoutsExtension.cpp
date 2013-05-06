#include "ExternalLayoutsExtension.h"


ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    SetExtensionInformation("BuiltinExternalLayouts",
                          _("External layouts"),
                          _("Builtin extension providing actions and conditions related to external layouts"),
                          "Compil Games",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
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
    #endif
}

