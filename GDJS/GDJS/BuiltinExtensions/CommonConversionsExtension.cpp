#include "CommonConversionsExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())


CommonConversionsExtension::CommonConversionsExtension()
{
    SetExtensionInformation("BuiltinCommonConversions",
                          _("Standard Conversions"),
                          _("Built-in extension providing standard conversions expressions."),
                          "Compil Games",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinCommonConversions");

    GetAllExpressions()["ToNumber"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.common.toNumber").SetIncludeFile("commontools.js");
    GetAllExpressions()["ToString"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.common.toString").SetIncludeFile("commontools.js");
    GetAllExpressions()["LargeNumberToString"].codeExtraInformation //TODO: Check if scientific notation is added or not by toString.
        .SetFunctionName("gdjs.evtTools.common.toString").SetIncludeFile("commontools.js");
    GetAllExpressions()["ToRad"].codeExtraInformation
        .SetFunctionName("gdjs.toRad");
    GetAllExpressions()["ToDeg"].codeExtraInformation
        .SetFunctionName("gdjs.toDegrees");
}
