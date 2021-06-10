/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EFFECT_H
#define GDCORE_EFFECT_H
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
  Effect(){};
  virtual ~Effect(){};

  void SetName(const gd::String& name_) { name = name_; }
  const gd::String& GetName() const { return name; }

  void SetEffectType(const gd::String& effectType_) {
    effectType = effectType_;
  }
  const gd::String& GetEffectType() const { return effectType; }

  void SetDoubleParameter(const gd::String& name, double value) {
    doubleParameters[name] = value;
  }

  double GetDoubleParameter(const gd::String& name) {
    return doubleParameters[name];
  }

  void SetStringParameter(const gd::String& name, const gd::String& value) {
    stringParameters[name] = value;
  }

  const gd::String& GetStringParameter(const gd::String& name) {
    return stringParameters[name];
  }

  void SetBooleanParameter(const gd::String& name, bool value) {
    booleanParameters[name] = value;
  }

  bool GetBooleanParameter(const gd::String& name) {
    return booleanParameters[name];
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
  gd::String name;        ///< The name of the layer.
  gd::String effectType;  ///< The name of the effect to apply.
  std::map<gd::String, double> doubleParameters; ///< Values of parameters being doubles, keyed by names.
  std::map<gd::String, gd::String> stringParameters; ///< Values of parameters being strings, keyed by names.
  std::map<gd::String, bool> booleanParameters; ///< Values of parameters being booleans, keyed by names.
};

}  // namespace gd
#endif
