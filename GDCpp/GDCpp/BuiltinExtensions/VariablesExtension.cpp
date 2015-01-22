/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/VariablesExtension.cpp"
#endif

VariablesExtension::VariablesExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["VarScene"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarSceneTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VariableChildExists"].codeExtraInformation.SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["GlobalVariableChildExists"].codeExtraInformation.SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VarSceneDef"].codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalDef"].codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VarGlobal"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["ModVarScene"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["ModVarSceneTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["ModVarGlobal"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["ModVarGlobalTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["VariableRemoveChild"].codeExtraInformation.SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["GlobalVariableRemoveChild"].codeExtraInformation.SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["Variable"].codeExtraInformation.SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllStrExpressions()["VariableString"].codeExtraInformation.SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["GlobalVariable"].codeExtraInformation.SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllStrExpressions()["GlobalVariableString"].codeExtraInformation.SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    #endif
}

