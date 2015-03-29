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
                          GD_T("Advanced control features"),
                          GD_T("Built-in extension providing advanced control features."),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllConditions()["Toujours"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.returnFalse").SetIncludeFile("commontools.js");
}

}
