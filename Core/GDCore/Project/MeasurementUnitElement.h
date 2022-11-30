/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_MEASUREMENTUNITELEMENT
#define GDCORE_MEASUREMENTUNITELEMENT
#include <vector>

#include "GDCore/Project/MeasurementBaseUnit.h"
#include "GDCore/String.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A couple of an atomic unit of measurement and its power.
 */
class GD_CORE_API MeasurementUnitElement {
public:
  MeasurementUnitElement(const gd::MeasurementBaseUnit &baseUnit_, int power_)
      : baseUnit(baseUnit_), power(power_) {}

  virtual ~MeasurementUnitElement();

  /**
   * \brief Return the base unit.
   */
  const gd::MeasurementBaseUnit &GetBaseUnit() const { return baseUnit; }

  /**
   * \brief Return the power on the base unit.
   */
  int GetPower() const { return power; }

private:
  gd::MeasurementBaseUnit baseUnit; ///< The base unit.
  int power;                        ///< The power on the base unit.
};

} // namespace gd

#endif // GDCORE_MEASUREMENTUNITELEMENT
