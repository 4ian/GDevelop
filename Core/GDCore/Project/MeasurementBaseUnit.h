/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_MEASUREMENTBASEUNIT
#define GDCORE_MEASUREMENTBASEUNIT
#include <vector>

#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief An atomic unit of measurement.
 */
class GD_CORE_API MeasurementBaseUnit {
public:
  MeasurementBaseUnit(gd::String name_, gd::String symbol_,
                      gd::String quantity_)
      : name(name_), symbol(symbol_), quantity(quantity_) {}

  virtual ~MeasurementBaseUnit();

  /**
   * \brief Return the unit name.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Return the unit symbol.
   */
  const gd::String &GetSymbol() const { return symbol; }

  /**
   * \brief Return the physical quantity.
   */
  const gd::String &GetQuantity() const { return quantity; }

  static const gd::MeasurementBaseUnit degreeAngle;
  static const gd::MeasurementBaseUnit pixel;
  static const gd::MeasurementBaseUnit meter;
  static const gd::MeasurementBaseUnit second;
  static const gd::MeasurementBaseUnit kilogram;

private:
  gd::String name;     ///< The unit name
  gd::String symbol;   ///< The unit symbol
  gd::String quantity; ///< The physical quantity
};

} // namespace gd

#endif // GDCORE_MEASUREMENTBASEUNIT
