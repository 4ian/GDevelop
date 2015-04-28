/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "StringInstructionsExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

StringInstructionsExtension::StringInstructionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(*this);

    SetExtensionInformation("BuiltinStringInstructions",
                          GD_T("Text manipulation"),
                          GD_T("Built-in extension providing expressions related to strings."),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllStrExpressions()["NewLine"]
        .SetFunctionName("gdjs.evtTools.string.newLine");
    GetAllStrExpressions()["SubStr"]
        .SetFunctionName("gdjs.evtTools.string.subStr");
    GetAllStrExpressions()["StrAt"]
        .SetFunctionName("gdjs.evtTools.string.strAt");
    GetAllExpressions()["StrLength"]
        .SetFunctionName("gdjs.evtTools.string.strLen");
    GetAllExpressions()["StrFind"]
        .SetFunctionName("gdjs.evtTools.string.strFind");
    GetAllExpressions()["StrRFind"]
        .SetFunctionName("gdjs.evtTools.string.strRFind");
    GetAllExpressions()["StrFindFrom"]
        .SetFunctionName("gdjs.evtTools.string.strFindFrom");
    GetAllExpressions()["StrRFindFrom"]
        .SetFunctionName("gdjs.evtTools.string.strRFindFrom");

    StripUnimplementedInstructionsAndExpressions();
}

}
