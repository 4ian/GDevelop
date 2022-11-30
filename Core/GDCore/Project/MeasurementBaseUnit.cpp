/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MeasurementBaseUnit.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include <vector>

namespace gd {

MeasurementBaseUnit::~MeasurementBaseUnit() {}

const gd::MeasurementBaseUnit MeasurementBaseUnit::degreeAngle =
    MeasurementBaseUnit("degree", "deg", "");
const gd::MeasurementBaseUnit MeasurementBaseUnit::pixel =
    MeasurementBaseUnit("pixel", "px", "distance");
const gd::MeasurementBaseUnit MeasurementBaseUnit::meter =
    MeasurementBaseUnit("meter", "m", "distance");
const gd::MeasurementBaseUnit MeasurementBaseUnit::second =
    MeasurementBaseUnit("second", "s", "time");
const gd::MeasurementBaseUnit MeasurementBaseUnit::kilogram =
    MeasurementBaseUnit("kilogram", "Kg", "mass");

} // namespace gd
