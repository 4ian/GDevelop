/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "TextObject.h"

void DeclareTextObjectExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TextObjectJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  TextObjectJsExtension() {
    DeclareTextObjectExtension(*this);

    GetObjectMetadata("TextObject::Text")
        .SetIncludeFile("Extensions/TextObject/textruntimeobject.js")
        .AddIncludeFile(
            "Extensions/TextObject/textruntimeobject-pixi-renderer.js");
    GetAllActionsForObject("TextObject::Text")["TextObject::Scale"]
        .SetFunctionName("setScale")
        .SetGetter("getScaleMean");
    GetAllActionsForObject("TextObject::Text")["TextObject::ScaleX"]
        .SetFunctionName("setScaleX")
        .SetGetter("getScaleX");
    GetAllConditionsForObject("TextObject::Text")["TextObject::ScaleX"]
        .SetFunctionName("getScaleX");
    GetAllActionsForObject("TextObject::Text")["TextObject::ScaleY"]
        .SetFunctionName("setScaleY")
        .SetGetter("getScaleY");
    GetAllConditionsForObject("TextObject::Text")["TextObject::ScaleY"]
        .SetFunctionName("getScaleY");
    GetAllActionsForObject("TextObject::Text")["TextObject::String"]
        .SetFunctionName("setString")
        .SetGetter("getString");
    GetAllConditionsForObject("TextObject::Text")["TextObject::String"]
        .SetFunctionName("getString");

    GetAllActionsForObject("TextObject::Text")["TextObject::Text::SetFontSize"]
        .SetFunctionName("setCharacterSize")
        .SetGetter("getCharacterSize");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Text::FontSize"]
        .SetFunctionName("getCharacterSize");
    GetAllExpressionsForObject("TextObject::Text")["FontSize"]
        .SetFunctionName("getCharacterSize");

    // Deprecated actions/conditions (use "FontSize"/"SetFontSize" instead):
    GetAllActionsForObject("TextObject::Text")["TextObject::Size"]
        .SetFunctionName("setCharacterSize")
        .SetGetter("getCharacterSize");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Size"]
        .SetFunctionName("getCharacterSize");

    GetAllActionsForObject("TextObject::Text")["TextObject::Angle"]
        .SetFunctionName("setAngle")
        .SetGetter("getAngle");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Angle"]
        .SetFunctionName("getAngle");
    GetAllActionsForObject("TextObject::Text")["TextObject::Opacity"]
        .SetFunctionName("setOpacity")
        .SetGetter("getOpacity");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Opacity"]
        .SetFunctionName("getOpacity");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetBold"]
        .SetFunctionName("setBold");
    GetAllConditionsForObject("TextObject::Text")["TextObject::IsBold"]
        .SetFunctionName("isBold");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetItalic"]
        .SetFunctionName("setItalic");
    GetAllConditionsForObject("TextObject::Text")["TextObject::IsItalic"]
        .SetFunctionName("isItalic");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetWrapping"]
        .SetFunctionName("setWrapping");
    GetAllConditionsForObject("TextObject::Text")["TextObject::IsWrapping"]
        .SetFunctionName("isWrapping");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetPadding"]
        .SetFunctionName("setPadding")
        .SetGetter("getPadding");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Padding"]
        .SetFunctionName("getPadding");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetTextAlignment"]
        .SetFunctionName("setTextAlignment")
        .SetGetter("getTextAlignment");
    GetAllConditionsForObject("TextObject::Text")["TextObject::TextAlignment"]
        .SetFunctionName("getTextAlignment");
    GetAllActionsForObject("TextObject::Text")["TextObject::WrappingWidth"]
        .SetFunctionName("setWrappingWidth")
        .SetGetter("getWrappingWidth");
    GetAllConditionsForObject("TextObject::Text")["TextObject::WrappingWidth"]
        .SetFunctionName("getWrappingWidth");

    GetAllExpressionsForObject("TextObject::Text")["Padding"]
        .SetFunctionName("getPadding");
    GetAllExpressionsForObject("TextObject::Text")["ScaleX"]
        .SetFunctionName("getScaleX");
    GetAllExpressionsForObject("TextObject::Text")["ScaleY"]
        .SetFunctionName("getScaleY");
    GetAllExpressionsForObject("TextObject::Text")["Opacity"]
        .SetFunctionName("getOpacity");
    GetAllExpressionsForObject("TextObject::Text")["Angle"]
        .SetFunctionName("getAngle");
    GetAllStrExpressionsForObject("TextObject::Text")["String"]
        .SetFunctionName("getString");

    GetAllActionsForObject("TextObject::Text")["TextObject::ChangeColor"]
        .SetFunctionName("setColor");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetGradient"]
        .SetFunctionName("setGradient");

    GetAllActionsForObject("TextObject::Text")["TextObject::SetOutline"]
        .SetFunctionName("setOutline");
    GetAllActionsForObject("TextObject::Text")["TextObject::SetShadow"]
        .SetFunctionName("setShadow");
    GetAllActionsForObject("TextObject::Text")["TextObject::ShowShadow"]
        .SetFunctionName("showShadow");

    // Unimplemented actions and conditions:
    GetAllActionsForObject("TextObject::Text")["TextObject::Font"]
        .SetFunctionName("");
    GetAllActionsForObject("TextObject::Text")["TextObject::SetUnderlined"]
        .SetFunctionName("");
    GetAllConditionsForObject("TextObject::Text")["TextObject::IsUnderlined"]
        .SetFunctionName("");
    GetAllActionsForObject("TextObject::Text")["TextObject::SetSmooth"]
        .SetFunctionName("");
    GetAllConditionsForObject("TextObject::Text")["TextObject::Smoothed"]
        .SetFunctionName("");

    StripUnimplementedInstructionsAndExpressions();

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSTextObjectExtension() {
  return new TextObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new TextObjectJsExtension;
}
#endif
#endif
