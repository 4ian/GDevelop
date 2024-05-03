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
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/ForEachChildVariableEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterOptions.h"
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

  // Required for tests on event generation.
  std::shared_ptr<gd::PlatformExtension> commonInstructionsExtension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  commonInstructionsExtension->SetExtensionInformation(
      "BuiltinCommonInstructions", "instruction extension", "", "", "");
  commonInstructionsExtension->AddEvent("Standard", "Standard event", "", "", "", std::make_shared<gd::StandardEvent>());
  commonInstructionsExtension->AddEvent("ForEachChildVariable", "For each child variable event", "", "", "", std::make_shared<gd::ForEachChildVariableEvent>());
  commonInstructionsExtension->AddEvent("Repeat", "Repeat event", "", "", "", std::make_shared<gd::RepeatEvent>());

  std::shared_ptr<gd::PlatformExtension> baseObjectExtension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);

  // Create the base object. All objects "inherits" from it.
  baseObjectExtension->SetExtensionInformation(
      "BuiltinObject", "Base Object dummy extension", "", "", "");
  auto& baseObject = baseObjectExtension->AddObject<gd::ObjectConfiguration>(
      "", "Dummy Base Object", "Dummy Base Object", "");

  baseObject
      .AddExpression("GetFromBaseExpression",
                     "This works on any object.",
                     "",
                     "",
                     "")
      .AddParameter("object", _("Object"), "")
      .SetFunctionName("getFromBaseExpression");

