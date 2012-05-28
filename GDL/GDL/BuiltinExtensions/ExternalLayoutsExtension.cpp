#include "ExternalLayoutsExtension.h"


ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinExternalLayouts",
                          _("Agencements"),
                          _("Extension integrée offrant des actions et conditions liés aux agencement externes"),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)
    DECLARE_ACTION("CreateObjectsFromExternalLayout",
                   _("Créer des objets depuis un agencement externe"),
                   _("Créer les objets de l'agencement externe spécifié."),
                   _("Créer les objets de l'agencement externe _PARAM0_"),
                   _("Agencements externes"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom de l'agencement externe"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ExternalLayoutsTools::CreateObjectsFromExternalLayout").SetIncludeFile("GDL/BuiltinExtensions/ExternalLayoutsTools.h");

    DECLARE_END_ACTION()
    #endif
}
