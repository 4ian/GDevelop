/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "catch.hpp"

void SetupProjectWithDummyPlatform(gd::Project &project,
                                   gd::Platform &platform) {
  std::shared_ptr<gd::PlatformExtension> baseObjectExtension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  baseObjectExtension->SetExtensionInformation(
      "BuiltinObject", "Base Object dummy extension", "", "", "");
  auto baseObject = baseObjectExtension->AddObject<gd::Object>(
      "", "Dummy Base Object", "Dummy Base Object", "");

  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  extension->SetExtensionInformation(
      "MyExtension", "My testing extension", "", "", "");
  extension->AddExpression("GetNumber", "Get me a number", "", "", "")
      .SetFunctionName("getNumber");
  extension
      ->AddExpression(
          "GetVariableAsNumber", "Get me a variable value", "", "", "")
      .AddParameter("scenevar", "Scene variable")
      .SetFunctionName("returnVariable");
  extension
      ->AddExpression("GetGlobalVariableAsNumber",
                      "Get me a global variable value",
                      "",
                      "",
                      "")
      .AddParameter("globalvar", "Global variable")
      .SetFunctionName("returnVariable");
  extension
      ->AddExpression(
          "GetNumberWith2Params", "Get me a number with 2 params", "", "", "")
      .AddParameter("expression", "")
      .AddParameter("string", "")
      .SetFunctionName("getNumberWith2Params");
  extension
      ->AddExpression("GetNumberWith3Params",
                      "Get me a number with 3 params, 1 optional",
                      "",
                      "",
                      "")
      .AddParameter("expression", "")
      .AddParameter("string", "")
      .AddParameter("expression", "", "", true)
      .SetFunctionName("getNumberWith3Params");
  auto &object = extension->AddObject<gd::Object>(
      "Sprite", "Dummy Sprite", "Dummy sprite object", "");
  object
      .AddExpression("GetObjectVariableAsNumber",
                     "Get an object variable value",
                     "",
                     "",
                     "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectvar", _("Variable"))
      .SetFunctionName("returnVariable");
  object.AddExpression("GetObjectNumber", "Get number from object", "", "", "")
      .AddParameter("object", _("Object"), "Sprite")
      .SetFunctionName("getObjectNumber");
  object
      .AddStrExpression("GetObjectStringWith1Param",
                        "Get string from object with 1 param",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("expression", _("Number parameter"))
      .SetFunctionName("getObjectStringWith1Param");
  object
      .AddStrExpression("GetObjectStringWith3Param",
                        "Get string from object with 3 param",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("expression", _("Number parameter"))
      .AddParameter("string", _("String parameter"))
      .AddParameter("", _("Identifier parameter"))
      .SetFunctionName("getObjectStringWith3Param");
  // auto behavior = extension->AddBehavior("MyBehavior", "Dummy behavior",
  // "MyBehavior", "", "", "","",
  //   gd::make_unique<gd::Behavior>(),
  //   gd::make_unique<gd::BehaviorsSharedData>());

  platform.AddExtension(baseObjectExtension);
  platform.AddExtension(extension);
  project.AddPlatform(platform);
}