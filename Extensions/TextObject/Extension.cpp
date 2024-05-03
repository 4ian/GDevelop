/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Bold/Italic/Underlined styles )
 */

#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "TextObject.h"

void DeclareTextObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("TextObject",
                               _("Text object"),
                               _("An object that can be used to display any "
                                 "text on the screen: remaining life counter, "
                                 "some indicators, menu buttons, dialogues..."),
                               "Florian Rival and Victor Levasseur",
                               "Open source (MIT License)")
      .SetCategory("Text")
      .SetExtensionHelpPath("/objects/text");
  extension.AddInstructionOrExpressionGroupMetadata(_("Text object"))
      .SetIcon("CppPlatform/Extensions/texticon.png");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<TextObject>("Text",
                                 _("Text"),
                                 _("Displays a text on the screen."),
                                 "CppPlatform/Extensions/texticon.png")
          .SetCategoryFullName(_("Text"))
          .AddDefaultBehavior("TextContainerCapability::TextContainerBehavior")
          .AddDefaultBehavior("EffectCapability::EffectBehavior")
          .AddDefaultBehavior("ScalableCapability::ScalableBehavior")
          .AddDefaultBehavior("OpacityCapability::OpacityBehavior");

  obj.AddAction("Font",
                _("Font"),
                _("Change the font of the text."),
                _("Change font of _PARAM0_ to _PARAM1_"),
                _("Font"),
                "res/actions/font24.png",
                "res/actions/font.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("police", _("Font"))
      .SetFunctionName("ChangeFont");

  obj.AddAction(
         "ChangeColor",
         _("Color"),
         _("Change the color of the text. The color is white by default."),
         _("Change color of _PARAM0_ to _PARAM1_"),
         _("Effects"),
         "res/actions/color24.png",
         "res/actions/color.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"))
      .SetFunctionName("SetColor");

  obj.AddAction("SetGradient",
                _("Gradient"),
                _("Change the gradient of the text."),
                _("Change gradient of _PARAM0_ to colors _PARAM2_ "
                  "_PARAM3_ _PARAM4_ _PARAM5_, type _PARAM1_"),
                _("Effects"),
                "res/actions/textGradient24.png",
                "res/actions/textGradient.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("stringWithSelector",
                    _("Gradient type"),
                    "[\"LINEAR_VERTICAL\", \"LINEAR_HORIZONTAL\"]",
                    false)
      .AddParameter("color", _("First Color"))
      .AddParameter("color", _("Second Color"))
      .AddParameter("color", _("Third Color"))
      .AddParameter("color", _("Fourth Color"));

  // Deprecated
  obj.AddAction("SetOutline",
                _("Outline"),
                _("Change the outline of the text. A thickness of 0 disables "
                  "the outline."),
                _("Change outline of _PARAM0_ to color _PARAM1_ with thickness "
                  "_PARAM2_"),
                _("Effects"),
                "res/actions/textOutline24.png",
                "res/actions/textOutline.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"))
      .AddParameter("expression", _("Thickness"));

  obj.AddScopedAction("SetOutlineEnabled",
                _("Enable outline"),
                _("Enable or disable the outline of the text."),
                _("Enable the outline of _PARAM0_: _PARAM1_"),
                _("Outline"),
                "res/actions/textOutline24.png",
                "res/actions/textOutline.png")
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Enable outline"), "", true)
      .SetDefaultValue("yes");

  obj.AddScopedCondition("IsOutlineEnabled",
                _("Outline enabled"),
                _("Check if the text outline is enabled."),
                _("The outline of _PARAM0_ is enabled"),
                _("Outline"),
                "res/actions/textOutline24.png",
                "res/actions/textOutline.png")
      .AddParameter("object", _("Object"), "Text");

  obj.AddScopedAction("SetOutlineColor",
                _("Outline color"),
                _("Change the outline color of the text."),
                _("Change the text outline color of _PARAM0_ to _PARAM1_"),
                _("Outline"),
                "res/actions/textOutline24.png",
                "res/actions/textOutline.png")
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"));

  obj.AddExpressionAndConditionAndAction("number", "OutlineThickness",
                _("Outline thickness"),
                _("the outline thickness of the text"),
                _("the text outline thickness"),
                _("Outline"),
                "res/actions/textOutline24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Thickness")));

  // Deprecated
  obj.AddAction("SetShadow",
                _("Text shadow"),
                _("Change the shadow of the text."),
                _("Change the shadow of _PARAM0_ to color _PARAM1_ distance "
                  "_PARAM2_ blur _PARAM3_ angle _PARAM4_"),
                _("Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"))
      .AddParameter("expression", _("Distance"))
      .AddParameter("expression", _("Blur"))
      .AddParameter("expression", _("Angle"));

  obj.AddAction("ShowShadow",
                _("Enable shadow"),
                _("Enable or disable the shadow of the text."),
                _("Enable the shadow of _PARAM0_: _PARAM1_"),
                _("Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Show the shadow"), "", true)
      .SetDefaultValue("yes");

  obj.AddScopedCondition("IsShadowEnabled",
                _("Shadow enabled"),
                _("Check if the text shadow is enabled."),
                _("The shadow of _PARAM0_ is enabled"),
                _("Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")
      .AddParameter("object", _("Object"), "Text");

  obj.AddScopedAction("SetShadowColor",
                _("Shadow color"),
                _("Change the shadow color of the text."),
                _("Change the shadow color of _PARAM0_ to _PARAM1_"),
                _("Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")
      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"));

  obj.AddExpressionAndConditionAndAction("number", "ShadowOpacity",
                _("Shadow opacity"),
                _("the shadow opacity of the text"),
                _("the shadow opacity "),
                _("Shadow"),
                "res/actions/textShadow24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity (0 - 255)")));

  obj.AddExpressionAndConditionAndAction("number", "ShadowDistance",
                _("Shadow distance"),
                _("the shadow distance of the text"),
                _("the shadow distance "),
                _("Shadow"),
                "res/actions/textShadow24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Distance")));

  obj.AddExpressionAndConditionAndAction("number", "ShadowAngle",
                _("Shadow angle"),
                _("the shadow angle of the text"),
                _("the shadow angle "),
                _("Shadow"),
                "res/actions/textShadow24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));

  obj.AddExpressionAndConditionAndAction("number", "ShadowBlurRadius",
                _("Shadow blur radius"),
                _("the shadow blur radius of the text"),
                _("the shadow blur radius "),
                _("Shadow"),
                "res/actions/textShadow24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Blur radius")));

  obj.AddAction("SetSmooth",
                _("Smoothing"),
                _("Activate or deactivate text smoothing."),
                _("Smooth _PARAM0_: _PARAM1_"),
                _("Style"),
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Smooth the text"))
      .SetFunctionName("SetSmooth");

  obj.AddCondition("Smoothed",
                   _("Smoothing"),
                   _("Check if an object is smoothed"),
                   _("_PARAM0_ is smoothed"),
                   _("Style"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsSmoothed");

  obj.AddAction("SetBold",
                _("Bold"),
                _("De/activate bold"),
                _("Set bold style of _PARAM0_ : _PARAM1_"),
                _("Style"),
                "res/actions/bold.png",
                "res/actions/bold16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Set bold style"))
      .SetFunctionName("SetBold");

  obj.AddCondition("IsBold",
                   _("Bold"),
                   _("Check if the bold style is activated"),
                   _("_PARAM0_ bold style is set"),
                   _("Style"),
                   "res/conditions/bold.png",
                   "res/conditions/bold16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsBold");

  obj.AddAction("SetItalic",
                _("Italic"),
                _("De/activate italic."),
                _("Set italic style for _PARAM0_ : _PARAM1_"),
                _("Style"),
                "res/actions/italic.png",
                "res/actions/italic16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Set italic"))
      .SetFunctionName("SetItalic");

  obj.AddCondition("IsItalic",
                   _("Italic"),
                   _("Check if the italic style is activated"),
                   _("_PARAM0_ italic style is set"),
                   _("Style"),
                   "res/conditions/italic.png",
                   "res/conditions/italic16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsItalic");

  obj.AddAction("SetUnderlined",
                _("Underlined"),
                _("De/activate underlined style."),
                _("Set underlined style of _PARAM0_: _PARAM1_"),
                _("Style"),
                "res/actions/underline.png",
                "res/actions/underline16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Underline"))
      .SetFunctionName("SetUnderlined");

  obj.AddCondition("IsUnderlined",
                   _("Underlined"),
                   _("Check if the underlined style of an object is set."),
                   _("_PARAM0_ underlined style is activated"),
                   _("Style"),
                   "res/conditions/underline.png",
                   "res/conditions/underline16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsUnderlined");

  obj.AddCondition("Padding",
                   _("Padding"),
                   _("Compare the number of pixels around a text object. If "
                     "the shadow or the outline around the text are getting "
                     "cropped, raise this value."),
                   _("the padding"),
                   _("Style"),
                   "res/conditions/textPadding24_black.png",
                   "res/conditions/textPadding_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("SetPadding",
                _("Padding"),
                _("Set the number of pixels around a text object. If the "
                  "shadow or the outline around the text are getting cropped, "
                  "raise this value."),
                _("the padding"),
                _("Style"),
                "res/actions/textPadding24_black.png",
                "res/actions/textPadding_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddAction("SetTextAlignment",
                _("Alignment"),
                _("Set the text alignment of a multiline text object (does not "
                  "work with single line texts)."),
                _("Align _PARAM0_: _PARAM1_"),
                _("Style"),
                "res/actions/textAlign24.png",
                "res/actions/textAlign.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("stringWithSelector",
                    _("Alignment"),
                    "[\"left\", \"center\", \"right\"]",
                    false)
      .SetFunctionName("SetTextAlignment");

  obj.AddCondition("TextAlignment",
                   _("Alignment"),
                   _("Compare the text alignment of a multiline text object."),
                   _("the alignment"),
                   _("Style"),
                   "res/conditions/textAlign24.png",
                   "res/conditions/textAlign.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "stringWithSelector",
          gd::ParameterOptions::MakeNewOptions()
              .SetDescription(_("Alignment"))
              .SetTypeExtraInfo("[\"left\", \"center\", \"right\"]"));

  obj.AddAction(
         "SetWrapping",
         _("Wrapping"),
         _("De/activate word wrapping. Note that word wrapping is a graphical "
           "option,\nyou can't get the number of lines displayed"),
         _("Activate wrapping style of _PARAM0_: _PARAM1_"),
         _("Style"),
         "res/actions/wordWrap24_black.png",
         "res/actions/wordWrap_black.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Wrapping"));

  obj.AddCondition("IsWrapping",
                   _("Wrapping"),
                   _("Test if the word wrapping style of an object is set."),
                   _("_PARAM0_ word wrapping style is activated"),
                   _("Style"),
                   "res/conditions/wordWrap24_black.png",
                   "res/conditions/wordWrap_black.png")

      .AddParameter("object", _("Object"), "Text");

  obj.AddAction("WrappingWidth",
                _("Wrapping width"),
                _("Modify the word wrapping width of a Text object."),
                _("the wrapping width"),
                _("Style"),
                "res/actions/wordWrap24_black.png",
                "res/actions/wordWrap_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions());

  obj.AddCondition("WrappingWidth",
                   _("Wrapping width"),
                   _("Test the word wrapping width of a Text object."),
                   _("the wrapping width"),
                   _("Style"),
                   "res/conditions/wordWrap24_black.png",
                   "res/conditions/wordWrap_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions());

  obj.AddExpression("Padding",
                    _("Padding"),
                    _("Padding"),
                    _("Style"),
                    "res/actions/textPadding_black.png")
      .AddParameter("object", _("Object"), "Text");

  obj.AddExpressionAndConditionAndAction("number",
                                         "FontSize",
                                         _("Font size"),
                                         _("the font size of a text object"),
                                         _("the font size"),
                                         "",
                                         "res/conditions/characterSize24.png")
      .AddParameter("object", _("Object"), "Text")
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  // Support for deprecated "Size" actions/conditions:
  obj.AddDuplicatedAction("Size", "Text::SetFontSize").SetHidden();
  obj.AddDuplicatedCondition("Size", "Text::FontSize").SetHidden();

  // Deprecated
  obj.AddAction("Angle",
                _("Angle"),
                _("Modify the angle of a Text object."),
                _("the angle"),
                _("Rotation"),
                "res/actions/rotate24_black.png",
                "res/actions/rotate_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")))
      .SetHidden()
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle");

  // Deprecated
  obj.AddCondition("Angle",
                   _("Angle"),
                   _("Compare the value of the angle of a Text object."),
                   _("the angle"),
                   _("Rotation"),
                   "res/conditions/rotate24_black.png",
                   "res/conditions/rotate_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")))
      .SetHidden()
      .SetFunctionName("GetAngle");

  // Deprecated
  obj.AddCondition("ScaleX",
                   _("Scale on X axis"),
                   _("Compare the scale of the text on the X axis"),
                   _("the scale on the X axis"),
                   "Scale",
                   "res/conditions/scaleWidth24_black.png",
                   "res/conditions/scaleWidth_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale to compare to (1 by default)")))
      .SetHidden()
      .SetFunctionName("GetScaleX");

  // Deprecated
  obj.AddAction(
         "ScaleX",
         _("Scale on X axis"),
         _("Modify the scale of the text on the X axis (default scale is 1)"),
         _("the scale on the X axis"),
         _("Scale"),
         "res/actions/scaleWidth24_black.png",
         "res/actions/scaleWidth_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .SetFunctionName("SetScaleX");

  // Deprecated
  obj.AddCondition("ScaleY",
                   _("Scale on Y axis"),
                   _("Compare the scale of the text on the Y axis"),
                   _("the scale on the Y axis"),
                   "Scale",
                   "res/conditions/scaleHeight24_black.png",
                   "res/conditions/scaleHeight_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale to compare to (1 by default)")))
      .SetHidden()
      .SetFunctionName("GetScaleY");

  // Deprecated
  obj.AddAction(
         "ScaleY",
         _("Scale on Y axis"),
         _("Modify the scale of the text on the Y axis (default scale is 1)"),
         _("the scale on the Y axis"),
         _("Scale"),
         "res/actions/scaleHeight24_black.png",
         "res/actions/scaleHeight_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .SetFunctionName("SetScaleY");

  // Deprecated
  obj.AddAction(
         "Scale",
         _("Scale"),
         _("Modify the scale of the specified object (default scale is 1)"),
         _("the scale"),
         _("Scale"),
         "res/actions/scale24_black.png",
         "res/actions/scale_black.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .SetFunctionName("SetScale");

  // Deprecated
  obj.AddExpression("ScaleX",
                    _("X Scale of a Text object"),
                    _("X Scale of a Text object"),
                    _("Scale"),
                    "res/actions/scaleWidth_black.png")
      .AddParameter("object", _("Object"), "Text")
      .SetHidden()
      .SetFunctionName("GetScaleX");

  // Deprecated
  obj.AddExpression("ScaleY",
                    _("Y Scale of a Text object"),
                    _("Y Scale of a Text object"),
                    _("Scale"),
                    "res/actions/scaleHeight_black.png")
      .AddParameter("object", _("Object"), "Text")
      .SetHidden()
      .SetFunctionName("GetScaleY");

  // Deprecated
  obj.AddAction("Opacity",
                _("Text opacity"),
                _("Change the opacity of a Text. 0 is fully transparent, 255 "
                  "is opaque (default)."),
                _("the opacity"),
                "",
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity (0-255)")))
      .SetFunctionName("SetOpacity")
      .SetGetter("GetOpacity")
      .SetHidden();

  // Deprecated
  obj.AddCondition("Opacity",
                   _("Opacity"),
                   _("Compare the opacity of a Text object, between 0 (fully "
                     "transparent) to 255 (opaque)."),
                   _("the opacity"),
                   "",
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity to compare to (0-255)")))
      .SetFunctionName("GetOpacity")
      .SetHidden();

  // Deprecated
  obj.AddExpression("Opacity",
                    _("Opacity of a Text object"),
                    _("Opacity of a Text object"),
                    _("Opacity"),
                    "res/actions/opacity.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetOpacity")
      .SetHidden();

  // Deprecated
  obj.AddExpression("Angle",
                    _("Angle"),
                    _("Angle"),
                    _("Rotation"),
                    "res/actions/rotate_black.png")
      .AddParameter("object", _("Object"), "Text")
      .SetHidden()
      .SetFunctionName("GetAngle");

  // Deprecated
  obj.AddAction("String",
                _("Modify the text"),
                _("Modify the text of a Text object."),
                _("the text"),
                "",
                "res/actions/text24_black.png",
                "res/actions/text_black.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters(
          "string",
          gd::ParameterOptions::MakeNewOptions().SetDescription(_("Text")))
      .SetFunctionName("SetString")
      .SetGetter("GetString");

  // Deprecated
  obj.AddCondition("String",
                   _("Compare the text"),
                   _("Compare the text of a Text object."),
                   _("the text"),
                   "",
                   "res/conditions/text24_black.png",
                   "res/conditions/text_black.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters(
          "string",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Text to compare to")))
      .SetFunctionName("GetString");

  // Deprecated
  obj.AddStrExpression(
         "String", _("Text"), _("Text"), _("Text"), "res/texteicon.png")
      .AddParameter("object", _("Object"), "Text")
      .SetHidden()
      .SetFunctionName("GetString");
}
