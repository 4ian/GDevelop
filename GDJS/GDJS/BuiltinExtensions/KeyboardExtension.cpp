/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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

    SetExtensionInformation("BuiltinKeyboard",
                          _("Keyboard features"),
                          _("Built-in extensions allowing to use keyboard"),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllConditions()["KeyPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.js");
    GetAllConditions()["KeyFromTextPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.js");
    GetAllConditions()["AnyKeyPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.anyKeyPressed").SetIncludeFile("inputtools.js");
}

}
