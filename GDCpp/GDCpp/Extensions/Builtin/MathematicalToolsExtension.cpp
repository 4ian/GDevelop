/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "MathematicalToolsExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/MathematicalToolsExtension.cpp"
#endif

MathematicalToolsExtension::MathematicalToolsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(*this);

#if defined(GD_IDE_ONLY)

  GetAllExpressions()["normalize"]
      .SetFunctionName("GDpriv::MathematicalTools::normalize")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["clamp"]
      .SetFunctionName("GDpriv::MathematicalTools::clamp")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["AngleDifference"]
      .SetFunctionName("GDpriv::MathematicalTools::angleDifference")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["mod"]
      .SetFunctionName("GDpriv::MathematicalTools::mod")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["min"]
      .SetFunctionName("GDpriv::MathematicalTools::Minimal")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["max"]
      .SetFunctionName("GDpriv::MathematicalTools::Maximal")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["abs"]
      .SetFunctionName("GDpriv::MathematicalTools::abs")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["acos"]
      .SetFunctionName("GDpriv::MathematicalTools::acos")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["acosh"]
      .SetFunctionName("GDpriv::MathematicalTools::acosh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["asin"]
      .SetFunctionName("GDpriv::MathematicalTools::asin")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["asinh"]
      .SetFunctionName("GDpriv::MathematicalTools::asinh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["atan"]
      .SetFunctionName("GDpriv::MathematicalTools::atan")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["atan2"]
      .SetFunctionName("GDpriv::MathematicalTools::atan2")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["atanh"]
      .SetFunctionName("GDpriv::MathematicalTools::atanh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["cbrt"]
      .SetFunctionName("GDpriv::MathematicalTools::cbrt")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["ceil"]
      .SetFunctionName("GDpriv::MathematicalTools::ceil")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["floor"]
      .SetFunctionName("GDpriv::MathematicalTools::floor")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["cos"]
      .SetFunctionName("GDpriv::MathematicalTools::cos")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["cosh"]
      .SetFunctionName("GDpriv::MathematicalTools::cosh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["cot"]
      .SetFunctionName("GDpriv::MathematicalTools::cot")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["csc"]
      .SetFunctionName("GDpriv::MathematicalTools::csc")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["int"]
      .SetFunctionName("GDpriv::MathematicalTools::Round")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["rint"]
      .SetFunctionName("GDpriv::MathematicalTools::Round")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["round"]
      .SetFunctionName("GDpriv::MathematicalTools::Round")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["exp"]
      .SetFunctionName("GDpriv::MathematicalTools::exp")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["log"]
      .SetFunctionName("GDpriv::MathematicalTools::log")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["ln"]
      .SetFunctionName("GDpriv::MathematicalTools::log")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["log2"]
      .SetFunctionName("GDpriv::MathematicalTools::log2")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["log10"]
      .SetFunctionName("GDpriv::MathematicalTools::log10")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["nthroot"]
      .SetFunctionName("GDpriv::MathematicalTools::nthroot")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["pow"]
      .SetFunctionName("GDpriv::MathematicalTools::pow")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["sec"]
      .SetFunctionName("GDpriv::MathematicalTools::sec")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["sign"]
      .SetFunctionName("GDpriv::MathematicalTools::sign")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["sin"]
      .SetFunctionName("GDpriv::MathematicalTools::sin")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["sinh"]
      .SetFunctionName("GDpriv::MathematicalTools::sinh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["sqrt"]
      .SetFunctionName("GDpriv::MathematicalTools::sqrt")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["tan"]
      .SetFunctionName("GDpriv::MathematicalTools::tan")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["tanh"]
      .SetFunctionName("GDpriv::MathematicalTools::tanh")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["trunc"]
      .SetFunctionName("GDpriv::MathematicalTools::trunc")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["lerp"]
      .SetFunctionName("GDpriv::MathematicalTools::lerp")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["XFromAngleAndDistance"]
      .SetFunctionName("GDpriv::MathematicalTools::XFromAngleAndDistance")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");
  GetAllExpressions()["XFromAngleAndDistance"]
      .SetFunctionName("GDpriv::MathematicalTools::YFromAngleAndDistance")
      .SetIncludeFile("GDCpp/Extensions/Builtin/MathematicalTools.h");

#endif
}
