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
        SetExtensionInformation("TextObject",
                              _("Text object"),
                              _("Extension allowing to use an object displaying a text."),
                              "Compil Games",
                              "Open source (MIT License)");

        DeclareTextObjectExtension(*this);

        GetObjectMetadata("TextObject::Text").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::String"].codeExtraInformation
            .SetFunctionName("setString").SetAssociatedGetter("getString").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::String"].codeExtraInformation
            .SetFunctionName("getString").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Size"].codeExtraInformation
            .SetFunctionName("setCharacterSize").SetAssociatedGetter("getCharacterSize").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Size"].codeExtraInformation
            .SetFunctionName("getCharacterSize").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Angle"].codeExtraInformation
            .SetFunctionName("setAngle").SetAssociatedGetter("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Angle"].codeExtraInformation
            .SetFunctionName("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllActionsForObject("TextObject::Text")["TextObject::Opacity"].codeExtraInformation
            .SetFunctionName("setOpacity").SetAssociatedGetter("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::Opacity"].codeExtraInformation
            .SetFunctionName("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetBold"].codeExtraInformation
            .SetFunctionName("setBold").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsBold"].codeExtraInformation
            .SetFunctionName("isBold").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::SetItalic"].codeExtraInformation
            .SetFunctionName("setItalic").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsItalic"].codeExtraInformation
            .SetFunctionName("isItalic").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllExpressionsForObject("TextObject::Text")["Opacity"].codeExtraInformation
            .SetFunctionName("getOpacity").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllExpressionsForObject("TextObject::Text")["Angle"].codeExtraInformation
            .SetFunctionName("getAngle").SetIncludeFile("TextObject/textruntimeobject.js");
        GetAllStrExpressionsForObject("TextObject::Text")["String"].codeExtraInformation
            .SetFunctionName("getString").SetIncludeFile("TextObject/textruntimeobject.js");

        GetAllActionsForObject("TextObject::Text")["TextObject::ChangeColor"].codeExtraInformation
            .SetFunctionName("setColor").SetIncludeFile("TextObject/textruntimeobject.js");

        //Unimplemented actions and conditions:
        GetAllActionsForObject("TextObject::Text")["TextObject::Font"].codeExtraInformation
            .SetFunctionName("");
        GetAllActionsForObject("TextObject::Text")["TextObject::SetUnderlined"].codeExtraInformation
            .SetFunctionName("");
        GetAllConditionsForObject("TextObject::Text")["TextObject::IsUnderlined"].codeExtraInformation
            .SetFunctionName("");

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
