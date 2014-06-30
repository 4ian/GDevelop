/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "TextEntryObject.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("TextEntryObject",
                              _("Text entry object"),
                              _("Extension allowing to use an object capturing text entered with keyboard."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject("TextEntry",
                       _("Text entry"),
                       _("Invisible object used to get the text entered with the keyboard"),
                       "CppPlatform/Extensions/textentry.png",
                       &CreateTextEntryObject,
                       &DestroyTextEntryObject);

            AddRuntimeObject(obj, "RuntimeTextEntryObject", CreateRuntimeTextEntryObject, DestroyRuntimeTextEntryObject);

        #if defined(GD_IDE_ONLY)
            TextEntryObject::LoadEdittimeIcon();
            obj.SetIncludeFile("TextEntryObject/TextEntryObject.h");

            obj.AddAction("String",
                           _("Text in memory"),
                           _("Modify text in memory of the object"),
                           _("Do _PARAM1__PARAM2_ to the text in memory of _PARAM0_"),
                           "",
                           "CppPlatform/Extensions/textentry24.png",
                           "CppPlatform/Extensions/textentryicon.png")
                .AddParameter("object", _("Object"), "TextEntry", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("string", _("Text"))
                .codeExtraInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("TextEntryObject/TextEntryObject.h");

            obj.AddCondition("String",
                           _("Text in memory"),
                           _("Test the text of a Text Entry object."),
                           _("The text of _PARAM0_ is _PARAM1__PARAM2_"),
                           "",
                           "CppPlatform/Extensions/textentry24.png",
                           "CppPlatform/Extensions/textentryicon.png")
                .AddParameter("object", _("Object"), "TextEntry", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("string", _("Text to test"))
                .codeExtraInformation.SetFunctionName("GetString").SetManipulatedType("string").SetIncludeFile("TextEntryObject/TextEntryObject.h");

            obj.AddAction("Activate",
                           _("De/activate capturing text input"),
                           _("Activate or desactivate the capture of text entered with keyboard."),
                           _("Activate capture by _PARAM0_ of the text entered with keyboard: _PARAM1_"),
                           _("Setup"),
                           "CppPlatform/Extensions/textentry24.png",
                           "CppPlatform/Extensions/textentryicon.png")
                .AddParameter("object", _("Object"), "TextEntry", false)
                .AddParameter("yesorno", _("Activate"))
                .codeExtraInformation.SetFunctionName("Activate").SetIncludeFile("TextObject/TextObject.h");


            obj.AddCondition("Activated",
                           _("Text input"),
                           _("Test if the object capture text entered with keyboard."),
                           _("_PARAM0_ capture the text entered with keyboard"),
                           _("Setup"),
                           "CppPlatform/Extensions/textentry24.png",
                           "CppPlatform/Extensions/textentryicon.png")
                .AddParameter("object", _("Object"), "TextEntry", false)
                .codeExtraInformation.SetFunctionName("IsActivated").SetIncludeFile("TextObject/TextObject.h");

            obj.AddStrExpression("String", _("Text entered with keyboard"), _("Text entered with keyboard"), _("Text entered with keyboard"), "res/texteicon.png")
                .AddParameter("object", _("Object"), "TextEntry", false)
                .codeExtraInformation.SetFunctionName("GetString").SetIncludeFile("TextObject/TextObject.h");

        #endif
        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

