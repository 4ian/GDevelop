/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"

#include "TextObject.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

void DeclareTextObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TextObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TextObjectJsExtension()
    {
        DeclareTextObjectExtension(*this);

        GetObjectMetadata("TextObject::Text")
            .SetIncludeFile("Extensions/TextObject/textruntimeobject.js")
            .AddIncludeFile("Extensions/TextObject/textruntimeobject-pixi-renderer.js")
            .AddIncludeFile("Extensions/TextObject/textruntimeobject-cocos-renderer.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::String"].SetFunctionName("setString").SetGetter("getString").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::String"].SetFunctionName("getString").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Size"].SetFunctionName("setCharacterSize").SetGetter("getCharacterSize").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Size"].SetFunctionName("getCharacterSize").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Angle"].SetFunctionName("setAngle").SetGetter("getAngle").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Angle"].SetFunctionName("getAngle").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Opacity"].SetFunctionName("setOpacity").SetGetter("getOpacity").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Opacity"].SetFunctionName("getOpacity").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetBold"].SetFunctionName("setBold").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsBold"].SetFunctionName("isBold").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetItalic"].SetFunctionName("setItalic").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsItalic"].SetFunctionName("isItalic").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");

        GetAllExpressionsForObject("TextObject::Text")["Opacity"].SetFunctionName("getOpacity").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllExpressionsForObject("TextObject::Text")["Angle"].SetFunctionName("getAngle").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");
        GetAllStrExpressionsForObject("TextObject::Text")["String"].SetFunctionName("getString").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::ChangeColor"].SetFunctionName("setColor").SetIncludeFile("Extensions/TextObject/textruntimeobject.js");

        //Unimplemented actions and conditions:
        GetAllActionsForObject("TextObject::Text")["TextObject::Font"].SetFunctionName("");
        GetAllActionsForObject("TextObject::Text")["TextObject::SetUnderlined"].SetFunctionName("");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsUnderlined"].SetFunctionName("");
        GetAllActionsForObject("TextObject::Text")["TextObject::SetSmooth"].SetFunctionName("");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Smoothed"].SetFunctionName("");

        StripUnimplementedInstructionsAndExpressions();

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTextObjectExtension() {
    return new TextObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TextObjectJsExtension;
}
#endif
#endif
