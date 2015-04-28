/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "ExternalLayoutsExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(*this);

    SetExtensionInformation("BuiltinExternalLayouts",
                          GD_T("External layouts"),
                          GD_T("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"].SetFunctionName("gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout");

    StripUnimplementedInstructionsAndExpressions();
}

}
