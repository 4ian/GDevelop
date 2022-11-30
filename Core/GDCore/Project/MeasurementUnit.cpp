/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MeasurementUnit.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include <vector>

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
}

} // namespace gd
