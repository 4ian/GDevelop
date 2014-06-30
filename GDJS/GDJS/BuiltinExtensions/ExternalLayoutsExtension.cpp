/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("External layouts"),
                          _("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout");

    StripUnimplementedInstructionsAndExpressions();
}

}
