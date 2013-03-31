#include "ExternalLayoutsExtension.h"


ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinExternalLayouts",
                          _("External layouts"),
                          _("Builtin extension providing actions and conditions related to external layouts"),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)
    DECLARE_ACTION("CreateObjectsFromExternalLayout",
                   _("Create objects from an external layout"),
                   _("Create objects from an external layout."),
                   _("Create objects from the external layout _PARAM1_"),
                   _("External layouts"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Name of the external layout"), "",false);
        instrInfo.AddParameter("expression", _("X position of the origin"), "",true).SetDefaultValue("0");
        instrInfo.AddParameter("expression", _("Y position of the origin"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("ExternalLayoutsTools::CreateObjectsFromExternalLayout").SetIncludeFile("GDL/BuiltinExtensions/ExternalLayoutsTools.h");

    DECLARE_END_ACTION()
    #endif
}

