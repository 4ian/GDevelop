/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "CommonConversionsExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

CommonConversionsExtension::CommonConversionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(*this);

    SetExtensionInformation("BuiltinCommonConversions",
                          _("Standard Conversions"),
                          _("Built-in extension providing standard conversions expressions."),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllExpressions()["ToNumber"].SetFunctionName("gdjs.evtTools.common.toNumber");
    GetAllStrExpressions()["ToString"].SetFunctionName("gdjs.evtTools.common.toString");
    GetAllStrExpressions()["LargeNumberToString"].SetFunctionName("gdjs.evtTools.common.toString");
    GetAllExpressions()["ToRad"].SetFunctionName("gdjs.toRad");
    GetAllExpressions()["ToDeg"].SetFunctionName("gdjs.toDegrees");
}

}
