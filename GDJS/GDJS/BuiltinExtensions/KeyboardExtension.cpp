#include "KeyboardExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

KeyboardExtension::KeyboardExtension()
{
    SetExtensionInformation("BuiltinKeyboard",
                          _("Keyboard features"),
                          _("Built-in extensions allowing to use keyboard"),
                          "Compil Games",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinKeyboard");

    GetAllConditions()["KeyPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.h");
    GetAllConditions()["KeyFromTextPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isKeyPressed").SetIncludeFile("inputtools.h");
    GetAllConditions()["AnyKeyPressed"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.anyKeyPressed").SetIncludeFile("inputtools.h");
}
