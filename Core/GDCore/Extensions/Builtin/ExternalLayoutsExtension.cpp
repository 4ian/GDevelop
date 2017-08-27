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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinExternalLayouts",
                          _("External layouts"),
                          _("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("CreateObjectsFromExternalLayout",
                   _("Create objects from an external layout"),
                   _("Create objects from an external layout."),
                   _("Create objects from the external layout named _PARAM1_"),
                   _("External layouts"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the external layout"))
        .AddParameter("expression", _("X position of the origin"), "",true).SetDefaultValue("0")
        .AddParameter("expression", _("Y position of the origin"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced();
    #endif
}

}
