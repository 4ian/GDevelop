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
                          _("Builtin extension providing advanced control features."),
                          "Compil Games",
                          "Freeware");

    GetAllConditions()["Always"].codeExtraInformation.SetFunctionName("gdjs.returnFalse").SetIncludeFile("gd.js");
}
