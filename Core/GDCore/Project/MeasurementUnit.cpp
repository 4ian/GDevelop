/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MeasurementUnit.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include <vector>
#include <algorithm>

namespace gd {

MeasurementUnit::~MeasurementUnit() {}

gd::MeasurementUnit MeasurementUnit::undefined = CreateUndefined();
gd::MeasurementUnit MeasurementUnit::dimensionless = CreateDimensionless();
gd::MeasurementUnit MeasurementUnit::degreeAngle = CreateDegreeAngle();
gd::MeasurementUnit MeasurementUnit::second = CreateSecond();
gd::MeasurementUnit MeasurementUnit::pixel = CreatePixel();
gd::MeasurementUnit MeasurementUnit::pixelSpeed = CreatePixelSpeed();
gd::MeasurementUnit MeasurementUnit::pixelAcceleration =
    CreatePixelAcceleration();
gd::MeasurementUnit MeasurementUnit::newton = CreateNewton();
gd::MeasurementUnit MeasurementUnit::angularSpeed = CreateAngularSpeed();
std::vector<const gd::MeasurementUnit*> MeasurementUnit::defaultMeasurementUnits;

const std::vector<const gd::MeasurementUnit*> &
MeasurementUnit::GetDefaultMeasurementUnits() {
  if (defaultMeasurementUnits.size() == 0) {
    defaultMeasurementUnits.push_back(&undefined);
    defaultMeasurementUnits.push_back(&dimensionless);
    defaultMeasurementUnits.push_back(&degreeAngle);
    defaultMeasurementUnits.push_back(&second);
    defaultMeasurementUnits.push_back(&pixel);
    defaultMeasurementUnits.push_back(&pixelSpeed);
    defaultMeasurementUnits.push_back(&pixelAcceleration);
    defaultMeasurementUnits.push_back(&angularSpeed);
    defaultMeasurementUnits.push_back(&newton);
  }
  return defaultMeasurementUnits;
}

std::size_t MeasurementUnit::GetDefaultMeasurementUnitsCount() {
  return GetDefaultMeasurementUnits().size();
}

const gd::MeasurementUnit &
MeasurementUnit::GetDefaultMeasurementUnitAtIndex(std::size_t index) {
  return *GetDefaultMeasurementUnits().at(index);
}

bool MeasurementUnit::HasDefaultMeasurementUnitNamed(const gd::String &name) {
  auto units = GetDefaultMeasurementUnits();
  return std::find_if(units.begin(), units.end(),
                      [name](const gd::MeasurementUnit *unit) -> bool {
                        return unit->GetName() == name;
                      }) != units.end();
}

const gd::MeasurementUnit &
MeasurementUnit::GetDefaultMeasurementUnitByName(const gd::String &name) {
  auto units = GetDefaultMeasurementUnits();
  return **std::find_if(units.begin(), units.end(),
                        [name](const gd::MeasurementUnit *unit) -> bool {
                          return unit->GetName() == name;
                        });
}

void MeasurementUnit::ApplyTranslation() {
  undefined = CreateUndefined();
  dimensionless = CreateDimensionless();
  degreeAngle = CreateDegreeAngle();
  second = CreateSecond();
  pixel = CreatePixel();
  pixelSpeed = CreatePixelSpeed();
  pixelAcceleration = CreatePixelAcceleration();
  newton = CreateNewton();
  angularSpeed = CreateAngularSpeed();
  defaultMeasurementUnits.clear();
}

} // namespace gd
