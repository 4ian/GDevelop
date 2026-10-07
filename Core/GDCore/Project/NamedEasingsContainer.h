/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

#include "GDCore/Project/NamedEasing.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A container of named easings (gd::NamedEasing), used by gd::Project
 * and gd::EventsFunctionsExtension.
 *
 * \see gd::NamedEasing
 * \ingroup PlatformDefinition
 */
class GD_CORE_API NamedEasingsContainer
    : private SerializableWithNameList<gd::NamedEasing> {
 public:
  NamedEasingsContainer() {}

  NamedEasingsContainer(const NamedEasingsContainer& other) { Init(other); }

  NamedEasingsContainer& operator=(const NamedEasingsContainer& other) {
    if (this != &other) {
      Init(other);
    }
    return *this;
  }

  /** \name Named easings management
   */
  ///@{
  bool HasNamedEasingNamed(const gd::String& name) const { return Has(name); }

  gd::NamedEasing& GetNamedEasing(const gd::String& name) { return Get(name); }

  const gd::NamedEasing& GetNamedEasing(const gd::String& name) const {
    return Get(name);
  }

  gd::NamedEasing& GetNamedEasing(std::size_t index) { return Get(index); }

  const gd::NamedEasing& GetNamedEasing(std::size_t index) const {
    return Get(index);
  }

  std::size_t GetNamedEasingsCount() const { return GetCount(); }

  gd::NamedEasing& InsertNewNamedEasing(const gd::String& name,
                                        std::size_t position) {
    return InsertNew(name, position);
  }
  gd::NamedEasing& InsertNamedEasing(const gd::NamedEasing& easing,
                                     std::size_t position) {
    return Insert(easing, position);
  }
  void RemoveNamedEasing(const gd::String& name) { return Remove(name); }
  void ClearNamedEasings() { return Clear(); }
  void MoveNamedEasing(std::size_t oldIndex, std::size_t newIndex) {
    return Move(oldIndex, newIndex);
  };
  std::size_t GetNamedEasingPosition(const gd::NamedEasing& easing) {
    return GetPosition(easing);
  };
  ///@}

  /** \name Serialization
   */
  ///@{
  void SerializeNamedEasingsTo(SerializerElement& element) const {
    return SerializeElementsTo("namedEasing", element);
  };

  void UnserializeNamedEasingsFrom(const SerializerElement& element) {
    return UnserializeElementsFrom("namedEasing", element);
  };
  ///@}

 protected:
  void Init(const gd::NamedEasingsContainer& other) {
    return SerializableWithNameList<gd::NamedEasing>::Init(other);
  };
};

}  // namespace gd
