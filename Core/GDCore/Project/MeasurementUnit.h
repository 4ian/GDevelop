/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_MEASUREMENTUNIT
#define GDCORE_MEASUREMENTUNIT
#include <vector>

#include "GDCore/Project/MeasurementUnitElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"

namespace gd {
class SerializerElement;
class MeasurementBaseUnit;
} // namespace gd

namespace gd {

/**
 * \brief An unit of measurement.
 */
class GD_CORE_API MeasurementUnit {
public:
  MeasurementUnit(const std::vector<gd::MeasurementUnitElement> elements_,
                  gd::String name_, gd::String label_,
                  gd::String description_ = "")
      : elements(elements_), name(name_), label(label_),
        description(description_) {}

  MeasurementUnit(gd::String name_, gd::String label_,
                  gd::String description_ = "")
      : name(name_), label(label_), description(description_) {}

  virtual ~MeasurementUnit();

  /**
   * \brief Return the unit name.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Return the unit description.
   */
  const gd::String &GetDescription() const { return description; }

  /**
   * \brief Return the unit elements.
   */
  const std::vector<gd::MeasurementUnitElement> &GetElements() const {
    return elements;
  }

  std::size_t GetElementsCount() const { return elements.size(); }

  int GetElementPower(std::size_t elementIndex) const {
    return elements.at(elementIndex).GetPower();
  }

  const gd::MeasurementBaseUnit &
  GetElementBaseUnit(std::size_t elementIndex) const {
    return elements.at(elementIndex).GetBaseUnit();
  }

  bool IsUnknown() const { return this == &gd::MeasurementUnit::unknown; }

  static gd::MeasurementUnit &GetUnknown() { return unknown; }

  static gd::MeasurementUnit &GetDimensionless() { return dimensionless; }

  static gd::MeasurementUnit &GetDegreeAngle() { return degreeAngle; }

  static gd::MeasurementUnit &GetSecond() { return second; }

  static gd::MeasurementUnit &GetPixel() { return pixel; }

  static gd::MeasurementUnit &GetPixelSpeed() { return pixelSpeed; }

  static gd::MeasurementUnit &GetPixelAcceleration() {
    return pixelAcceleration;
  }

  static gd::MeasurementUnit &GetNewton() { return newton; }

private:
  static gd::MeasurementUnit unknown;
  static gd::MeasurementUnit dimensionless;
  static gd::MeasurementUnit degreeAngle;
  static gd::MeasurementUnit second;
  static gd::MeasurementUnit pixel;
  static gd::MeasurementUnit pixelSpeed;
  static gd::MeasurementUnit pixelAcceleration;
  static gd::MeasurementUnit newton;

  static gd::MeasurementUnit CreateUnknown() {
    return MeasurementUnit("Unknown", _("Unknown"));
  }

  static gd::MeasurementUnit CreateDimensionless() {
    return MeasurementUnit("Dimensionless", _("Dimensionless"));
  }

  static gd::MeasurementUnit CreateDegreeAngle() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::degreeAngle, 1));
    return MeasurementUnit(elements, "DegreeAngle", _("Degree"));
  }

  static gd::MeasurementUnit CreateSecond() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, 1));
    return MeasurementUnit(elements, "Second", _("Second"));
  }

  static gd::MeasurementUnit CreatePixel() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    return MeasurementUnit(elements, "Pixel", _("Pixel"));
  }

  static gd::MeasurementUnit CreatePixelSpeed() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -1));
    return MeasurementUnit(elements, "PixelSpeed", _("Speed"));
  }

  static gd::MeasurementUnit CreatePixelAcceleration() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -2));
    return MeasurementUnit(elements, "PixelAcceleration", _("Acceleration"));
  }

  static gd::MeasurementUnit CreateNewton() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::meter, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::kilogram, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -2));
    return MeasurementUnit(elements, "Newton", _("Newton"),
                           _("A unit to measure forces."));
  }

  gd::String name;                                  ///< The unit name.
  gd::String label;                                 ///< The unit label.
  gd::String description;                           ///< The unit description.
  std::vector<gd::MeasurementUnitElement> elements; ///< The unit elements.
};

} // namespace gd

#endif // GDCORE_MEASUREMENTUNIT
