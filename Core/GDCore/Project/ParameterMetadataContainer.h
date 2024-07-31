/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"
#include <vector>
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Used as a base class for classes that will own events-backed
 * functions.
 *
 * \see gd::ParameterMetadata
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ParameterMetadataContainer
    : private SerializableWithNameList<gd::ParameterMetadata> {
public:
  ParameterMetadataContainer() {}

  /** \name Events Functions management
   */
  ///@{
  /**
   * \brief Check if the function with the specified name exists.
   */
  bool HasParameterNamed(const gd::String &name) const { return Has(name); }

  /**
   * \brief Get the function with the specified name.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  gd::ParameterMetadata &GetParameter(const gd::String &name) {
    return Get(name);
  }

  /**
   * \brief Get the function with the specified name.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  const gd::ParameterMetadata &GetParameter(const gd::String &name) const {
    return Get(name);
  }

  /**
   * \brief Get the function at the specified index in the list.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  gd::ParameterMetadata &GetParameter(std::size_t index) { return Get(index); }

  /**
   * \brief Get the function at the specified index in the list.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  const gd::ParameterMetadata &GetParameter(std::size_t index) const {
    return Get(index);
  }

  /**
   * \brief Return the number of functions.
   */
  std::size_t GetParametersCount() const { return GetCount(); }

  gd::ParameterMetadata &InsertNewParameter(const gd::String &name,
                                            std::size_t position) {
    return InsertNew(name, position);
  }
  gd::ParameterMetadata &InsertParameter(const gd::ParameterMetadata &object,
                                         std::size_t position) {
    return Insert(object, position);
  }
  gd::ParameterMetadata &AddNewParameter(const gd::String &name) {
    return InsertNew(name, GetCount());
  }
  gd::ParameterMetadata &AddParameter(const gd::ParameterMetadata &object) {
    return Insert(object, GetCount());
  }
  void RemoveParameter(const gd::String &name) { return Remove(name); }
  void ClearParameters() { return Clear(); }
  void MoveParameter(std::size_t oldIndex, std::size_t newIndex) {
    return Move(oldIndex, newIndex);
  };
  std::size_t
  GetParameterPosition(const gd::ParameterMetadata &parameterMetadata) {
    return GetPosition(parameterMetadata);
  };

  /**
   * \brief Provide a raw access to the vector containing the functions.
   */
  const std::vector<std::unique_ptr<gd::ParameterMetadata>> &
  GetInternalVector() const {
    return elements;
  };

  /**
   * \brief Provide a raw access to the vector containing the functions.
   */
  std::vector<std::unique_ptr<gd::ParameterMetadata>> &GetInternalVector() {
    return elements;
  };
  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize events functions.
   */
  void SerializeParametersTo(SerializerElement &element) const {
    return SerializeElementsTo("parameters", element);
  };

  /**
   * \brief Unserialize the events functions.
   */
  void UnserializeParametersFrom(const SerializerElement &element) {
    return UnserializeElementsFrom("parameters", element);
  };
  ///@}
protected:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::ParameterMetadataContainer &other) {
    return SerializableWithNameList<gd::ParameterMetadata>::Init(other);
  };
};

} // namespace gd
