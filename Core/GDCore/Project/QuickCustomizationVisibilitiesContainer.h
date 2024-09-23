#pragma once
#include <memory>
#include <vector>

#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {

class QuickCustomizationVisibilitiesContainer {
 public:
  QuickCustomizationVisibilitiesContainer();

  void Set(const gd::String& name, QuickCustomization::Visibility visibility);

  QuickCustomization::Visibility Get(const gd::String& name) const;

  bool IsEmpty() const;

  void SerializeTo(SerializerElement& element) const;

  void UnserializeFrom(const SerializerElement& element);

 private:
  std::map<gd::String, QuickCustomization::Visibility> visibilities;
};

}  // namespace gd