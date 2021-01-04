/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Bold/Italic/Underlined styles )
 */

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCpp/Extensions/ExtensionBase.h"

#include "TextObject.h"

void DeclareTextObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "TextObject",
          _("Text object"),
          _("This Extension enables the use of an object that displays text."),
          "Florian Rival and Victor Levasseur",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/text");

  gd::ObjectMetadata& obj =
      extension.AddObject<TextObject>("Text",
                                      _("Text"),
                                      _("Displays a text"),
                                      "CppPlatform/Extensions/texticon.png");

#if defined(GD_IDE_ONLY)
  obj.SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("String",
                _("Modify the text"),
                _("Modify the text of a Text object."),
                _("the text"),
                "",
                "res/actions/text24.png",
                "res/actions/text.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("string")
      .SetFunctionName("SetString")
      .SetGetter("GetString")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("String",
                   _("Compare the text"),
                   _("Compare the text of a Text object."),
                   _("the text"),
                   "",
                   "res/conditions/text24.png",
                   "res/conditions/text.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("string")
      .SetFunctionName("GetString")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("Font",
                _("Font"),
                _("Change the font of the text."),
                _("Change font of _PARAM0_ to _PARAM1_"),
                _("Font"),
                "res/actions/font24.png",
                "res/actions/font.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("police", _("Font"))
      .SetFunctionName("ChangeFont")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("Size",
                _("Size"),
                _("Change the size of the text."),
                _("the size of the text"),
                "",
                "res/actions/characterSize24.png",
                "res/actions/characterSize.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetCharacterSize")
      .SetGetter("GetCharacterSize")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Size",
                   _("Size"),
                   _("Compare the size of the text"),
                   _("the size of the text"),
                   "",
                   "res/conditions/characterSize24.png",
                   "res/conditions/characterSize.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetCharacterSize")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("ScaleX",
                   _("Scale on X axis"),
                   _("Compare the scale of the text on the X axis"),
                   _("the scale on the X axis"),
                   "Scale",
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetScaleX")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction(
         "ScaleX",
         _("Scale on X axis"),
         _("Modify the scale of the text on the X axis (default scale is 1)"),
         _("the scale on the X axis"),
         _("Scale"),
         "res/actions/scaleWidth24.png",
         "res/actions/scaleWidth.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetScaleX")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("ScaleY",
                   _("Scale on Y axis"),
                   _("Compare the scale of the text on the Y axis"),
                   _("the scale on the Y axis"),
                   "Scale",
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetScaleY")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction(
         "ScaleY",
         _("Scale on Y axis"),
         _("Modify the scale of the text on the Y axis (default scale is 1)"),
         _("the scale on the Y axis"),
         _("Scale"),
         "res/actions/scaleHeight24.png",
         "res/actions/scaleHeight.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetScaleY")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction(
         "Scale",
         _("Scale"),
         _("Modify the scale of the specified object (default scale is 1)"),
         _("the scale"),
         _("Scale"),
         "res/actions/scale24.png",
         "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetScale")
      .SetIncludeFile("TextObject/TextObject.h");

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
      .SetFunctionName("SetColor")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("SetGradient",
                _("Gradient"),
                _("Change the gradient of the text."),
                _("Change gradient of _PARAM0_ to colors _PARAM1_ _PARAM2_ "
                  "_PARAM3_ _PARAM4_ type _PARAM5_"),
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

  obj.AddAction("SetOutline",
                _("Outline"),
                _("Change the outline of the text. A thickness of 0 disables "
                  "the outline."),
                _("Change outline of _PARAM0_ to color _PARAM1_ with thickness "
                  "_PARAM2_"),
                _("Effects"),
                "res/actions/textOutline24.png",
                "res/actions/textOutline.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"))
      .AddParameter("expression", _("Thickness"));

  obj.AddAction("SetShadow",
                _("Change Shadow"),
                _("Change the shadow of the text."),
                _("Change the shadow of _PARAM0_ to color _PARAM1_ distance "
                  "_PARAM2_ blur _PARAM3_ angle _PARAM4_"),
                _("Effects/Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("color", _("Color"))
      .AddParameter("expression", _("Distance"))
      .AddParameter("expression", _("Blur"))
      .AddParameter("expression", _("Angle"));

  obj.AddAction("ShowShadow",
                _("Show Shadow"),
                _("Show the shadow of the text."),
                _("Show the shadow of _PARAM0_: _PARAM1_"),
                _("Effects/Shadow"),
                "res/actions/textShadow24.png",
                "res/actions/textShadow.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Show the shadow"));

  obj.AddAction("Opacity",
                _("Change text opacity"),
                _("Change the opacity of a Text. 0 is fully transparent, 255 "
                  "is opaque (default)."),
                _("the opacity"),
                "",
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetOpacity")
      .SetGetter("GetOpacity")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Opacity",
                   _("Opacity"),
                   _("Compare the opacity of a Text object, between 0 (fully "
                     "transparent) to 255 (opaque)."),
                   _("the opacity"),
                   "",
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetOpacity")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("SetSmooth",
                _("Smoothing"),
                _("Activate or deactivate text smoothing."),
                _("Smooth _PARAM0_: _PARAM1_"),
                _("Style"),
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Smooth the text"))
      .SetFunctionName("SetSmooth")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Smoothed",
                   _("Smoothing"),
                   _("Check if an object is smoothed"),
                   _("_PARAM0_ is smoothed"),
                   _("Style"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsSmoothed")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("SetBold",
                _("Bold"),
                _("De/activate bold"),
                _("Set bold style of _PARAM0_ : _PARAM1_"),
                _("Style"),
                "res/actions/bold.png",
                "res/actions/bold16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Set bold style"))
      .SetFunctionName("SetBold")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("IsBold",
                   _("Bold"),
                   _("Check if the bold style is activated"),
                   _("_PARAM0_ bold style is set"),
                   _("Style"),
                   "res/conditions/bold.png",
                   "res/conditions/bold16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsBold")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("SetItalic",
                _("Italic"),
                _("De/activate italic."),
                _("Set italic style for _PARAM0_ : _PARAM1_"),
                _("Style"),
                "res/actions/italic.png",
                "res/actions/italic16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Set italic"))
      .SetFunctionName("SetItalic")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("IsItalic",
                   _("Italic"),
                   _("Check if the italic style is activated"),
                   _("_PARAM0_ italic style is set"),
                   _("Style"),
                   "res/conditions/italic.png",
                   "res/conditions/italic16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsItalic")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("SetUnderlined",
                _("Underlined"),
                _("De/activate underlined style."),
                _("Set underlined style of _PARAM0_: _PARAM1_"),
                _("Style"),
                "res/actions/underline.png",
                "res/actions/underline16.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Underline"))
      .SetFunctionName("SetUnderlined")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("IsUnderlined",
                   _("Underlined"),
                   _("Check if the underlined style of an object is set."),
                   _("_PARAM0_ underlined style is activated"),
                   _("Style"),
                   "res/conditions/underline.png",
                   "res/conditions/underline16.png")

      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("IsUnderlined")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddAction("Angle",
                _("Angle"),
                _("Modify the angle of a Text object."),
                _("the angle"),
                _("Rotation"),
                "res/actions/rotate24.png",
                "res/actions/rotate.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Angle",
                   _("Angle"),
                   _("Compare the value of the angle of a Text object."),
                   _("the angle"),
                   _("Rotation"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetAngle")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Padding",
                   _("Padding"),
                   _("Compare the number of pixels around a text object. If "
                     "the shadow or the outline around the text are getting "
                     "cropped, raise this value."),
                   _("the padding"),
                   _("Style"),
                   "res/conditions/textPadding24.png",
                   "res/conditions/textPadding.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetPadding",
                _("Padding"),
                _("Set the number of pixels around a text object. If the "
                  "shadow or the outline around the text are getting cropped, "
                  "raise this value."),
                _("the padding"),
                _("Style"),
                "res/actions/textPadding24.png",
                "res/actions/textPadding.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number");

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
      .SetFunctionName("SetTextAlignment")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("TextAlignment",
                   _("Alignment"),
                   _("Compare the text alignment of a multiline text object."),
                   _("the alignment"),
                   _("Style"),
                   "res/conditions/textAlign24.png",
                   "res/conditions/textAlign.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("string");

  obj.AddAction(
         "SetWrapping",
         _("Wrapping"),
         _("De/activate word wrapping. Note that word wrapping is a graphical "
           "option,\nyou can't get the number of lines displayed"),
         _("Set word wrapping style of _PARAM0_: _PARAM1_"),
         _("Style"),
         "res/actions/wordWrap24.png",
         "res/actions/wordWrap.png")

      .AddParameter("object", _("Object"), "Text")
      .AddParameter("yesorno", _("Wrapping"));

  obj.AddCondition("IsWrapping",
                   _("Wrapping"),
                   _("Test if the word wrapping style of an object is set."),
                   _("_PARAM0_ word wrapping style is activated"),
                   _("Style"),
                   "res/conditions/wordWrap24.png",
                   "res/conditions/wordWrap.png")

      .AddParameter("object", _("Object"), "Text");

  obj.AddAction("WrappingWidth",
                _("Wrapping width"),
                _("Modify the word wrapping width of a Text object."),
                _("the wrapping width"),
                _("Style"),
                "res/actions/wordWrap24.png",
                "res/actions/wordWrap.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardOperatorParameters("number");

  obj.AddCondition("WrappingWidth",
                   _("Wrapping width"),
                   _("Test the word wrapping width of a Text object."),
                   _("the wrapping width"),
                   _("Style"),
                   "res/conditions/wordWrap24.png",
                   "res/conditions/wordWrap.png")

      .AddParameter("object", _("Object"), "Text")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddExpression("Padding",
                    _("Padding"),
                    _("Padding"),
                    _("Style"),
                    "res/actions/textPadding.png")
      .AddParameter("object", _("Object"), "Text");

  obj.AddExpression("ScaleX",
                    _("X Scale of a Text object"),
                    _("X Scale of a Text object"),
                    _("Scale"),
                    "res/actions/scaleWidth.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetScaleX")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddExpression("ScaleY",
                    _("Y Scale of a Text object"),
                    _("Y Scale of a Text object"),
                    _("Scale"),
                    "res/actions/scaleHeight.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetScaleY")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddExpression("Opacity",
                    _("Opacity of a Text object"),
                    _("Opacity of a Text object"),
                    _("Opacity"),
                    "res/actions/opacity.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetOpacity")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddExpression("Angle",
                    _("Angle"),
                    _("Angle"),
                    _("Rotation"),
                    "res/actions/rotate.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetAngle")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddStrExpression(
         "String", _("Text"), _("Text"), _("Text"), "res/texteicon.png")
      .AddParameter("object", _("Object"), "Text")
      .SetFunctionName("GetString")
      .SetIncludeFile("TextObject/TextObject.h");
#endif
}

/**
 * \brief This class declares information about the C++ extension.
 */
class Extension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  Extension() {
    DeclareTextObjectExtension(*this);
    AddRuntimeObject<TextObject, RuntimeTextObject>(
        GetObjectMetadata("TextObject::Text"), "RuntimeTextObject");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppTextObjectExtension() {
  return new Extension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new Extension;
}
#endif
