/**

GDevelop - Text Object Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
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

        GetObjectMetadata("TextObject::Text").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::String"].SetFunctionName("setString").SetGetter("getString").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::String"].SetFunctionName("getString").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Size"].SetFunctionName("setCharacterSize").SetGetter("getCharacterSize").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Size"].SetFunctionName("getCharacterSize").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Angle"].SetFunctionName("setAngle").SetGetter("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Angle"].SetFunctionName("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Opacity"].SetFunctionName("setOpacity").SetGetter("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Opacity"].SetFunctionName("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetBold"].SetFunctionName("setBold").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsBold"].SetFunctionName("isBold").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetItalic"].SetFunctionName("setItalic").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsItalic"].SetFunctionName("isItalic").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllExpressionsForObject("TextObject::Text")["Opacity"].SetFunctionName("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllExpressionsForObject("TextObject::Text")["Angle"].SetFunctionName("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllStrExpressionsForObject("TextObject::Text")["String"].SetFunctionName("getString").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::ChangeColor"].SetFunctionName("setColor").SetIncludeFile("TextObject/textruntimeobject.js");

        //Unimplemented actions and conditions:
        GetAllActionsForObject("TextObject::Text")["TextObject::Font"].SetFunctionName("");
        GetAllActionsForObject("TextObject::Text")["TextObject::SetUnderlined"].SetFunctionName("");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsUnderlined"].SetFunctionName("");

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
