/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "AdvancedExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

AdvancedExtension::AdvancedExtension()
{
    SetExtensionInformation("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Built-in extension providing advanced control features."),
                          "Florian Rival",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinAdvanced");

    GetAllConditions()["Always"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.returnFalse").SetIncludeFile("commontools.js");
}
