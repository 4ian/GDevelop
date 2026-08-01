/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "LocalizationExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"

namespace gdjs {

LocalizationExtension::LocalizationExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsLocalizationExtension(*this);

  GetAllActions()["SetCurrentLocale"]
      .SetFunctionName("gdjs.evtTools.localization.setLocale")
      .SetGetter("gdjs.evtTools.localization.getLocale")
      .SetIncludeFile("events-tools/localizationtools.js");
  GetAllConditions()["CurrentLocale"]
      .SetFunctionName("gdjs.evtTools.localization.getLocale")
      .SetIncludeFile("events-tools/localizationtools.js");
  GetAllStrExpressions()["CurrentLocale"]
      .SetFunctionName("gdjs.evtTools.localization.getLocale")
      .SetIncludeFile("events-tools/localizationtools.js");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
