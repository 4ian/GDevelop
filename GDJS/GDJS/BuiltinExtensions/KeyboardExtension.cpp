/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "KeyboardExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

KeyboardExtension::KeyboardExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsKeyboardExtension(*this);

    GetAllConditions()["KeyPressed"].SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.js");
    GetAllConditions()["KeyFromTextPressed"].SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.js");
    GetAllConditions()["AnyKeyPressed"].SetFunctionName("gdjs.evtTools.input.anyKeyPressed").SetIncludeFile("inputtools.js");
    GetAllStrExpressions()["LastPressedKey"].SetFunctionName("gdjs.evtTools.input.lastPressedKey").SetIncludeFile("inputtools.js");
}

}
