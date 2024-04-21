/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "TextEntryObject.h"

// Deprecated extension - so no translation markers and the object is hidden in the editor.
void DeclareTextEntryObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "TextEntryObject",
          "Text entry object",
          "Deprecated object that can be used to capture the text "
            "entered with a keyboard by a player.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("User interface")
      .SetExtensionHelpPath("/objects/text_entry");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<TextEntryObject>("TextEntry",
                                      "Text entry",
                                      "Invisible object used to get the text "
                                        "entered with the keyboard.",
                                      "CppPlatform/Extensions/textentry.png")
          .SetCategoryFullName("User interface")
          .SetHidden(); // Deprecated

  obj.AddAction("String",
                "Text in memory",
                "Modify text in memory of the object",
                "the text in memory",
                "",
                "CppPlatform/Extensions/textentry24.png",
                "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", "Object", "TextEntry")
      .UseStandardOperatorParameters(
          "string",
          gd::ParameterOptions::MakeNewOptions().SetDescription("Text"))
      .SetFunctionName("SetString")
      .SetGetter("GetString");

  obj.AddCondition("String",
                   "Text in memory",
                   "Test the text of a Text Entry object.",
                   "the text",
                   "",
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", "Object", "TextEntry")
      .UseStandardRelationalOperatorParameters(
          "string",
          gd::ParameterOptions::MakeNewOptions().SetDescription("Text to compare to"))
      .SetFunctionName("GetString");

  obj.AddAction(
         "Activate",
         "De/activate capturing text input",
         "Activate or deactivate the capture of text entered with keyboard.",
         "Activate capture by _PARAM0_ of the text entered with keyboard: "
           "_PARAM1_",
         "Setup",
         "CppPlatform/Extensions/textentry24.png",
         "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", "Object", "TextEntry")
      .AddParameter("yesorno", "Activate")
      .SetFunctionName("Activate");

  obj.AddCondition("Activated",
                   "Text input",
                   "Test if the object captured text entered with keyboard.",
                   "_PARAM0_ capture the text entered with keyboard",
                   "Setup",
                   "CppPlatform/Extensions/textentry24.png",
                   "CppPlatform/Extensions/textentryicon.png")

      .AddParameter("object", "Object", "TextEntry")
      .SetFunctionName("IsActivated");

  obj.AddStrExpression("String",
                       "Text entered with keyboard",
                       "Text entered with keyboard",
                       "Text entered with keyboard",
                       "res/texteicon.png")
      .AddParameter("object", "Object", "TextEntry")
      .SetFunctionName("GetString");
}
