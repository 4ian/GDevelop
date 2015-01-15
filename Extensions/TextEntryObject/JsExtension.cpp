/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclareTextEntryObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TextEntryObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TextEntryObjectJsExtension()
    {
        SetExtensionInformation("TextEntryObject",
                              _("Text entry object"),
                              _("Extension allowing to use an object capturing text entered with keyboard."),
                              "Florian Rival",
                              "Open source (MIT License)");

        DeclareTextEntryObjectExtension(*this);

        GetObjectMetadata("TextEntryObject::TextEntry").SetIncludeFile("TextEntryObject/textentryruntimeobject.js");

        GetAllActionsForObject("TextEntryObject::TextEntry")["TextEntryObject::String"].codeExtraInformation
            .SetFunctionName("setString").SetAssociatedGetter("getString");
        GetAllConditionsForObject("TextEntryObject::TextEntry")["TextEntryObject::String"].codeExtraInformation
            .SetFunctionName("getString");
        GetAllActionsForObject("TextEntryObject::TextEntry")["TextEntryObject::Activate"].codeExtraInformation
            .SetFunctionName("activate");
        GetAllConditionsForObject("TextEntryObject::TextEntry")["TextEntryObject::Activated"].codeExtraInformation
            .SetFunctionName("isActivated");

        GetAllStrExpressionsForObject("TextEntryObject::TextEntry")["String"]
            .codeExtraInformation.SetFunctionName("getString");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTextEntryObjectExtension() {
    return new TextEntryObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TextEntryObjectJsExtension;
}
#endif
#endif
