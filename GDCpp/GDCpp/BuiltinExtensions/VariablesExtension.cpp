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
    GetAllConditions()["VarScene"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarSceneTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VariableChildExists"].SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["GlobalVariableChildExists"].SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VarSceneDef"].SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalDef"].SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["VarGlobal"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["ModVarScene"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["ModVarSceneTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["ModVarGlobal"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["ModVarGlobalTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["VariableRemoveChild"].SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["GlobalVariableRemoveChild"].SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["Variable"].SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllStrExpressions()["VariableString"].SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["GlobalVariable"].SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllStrExpressions()["GlobalVariableString"].SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    #endif
}

