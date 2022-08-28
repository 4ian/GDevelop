/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/ObjectConfiguration.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "catch.hpp"

// TODO Remove these 2 classes and write the test with events based behaviors.
class BehaviorWithRequiredBehaviorProperty : public gd::Behavior {
 public:
  BehaviorWithRequiredBehaviorProperty(
      const gd::String& name, const gd::String& type)
      : Behavior(name, type) {};
  virtual ~BehaviorWithRequiredBehaviorProperty(){};
  virtual Behavior* Clone() const override {
    return new BehaviorWithRequiredBehaviorProperty(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override {
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties["requiredBehaviorProperty"]
        .SetLabel("A required behavior")
        .SetValue(
            behaviorContent.GetStringAttribute("requiredBehaviorProperty"))
        .SetType("Behavior")
        .AddExtraInfo("MyExtension::MyBehavior");
    return properties;
  }
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override {
    if (name == _("requiredBehaviorProperty")) {
      behaviorContent.SetAttribute("requiredBehaviorProperty", value);
      return true;
    }
    return false;
  }
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override {
    behaviorContent.SetAttribute("requiredBehaviorProperty", "");
  }
};

class BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior
    : public gd::Behavior {
 public:
  BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior(
      const gd::String& name, const gd::String& type)
      : Behavior(name, type) {};
  virtual ~BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior(){};
  virtual Behavior* Clone() const override {
    return new BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior(
        *this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override {
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties["requiredBehaviorProperty"]
        .SetLabel("A required behavior")
        .SetValue(
            behaviorContent.GetStringAttribute("requiredBehaviorProperty"))
        .SetType("Behavior")
        .AddExtraInfo("MyExtension::BehaviorWithRequiredBehaviorProperty");
    return properties;
  }
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override {
    if (name == _("requiredBehaviorProperty")) {
      behaviorContent.SetAttribute("requiredBehaviorProperty", value);
      return true;
    }
    return false;
  }
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override {
    behaviorContent.SetAttribute("requiredBehaviorProperty", "");
  }
};

void SetupProjectWithDummyPlatform(gd::Project& project,
                                   gd::Platform& platform) {
  // Don't show extension loading logs for tests (too verbose).
  platform.EnableExtensionLoadingLogs(false);

  std::shared_ptr<gd::PlatformExtension> baseObjectExtension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);

  // Create the base object. All objects "inherits" from it.
  baseObjectExtension->SetExtensionInformation(
      "BuiltinObject", "Base Object dummy extension", "", "", "");
  auto& baseObject = baseObjectExtension->AddObject<gd::ObjectConfiguration>(
      "", "Dummy Base Object", "Dummy Base Object", "");

  // Add this expression for all objects. But it requires a "capability".
  baseObject
      .AddStrExpression("GetSomethingRequiringEffectCapability",
                        "Get something, but this requires the effect capability for the object.",
                        "",
                        "",
                        "")
      .AddParameter("object", _("Object"), "")
      .AddParameter("expression", _("Number parameter"))
      .SetRequiresBaseObjectCapability("effect")
      .SetFunctionName("getSomethingRequiringEffectCapability");

  // Create an extension with various stuff inside.
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

  extension
      ->AddAction("DoSomethingWithResources",
                  "Do something with resources",
                  "This does something with resources",
                  "Do something with resources please",
                  "",
                  "",
                  "")
      .AddParameter("bitmapFontResource",
                    "Parameter 1 (a bitmap font resource)")
      .AddParameter("imageResource", "Parameter 2 (an image resource)")
      .AddParameter("soundfile", "Parameter 3 (an audio resource)")
      .SetFunctionName("doSomethingWithResources");

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
      ->AddStrExpression(
          "GetStringWith2ObjectParamAnd2ObjectVarParam",
          "Get string with twice an object param and an objectvar param",
          "",
          "",
          "")
      .AddParameter("object", _("Object 1 parameter"))
      .AddParameter("objectvar", _("Variable for object 1"))
      .AddParameter("object", _("Object 2 parameter"))
      .AddParameter("objectvar", _("Variable for object 2"))
      .SetFunctionName("getStringWith2ObjectParamAnd2ObjectVarParam");
  extension
      ->AddStrExpression(
          "GetStringWith1ObjectParamAnd2ObjectVarParam",
          "Get string with 2 objectvar param one from the same object param",
          "",
          "",
          "")
      .AddParameter("object", _("Object 1 parameter"))
      .AddParameter("objectvar", _("Variable for object 1"))
      .AddParameter("objectvar", _("Variable for object 2"))
      .SetFunctionName("getStringWith1ObjectParamAnd2ObjectVarParam");

  auto& object = extension->AddObject<gd::ObjectConfiguration>(
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

  {
    auto& behavior =
        extension->AddBehavior("MyBehavior",
                               "Dummy behavior",
                               "MyBehavior",
                               "A dummy behavior for tests",
                               "Group",
                               "Icon.png",
                               "MyBehavior",
                               gd::make_unique<gd::Behavior>(
                                  "Behavior", "MyExtension::MyBehavior"),
                               gd::make_unique<gd::BehaviorsSharedData>());
    behavior
        .AddAction("BehaviorDoSomething",
                   "Do something on behavior",
                   "This does something with the behavior",
                   "Do something with the behavior please",
                   "",
                   "",
                   "")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "MyExtension::MyBehavior")
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
    behavior
        .AddExpression("GetBehaviorNumberWith1Param",
                       "Get number from behavior with 1 param",
                       "",
                       "",
                       "")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "MyExtension::MyBehavior")
        .AddParameter("expression", _("Number parameter"))
        .SetFunctionName("getBehaviorNumberWith1Param");
  }
  {
    auto& behavior =
        extension->AddBehavior("MyOtherBehavior",
                               "Another Dummy behavior",
                               "MyOtherBehavior",
                               "Another dummy behavior for tests",
                               "Group",
                               "Icon.png",
                               "MyOtherBehavior",
                               gd::make_unique<gd::Behavior>(
                                  "Behavior", "MyExtension::MyOtherBehavior"),
                               gd::make_unique<gd::BehaviorsSharedData>());
  }

  {
    auto& behavior = extension->AddBehavior(
        "BehaviorWithRequiredBehaviorProperty",
        "BehaviorWithRequiredBehaviorProperty",
        "BehaviorWithRequiredBehaviorProperty",
        "A dummy behavior requiring another behavior (MyBehavior)",
        "Group",
        "Icon.png",
        "BehaviorWithRequiredBehaviorProperty",
        gd::make_unique<BehaviorWithRequiredBehaviorProperty>(
            "Behavior", "MyExtension::BehaviorWithRequiredBehaviorProperty"),
        gd::make_unique<gd::BehaviorsSharedData>());
  }
  {
    auto& behavior = extension->AddBehavior(
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        "A dummy behavior requiring another behavior "
        "(BehaviorWithRequiredBehaviorProperty) that itself requires another "
        "behavior (MyBehavior)",
        "Group",
        "Icon.png",
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        gd::make_unique<
            BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior>(
                "Behavior",
                "MyExtension::BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior"),
        gd::make_unique<gd::BehaviorsSharedData>());
  }

  {
    auto& object = extension
                       ->AddObject<gd::ObjectConfiguration>(
                           "FakeObjectWithUnsupportedCapability",
                           "FakeObjectWithUnsupportedCapability",
                           "This is FakeObjectWithUnsupportedCapability",
                           "")
                       .AddUnsupportedBaseObjectCapability("effect");
  }

  platform.AddExtension(baseObjectExtension);
  platform.AddExtension(extension);
  project.AddPlatform(platform);
}
