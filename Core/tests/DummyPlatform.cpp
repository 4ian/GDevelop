/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "catch.hpp"

void SetupProjectWithDummyPlatform(gd::Project &project,
                                   gd::Platform &platform) {
  // Don't show extension loading logs for tests (too verbose).
  platform.EnableExtensionLoadingLogs(false);

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
  extension
      ->AddAction("DoSomething",
                  "Do something",
                  "This does something",
                  "Do something please",
                  "",
                  "",
                  "")
      .AddParameter("expression", "Parameter 1 (a number)")
      .SetFunctionName("doSomething");
  extension->AddExpression("GetNumber", "Get me a number", "", "", "")
      .SetFunctionName("getNumber");
  extension
      ->AddExpression(
          "GetVariableAsNumber", "Get me a variable value", "", "", "")
      .AddParameter("scenevar", "Scene variable")
      .SetFunctionName("returnVariable");
  extension->AddStrExpression("ToString", "ToString", "", "", "")
      .AddParameter("expression", "Number to convert to string")
      .SetFunctionName("toString");
  extension
      ->AddExpression("MouseX",
                      _("Cursor X position"),
                      _("Cursor X position"),
                      _("Mouse cursor"),
                      "res/actions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("camera", _("Camera"), "", true)
      .SetDefaultValue("0")
      .SetFunctionName("getMouseX");
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
  extension
      ->AddStrExpression("GetStringWith2ObjectParamAnd2ObjectVarParam",
                        "Get string with twice an object param and an objectvar param",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object 1 parameter"))
      .AddParameter("objectvar", _("Variable for object 1"))
      .AddParameter("object", _("Object 2 parameter"))
      .AddParameter("objectvar", _("Variable for object 2"))
      .SetFunctionName("getStringWith2ObjectParamAnd2ObjectVarParam");

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
  object
      .AddStrExpression("GetObjectStringWith2ObjectParam",
                        "Get string from object with a 2 objects param",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("object", _("Object parameter"))
      .AddParameter("objectPtr", _("Object parameter"))
      .SetFunctionName("getObjectStringWith2ObjectParam");
  auto behavior =
      extension->AddBehavior("MyBehavior",
                             "Dummy behavior",
                             "MyBehavior",
                             "A dummy behavior for tests",
                             "",
                             "",
                             "",
                             gd::make_unique<gd::Behavior>(),
                             gd::make_unique<gd::BehaviorsSharedData>());
  behavior
      .AddAction("BehaviorDoSomething",
                 "Do something on behavior",
                 "This does something with the behavior",
                 "Do something with the behavior please",
                 "",
                 "",
                 "")
      .AddParameter("expression", "Parameter 1 (a number)")
      .SetFunctionName("behaviorDoSomething");
  behavior
      .AddStrExpression("GetBehaviorStringWith1Param",
                        "Get string from behavior with 1 param",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MyExtension::MyBehavior")
      .AddParameter("expression", _("Number parameter"))
      .SetFunctionName("getBehaviorStringWith1Param");

  platform.AddExtension(baseObjectExtension);
  platform.AddExtension(extension);
  project.AddPlatform(platform);
}
