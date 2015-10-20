/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AdvancedExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

AdvancedExtension::AdvancedExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(*this);

    SetExtensionInformation("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Built-in extension providing advanced control features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllConditions()["Toujours"].SetFunctionName("gdjs.evtTools.common.logicalNegation").SetIncludeFile("commontools.js");
}

}
