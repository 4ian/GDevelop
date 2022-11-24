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

gd::MeasurementUnit MeasurementUnit::unknown = CreateUnknown();
gd::MeasurementUnit MeasurementUnit::dimensionless = CreateDimensionless();
gd::MeasurementUnit MeasurementUnit::degreeAngle = CreateDegreeAngle();
gd::MeasurementUnit MeasurementUnit::second = CreateSecond();
gd::MeasurementUnit MeasurementUnit::pixel = CreatePixel();
gd::MeasurementUnit MeasurementUnit::pixelSpeed = CreatePixelSpeed();
gd::MeasurementUnit MeasurementUnit::pixelAcceleration =
    CreatePixelAcceleration();
gd::MeasurementUnit MeasurementUnit::newton = CreateNewton();
gd::MeasurementUnit MeasurementUnit::angularSpeed = CreateAngularSpeed();

} // namespace gd
