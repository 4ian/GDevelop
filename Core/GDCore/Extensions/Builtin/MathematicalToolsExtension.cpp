/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API
BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(
    gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "BuiltinMathematicalTools",
      _("Mathematical tools"),
      "A set of mathematical functions that can be used in expressions.",
      "Florian Rival",
      "Open source (MIT License)");


  extension
      .AddExpression("normalize",
                     _("Normalize a value between `min` and `max` to a value between 0 and 1."),
                     _("Remap a value between 0 and 1."),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Value"))
      .AddParameter("expression", _("Min"))
      .AddParameter("expression", _("Max"));

  extension
      .AddExpression("clamp",
                     _("Clamp (restrict a value to a given range)"),
                     _("Restrict a value to a given range"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Value"))
      .AddParameter("expression", _("Min"))
      .AddParameter("expression", _("Max"));

  extension
      .AddExpression("AngleDifference",
                     _("Difference between two angles"),
                     _("Difference between two angles"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("First angle"))
      .AddParameter("expression", _("Second angle"));

  extension
      .AddExpression("AngleBetweenPositions",
                     _("Angle between two positions"),
                     _("Compute the angle between two positions."),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("First point X position"))
      .AddParameter("expression", _("First point Y position"))
      .AddParameter("expression", _("Second point X position"))
      .AddParameter("expression", _("Second point Y position"));

  extension
      .AddExpression("DistanceBetweenPositions",
                     _("Distance between two positions"),
                     _("Compute the distance between two positions."),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("First point X position"))
      .AddParameter("expression", _("First point Y position"))
      .AddParameter("expression", _("Second point X position"))
      .AddParameter("expression", _("Second point Y position"));

  extension
      .AddExpression("mod",
                     _("Modulo"),
                     _("x mod y"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("x (as in x mod y)"))
      .AddParameter("expression", _("y (as in x mod y)"));

  extension
      .AddExpression("min",
                     _("Minimum of two numbers"),
                     _("Minimum of two numbers"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("First expression"))
      .AddParameter("expression", _("Second expression"));

  extension
      .AddExpression("max",
                     _("Maximum of two numbers"),
                     _("Maximum of two numbers"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("First expression"))
      .AddParameter("expression", _("Second expression"));

  extension
      .AddExpression("abs",
                     _("Absolute value"),
                     _("Absolute value"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("acos",
                     _("Arccosine"),
                     _("Arccosine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("acosh",
                     _("Hyperbolic arccosine"),
                     _("Hyperbolic arccosine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("asin",
                     _("Arcsine"),
                     _("Arcsine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("asinh",
                     _("Arcsine"),
                     _("Arcsine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("atan",
                     _("Arctangent"),
                     _("Arctangent"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("atan2",
                     _("2 argument arctangent"),
                     _("2 argument arctangent (atan2)"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Y"))
      .AddParameter("expression", _("X"));

  extension
      .AddExpression("atanh",
                     _("Hyperbolic arctangent"),
                     _("Hyperbolic arctangent"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("cbrt",
                     _("Cube root"),
                     _("Cube root"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("ceil",
                     _("Ceil (round up)"),
                     _("Round number up to an integer"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("floor",
                     _("Floor (round down)"),
                     _("Round number down to an integer"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("cos",
                     _("Cosine"),
                     _("Cosine of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("cosh",
                     _("Hyperbolic cosine"),
                     _("Hyperbolic cosine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("cot",
                     _("Cotangent"),
                     _("Cotangent of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("csc",
                     _("Cosecant"),
                     _("Cosecant of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("int",
                     _("Round"),
                     _("Round a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .SetHidden()
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("rint",
                     _("Round"),
                     _("Round a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .SetHidden()
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("round",
                     _("Round"),
                     _("Round a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("exp",
                     _("Exponential"),
                     _("Exponential of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("log",
                     _("Logarithm"),
                     _("Logarithm"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("ln",
                     _("Logarithm"),
                     _("Logarithm"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .SetHidden()
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("log2",
                     _("Base-2 logarithm"),
                     _("Base 2 Logarithm"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("log10",
                     _("Base-10 logarithm"),
                     _("Base-10 logarithm"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("nthroot",
                     _("Nth root"),
                     _("Nth root of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Number"))
      .AddParameter("expression", _("N"));

  extension
      .AddExpression("pow",
                     _("Power"),
                     _("Raise a number to power n"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Number"))
      .AddParameter("expression", _("The exponent (n in x^n)"));

  extension
      .AddExpression("sec",
                     _("Secant"),
                     _("Secant"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("sign",
                     _("Sign of a number"),
                     _("Return the sign of a number (1,-1 or 0)"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("sin",
                     _("Sine"),
                     _("Sine of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("sinh",
                     _("Hyperbolic sine"),
                     _("Hyperbolic sine"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("sqrt",
                     _("Square root"),
                     _("Square root of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("tan",
                     _("Tangent"),
                     _("Tangent of a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("tanh",
                     _("Hyperbolic tangent"),
                     _("Hyperbolic tangent"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("trunc",
                     _("Truncation"),
                     _("Truncate a number"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Expression"));

  extension
      .AddExpression("lerp",
                     _("Lerp (Linear interpolation)"),
                     _("Linearly interpolate a to b by x"),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("a (in a+(b-a)*x)"))
      .AddParameter("expression", _("b (in a+(b-a)*x)"))
      .AddParameter("expression", _("x (in a+(b-a)*x)"));

  extension
      .AddExpression("XFromAngleAndDistance",
                     _("X position from angle and distance"),
                     _("Compute the X position when given an angle and distance "
                      "relative to the origin (0;0). This is also known as "
                      "getting the cartesian coordinates of a 2D vector, using "
                      "its polar coordinates."),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Distance"));

  extension
      .AddExpression("YFromAngleAndDistance",
                     _("Y position from angle and distance"),
                     _("Compute the Y position when given an angle and distance "
                      "relative to the origin (0;0). This is also known as "
                      "getting the cartesian coordinates of a 2D vector, using "
                      "its polar coordinates."),
                     _("Mathematical tools"),
                     "res/mathfunction.png")
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Distance"));

}

}  // namespace gd
