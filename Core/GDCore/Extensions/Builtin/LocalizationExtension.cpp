/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsLocalizationExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinLocalization",
          _("Localization"),
          _("Actions, conditions and expressions to choose and read the "
            "locale used by the game."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetShortDescription(
          "Read, compare and change the locale selected for the game.");
  extension.AddInstructionOrExpressionGroupMetadata(_("Localization"))
      .SetIcon("res/locale.png");

  extension
      .AddExpressionAndConditionAndAction(
          "string",
          "CurrentLocale",
          _("Current locale"),
          _("the locale currently selected for the game"),
          _("the current locale"),
          _("Localization"),
          "res/locale.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters(
          "string",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Locale identifier (for example, \"en\" or \"en-US\")")))
      .MarkAsSimple();
}

}  // namespace gd
