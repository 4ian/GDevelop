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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsAdvancedExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Built-in extension providing advanced control features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("Toujours",
                 _("Always"),
                 _("This condition always returns true (or always false, if the condition is inverted)."),
                 _("Always"),
                 _("Other"),
                 "res/conditions/toujours24.png",
                 "res/conditions/toujours.png")
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsAdvanced();
    #endif
}

}
