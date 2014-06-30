/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "MathematicalToolsExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

MathematicalToolsExtension::MathematicalToolsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(*this);

    SetExtensionInformation("BuiltinMathematicalTools",
                          _("Mathematical tools"),
                          _("Built-in extension providing mathematical tools"),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllExpressions()["cos"]
        .codeExtraInformation.SetFunctionName("Math.cos");
    GetAllExpressions()["sin"]
        .codeExtraInformation.SetFunctionName("Math.sin");
    GetAllExpressions()["tan"]
        .codeExtraInformation.SetFunctionName("Math.tan");
    GetAllExpressions()["abs"]
        .codeExtraInformation.SetFunctionName("Math.abs");
    GetAllExpressions()["min"]
        .codeExtraInformation.SetFunctionName("Math.min");
    GetAllExpressions()["max"]
        .codeExtraInformation.SetFunctionName("Math.max");
    GetAllExpressions()["sqrt"]
        .codeExtraInformation.SetFunctionName("Math.sqrt");
    GetAllExpressions()["acos"]
        .codeExtraInformation.SetFunctionName("Math.acos");
    GetAllExpressions()["acosh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.acosh");
    GetAllExpressions()["asin"]
        .codeExtraInformation.SetFunctionName("Math.asin");
    GetAllExpressions()["asinh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.asinh");
    GetAllExpressions()["atan"]
        .codeExtraInformation.SetFunctionName("Math.atan");
    GetAllExpressions()["atan2"]
        .codeExtraInformation.SetFunctionName("Math.atan2");
    GetAllExpressions()["atanh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.atanh");
    GetAllExpressions()["cbrt"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.cbrt");
    GetAllExpressions()["ceil"]
        .codeExtraInformation.SetFunctionName("Math.ceil");
    GetAllExpressions()["floor"]
        .codeExtraInformation.SetFunctionName("Math.floor");
    GetAllExpressions()["cosh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.cosh");
    GetAllExpressions()["sinh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.sinh");
    GetAllExpressions()["tanh"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.tanh");
    GetAllExpressions()["cot"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.cot");
    GetAllExpressions()["csc"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.csc");
    GetAllExpressions()["sec"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.sec");
    GetAllExpressions()["exp"]
        .codeExtraInformation.SetFunctionName("Math.exp");
    GetAllExpressions()["log10"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.log10");
    GetAllExpressions()["log2"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.log2");
    GetAllExpressions()["log"]
        .codeExtraInformation.SetFunctionName("Math.log");
    GetAllExpressions()["ln"]
        .codeExtraInformation.SetFunctionName("Math.ln");
    GetAllExpressions()["pow"]
        .codeExtraInformation.SetFunctionName("Math.pow");
    GetAllExpressions()["nthroot"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.nthroot");
    GetAllExpressions()["sign"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.sign");
    GetAllExpressions()["mod"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.mod");
    GetAllExpressions()["AngleDifference"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.angleDifference");
    GetAllExpressions()["int"]
        .codeExtraInformation.SetFunctionName("Math.round");
    GetAllExpressions()["rint"]
        .codeExtraInformation.SetFunctionName("Math.round");
    GetAllExpressions()["round"]
        .codeExtraInformation.SetFunctionName("Math.round");
    GetAllExpressions()["trunc"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.trunc");
    GetAllExpressions()["lerp"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.common.lerp");

    StripUnimplementedInstructionsAndExpressions();
}

}
