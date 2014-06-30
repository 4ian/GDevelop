/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Text manipulation"),
                          _("Built-in extension providing expressions related to strings."),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllStrExpressions()["NewLine"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.newLine");
    GetAllStrExpressions()["SubStr"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.subStr");
    GetAllStrExpressions()["StrAt"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strAt");
    GetAllExpressions()["StrLength"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strLen");
    GetAllExpressions()["StrFind"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strFind");
    GetAllExpressions()["StrRFind"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strRFind");
    GetAllExpressions()["StrFindFrom"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strFindFrom");
    GetAllExpressions()["StrRFindFrom"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.string.strRFindFrom");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
}

}
