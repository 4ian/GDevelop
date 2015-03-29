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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinExternalLayouts",
                          GD_T("External layouts"),
                          GD_T("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("CreateObjectsFromExternalLayout",
                   GD_T("Create objects from an external layout"),
                   GD_T("Create objects from an external layout."),
                   GD_T("Create objects from the external layout _PARAM1_"),
                   GD_T("External layouts"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Name of the external layout"), "",false)
        .AddParameter("expression", GD_T("X position of the origin"), "",true).SetDefaultValue("0")
        .AddParameter("expression", GD_T("Y position of the origin"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced();
    #endif
}

}
