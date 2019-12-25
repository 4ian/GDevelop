/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "TextEntryObject.h"

void DeclareTextEntryObjectExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "TextEntryObject",
      _("Text entry object"),
      _("This Extension enables the use of an object that captures text "
        "entered with a keyboard by a player."),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/text_entry");

  gd::ObjectMetadata& obj = extension.AddObject<TextEntryObject>(
      "TextEntry",
      _("Text entry"),
      _("Invisible object used to get the text entered with the keyboard"),
      "CppPlatform/Extensions/textentry.png");

#if defined(GD_IDE_ONLY)
  obj.SetIncludeFile("TextEntryObject/TextEntryObject.h");

  obj.AddAction("String",
                _("Text in memory"),
                _("Modify text in memory of the object"),
                _("the text in memory"),
                "",
                "CppPlatform/Extensions/textentry24.png",
                "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .UseStandardOperatorParameters("string")
      .SetFunctionName("SetString")
      .SetGetter("GetString")
      .SetIncludeFile("TextEntryObject/TextEntryObject.h");

  obj.AddCondition("String",
                   _("Text in memory"),
                   _("Test the text of a Text Entry object."),
                   _("the text"),
                   "",
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .UseStandardRelationalOperatorParameters("string")
      .SetFunctionName("GetString")
      .SetIncludeFile("TextEntryObject/TextEntryObject.h");

  obj.AddAction(
         "Activate",
         _("De/activate capturing text input"),
         _("Activate or deactivate the capture of text entered with keyboard."),
         _("Activate capture by _PARAM0_ of the text entered with keyboard: "
           "_PARAM1_"),
         _("Setup"),
         "CppPlatform/Extensions/textentry24.png",
         "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .AddParameter("yesorno", _("Activate"))
      .SetFunctionName("Activate")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddCondition("Activated",
                   _("Text input"),
                   _("Test if the object captured text entered with keyboard."),
                   _("_PARAM0_ capture the text entered with keyboard"),
                   _("Setup"),
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .SetFunctionName("IsActivated")
      .SetIncludeFile("TextObject/TextObject.h");

  obj.AddStrExpression("String",
                       _("Text entered with keyboard"),
                       _("Text entered with keyboard"),
                       _("Text entered with keyboard"),
                       "res/texteicon.png")
      .AddParameter("object", _("Object"), "TextEntry")
      .SetFunctionName("GetString")
      .SetIncludeFile("TextObject/TextObject.h");
#endif
}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  Extension() {
    DeclareTextEntryObjectExtension(*this);
    AddRuntimeObject<TextEntryObject, RuntimeTextEntryObject>(
        GetObjectMetadata("TextEntryObject::TextEntry"),
        "RuntimeTextEntryObject");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new Extension;
}
#endif
