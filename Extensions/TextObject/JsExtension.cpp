/**

Game Develop - Text Object Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
#include "TextObject.h"
#include <boost/version.hpp>
#include <iostream>
#include "GDCore/Tools/Localization.h"

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("TextObject",
                              _("Text object"),
                              _("Extension allowing to use an object displaying a text."),
                              "Compil Games",
                              "zlib/libpng License (Open Source)");

        CloneExtension("Game Develop C++ platform", "TextObject");

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

        StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
        /* Font action
           SetUnderlined action
           IsUnderlined condition
        */
    };
    virtual ~JsExtension() {};
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDJSExtension(gd::PlatformExtension * p) {
    delete p;
}
#endif
