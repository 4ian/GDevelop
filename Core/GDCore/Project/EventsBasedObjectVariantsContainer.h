/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Used as a base class for classes that will own events-backed
 * variants.
 *
 * \see gd::EventsBasedObjectVariantContainer
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsBasedObjectVariantsContainer
    : private SerializableWithNameList<gd::EventsBasedObjectVariant> {
public:
  EventsBasedObjectVariantsContainer() {}

  EventsBasedObjectVariantsContainer(const EventsBasedObjectVariantsContainer &other) {
    Init(other);
  }

  EventsBasedObjectVariantsContainer &operator=(const EventsBasedObjectVariantsContainer &other) {
    if (this != &other) {
      Init(other);
    }
    return *this;
  }

  /** \name Events Functions management
   */
  ///@{
  /**
   * \brief Check if the variant with the specified name exists.
   */
  bool HasVariantNamed(const gd::String& name) const {
    return Has(name);
  }

  /**
   * \brief Get the variant with the specified name.
   *
   * \warning Trying to access to a not existing variant will result in
   * undefined behavior.
   */
  gd::EventsBasedObjectVariant& GetVariant(const gd::String& name) {
    return Get(name);
  }

  /**
   * \brief Get the variant with the specified name.
   *
   * \warning Trying to access to a not existing variant will result in
   * undefined behavior.
   */
  const gd::EventsBasedObjectVariant& GetVariant(const gd::String& name) const {
    return Get(name);
  }

  /**
   * \brief Get the variant at the specified index in the list.
   *
   * \warning Trying to access to a not existing variant will result in
   * undefined behavior.
   */
  gd::EventsBasedObjectVariant& GetVariant(std::size_t index) {
    return Get(index);
  }

  /**
   * \brief Get the variant at the specified index in the list.
   *
   * \warning Trying to access to a not existing variant will result in
   * undefined behavior.
   */
  const gd::EventsBasedObjectVariant& GetVariant(std::size_t index) const {
    return Get(index);
  }

  /**
   * \brief Return the number of variants.
   */
  std::size_t GetVariantsCount() const { return GetCount(); }

  gd::EventsBasedObjectVariant& InsertNewVariant(const gd::String& name,
                                              std::size_t position) {
    return InsertNew(name, position);
  }
  gd::EventsBasedObjectVariant& InsertVariant(const gd::EventsBasedObjectVariant& object,
                                           std::size_t position) {
    return Insert(object, position);
  }
  void RemoveVariant(const gd::String& name) { return Remove(name); }
  void ClearVariants() { return Clear(); }
  void MoveVariant(std::size_t oldIndex, std::size_t newIndex) {
    return Move(oldIndex, newIndex);
  };
  std::size_t GetVariantPosition(const gd::EventsBasedObjectVariant& eventsFunction) {
    return GetPosition(eventsFunction);
  };

  /**
   * \brief Provide a raw access to the vector containing the variants.
   */
  const std::vector<std::unique_ptr<gd::EventsBasedObjectVariant>>& GetInternalVector()
      const {
    return elements;
  };

  /**
   * \brief Provide a raw access to the vector containing the variants.
   */
  std::vector<std::unique_ptr<gd::EventsBasedObjectVariant>>& GetInternalVector() {
    return elements;
  };
  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize events variants.
   */
  void SerializeVariantsTo(SerializerElement& element) const {
    return SerializeElementsTo("variant", element);
  };

  /**
   * \brief Unserialize the events variants.
   */
  void UnserializeVariantsFrom(gd::Project& project,
                                      const SerializerElement& element) {
    return UnserializeElementsFrom("variant", project, element);
  };
  ///@}
 protected:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::EventsBasedObjectVariantsContainer& other) {
    return SerializableWithNameList<gd::EventsBasedObjectVariant>::Init(other);
  };

private:
};

}  // namespace gd
