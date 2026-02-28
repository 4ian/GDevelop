/**
 
 GDevelop - Light3D Object Extension
 Copyright (c) 2024 GDevelop Team
 This project is released under the MIT License.
 */

#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "Light3DObject.h"

void DeclareLight3DExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("Light3D",
                               _("Light3D Object"),
                               _("A 3D light object that can illuminate the scene. "
                                 "Supports Point Light and Spot Light with shadows."),
                               "GDevelop Team",
                               "Open source (MIT License)")
      .SetCategory("Graphics")
      .SetExtensionHelpPath("/objects/light3d");
  
  extension.AddInstructionOrExpressionGroupMetadata(_("Light3D"))
      .SetIcon("CppPlatform/Extensions/light3dicon.png");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<Light3DObject>("Light3D",
                                 _("Light3D"),
                                 _("A 3D light object that can illuminate the scene."),
                                 "CppPlatform/Extensions/light3dicon.png")
          .SetCategory("Graphics")
          .MarkAsRenderedIn3D()
          .AddDefaultBehavior("Scene3D::Base3DBehavior");

  // Light type
  obj.AddExpressionAndConditionAndAction("string",
                                        "LightType",
                                        _("Light type"),
                                        _("the type of the light"),
                                        _("the light type"),
                                        "",
                                        "res/conditions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("string", gd::ParameterOptions::MakeNewOptions());

  // Enabled
  obj.AddScopedAction("SetEnabled",
                     _("Enable/Disable light"),
                     _("Enable or disable the light"),
                     _("Enable light _PARAM0_: _PARAM1_"),
                     _("General"),
                     "res/actions/light.png",
                     "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .AddParameter("yesorno", _("Enable light"), "", true)
      .SetDefaultValue("yes");

  obj.AddScopedCondition("IsEnabled",
                        _("Light is enabled"),
                        _("Check if the light is enabled"),
                        _("Light _PARAM0_ is enabled"),
                        _("General"),
                        "res/conditions/light.png",
                        "res/conditions/light.png")
      .AddParameter("object", _("Object"), "Light3D");

  // Color
  obj.AddAction("SetColor",
                _("Color"),
                _("Change the color of the light"),
                _("Change color of _PARAM0_ to _PARAM1_"),
                _("Appearance"),
                "res/actions/color24.png",
                "res/actions/color.png")
      .AddParameter("object", _("Object"), "Light3D")
      .AddParameter("color", _("Color"));

  // Intensity
  obj.AddExpressionAndConditionAndAction("number",
                                         "Intensity",
                                         _("Intensity"),
                                         _("the intensity of the light"),
                                         _("the light intensity"),
                                         _("Appearance"),
                                         "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Distance
  obj.AddExpressionAndConditionAndAction("number",
                                         "Distance",
                                         _("Distance"),
                                         _("the distance of the light"),
                                         _("the light distance"),
                                         _("Appearance"),
                                         "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Decay
  obj.AddExpressionAndConditionAndAction("number",
                                         "Decay",
                                         _("Decay"),
                                         _("the decay of the light"),
                                         _("the light decay"),
                                         _("Appearance"),
                                         "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Angle (for Spot Light)
  obj.AddExpressionAndConditionAndAction("number",
                                         "Angle",
                                         _("Angle"),
                                         _("the angle of the spotlight"),
                                         _("the spotlight angle"),
                                         _("Appearance"),
                                         "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Penumbra (for Spot Light)
  obj.AddExpressionAndConditionAndAction("number",
                                         "Penumbra",
                                         _("Penumbra"),
                                         _("the penumbra of the spotlight"),
                                         _("the spotlight penumbra"),
                                         _("Appearance"),
                                         "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Cast Shadow
  obj.AddScopedAction("SetCastShadow",
                     _("Cast shadow"),
                     _("Enable or disable shadow casting"),
                     _("Cast shadow from _PARAM0_: _PARAM1_"),
                     _("Shadows"),
                     "res/actions/shadow.png",
                     "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .AddParameter("yesorno", _("Cast shadow"), "", true)
      .SetDefaultValue("yes");

  obj.AddScopedCondition("IsCastingShadow",
                        _("Light is casting shadow"),
                        _("Check if the light is casting shadows"),
                        _("Light _PARAM0_ is casting shadow"),
                        _("Shadows"),
                        "res/conditions/shadow.png",
                        "res/conditions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D");

  // Shadow - Map Size
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowMapSize",
                                         _("Shadow map size"),
                                         _("the shadow map size"),
                                         _("the shadow map size"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Bias
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowBias",
                                         _("Shadow bias"),
                                         _("the shadow bias"),
                                         _("the shadow bias"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Normal Bias
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowNormalBias",
                                         _("Shadow normal bias"),
                                         _("the shadow normal bias"),
                                         _("the shadow normal bias"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Radius
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowRadius",
                                         _("Shadow radius"),
                                         _("the shadow radius"),
                                         _("the shadow radius"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Near
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowNear",
                                         _("Shadow near"),
                                         _("the shadow near"),
                                         _("the shadow near"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Far
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowFar",
                                         _("Shadow far"),
                                         _("the shadow far"),
                                         _("the shadow far"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Shadow - Focus (for Spot Light)
  obj.AddExpressionAndConditionAndAction("number",
                                         "ShadowFocus",
                                         _("Shadow focus"),
                                         _("the shadow focus"),
                                         _("the shadow focus"),
                                         _("Shadows"),
                                         "res/actions/shadow.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Flicker - Enabled
  obj.AddScopedAction("SetFlickerEnabled",
                     _("Enable flicker"),
                     _("Enable or disable the flicker effect"),
                     _("Enable flicker on _PARAM0_: _PARAM1_"),
                     _("Effects"),
                     "res/actions/flicker.png",
                     "res/actions/flicker.png")
      .AddParameter("object", _("Object"), "Light3D")
      .AddParameter("yesorno", _("Enable flicker"), "", true)
      .SetDefaultValue("yes");

  obj.AddScopedCondition("IsFlickerEnabled",
                        _("Flicker is enabled"),
                        _("Check if the flicker effect is enabled"),
                        _("Flicker on _PARAM0_ is enabled"),
                        _("Effects"),
                        "res/conditions/flicker.png",
                        "res/conditions/flicker.png")
      .AddParameter("object", _("Object"), "Light3D");

  // Flicker - Speed
  obj.AddExpressionAndConditionAndAction("number",
                                         "FlickerSpeed",
                                         _("Flicker speed"),
                                         _("the flicker speed"),
                                         _("the flicker speed"),
                                         _("Effects"),
                                         "res/actions/flicker.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Z Position
  obj.AddExpressionAndConditionAndAction("number",
                                         "ZPosition",
                                         _("Z Position"),
                                         _("the Z position of the light"),
                                         _("the Z position"),
                                         _("Position"),
                                         "res/actions/position.png")
      .AddParameter("object", _("Object"), "Light3D")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Toggle light
  obj.AddAction("ToggleLight",
               _("Toggle light"),
               _("Toggle the light on/off"),
               _("Toggle light _PARAM0_"),
               _("General"),
               "res/actions/light.png",
               "res/actions/light.png")
      .AddParameter("object", _("Object"), "Light3D");

  // Toggle flicker
  obj.AddAction("ToggleFlicker",
               _("Toggle flicker"),
               _("Toggle the flicker effect on/off"),
               _("Toggle flicker _PARAM0_"),
               _("Effects"),
               "res/actions/flicker.png",
               "res/actions/flicker.png")
      .AddParameter("object", _("Object"), "Light3D");

  // Light Type condition
  obj.AddCondition("LightType",
                 _("Light type"),
                 _("Check the type of the light"),
                 _("the light type of _PARAM0_ is _PARAM1_"),
                 _("General"),
                 "res/conditions/light.png",
                 "res/conditions/light.png")
      .AddParameter("object", _("Object"), "Light3D")
      .AddParameter("stringWithSelector", _("Light type"), "[\"Point\", \"Spot\"]", false);

  // Expressions
  obj.AddExpression("ColorR",
                   _("Red color component"),
                   _("Get the red component of the light color"),
                   _("Light color"),
                   "res/actions/color.png")
      .AddParameter("object", _("Object"), "Light3D");

  obj.AddExpression("ColorG",
                   _("Green color component"),
                   _("Get the green component of the light color"),
                   _("Light color"),
                   "res/actions/color.png")
      .AddParameter("object", _("Object"), "Light3D");

  obj.AddExpression("ColorB",
                   _("Blue color component"),
                   _("Get the blue component of the light color"),
                   _("Light color"),
                   "res/actions/color.png")
      .AddParameter("object", _("Object"), "Light3D");
}
