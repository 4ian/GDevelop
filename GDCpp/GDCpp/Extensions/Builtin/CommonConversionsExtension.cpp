#include "GDCpp/Extensions/Builtin/CommonConversionsExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/CommonConversionsExtension.cpp"
#endif

CommonConversionsExtension::CommonConversionsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(*this);

#if defined(GD_IDE_ONLY)
  GetAllExpressions()["ToNumber"]
      .SetFunctionName("GDpriv::CommonInstructions::ToDouble")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllStrExpressions()["ToString"]
      .SetFunctionName("GDpriv::CommonInstructions::ToString")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllStrExpressions()["LargeNumberToString"]
      .SetFunctionName("GDpriv::CommonInstructions::LargeNumberToString")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["ToRad"]
      .SetFunctionName("GDpriv::CommonInstructions::ToRad")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["ToDeg"]
      .SetFunctionName("GDpriv::CommonInstructions::ToDeg")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
#endif
}
