/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"

VariablesExtension::VariablesExtension()
{
    SetExtensionInformation("BuiltinVariables",
                          _("Variable features"),
                          _("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Freeware");
    #if defined(GD_IDE_ONLY)
    {
        AddCondition("VarScene",
                   _("Scene variables"),
                   _("Test a variable."),
                   _("Variable _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");
    }

    {
        AddCondition("VarSceneTxt",
                   _("Text of a scene variable"),
                   _("Test the text of a variable."),
                   _("The text of variable _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");
    }


    AddCondition("VarSceneDef",
                   _("Test if a scene variable is defined"),
                   _("Test if the scene variable exist."),
                   _("Variable _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");


    {
        AddCondition("VarGlobal",
                   _("Global variable"),
                   _("Test the value of a global variable."),
                   _("The global variable _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");
    }


    {
        AddCondition("VarGlobalTxt",
                   _("Text of a global variable"),
                   _("Test the text of a global variable."),
                   _("The text of the global variable _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");

    }

    AddCondition("VarGlobalDef",
                   _("Test if a global variable is defined"),
                   _("Test if a global variable exists"),
                   _("Global variable _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    {
        AddAction("ModVarScene",
                   _("Scene variables"),
                   _("Modify a scene variable."),
                   _("Do _PARAM1__PARAM2_ to variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");

    }

    {
        AddAction("ModVarSceneTxt",
                   _("Text of a scene variable"),
                   _("Modify the text of a scene variable."),
                   _("Do _PARAM1__PARAM2_ to the text of variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");

    }

    {
        AddAction("ModVarGlobal",
                   _("Global variable"),
                   _("Modify a global variable"),
                   _("Do _PARAM1__PARAM2_ to global variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");

    }

    {
        AddAction("ModVarGlobalTxt",
                   _("Text of a global variable"),
                   _("Modify the text of a global variable."),
                   _("Do _PARAM1__PARAM2_ to the text of global variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");
    }

    {
        AddExpression("Variable", _("Scene variables"), _("Scene variables"), _("Variables"), "res/actions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("GetVariableValue");
    }

    {
        AddStrExpression("VariableString", _("Scene variables"), _("Text of a scene variable"), _("Variables"), "res/actions/var.png")
        .AddParameter("scenevar", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("GetVariableString");
    }

    {
        AddExpression("GlobalVariable", _("Global variable"), _("Global variable"), _("Variables"), "res/actions/var.png")
        .AddParameter("globalvar", _("Name of the global variable"))
        .codeExtraInformation.SetFunctionName("GetVariableValue");
    }

    {
        AddStrExpression("GlobalVariableString", _("Global variable"), _("Text of a global variable"), _("Variables"), "res/actions/var.png")
        .AddParameter("globalvar", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("GetVariableString");
    }
    #endif
}

