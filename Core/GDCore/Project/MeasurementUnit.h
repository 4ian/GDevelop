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
 * \brief A unit of measurement.
 */
class GD_CORE_API MeasurementUnit {
public:
  MeasurementUnit(const std::vector<gd::MeasurementUnitElement> &elements_,
                  gd::String name_, gd::String label_,
                  gd::String elementsWithWords_, gd::String description_ = "")
      : elements(elements_), name(name_), label(label_),
        description(description_), elementsWithWords(elementsWithWords_) {}

  MeasurementUnit(gd::String name_, gd::String label_,
                  gd::String elementsWithWords_, gd::String description_ = "")
      : name(name_), label(label_), description(description_),
        elementsWithWords(elementsWithWords_) {}

  virtual ~MeasurementUnit();

  /**
   * \brief Return the unit name.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Return the unit label.
   */
  const gd::String &GetLabel() const { return label; }

  /**
   * \brief Return the unit description.
   */
  const gd::String &GetDescription() const { return description; }

  /**
   * \brief Return the unit description.
   */
  const gd::String &GetElementsWithWords() const { return elementsWithWords; }

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

  bool IsUndefined() const {
    return this == &gd::MeasurementUnit::undefined || name == "Undefined";
  }

  static void ApplyTranslation();

  static const gd::MeasurementUnit &GetUndefined() { return undefined; }

  static const gd::MeasurementUnit &GetDimensionless() { return dimensionless; }

  static const gd::MeasurementUnit &GetDegreeAngle() { return degreeAngle; }

  static const gd::MeasurementUnit &GetSecond() { return second; }

  static const gd::MeasurementUnit &GetPixel() { return pixel; }

  static const gd::MeasurementUnit &GetPixelSpeed() { return pixelSpeed; }

  static const gd::MeasurementUnit &GetPixelAcceleration() {
    return pixelAcceleration;
  }

  static const gd::MeasurementUnit &GetAngularSpeed() { return angularSpeed; }

  static const gd::MeasurementUnit &GetNewton() { return newton; }

  static const std::vector<const gd::MeasurementUnit*> &GetDefaultMeasurementUnits();
  static std::size_t GetDefaultMeasurementUnitsCount();
  static const gd::MeasurementUnit &GetDefaultMeasurementUnitAtIndex(std::size_t index);
  static bool HasDefaultMeasurementUnitNamed(const gd::String &name);
  static const gd::MeasurementUnit &GetDefaultMeasurementUnitByName(const gd::String &name);

private:
  static std::vector<const gd::MeasurementUnit*> defaultMeasurementUnits;
  static gd::MeasurementUnit undefined;
  static gd::MeasurementUnit dimensionless;
  static gd::MeasurementUnit degreeAngle;
  static gd::MeasurementUnit second;
  static gd::MeasurementUnit pixel;
  static gd::MeasurementUnit pixelSpeed;
  static gd::MeasurementUnit pixelAcceleration;
  static gd::MeasurementUnit newton;
  static gd::MeasurementUnit angularSpeed;

  static gd::MeasurementUnit CreateUndefined() {
    return MeasurementUnit("Undefined", _("Undefined"), "");
  }

  static gd::MeasurementUnit CreateDimensionless() {
    return MeasurementUnit("Dimensionless", _("Dimensionless"), "");
  }

  static gd::MeasurementUnit CreateDegreeAngle() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::degreeAngle, 1));
    return MeasurementUnit(elements, "DegreeAngle", _("Angle"), _("degree"));
  }

  static gd::MeasurementUnit CreateSecond() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, 1));
    return MeasurementUnit(elements, "Second", _("Duration"), _("second"));
  }

  static gd::MeasurementUnit CreatePixel() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    return MeasurementUnit(elements, "Pixel", _("Distance"), _("pixel"));
  }

  static gd::MeasurementUnit CreatePixelSpeed() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -1));
    return MeasurementUnit(elements, "PixelSpeed", _("Speed"),
                           _("pixel per second"),
                           _("How much distance is covered per second."));
  }

  static gd::MeasurementUnit CreatePixelAcceleration() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::pixel, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -2));
    return MeasurementUnit(elements, "PixelAcceleration", _("Acceleration"),
                           _("pixel per second, per second"),
                           _("How much speed is gained (or lost) per second."));
  }

  static gd::MeasurementUnit CreateNewton() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::meter, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::kilogram, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -2));
    return MeasurementUnit(
        elements, "Newton",
        _("Force (in Newton)"), _("meter kilogram per second, per second"),
        _("A unit to measure forces."));
  }

  static gd::MeasurementUnit CreateAngularSpeed() {
    std::vector<gd::MeasurementUnitElement> elements;
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::degreeAngle, 1));
    elements.push_back(
        MeasurementUnitElement(gd::MeasurementBaseUnit::second, -1));
    return MeasurementUnit(elements, "AngularSpeed", _("Angular speed"),
                           _("degree per second"),
                           _("How much angle is covered per second."));
  }

  gd::String name;              ///< The unit name.
  gd::String label;             ///< The unit label.
  gd::String description;       ///< The unit description.
  gd::String elementsWithWords; ///< The unit elements put in words.
  std::vector<gd::MeasurementUnitElement> elements; ///< The unit elements.
};

} // namespace gd

#endif // GDCORE_MEASUREMENTUNIT
