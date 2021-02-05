/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include <cmath>
#include "GDCpp/Runtime/CommonTools.h"

namespace GDpriv {
namespace MathematicalTools {

double GD_API normalize(double expression, double min, double max) { 
  return (min = max ? max : (expression - min) / (max - min));
}

double GD_API clamp(double expression, double min, double max) { 
  return std::min(std::max(expression, min), max);
}

double GD_API Minimal(double expression1, double expression2) {
  return std::min(expression1, expression2);
}

double GD_API Maximal(double expression1, double expression2) {
  return std::max(expression1, expression2);
}

double GD_API abs(double expression) { return ::fabs(expression); }

double GD_API acos(double expression) { return ::acos(expression); }
double GD_API asin(double expression) { return ::asin(expression); }

double GD_API acosh(double expression) { return ::acosh(expression); }
double GD_API asinh(double expression) { return ::asinh(expression); }
double GD_API atan(double expression) { return ::atan(expression); }
double GD_API atan2(double y, double x) { return ::atan2(y, x); }
double GD_API atanh(double expression) { return ::atanh(expression); }
double GD_API cbrt(double expression) { return ::cbrt(expression); }
double GD_API ceil(double expression) { return ::ceil(expression); }
double GD_API floor(double expression) { return ::floor(expression); }
double GD_API cos(double expression) { return ::cos(expression); }
double GD_API cosh(double expression) { return ::cosh(expression); }
double GD_API cot(double expression) { return 1 / ::tan(expression); }
double GD_API csc(double expression) { return 1.0 / ::sin(expression); }
double GD_API sec(double expression) { return 1.0 / ::cos(expression); }
double GD_API exp(double expression) { return ::exp(expression); }
double GD_API Round(double expression) { return GDRound(expression); }
double GD_API log(double expression) { return ::log(expression); }
double GD_API log2(double expression) {
#if defined(ANDROID)
  return log(expression) / log(2);
#else
  return ::log2(expression);
#endif
}
double GD_API log10(double expression) { return ::log10(expression); }
double GD_API nthroot(double expression, double n) {
  return ::pow(expression, 1.0 / n);
}
double GD_API pow(double expression, double n) { return ::pow(expression, n); }
double GD_API sin(double expression) { return ::sin(expression); }
double GD_API sinh(double expression) { return ::sinh(expression); }
double GD_API sign(double expression) {
  if (expression == 0) return 0;

  return (expression > 0 ? +1 : -1);
}
double GD_API sqrt(double expression) { return ::sqrt(expression); }
double GD_API tan(double expression) { return ::tan(expression); }
double GD_API tanh(double expression) { return ::tanh(expression); }
double GD_API trunc(double expression) { return ::trunc(expression); }
double GD_API mod(double x, double y) { return x - y * ::floor(x / y); }

double GD_API angleDifference(double angle1, double angle2) {
  return mod(mod(angle1 - angle2, 360.0) + 180.0, 360.0) - 180.0;
}

double GD_API lerp(double a, double b, double x) { return a + (b - a) * x; }

}  // namespace MathematicalTools
}  // namespace GDpriv
