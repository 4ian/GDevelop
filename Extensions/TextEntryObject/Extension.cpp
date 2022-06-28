/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "TextEntryObject.h"

void DeclareTextEntryObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "TextEntryObject",
          _("Text entry object"),
          _("An object that can be used to capture the text "
            "entered with a keyboard by a player."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/text_entry");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<TextEntryObject>("TextEntry",
                                      _("Text entry"),
                                      _("Invisible object used to get the text "
                                        "entered with the keyboard."),
                                      "CppPlatform/Extensions/textentry.png")
          .SetCategoryFullName(_("Advanced"));

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
      .SetGetter("GetString");

  obj.AddCondition("String",
                   _("Text in memory"),
                   _("Test the text of a Text Entry object."),
                   _("the text"),
                   "",
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .UseStandardRelationalOperatorParameters("string")
      .SetFunctionName("GetString");

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
      .SetFunctionName("Activate");

  obj.AddCondition("Activated",
                   _("Text input"),
                   _("Test if the object captured text entered with keyboard."),
                   _("_PARAM0_ capture the text entered with keyboard"),
                   _("Setup"),
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", _("Object"), "TextEntry")
      .SetFunctionName("IsActivated");

  obj.AddStrExpression("String",
                       _("Text entered with keyboard"),
                       _("Text entered with keyboard"),
                       _("Text entered with keyboard"),
                       "res/texteicon.png")
      .AddParameter("object", _("Object"), "TextEntry")
      .SetFunctionName("GetString");
}
