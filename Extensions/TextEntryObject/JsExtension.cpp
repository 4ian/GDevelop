/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclareTextEntryObjectExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TextEntryObjectJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  TextEntryObjectJsExtension() {
    DeclareTextEntryObjectExtension(*this);

    GetObjectMetadata("TextEntryObject::TextEntry")
        .SetIncludeFile("Extensions/TextEntryObject/textentryruntimeobject.js")
        .AddIncludeFile(
            "Extensions/TextEntryObject/"
            "textentryruntimeobject-pixi-renderer.js");

    GetAllActionsForObject(
        "TextEntryObject::TextEntry")["TextEntryObject::String"]
        .SetFunctionName("setString")
        .SetGetter("getString");
    GetAllConditionsForObject(
        "TextEntryObject::TextEntry")["TextEntryObject::String"]
        .SetFunctionName("getString");
    GetAllActionsForObject(
        "TextEntryObject::TextEntry")["TextEntryObject::Activate"]
        .SetFunctionName("activate");
    GetAllConditionsForObject(
        "TextEntryObject::TextEntry")["TextEntryObject::Activated"]
        .SetFunctionName("isActivated");

    GetAllStrExpressionsForObject("TextEntryObject::TextEntry")["String"]
        .SetFunctionName("getString");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSTextEntryObjectExtension() {
  return new TextEntryObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new TextEntryObjectJsExtension;
}
#endif
#endif