// Declare default behaviors that are used by event-based objects to avoid
// warnings.
{
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  extension
      ->SetExtensionInformation("ResizableCapability",
                               _("Resizable capability"),
                               _("Change the object dimensions."),
                               "", "");
  gd::BehaviorMetadata& aut = extension->AddBehavior(
      "ResizableBehavior",
      _("Resizable capability"),
      "Resizable",
      _("Change the object dimensions."),
      "", "", "",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();
  platform.AddExtension(extension);
}
{
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  extension
      ->SetExtensionInformation("ScalableCapability",
                               _("Scalable capability"),
                               _("Change the object scale."),
                               "", "");
  gd::BehaviorMetadata& aut = extension->AddBehavior(
      "ScalableBehavior",
      _("Scalable capability"),
      "Scale",
      _("Change the object scale."),
      "", "", "",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();
  platform.AddExtension(extension);
}
{
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  extension
      ->SetExtensionInformation("FlippableCapability",
                               _("Flippable capability"),
                               _("Flip objects."),
                               "", "");
  gd::BehaviorMetadata& aut = extension->AddBehavior(
      "FlippableBehavior",
      _("Flippable capability"),
      "Flippable",
      _("Flip objects."),
      "", "", "",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();
  platform.AddExtension(extension);
}
{
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  extension
      ->SetExtensionInformation("EffectCapability",
                               _("Effect capability"),
                               _("Apply visual effects to objects."),
                               "", "");
  gd::BehaviorMetadata& aut = extension->AddBehavior(
      "EffectBehavior",
      _("Effect capability"),
      "Effect",
      _("Apply visual effects to objects."),
      "", "", "",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();
  platform.AddExtension(extension);
}
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
      ->AddAction("DoSomethingWithObjects",
                  "Do something",
                  "This does something",
                  "Do something please",
                  "",
                  "",
                  "")
      .AddParameter("object", _("Object 1 parameter"))
      .AddParameter("object", _("Object 2 parameter"))
      .SetFunctionName("doSomethingWithObjects");

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

  extension
      ->AddAction("DoSomethingWithLegacyPreScopedVariables",
                  "Do something with variables",
                  "This does something with variables",
                  "Do something with variables please",
                  "",
                  "",
                  "")
      .AddParameter("scenevar", "Scene variable")
      .AddParameter("globalvar", "Global variable")
      .AddParameter("object", "Some object")
      .AddParameter("objectvar", "Some variable of the object")
      .SetFunctionName("doSomethingWithVariables");

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
      .SetFunctionName("getCursorX");
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

  auto& object = extension->AddObject<gd::SpriteObject>(
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
      .AddParameter("expression", _("Identifier parameter"))
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

  // Actions and expressions with several parameter types.
  object
      .AddAction("SetAnimationName", _("Change the animation (by name)"),
                 _("Change the animation of the object, using the name of the "
                   "animation."),
                 _("Set animation of _PARAM0_ to _PARAM1_"),
                 _("Animations and images"), "", "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectAnimationName", _("Animation name"));
  object
      .AddExpression("AnimationFrameCount", _("Animation frame count"),
                 _("Return the number of frame in the animation."),
                 _("Animations and images"), "")
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectAnimationName", _("Animation name"));
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
    gd::BehaviorMetadata &effectBehavior =
        extension
            ->AddBehavior("EffectBehavior",
                          _("Effect capability"),
                          "Effect",
                          _("Apply visual effects to objects."),
                          "",
                          "res/actions/effect_black.svg", "EffectBehavior",
                          std::make_shared<gd::Behavior>(),
                          std::make_shared<gd::BehaviorsSharedData>())
            .SetHidden();

    // Add this expression for the effect capability.
    effectBehavior
        .AddStrExpression("GetSomethingRequiringEffectCapability",
                          "Get something, but this requires the effect "
                          "capability for the object.",
                          "",
                          "",
                          "")
        .AddParameter("object", _("Object"), "")
        .AddParameter("behavior", _("Behavior"), "EffectBehavior")
        .AddParameter("expression", _("Number parameter"))
        .SetFunctionName("getSomethingRequiringEffectCapability");
  }
  {
    auto& object = extension
                       ->AddObject<gd::ObjectConfiguration>(
                           "FakeObjectWithDefaultBehavior",
                           "FakeObjectWithDefaultBehavior",
                           "This is FakeObjectWithDefaultBehavior",
                           "")
                       .AddDefaultBehavior("MyExtension::EffectBehavior");
  }

  // Declare an event-based behavior to avoid warnings.
  {
    extension->AddBehavior("MyEventsBasedBehavior",
                            "My event-based behavior",
                            "MyEventsBasedBehavior",
                            "Avoid warnings",
                            "Group",
                            "Icon.png",
                            "MyEventsBasedBehavior",
                            gd::make_unique<gd::Behavior>(),
                            gd::make_unique<gd::BehaviorsSharedData>());
  }

  // Actions and expressions with several parameter types.
  {
    extension
        ->AddAction("CreateObjectsFromExternalLayout",
                    _("Create objects from an external layout"),
                    _("Create objects from an external layout."),
                    _("Create objects from the external layout named _PARAM1_"),
                    "", "", "")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("externalLayoutName", _("Name of the external layout"))
        .AddParameter("expression", _("X position of the origin"), "", true)
        .SetDefaultValue("0")
        .AddParameter("expression", _("Y position of the origin"), "", true)
        .SetDefaultValue("0");

    extension
        ->AddAction("Scene", _("Change the scene"),
                    _("Stop this scene and start the specified one instead."),
                    _("Change to scene _PARAM1_"), "", "", "")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("sceneName", _("Name of the new scene"))
        .AddParameter("yesorno", _("Stop any other paused scenes?"))
        .SetDefaultValue("true");

    extension
        ->AddExpressionAndConditionAndAction(
            "number", "CameraCenterX", _("Camera center X position"),
            _("the X position of the center of a camera"),
            _("the X position of camera _PARAM4_ (layer: _PARAM3_)"), "", "")
        .AddCodeOnlyParameter("currentScene", "")
        .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions())
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
        .SetDefaultValue("\"\"");

    extension
        ->AddAction("EnableLayerEffect", _("Enable layer effect"),
                    _("Enable an effect on a layer"),
                    _("Enable effect _PARAM2_ on layer _PARAM1_: _PARAM3_"),
                    _("Effects"), "", "")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
        .SetDefaultValue("\"\"")
        .AddParameter("layerEffectName", _("Effect name"))
        .AddParameter("yesorno", _("Enable"), "", true);

  extension
      ->AddExpression(
          "LayerEffectParameter",
          _("Effect property (number)"),
          _("Return the value of a property of an effect."),
          _("Effects"),
          "")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .AddParameter("layerEffectParameterName", _("Property name"));
  }

  {
      auto& effect = extension
      ->AddEffect("EffectWithResource")
      .SetFullName("Effect with resource")
      .MarkAsOnlyWorkingFor2D();
      auto& effectProperties = effect.GetProperties();
      effectProperties["texture"]
      .SetType("resource")
      .AddExtraInfo("image");
  }

  platform.AddExtension(commonInstructionsExtension);
  platform.AddExtension(baseObjectExtension);
  platform.AddExtension(extension);
  project.AddPlatform(platform);
}
