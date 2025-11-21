/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <map>
namespace gd {
class SerializerElement;
}
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Represents an effect that can be applied on a layer.
 *
 * \see gd::Layer
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Effect {
 public:
  Effect() : folded(false) {};
  virtual ~Effect() {};

  void SetName(const gd::String& name_) { name = name_; }
  const gd::String& GetName() const { return name; }

  void SetEffectType(const gd::String& effectType_) {
    effectType = effectType_;
  }
  const gd::String& GetEffectType() const { return effectType; }

  void SetFolded(bool fold = true) { folded = fold; }
  bool IsFolded() const { return folded; }

  void SetEnabled(bool isEnabled_) {
    isEnabled = isEnabled_;
  }
  bool IsEnabled() const { return isEnabled; }

  void SetDoubleParameter(const gd::String &name, double value) {
    doubleParameters[name] = value;
  }

  double GetDoubleParameter(const gd::String &name) const {
    auto itr = doubleParameters.find(name);
    return itr == doubleParameters.end() ? 0 : itr->second;
  }

  bool HasDoubleParameter(const gd::String &name) const {
    return doubleParameters.find(name) != doubleParameters.end();
  }

  void SetStringParameter(const gd::String &name, const gd::String &value) {
    stringParameters[name] = value;
  }

  const gd::String &GetStringParameter(const gd::String &name) const {
    auto itr = stringParameters.find(name);
    return itr == stringParameters.end() ? badStringParameterValue : itr->second;
  }

  bool HasStringParameter(const gd::String &name) const {
    return stringParameters.find(name) != stringParameters.end();
  }

  void SetBooleanParameter(const gd::String &name, bool value) {
    booleanParameters[name] = value;
  }

  bool GetBooleanParameter(const gd::String &name) const {
    auto itr = booleanParameters.find(name);
    return itr == booleanParameters.end() ? false : itr->second;
  }

  bool HasBooleanParameter(const gd::String &name) const {
    return booleanParameters.find(name) != booleanParameters.end();
  }

  const std::map<gd::String, double>& GetAllDoubleParameters() const {
    return doubleParameters;
  }

  const std::map<gd::String, gd::String>& GetAllStringParameters() const {
    return stringParameters;
  }

  const std::map<gd::String, bool>& GetAllBooleanParameters() const {
    return booleanParameters;
  }

  void ClearParameters() {
    doubleParameters.clear();
    stringParameters.clear();
    booleanParameters.clear();
  }

  /**
   * \brief Serialize layer.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the layer.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  bool folded;
  gd::String name;        ///< The name of the layer.
  gd::String effectType;  ///< The name of the effect to apply.
  bool isEnabled = true; ///< Enable the effect at the beginning of the scene, at its object creation or in the editor.
  std::map<gd::String, double> doubleParameters; ///< Values of parameters being doubles, keyed by names.
  std::map<gd::String, gd::String> stringParameters; ///< Values of parameters being strings, keyed by names.
  std::map<gd::String, bool> booleanParameters; ///< Values of parameters being booleans, keyed by names.

  static gd::String badStringParameterValue;  ///< Empty string returned by
                                              ///< GeStringParameter
};

}  // namespace gd
